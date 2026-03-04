import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function UserRegistration() {
  const webcamRef = useRef(null);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const registerUser = async () => {
    if (!userId || !name || !capturedImage) {
      alert('Please fill all fields and capture an image');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_URL}/api/register-user`, {
        user_id: userId,
        name: name,
        image: capturedImage
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'User registered successfully!'
      });
      
      // Reset form
      setUserId('');
      setName('');
      setCapturedImage(null);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">User Registration</h2>
      
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
            placeholder="Enter unique User ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capture Face Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {!capturedImage ? (
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full"
                mirrored={true}
              />
            ) : (
              <img src={capturedImage} alt="Captured" className="w-full" />
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          {!capturedImage ? (
            <button
              onClick={captureImage}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Capture Image
            </button>
          ) : (
            <>
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Retake
              </button>
              <button
                onClick={registerUser}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </>
          )}
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserRegistration;
