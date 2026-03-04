import React, { useState } from 'react';
import PaymentFlow from './components/PaymentFlow';
import UserRegistration from './components/UserRegistration';

function App() {
  const [mode, setMode] = useState('payment'); // 'payment' or 'register'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">FaceTrust AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMode('register')}
                className={`px-4 py-2 rounded-lg ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setMode('payment')}
                className={`px-4 py-2 rounded-lg ${
                  mode === 'payment'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Payment
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'register' ? <UserRegistration /> : <PaymentFlow />}
      </main>
    </div>
  );
}

export default App;
