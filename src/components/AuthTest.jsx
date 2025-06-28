import React, { useState } from 'react';
import { Button } from './ui/button';
import AuthFlowManager from './auth/AuthFlowManager';
import { useAuth } from '../hooks/useAuth';
import { getUserData, isAuthenticated } from '../utils/tokenManager';
import { useNavigate } from 'react-router-dom';

const AuthTest = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authState, setAuthState] = useState({
    isLoggedIn: isAuthenticated(),
    userData: getUserData()
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // Update auth state without page reload
    setAuthState({
      isLoggedIn: isAuthenticated(),
      userData: getUserData()
    });
      navigate('/address');

  };

  const handleLogout = () => {
    logout();
    // Update auth state without page reload
    setAuthState({
      isLoggedIn: false,
      userData: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Authentication Test
        </h1>

        {authState.isLoggedIn ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Logged In Successfully!
              </h2>
              {authState.userData && (
                <div className="text-sm text-green-700">
                  <p><strong>Name:</strong> {authState.userData.first_name} {authState.userData.last_name}</p>
                  <p><strong>Email:</strong> {authState.userData.email}</p>
                  <p><strong>Mobile:</strong> {authState.userData.country_code}{authState.userData.mobile}</p>
                </div>
              )}
            </div>



            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                🔐 Not Logged In
              </h2>
              <p className="text-sm text-blue-700">
                Click the button below to test the authentication flow.
              </p>
            </div>

            <Button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-palette-orange hover:bg-palette-orange/90"
            >
              Test Authentication Flow
            </Button>


          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Test Flow:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Enter mobile number (try: 1234567890)</li>
            <li>2. Enter OTP (try: 1234)</li>
            <li>3. If new user → Complete registration → GPS Location</li>
            <li>4. If existing user → Login successful → GPS Location (if needed)</li>
            <li>5. GPS Location → Allow/Manual/Skip options</li>
          </ol>
        </div>
      </div>

      <AuthFlowManager
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AuthTest;
