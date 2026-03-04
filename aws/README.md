# AWS Deployment Guide

Deploy FaceTrust AI to AWS using Lambda, API Gateway, Rekognition, S3, and DynamoDB.

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. Appropriate IAM permissions

## Setup AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

## Deployment Steps

### Option 1: Automated Deployment

```bash
cd aws
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Create CloudFormation Stack**
```bash
aws cloudformation create-stack \
  --stack-name facetrust-ai-stack \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

2. **Create Rekognition Collection**
```bash
aws rekognition create-collection \
  --collection-id facetrust-collection \
  --region us-east-1
```

3. **Package and Deploy Lambda**
```bash
cd ../backend
pip install -r requirements.txt -t lambda_package/
cp -r services lambda_package/
cp ../aws/lambda_function.py lambda_package/
cd lambda_package
zip -r ../lambda_function.zip .

aws lambda update-function-code \
  --function-name facetrust-api \
  --zip-file fileb://lambda_function.zip
```

4. **Get API Endpoint**
```bash
aws cloudformation describe-stacks \
  --stack-name facetrust-ai-stack \
  --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
  --output text
```

## AWS Services Used

- **Lambda**: Serverless compute for API logic
- **API Gateway**: HTTP API endpoint
- **Rekognition**: Face detection and matching
- **S3**: Store face images
- **DynamoDB**: Store user data
- **CloudFormation**: Infrastructure as Code

## Cost Estimation

For prototype/demo usage:
- Lambda: ~$0.20/million requests
- API Gateway: ~$1.00/million requests
- Rekognition: ~$1.00/1000 images
- S3: ~$0.023/GB
- DynamoDB: Pay-per-request pricing

Estimated monthly cost for demo: $5-20

## Cleanup

To delete all resources:

```bash
aws cloudformation delete-stack --stack-name facetrust-ai-stack
aws rekognition delete-collection --collection-id facetrust-collection
```

## Security Notes

- Enable AWS WAF for API protection
- Use AWS Secrets Manager for sensitive data
- Enable CloudWatch logging
- Implement rate limiting
- Use VPC for Lambda if needed
