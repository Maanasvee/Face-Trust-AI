# FaceTrust AI - API Documentation

## Base URL

**Local Development**: `http://localhost:8000`  
**AWS Production**: `https://your-api-gateway-url.amazonaws.com/prod`

## Authentication

Currently, the API does not require authentication for the prototype. In production, implement JWT tokens or API keys.

---

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint**: `GET /`

**Response**:
```json
{
  "message": "FaceTrust AI API",
  "status": "running"
}
```

**Status Codes**:
- `200 OK`: API is running

---

### 2. Health Status

Detailed health check.

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy"
}
```

**Status Codes**:
- `200 OK`: Service is healthy

---

### 3. Register User

Register a new user with face image.

**Endpoint**: `POST /api/register-user`

**Request Body**:
```json
{
  "user_id": "string",
  "name": "string",
  "image": "string (base64)"
}
```

**Request Example**:
```json
{
  "user_id": "user001",
  "name": "John Doe",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "message": "User John Doe registered successfully",
  "user_id": "user001"
}
```

**Status Codes**:
- `200 OK`: User registered successfully
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Server error

**Error Response**:
```json
{
  "detail": "Error message"
}
```

**Notes**:
- `user_id` must be unique
- `image` should be base64-encoded JPEG/PNG
- Face must be clearly visible in image

---

### 4. Verify Payment

Verify payment using biometric authentication.

**Endpoint**: `POST /api/verify-payment`

**Request Body**:
```json
{
  "user_id": "string",
  "image": "string (base64)",
  "amount": "number"
}
```

**Request Example**:
```json
{
  "user_id": "user001",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "amount": 100.00
}
```

**Response**:
```json
{
  "decision": "APPROVED",
  "message": "Payment of $100.00 approved successfully!",
  "risk_score": 0.85,
  "details": {
    "face_match": 0.92,
    "liveness": 0.88,
    "deepfake": 0.75,
    "emotion": "neutral",
    "emotion_stability": 0.80
  }
}
```

**Decision Types**:
- `APPROVED`: Payment approved (risk_score ≥ 0.8)
- `OTP_REQUIRED`: Additional verification needed (0.5 ≤ risk_score < 0.8)
- `BLOCKED`: Payment blocked (risk_score < 0.5)

**Status Codes**:
- `200 OK`: Verification completed
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error

**Error Response**:
```json
{
  "detail": "Error message"
}
```

---

## Data Models

### UserRegistration

```typescript
{
  user_id: string;      // Unique user identifier
  name: string;         // Full name
  image: string;        // Base64-encoded image
}
```

### PaymentVerification

```typescript
{
  user_id: string;      // User identifier
  image: string;        // Base64-encoded image
  amount: number;       // Payment amount
}
```

### VerificationResult

```typescript
{
  decision: "APPROVED" | "OTP_REQUIRED" | "BLOCKED";
  message: string;
  risk_score: number;   // 0.0 to 1.0
  details: {
    face_match: number;           // 0.0 to 1.0
    liveness: number;             // 0.0 to 1.0
    deepfake: number;             // 0.0 to 1.0
    emotion: string;              // Emotion label
    emotion_stability: number;    // 0.0 to 1.0
  }
}
```

---

## Risk Scoring Algorithm

### Formula

```
risk_score = (face_match × 0.4) + (liveness × 0.2) + 
             (deepfake × 0.2) + (emotion_stability × 0.2)
