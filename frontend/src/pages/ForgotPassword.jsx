import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify, 3: Reset
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">BA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bluelight Academy</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          {/* Step 1: Email */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Enter your email address and we'll send you a verification code
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="admin@bluelight.edu"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Verify Email
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Enter the 6-digit code sent to {formData.email}
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Enter your new password
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-gray-600 mb-8">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <Link
                to="/login"
                className="btn-primary inline-block px-8 py-3 text-lg font-semibold"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;