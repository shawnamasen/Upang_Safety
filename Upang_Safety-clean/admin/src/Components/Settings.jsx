import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profile, setProfile] = useState({
        email: '',
        fullName: ''
    });
    
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/AdminLoginPage');
            return;
        }

        // Fetch admin profile
        fetch('http://localhost:5000/admin/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.email) {
                setProfile({ 
                    email: data.email,
                    fullName: data.fullName || ''
                });
            }
        })
        .catch(err => {
            console.error('Error fetching profile:', err);
            setMessage({ type: 'error', text: 'Error loading profile' });
        });
    }, [navigate]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (!profile.fullName.trim()) {
            setMessage({ type: 'profile-error', text: 'Full name is required' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setMessage({ type: 'profile-error', text: 'Please log in again.' });
                navigate('/AdminLoginPage');
                return;
            }

            const response = await fetch('http://localhost:5000/admin/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: profile.fullName
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'profile-success', text: data.message || 'Profile updated successfully!' });
                // Update the name in localStorage for Sidebar
                localStorage.setItem('adminName', profile.fullName);
                // Trigger a re-render of the sidebar if needed
                window.dispatchEvent(new Event('adminProfileUpdated'));
            } else {
                setMessage({ type: 'profile-error', text: data.message || 'Error updating profile' });
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    navigate('/AdminLoginPage');
                }
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'profile-error', text: 'Server error while updating profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const maxLength = 16;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (password.length < minLength || password.length > maxLength) {
            return 'Password must be between 8 and 16 characters long';
        }
        if (!hasUpperCase) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!hasNumber) {
            return 'Password must contain at least one number';
        }
        if (!hasSpecialChar) {
            return 'Password must contain at least one special character';
        }
        return null;
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (!passwords.oldPassword || !passwords.newPassword) {
            setMessage({ type: 'error', text: 'All password fields are required.' });
            return;
        }

        const passwordError = validatePassword(passwords.newPassword);
        if (passwordError) {
            setMessage({ type: 'error', text: passwordError });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                setMessage({ type: 'error', text: 'Please log in again.' });
                navigate('/AdminLoginPage');
                return;
            }

            const response = await fetch('http://localhost:5000/admin/update-password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Error updating password' });
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('adminToken');
                    navigate('/AdminLoginPage');
                }
            }
        } catch (err) {
            console.error('Error updating password:', err);
            setMessage({ type: 'error', text: 'Server error while updating password. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            {/* ✅ Sidebar Section */}
            <Sidebar />

            {/* ✅ Main Settings Content */}
            <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Review system and profile settings</p>
                </header>

                {/* Profile Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Profile Settings</h2>
                    {message.type === 'profile-success' && (
                        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
                            {message.text}
                        </div>
                    )}
                    {message.type === 'profile-error' && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={profile.fullName}
                                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-50 text-gray-600"
                                placeholder="Loading..."
                            />
                            <p className="mt-1 text-sm text-gray-500">Email address cannot be changed</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-green-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 font-medium ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${
                            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSavePassword} className="space-y-6 max-w-lg">
                        {/* Old Password */}
                        <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Old Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={passwords.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter your current password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                                <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                                    <li>Must be 8-16 characters long</li>
                                    <li>Must contain at least one uppercase letter</li>
                                    <li>Must contain at least one number</li>
                                    <li>Must contain at least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
                                </ul>
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-green-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 font-medium ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Updating Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