```

### Weights

| Factor | Weight | Description |
|--------|--------|-------------|
| Face Match | 40% | Identity verification |
| Liveness | 20% | Anti-spoofing |
| Deepfake | 20% | Authenticity check |
| Emotion | 20% | Emotional stability |

### Decision Thresholds

| Risk Score | Decision | Action |
|------------|----------|--------|
| ≥ 0.8 | APPROVED | Process payment |
| 0.5 - 0.8 | OTP_REQUIRED | Request additional verification |
| < 0.5 | BLOCKED | Block transaction |

### Amount-Based Adjustment

For high-value transactions, thresholds are increased:

| Amount | Threshold Adjustment |
|--------|---------------------|
| > $1,000 | +0.05 |
| > $5,000 | +0.10 |

---

## Image Requirements

### Format
- JPEG or PNG
- Base64-encoded
- Include data URI prefix: `data:image/jpeg;base64,`

### Size
- Minimum: 320x240 pixels
- Recommended: 640x480 pixels
- Maximum: 1920x1080 pixels

### Quality
- Face should be clearly visible
- Good lighting conditions
- Frontal face view
- No obstructions (glasses, masks)

### Example Encoding (JavaScript)

```javascript
// From canvas
const canvas = document.getElementById('canvas');
const imageData = canvas.toDataURL('image/jpeg');

// From file
const file = document.getElementById('fileInput').files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const imageData = e.target.result;
};
reader.readAsDataURL(file);
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - User not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

### Common Error Messages

```json
{
  "detail": "User not found"
}
```

```json
{
  "detail": "Invalid image format"
}
```

```json
{
  "detail": "Face not detected in image"
}
```

---

## Rate Limiting

**Current**: No rate limiting (prototype)

**Production Recommendations**:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Implement exponential backoff

---

## CORS Configuration

**Allowed Origins**: `*` (all origins in prototype)

**Production**: Restrict to specific domains
```python
allow_origins=["https://yourdomain.com"]
```

---

## Example Usage

### cURL

**Register User**:
```bash
curl -X POST http://localhost:8000/api/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user001",
    "name": "John Doe",
    "image": "data:image/jpeg;base64,/9j/4AAQ..."
  }'
```

**Verify Payment**:
```bash
curl -X POST http://localhost:8000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user001",
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "amount": 100.00
  }'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Register user
async function registerUser(userId, name, imageData) {
  try {
    const response = await axios.post(`${API_URL}/api/register-user`, {
      user_id: userId,
      name: name,
      image: imageData
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Verify payment
async function verifyPayment(userId, imageData, amount) {
  try {
    const response = await axios.post(`${API_URL}/api/verify-payment`, {
      user_id: userId,
      image: imageData,
      amount: amount
    });
    return response.data;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}
```

### Python (Requests)

```python
import requests
import base64

API_URL = 'http://localhost:8000'

# Register user
def register_user(user_id, name, image_path):
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        f'{API_URL}/api/register-user',
        json={
            'user_id': user_id,
            'name': name,
            'image': f'data:image/jpeg;base64,{image_data}'
        }
    )
    return response.json()

# Verify payment
def verify_payment(user_id, image_path, amount):
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        f'{API_URL}/api/verify-payment',
        json={
            'user_id': user_id,
            'image': f'data:image/jpeg;base64,{image_data}',
            'amount': amount
        }
    )
    return response.json()
```

---

## Testing

### Postman Collection

Import this collection to test the API:

```json
{
  "info": {
    "name": "FaceTrust AI",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/"
      }
    },
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/register-user",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"user_id\": \"test001\",\n  \"name\": \"Test User\",\n  \"image\": \"data:image/jpeg;base64,...\"\n}"
        }
      }
    },
    {
      "name": "Verify Payment",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/verify-payment",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"user_id\": \"test001\",\n  \"image\": \"data:image/jpeg;base64,...\",\n  \"amount\": 100.00\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    }
  ]
}
```

---

## WebSocket Support

**Status**: Not implemented in current version

**Future**: Real-time verification updates via WebSocket

---

## Versioning

**Current Version**: v1.0.0

**API Versioning Strategy**: URL-based
- v1: `/api/v1/...`
- v2: `/api/v2/...`

---

## Support

For API issues or questions:
- GitHub Issues: [Repository URL]
- Email: support@facetrust.ai
- Documentation: [Docs URL]

---

## Changelog

### v1.0.0 (Current)
- Initial release
- User registration
- Payment verification
- Risk scoring
- Multi-factor biometric authentication

---

**Last Updated**: March 2026  
**API Version**: 1.0.0
