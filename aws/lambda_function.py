import json
import boto3
import base64
import numpy as np
from io import BytesIO
from PIL import Image

# Initialize AWS services
rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Configuration
USERS_TABLE = 'facetrust-users'
BUCKET_NAME = 'facetrust-images'

def lambda_handler(event, context):
    """
    AWS Lambda handler for FaceTrust AI
    Handles both user registration and payment verification
    """
    
    try:
        body = json.loads(event['body'])
        action = body.get('action')
        
        if action == 'register':
            return register_user(body)
        elif action == 'verify':
            return verify_payment(body)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid action'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def register_user(data):
    """Register user with AWS Rekognition"""
    user_id = data['user_id']
    name = data['name']
    image_data = data['image']
    
    # Decode image
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    
    # Store image in S3
    s3_key = f"users/{user_id}/face.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=s3_key,
        Body=image_bytes,
        ContentType='image/jpeg'
    )
    
    # Index face in Rekognition
    response = rekognition.index_faces(
        CollectionId='facetrust-collection',
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': s3_key}},
        ExternalImageId=user_id,
        DetectionAttributes=['ALL']
    )
    
    # Store user data in DynamoDB
    table = dynamodb.Table(USERS_TABLE)
    table.put_item(
        Item={
            'user_id': user_id,
            'name': name,
            's3_key': s3_key,
            'face_id': response['FaceRecords'][0]['Face']['FaceId']
        }
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'User registered successfully',
            'user_id': user_id
        })
    }

def verify_payment(data):
    """Verify payment using AWS Rekognition and custom logic"""
    user_id = data['user_id']
    image_data = data['image']
    amount = data['amount']
    
    # Decode image
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    
    # Face matching with Rekognition
    search_response = rekognition.search_faces_by_image(
        CollectionId='facetrust-collection',
        Image={'Bytes': image_bytes},
        MaxFaces=1,
        FaceMatchThreshold=80
    )
    
    face_match_score = 0.0
    if search_response['FaceMatches']:
        face_match_score = search_response['FaceMatches'][0]['Similarity'] / 100.0
    
    # Detect faces for liveness
    detect_response = rekognition.detect_faces(
        Image={'Bytes': image_bytes},
        Attributes=['ALL']
    )
    
    liveness_score = 0.5
    if detect_response['FaceDetails']:
        face_detail = detect_response['FaceDetails'][0]
        # Check quality indicators
        if face_detail['Quality']['Brightness'] > 50 and face_detail['Quality']['Sharpness'] > 50:
            liveness_score = 0.8
    
    # Simplified scoring (in production, use full ML pipeline)
    deepfake_confidence = 0.75
    emotion_stability = 0.8
    
    # Calculate risk score
    risk_score = (
        face_match_score * 0.4 +
        liveness_score * 0.2 +
        deepfake_confidence * 0.2 +
        emotion_stability * 0.2
    )
    
    # Make decision
    if risk_score >= 0.8:
        decision = "APPROVED"
        message = f"Payment of ${amount:.2f} approved"
    elif risk_score >= 0.5:
        decision = "OTP_REQUIRED"
        message = "Additional verification required"
    else:
        decision = "BLOCKED"
        message = "Payment blocked due to security concerns"
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'decision': decision,
            'message': message,
            'risk_score': risk_score,
            'details': {
                'face_match': face_match_score,
                'liveness': liveness_score,
                'deepfake': deepfake_confidence,
                'emotion': 'neutral'
            }
        })
    }
