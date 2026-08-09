import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { UserPlus, MoreVertical, X, Trash2, Edit, KeyRound, ArrowLeft } from 'lucide-react';

// --- Mock Data ---
const usersData = [];

// --- Sub-components ---
const AddUserModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Student');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit({ name, email, role, isActive: true });
            onClose();
        } catch (err) {
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Add User</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
                    <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border px-3 py-2 rounded" />
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full border px-3 py-2 rounded">
                        <option>Student</option>
                        <option>Professor</option>
                        <option>Admin</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditUserModal = ({ user, onClose, onSubmit }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState(user?.role || 'Student');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(user._id, { name, email, role });
            onClose();
        } catch (err) {
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
                    <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border px-3 py-2 rounded" />
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full border px-3 py-2 rounded">
                        <option>Student</option>
                        <option>Professor</option>
                        <option>Admin</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ActionMenu = ({ user, onEdit, onDeactivate }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const closeMenu = () => setIsOpen(false);
        if (isOpen) window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, [isOpen]);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                    <a href="#" onClick={(e) => { e.preventDefault(); onEdit(user); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Edit size={16} className="mr-2" /> Edit User
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onDeactivate(user._id); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 size={16} className="mr-2" /> Deactivate
                    </a>
                </div>
            )}
        </div>
    );
};

// --- Main Page ---
const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Fetch real users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/user/allusers');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('Failed to load users. Please check if backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Create user
    const createUser = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const newUser = await response.json();
            setUsers(prev => [...prev, newUser]);
            return newUser;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    };

    // Update user
    const updateUser = async (userId, userData) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            const updatedUser = await response.json();
            setUsers(prev => 
                prev.map(user => user._id === userId ? updatedUser : user)
            );
            return updatedUser;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    };

    // Deactivate user
    const deactivateUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to deactivate user');
            }

            const deactivatedUser = await response.json();
            setUsers(prev => 
                prev.map(user => 
                    user._id === userId ? { ...user, isActive: false } : user
                )
            );
            return deactivatedUser;
        } catch (error) {
            console.error('Deactivate user error:', error);
            throw error;
        }
    };

    const filteredUsers = users.filter(user =>
        (roleFilter === 'All' || user.role === roleFilter) && user.isActive
    );

    if (loading) return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div>Loading users...</div>
            </main>
        </div>
    );

    if (error) return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="text-red-600">{error}</div>
            </main>
        </div>
    );

    // Update ActionMenu to use deactivateUser
    const ActionMenu = ({ user, onEdit, onDeactivate }) => {
        const [isOpen, setIsOpen] = useState(false);
        
        useEffect(() => {
            const closeMenu = () => setIsOpen(false);
            if (isOpen) {
                window.addEventListener('click', closeMenu);
            }
            return () => window.removeEventListener('click', closeMenu);
        }, [isOpen]);

        return (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                    <MoreVertical size={20} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                        <a href="#" onClick={(e) => { e.preventDefault(); onEdit(user); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit size={16} className="mr-2" /> Edit User
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onDeactivate(user._id); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={16} className="mr-2" /> Deactivate
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500 mt-1">Monitor and manage campus user accounts</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center bg-green-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                    >
                        <UserPlus size={20} className="mr-2" /> Add User
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                        <label htmlFor="role" className="mr-2 font-medium text-gray-700">Role:</label>
                        <select
                            id="role"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Student">Student</option>
                            <option value="Professor">Professor</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider"># of Reports</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.userId || user._id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.role}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-center text-gray-800">{user.reportsCount || 0}</td>
                                        <td className="px-6 py-4 text-sm flex justify-center">
                                            <ActionMenu 
                                                user={user} 
                                                onEdit={setEditingUser}
                                                onDeactivate={deactivateUser}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isAddModalOpen && (
                <AddUserModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={createUser}
                />
            )}
            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)}
                    onSubmit={updateUser}
                />
            )}
        </div>
    );
};

export default UserManagementPage;