# FaceTrust AI - Testing Guide

## Testing Strategy

This guide covers comprehensive testing for the FaceTrust AI system.

## 1. Unit Testing

### Backend Services Testing

Create `backend/tests/test_services.py`:

```python
import pytest
import numpy as np
from services.face_recognition import FaceRecognitionService
from services.liveness_detection import LivenessDetectionService
from services.deepfake_detection import DeepfakeDetectionService
from services.emotion_analysis import EmotionAnalysisService
from services.risk_scoring import RiskScoringEngine

def test_face_recognition():
    service = FaceRecognitionService()
    # Test with dummy image
    image = np.random.randint(0, 255, (160, 160, 3), dtype=np.uint8)
    embedding = service.extract_embedding(image)
    assert embedding.shape[0] == 512

def test_liveness_detection():
    service = LivenessDetectionService()
    image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    score = service.detect_liveness(image)
    assert 0 <= score <= 1

def test_deepfake_detection():
    service = DeepfakeDetectionService()
    image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    confidence = service.detect_deepfake(image)
    assert 0 <= confidence <= 1

def test_risk_scoring():
    engine = RiskScoringEngine()
    score = engine.calculate_risk_score(0.9, 0.8, 0.85, 0.75)
    assert 0 <= score <= 1
    
    decision, message = engine.make_decision(0.85, 100)
    assert decision == "APPROVED"
```

Run tests:
```bash
cd backend
pytest tests/
```

## 2. Integration Testing

### API Endpoint Testing

Create `backend/tests/test_api.py`:

```python
from fastapi.testclient import TestClient
from main import app
import base64

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_user():
    # Create dummy base64 image
    dummy_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    
    response = client.post("/api/register-user", json={
        "user_id": "test_user",
        "name": "Test User",
        "image": dummy_image
    })
    
    assert response.status_code == 200
    assert "user_id" in response.json()

def test_verify_payment():
    dummy_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    
    response = client.post("/api/verify-payment", json={
        "user_id": "test_user",
        "image": dummy_image,
        "amount": 100.0
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data
    assert "risk_score" in data
```

## 3. Frontend Testing

### Component Testing

Create `frontend/src/components/__tests__/PaymentFlow.test.js`:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentFlow from '../PaymentFlow';

test('renders payment form', () => {
  render(<PaymentFlow />);
  expect(screen.getByText(/Payment Verification/i)).toBeInTheDocument();
});

test('validates user input', () => {
  render(<PaymentFlow />);
  const button = screen.getByText(/Verify & Pay/i);
  fireEvent.click(button);
  // Should show validation error
});
```

Run tests:
```bash
cd frontend
npm test
```

## 4. End-to-End Testing

### Manual Test Cases

#### Test Case 1: Successful User Registration
**Steps**:
1. Navigate to Registration tab
2. Enter User ID: "demo001"
3. Enter Name: "Demo User"
4. Click "Capture Image"
5. Click "Register"

**Expected**: Success message displayed

#### Test Case 2: Successful Payment (High Risk Score)
**Steps**:
1. Navigate to Payment tab
2. Enter registered User ID
3. Enter Amount: $100
4. Click "Verify & Pay"

**Expected**: 
- Decision: APPROVED
- Risk Score: > 0.8
- Green success indicator

#### Test Case 3: Payment Requiring OTP (Medium Risk Score)
**Steps**:
1. Use different lighting/angle
2. Enter Amount: $500
3. Click "Verify & Pay"

**Expected**:
- Decision: OTP_REQUIRED
- Risk Score: 0.5-0.8
- Yellow warning indicator

#### Test Case 4: Blocked Payment (Low Risk Score)
**Steps**:
1. Use unregistered User ID
2. Enter Amount: $1000
3. Click "Verify & Pay"

**Expected**:
- Decision: BLOCKED
- Risk Score: < 0.5
- Red error indicator

#### Test Case 5: Invalid Input Handling
**Steps**:
1. Leave User ID empty
2. Click "Verify & Pay"

**Expected**: Validation error message

## 5. Performance Testing

### Load Testing with Locust

Create `backend/tests/locustfile.py`:

```python
from locust import HttpUser, task, between
import base64

class FaceTrustUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def verify_payment(self):
        dummy_image = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        self.client.post("/api/verify-payment", json={
            "user_id": "test_user",
            "image": dummy_image,
            "amount": 100.0
        })
```

Run load test:
```bash
locust -f backend/tests/locustfile.py
```

### Performance Metrics
- **Target Response Time**: < 2 seconds
- **Throughput**: > 100 requests/second
- **Error Rate**: < 1%

## 6. Security Testing

### Security Checklist

- [ ] SQL Injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Input validation
- [ ] Authentication/Authorization
- [ ] HTTPS enforcement
- [ ] Secure headers
- [ ] Data encryption
- [ ] API key protection

### Penetration Testing

Test with OWASP ZAP or Burp Suite:
```bash
# Install OWASP ZAP
# Run automated scan
zap-cli quick-scan http://localhost:8000
```

## 7. AWS Testing

### Lambda Function Testing

```bash
# Invoke Lambda function
aws lambda invoke \
  --function-name facetrust-api \
  --payload '{"body": "{\"action\": \"verify\"}"}' \
  response.json

# Check response
cat response.json
```

### API Gateway Testing

```bash
# Test API endpoint
curl -X POST https://your-api-gateway-url/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "image": "...", "amount": 100}'
```

## 8. Accessibility Testing

### WCAG Compliance

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast (4.5:1 minimum)
- [ ] Alt text for images
- [ ] ARIA labels
- [ ] Focus indicators

Tools:
- Lighthouse (Chrome DevTools)
- axe DevTools
- WAVE browser extension

## 9. Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 10. Regression Testing

### Automated Regression Suite

Create `backend/tests/test_regression.py`:

```python
def test_backward_compatibility():
    """Ensure old API format still works"""
    pass

def test_data_migration():
    """Test user data migration"""
    pass

def test_model_updates():
    """Verify model updates don't break existing functionality"""
    pass
```

## Test Data

### Sample Test Users

```json
{
  "users": [
    {
      "user_id": "test001",
      "name": "Alice Johnson",
      "scenario": "High confidence match"
    },
    {
      "user_id": "test002",
      "name": "Bob Smith",
      "scenario": "Medium confidence match"
    },
    {
      "user_id": "test003",
      "name": "Charlie Brown",
      "scenario": "Low confidence match"
    }
  ]
}
```

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install pytest
    
    - name: Run tests
      run: |
        cd backend
        pytest tests/
    
    - name: Set up Node
      uses: actions/setup-node@v2
      with:
        node-version: 16
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm install
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test
```

## Test Coverage

Target: > 80% code coverage

```bash
# Backend coverage
cd backend
pytest --cov=services tests/

# Frontend coverage
cd frontend
npm test -- --coverage
```

## Bug Reporting Template

```markdown
**Bug Title**: [Brief description]

**Environment**:
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [If applicable]

**Logs**: [Error messages]

**Severity**: [Critical/High/Medium/Low]
```

## Testing Schedule

- **Daily**: Unit tests (automated)
- **Weekly**: Integration tests
- **Before Release**: Full regression suite
- **Monthly**: Security audit
- **Quarterly**: Performance testing

---

**Remember**: Testing is continuous. Always test after changes!
