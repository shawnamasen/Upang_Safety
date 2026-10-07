// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Profile() {
  const navigate = useNavigate();
  const { userEmail, logout } = useUser();
  const [isProfessor, setIsProfessor] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const [userData, setUserData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    department: '',
    course: '',
    yearLevel: '',
    phoneNumber: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        // Try professor profile first
        let response = await fetch('http://localhost:5000/prof/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsProfessor(true);
          setUserData({
            fullName: data.name,
            email: data.email,
            department: data.department,
            phoneNumber: data.phone,
            professorId: data.professorId
          });
        } else {
          // If not a professor, try student profile
          response = await fetch('http://localhost:5000/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setIsProfessor(false);
            setUserData({
              fullName: data.name,
              studentId: data.StudentID,
              email: data.email,
              department: data.department,
              course: data.course,
              yearLevel: data.year,
              phoneNumber: data.phone
            });
          } else {
            throw new Error('Failed to fetch profile');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile data');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('Please fill all fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    // Password validation
    const passwordRegex = {
      length: /^.{8,16}$/,
      uppercase: /[A-Z]/,
      number: /[0-9]/,
      special: /[!@#$%^&*(),.?":{}|<>]/
    };

    if (!passwordRegex.length.test(passwordData.newPassword)) {
      setMessage('New password must be between 8 and 16 characters.');
      return;
    }
    if (!passwordRegex.uppercase.test(passwordData.newPassword)) {
      setMessage('New password must contain at least one uppercase letter.');
      return;
    }
    if (!passwordRegex.number.test(passwordData.newPassword)) {
      setMessage('New password must contain at least one number.');
      return;
    }
    if (!passwordRegex.special.test(passwordData.newPassword)) {
      setMessage('New password must contain at least one special character.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/user/profile/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        setMessage(data.message || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <img 
              src="/images/upang-logo.png" 
              alt="UPANG Logo" 
              className="h-8 w-8 rounded-full"
            />
            <h1 className="text-xl font-bold text-gray-800">UPANG Facility Management</h1>
          </div>
          <div className="flex flex-wrap justify-start sm:justify-end gap-6 w-full sm:w-auto items-center">
            <button onClick={() => navigate('/dashboard')} className="text-gray-700 hover:text-green-600 font-medium">Dashboard</button>
            <button onClick={() => navigate('/track-reports')} className="text-gray-700 hover:text-green-600 font-medium">Track Reports</button>
            <button 
              onClick={handleSignOut}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <FaArrowLeft 
          className="text-gray-600 cursor-pointer text-xl mb-4" 
          onClick={() => navigate(-1)} 
        />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">View your personal details and manage your account.</p>
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
              {userData.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{userData.fullName}</h2>
              <p className="text-gray-600">{isProfessor ? userData.professorId : userData.studentId}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="font-medium">{userData.fullName}</p>
            </div>
            {!isProfessor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <p className="font-medium">{userData.studentId}</p>
              </div>
            )}
            {isProfessor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor ID</label>
                <p className="font-medium">{userData.professorId}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <p className="font-medium text-blue-600">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <p className="font-medium">{userData.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <p className="font-medium">{userData.department}</p>
            </div>
            {!isProfessor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <p className="font-medium">{userData.course}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                  <p className="font-medium">{userData.yearLevel}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 mb-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className={`mb-4 text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-2 px-6 rounded-lg transition shadow-md ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}