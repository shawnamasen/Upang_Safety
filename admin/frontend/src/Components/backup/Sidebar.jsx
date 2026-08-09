import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, BarChart2, Users, Settings, LogOut
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const NavLink = ({ icon, label, path }) => {
        const isActive = location.pathname === path;
        return (
            <button
                onClick={() => navigate(path)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-green-700 text-white'
                        : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </button>
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/AdminLogin');
    };

    return (
        <>
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-green-800 text-white flex flex-col h-screen fixed">
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-center px-4 border-b border-green-700">
                    <div className="w-10 h-10 bg-white rounded-full mr-3 flex items-center justify-center">
                        <span className="font-bold text-green-800 text-lg">U</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-wider">UPANG SAFETY</h1>
                </div>

                {/* Admin Info */}
                <div className="flex items-center p-4 border-b border-green-700">
                    <img
                        src="https://placehold.co/40x40/a0aec0/ffffff?text=A"
                        alt="Admin Profile"
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                        <p className="font-semibold text-sm">Admin Profile</p>
                        <span className="text-xs text-green-300 bg-green-900 px-2 py-0.5 rounded">ADMIN</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2">
                    <NavLink icon={<LayoutDashboard size={20} />} label="DASHBOARD" path="/AdminDashboard" />
                    <NavLink icon={<FileText size={20} />} label="REPORT MANAGEMENT" path="/ReportManagement" />
                    <NavLink icon={<BarChart2 size={20} />} label="ANALYTICS" path="/Analytics" />
                    <NavLink icon={<Users size={20} />} label="USERS MANAGEMENT" path="/UserManagement" />
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-green-700">
                    <NavLink icon={<Settings size={20} />} label="SETTINGS" path="/Settings" />

                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-green-100 hover:bg-green-600 hover:text-white transition-colors mt-2"
                    >
                        <LogOut size={20} />
                        <span className="ml-3">LOGOUT</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl p-6 shadow-xl w-80">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Are you sure you want to log out from your admin account?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
