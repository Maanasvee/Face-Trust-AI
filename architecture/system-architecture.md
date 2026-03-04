# FaceTrust AI - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React.js + TailwindCSS)                     │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  User            │              │  Payment         │        │
│  │  Registration    │              │  Verification    │        │
│  └──────────────────┘              └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / BACKEND                      │
│                        (FastAPI / AWS)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI VERIFICATION PIPELINE                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Face      │  │   Liveness   │  │   Deepfake   │         │
│  │ Recognition  │  │  Detection   │  │  Detection   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────────────────────────┐       │
│  │   Emotion    │  │      Risk Scoring Engine         │       │
│  │   Analysis   │  │  (Weighted Algorithm: 40-20-20-20)│       │
│  └──────────────┘  └──────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DECISION ENGINE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   APPROVED   │  │ OTP REQUIRED │  │   BLOCKED    │         │
│  │  (Score>0.8) │  │ (0.5-0.8)    │  │  (Score<0.5) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  User Data   │  │ Face         │  │ Transaction  │         │
│  │  (DynamoDB)  │  │ Embeddings   │  │ Logs         │         │
│  │              │  │ (S3)         │  │ (DynamoDB)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer
- **Technology**: React.js, TailwindCSS
- **Features**:
  - User registration interface
  - Payment verification flow
  - Real-time webcam capture
  - Results visualization
  - Responsive design

### 2. API Layer
- **Local**: FastAPI (Python)
- **Cloud**: AWS API Gateway + Lambda
- **Endpoints**:
  - `POST /api/register-user`: Register new user
  - `POST /api/verify-payment`: Verify payment transaction
  - `GET /api/health`: Health check

### 3. AI Verification Pipeline

#### a. Face Recognition
- **Model**: DeepFace (Facenet512)
- **Function**: Verify identity against registered face
- **Output**: Similarity score (0-1)
- **Weight**: 40%

#### b. Liveness Detection
- **Techniques**:
  - Face/eye detection
  - Texture analysis (Laplacian variance)
  - Color distribution (skin tone)
  - Edge consistency
- **Output**: Liveness score (0-1)
- **Weight**: 20%

#### c. Deepfake Detection
- **Techniques**:
  - Frequency domain analysis (FFT)
  - Edge consistency check
  - Color coherence analysis
  - Noise pattern analysis
- **Output**: Authenticity confidence (0-1)
- **Weight**: 20%

#### d. Emotion Analysis
- **Model**: DeepFace emotion detection
- **Emotions**: angry, disgust, fear, happy, neutral, sad, surprise
- **Function**: Detect suspicious emotional states
- **Output**: Stability score (0-1)
- **Weight**: 20%

### 4. Risk Scoring Engine

**Formula**:
```
risk_score = (face_match × 0.4) + (liveness × 0.2) + 
             (deepfake × 0.2) + (emotion × 0.2)
```

**Decision Logic**:
- `risk_score ≥ 0.8` → **APPROVED**
- `0.5 ≤ risk_score < 0.8` → **OTP_REQUIRED**
- `risk_score < 0.5` → **BLOCKED**

**Amount-based Adjustment**:
- Transactions > $1000: +0.05 to thresholds
- Transactions > $5000: +0.10 to thresholds

### 5. Data Storage

#### Local Storage
- **Format**: JSON files
- **Location**: `data/users/`
- **Contents**: User ID, name, face embeddings

#### AWS Storage
- **DynamoDB**: User metadata, transaction logs
- **S3**: Face images, embeddings
- **Rekognition**: Face collection for matching

## Data Flow

### Registration Flow
```
1. User enters ID and name
2. Webcam captures face image
3. Image sent to backend (base64)
4. Face embedding extracted
5. Data stored (local JSON / AWS DynamoDB + S3)
6. Success confirmation returned
```

### Payment Verification Flow
```
1. User enters ID and amount
2. Webcam captures face image
3. Image sent to backend
4. Parallel AI verification:
   ├─ Face matching
   ├─ Liveness detection
   ├─ Deepfake detection
   └─ Emotion analysis
5. Risk score calculated
6. Decision made (APPROVED/OTP/BLOCKED)
7. Results displayed to user
```

## Security Considerations

1. **Data Encryption**
   - HTTPS for all API calls
   - Encrypted storage for face embeddings
   - Secure token-based authentication

2. **Privacy**
   - No raw images stored (only embeddings)
   - GDPR compliance
   - User consent required

3. **Anti-Spoofing**
   - Multi-factor verification
   - Liveness detection
   - Deepfake detection

4. **Rate Limiting**
   - API throttling
   - Failed attempt tracking
   - Account lockout mechanism

## Scalability

- **Horizontal Scaling**: Lambda auto-scales
- **Caching**: Redis for frequent queries
- **CDN**: CloudFront for static assets
- **Database**: DynamoDB auto-scaling

## Performance Metrics

- **Response Time**: < 2 seconds
- **Accuracy**: > 95% for face matching
- **Availability**: 99.9% uptime
- **Throughput**: 1000+ requests/minute
