import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PaymentFlow() {
  const webcamRef = useRef(null);
  const [amount, setAmount] = useState('100.00');
  const [userId, setUserId] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const captureAndVerify = async () => {
    if (!userId) {
      alert('Please enter User ID');
      return;
    }

    setCapturing(true);
    setLoading(true);
    setResult(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      const response = await axios.post(`${API_URL}/api/verify-payment`, {
        user_id: userId,
        image: imageSrc,
        amount: parseFloat(amount)
      });

      setResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        decision: 'BLOCKED',
        message: 'Verification failed. Please try again.',
        risk_score: 0
      });
    } finally {
      setLoading(false);
      setCapturing(false);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50';
      case 'OTP_REQUIRED':
        return 'text-yellow-600 bg-yellow-50';
      case 'BLOCKED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Verification</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your User ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              step="0.01"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
              mirrored={true}
            />
          </div>

          <button
            onClick={captureAndVerify}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Verifying...' : 'Verify & Pay'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Verification Results</h2>
        
        {!result && (
          <div className="text-center text-gray-500 py-12">
            <p>Capture your face to start verification</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${getDecisionColor(result.decision)}`}>
              <h3 className="text-xl font-bold mb-2">Decision: {result.decision}</h3>
              <p>{result.message}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Risk Score</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    result.risk_score > 0.8
                      ? 'bg-green-500'
                      : result.risk_score > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.risk_score * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {(result.risk_score * 100).toFixed(1)}%
              </p>
            </div>

            {result.details && (
              <div className="space-y-2">
                <h4 className="font-semibold">Verification Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Face Match:</span>
                    <span className="font-semibold ml-2">
                      {(result.details.face_match * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Liveness:</span>
                    <span className="font-semibold ml-2">
                      {(result.details.liveness * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Deepfake:</span>
                    <span className="font-semibold ml-2">
                      {(result.details.deepfake * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Emotion:</span>
                    <span className="font-semibold ml-2">
                      {result.details.emotion}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentFlow;
