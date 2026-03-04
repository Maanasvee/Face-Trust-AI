# FaceTrust AI – Emotion-Aware, Anti-Deepfake Biometric Payment System

A secure facial payment verification system using AI and AWS services with face recognition, liveness detection, deepfake detection, emotion analysis, and risk scoring.

## Features

- Face Recognition & Identity Verification
- Liveness Detection (anti-spoofing)
- Deepfake Detection
- Emotion Analysis
- Risk-based Payment Approval
- AWS Cloud Integration

## Tech Stack

- **Frontend**: React.js, TailwindCSS, Webcam API
- **Backend**: Python FastAPI
- **AI Models**: TensorFlow, PyTorch, OpenCV, DeepFace
- **Cloud**: AWS (Rekognition, Lambda, API Gateway, S3, DynamoDB, SageMaker)

## Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- AWS Account
- Webcam

### Installation

1. Clone the repository
2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Configure AWS credentials:
```bash
aws configure
```

5. Run the application:
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

## Project Structure

```
facetrust-ai/
├── frontend/          # React application
├── backend/           # FastAPI server
├── models/            # AI models
├── aws/               # AWS deployment
├── notebooks/         # Training notebooks
├── architecture/      # System diagrams
└── README.md
```

## Documentation

See individual folders for detailed documentation:
- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [Model Training](./notebooks/README.md)
- [AWS Deployment](./aws/README.md)

## License

MIT
