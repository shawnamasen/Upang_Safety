import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const DecorativeShape = ({ className }) => (
  <div className={`absolute ${className}`}>
    <div className="w-24 h-40 bg-green-200 opacity-50 transform -rotate-45"></div>
    <div className="w-32 h-48 bg-[#2E5945] transform -rotate-45 -ml-12 mt-4"></div>
  </div>
);

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@phinmaed.com')) {
      newErrors.email = 'Only @phinmaed.com email addresses are allowed';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/AdminDashboard");
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowCreateAccount(false);
        setErrors({ success: 'Account created successfully! Please log in.' });
        setFormData({ email: '', password: '' });
      } else {
        setErrors({ submit: data.message || 'Failed to create account' });
      }
    } catch (err) {
      setErrors({ submit: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Panel */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <DecorativeShape className="top-10 left-10" />
        <DecorativeShape className="top-10 right-10" />

        <div className="z-10 text-center">
          <img src="/upang_logo.png" alt="University of Pangasinan Logo" className="w-40 h-40 mx-auto mb-6"/>
          <h1 className="text-4xl font-bold text-gray-800">University of Pangasinan</h1>
          <p className="text-gray-500 mt-2">28WV+R2R, Arellano St, Downtown District, Dagupan, 2400 Pangasinan, Philippines</p>
        </div>

        <DecorativeShape className="bottom-10 left-10" />
        <DecorativeShape className="bottom-10 right-10" />
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/PHINMAEd_Logo.png" alt="PHINMA Education Logo" className="w-48 mx-auto mb-4"/>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
              <span className="ml-3 bg-gray-200 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">ADMIN</span>
            </div>

            <form onSubmit={showCreateAccount ? handleCreateAccount : handleLogin}>
              {errors.success && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                  {errors.success}
                </div>
              )}
              {errors.submit && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {errors.submit}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  <span className="text-red-500">*</span> Email
                </label>
                <input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter Email" 
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`} 
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  <span className="text-red-500">*</span> Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter Password"
                    className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                {!showCreateAccount && (
                  <a href="#" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    Forgot Password?
                  </a>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#2E5945] text-white font-bold py-2 px-4 rounded-md hover:bg-[#4A7C65] transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Please wait...' : (showCreateAccount ? 'Create Account' : 'Sign In')}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAccount(!showCreateAccount);
                    setErrors({});
                    setFormData({ email: '', password: '' });
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showCreateAccount ? 'Back to Login' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
