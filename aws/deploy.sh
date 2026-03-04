#!/bin/bash

# FaceTrust AI - AWS Deployment Script

echo "Starting FaceTrust AI deployment to AWS..."

# Configuration
STACK_NAME="facetrust-ai-stack"
REGION="us-east-1"
COLLECTION_NAME="facetrust-collection"

# Step 1: Create CloudFormation stack
echo "Creating CloudFormation stack..."
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $REGION

echo "Waiting for stack creation..."
aws cloudformation wait stack-create-complete \
  --stack-name $STACK_NAME \
  --region $REGION

# Step 2: Create Rekognition collection
echo "Creating Rekognition face collection..."
aws rekognition create-collection \
  --collection-id $COLLECTION_NAME \
  --region $REGION

# Step 3: Package Lambda function
echo "Packaging Lambda function..."
cd ../backend
pip install -r requirements.txt -t lambda_package/
cp -r services lambda_package/
cp ../aws/lambda_function.py lambda_package/

cd lambda_package
zip -r ../lambda_function.zip .
cd ..

# Step 4: Update Lambda function
echo "Updating Lambda function code..."
FUNCTION_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" \
  --output text \
  --region $REGION)

aws lambda update-function-code \
  --function-name facetrust-api \
  --zip-file fileb://lambda_function.zip \
  --region $REGION

# Step 5: Get API endpoint
echo "Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
  --output text \
  --region $REGION)

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Update your frontend .env file:"
echo "REACT_APP_API_URL=$API_ENDPOINT"
echo "=========================================="
