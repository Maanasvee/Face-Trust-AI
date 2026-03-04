# FaceTrust AI - Complete Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Running the Prototype](#running-the-prototype)
3. [AWS Cloud Deployment](#aws-cloud-deployment)
4. [Testing the System](#testing-the-system)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Webcam
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd facetrust-ai
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create data directory
mkdir data
mkdir data/users
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo REACT_APP_API_URL=http://localhost:8000 > .env
```

---

## Running the Prototype

### Start Backend Server

```bash
cd backend
python main.py
```

Backend will run at: `http://localhost:8000`

### Start Frontend Application

Open a new terminal:

```bash
cd frontend
npm start
```

Frontend will open at: `http://localhost:3000`

### Using the Application

#### 1. Register a User

1. Click "Register" tab
2. Enter User ID (e.g., "user001")
3. Enter Full Name
4. Click "Capture Image" to take photo
5. Click "Register" to save

#### 2. Verify Payment

1. Click "Payment" tab
2. Enter registered User ID
3. Enter payment amount
4. Click "Verify & Pay"
5. View verification results

---

## AWS Cloud Deployment

### Prerequisites
- AWS Account
- AWS CLI installed
- IAM permissions for Lambda, API Gateway, Rekognition, S3, DynamoDB

### Step 1: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Output format: `json`

### Step 2: Deploy Infrastructure

```bash
cd aws

# Make deploy script executable (Mac/Linux)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:

```bash
# Create CloudFormation stack
aws cloudformation create-stack \
  --stack-name facetrust-ai-stack \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name facetrust-ai-stack \
  --region us-east-1

# Create Rekognition collection
aws rekognition create-collection \
  --collection-id facetrust-collection \
  --region us-east-1
```

### Step 3: Deploy Lambda Function

```bash
cd ../backend

# Install dependencies in package directory
pip install -r requirements.txt -t lambda_package/

# Copy code
cp -r services lambda_package/
cp ../aws/lambda_function.py lambda_package/

# Create deployment package
cd lambda_package
zip -r ../lambda_function.zip .
cd ..

# Update Lambda function
aws lambda update-function-code \
  --function-name facetrust-api \
  --zip-file fileb://lambda_function.zip \
  --region us-east-1
```

### Step 4: Get API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name facetrust-ai-stack \
  --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
  --output text
```

### Step 5: Update Frontend

Update `frontend/.env`:
```
REACT_APP_API_URL=<your-api-endpoint>
```

### Step 6: Deploy Frontend to S3 (Optional)

```bash
cd frontend

# Build production version
npm run build

# Create S3 bucket
aws s3 mb s3://facetrust-frontend

# Enable static website hosting
aws s3 website s3://facetrust-frontend \
  --index-document index.html

# Upload files
aws s3 sync build/ s3://facetrust-frontend --acl public-read

# Get website URL
echo "http://facetrust-frontend.s3-website-us-east-1.amazonaws.com"
```

---

## Testing the System

### Test Cases

#### Test 1: User Registration
```bash
curl -X POST http://localhost:8000/api/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test001",
    "name": "Test User",
    "image": "<base64_image>"
  }'
```

Expected: `{"message": "User registered successfully"}`

#### Test 2: Payment Verification (Approved)
```bash
curl -X POST http://localhost:8000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test001",
    "image": "<base64_image>",
    "amount": 100.00
  }'
```

Expected: `{"decision": "APPROVED", "risk_score": 0.85}`

#### Test 3: Unknown User (Blocked)
```bash
curl -X POST http://localhost:8000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "unknown",
    "image": "<base64_image>",
    "amount": 100.00
  }'
```

Expected: `{"decision": "BLOCKED", "risk_score": 0.0}`

### Manual Testing Checklist

- [ ] User registration with valid image
- [ ] User registration with invalid data
- [ ] Payment verification with registered user
- [ ] Payment verification with unregistered user
- [ ] Payment verification with different amounts
- [ ] UI responsiveness on different screen sizes
- [ ] Webcam permission handling
- [ ] Error message display

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'deepface'`
```bash
pip install deepface
```

**Problem**: `cv2 not found`
```bash
pip install opencv-python
```

**Problem**: Port 8000 already in use
```bash
# Change port in backend/main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Frontend Issues

**Problem**: `npm install` fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Webcam not working
- Check browser permissions
- Use HTTPS (required for webcam in production)
- Try different browser

**Problem**: CORS errors
- Ensure backend CORS middleware is configured
- Check API_URL in .env file

### AWS Issues

**Problem**: Lambda timeout
- Increase timeout in CloudFormation template (default: 30s)
- Optimize model loading

**Problem**: Rekognition collection not found
```bash
aws rekognition create-collection \
  --collection-id facetrust-collection
```

**Problem**: S3 access denied
- Check IAM role permissions
- Verify bucket policy

---

## Performance Optimization

### Backend
- Use model caching
- Implement connection pooling
- Enable compression
- Use async operations

### Frontend
- Lazy load components
- Optimize images
- Use React.memo for expensive components
- Implement service workers

### AWS
- Use Lambda provisioned concurrency
- Enable API Gateway caching
- Use CloudFront CDN
- Optimize Lambda memory allocation

---

## Security Best Practices

1. **Never commit sensitive data**
   - Use `.env` files
   - Add to `.gitignore`

2. **Enable HTTPS**
   - Use SSL certificates
   - Enforce HTTPS redirects

3. **Implement rate limiting**
   - Prevent brute force attacks
   - Use AWS WAF

4. **Sanitize inputs**
   - Validate all user inputs
   - Prevent injection attacks

5. **Monitor and log**
   - Enable CloudWatch logs
   - Set up alerts

---

## Demo Preparation

### For Hackathon Presentation

1. **Prepare test users**
   - Register 2-3 test users beforehand
   - Have clear photos ready

2. **Demo script**
   - Show registration flow
   - Demonstrate successful payment
   - Show blocked transaction
   - Explain risk scoring

3. **Backup plan**
   - Record video demo
   - Have screenshots ready
   - Prepare offline version

4. **Talking points**
   - Multi-factor biometric verification
   - AI-powered security
   - Real-time processing
   - Scalable AWS architecture

---

## Next Steps

### For Production
- [ ] Implement proper authentication (JWT)
- [ ] Add OTP verification flow
- [ ] Implement transaction logging
- [ ] Add admin dashboard
- [ ] Enhance security measures
- [ ] Conduct security audit
- [ ] Load testing
- [ ] GDPR compliance review

### For Enhancement
- [ ] Add voice recognition
- [ ] Implement behavioral biometrics
- [ ] Add fraud detection ML model
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Blockchain integration for audit trail
