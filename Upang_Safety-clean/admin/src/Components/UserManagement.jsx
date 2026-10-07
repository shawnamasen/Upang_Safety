import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { UserPlus, MoreVertical, X, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// --- Sub-components ---
const AddUserModal = ({ onClose, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState(null);
    const [formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const initialStudentState = {
        studentId: '', email: '', password: '', confirmPassword: '', name: '',
        year: '', phoneNumber: '', department: '', course: ''
    };
    const initialProfessorState = {
        professorId: '', name: '', password: '', confirmPassword: '',
        email: '', department: '', phoneNumber: ''
    };
    const handleRoleSelect = (role) => {
        setUserType(role);
        setFormData(role === 'Student' ? initialStudentState : initialProfessorState);
        setStep(2);
    };
    const handleBack = () => {
        setStep(1);
        setUserType(null);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const [errors, setErrors] = useState({});
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
    const validateEmail = (email) => {
        if (!email.endsWith('@phinmaed.com')) {
            return 'Email must be a @phinmaed.com address';
        }
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match!";
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            newErrors.password = passwordError;
        }
        const emailError = validateEmail(formData.email);
        if (emailError) {
            newErrors.email = emailError;
        }
        const requiredFields = userType === 'Student' 
            ? ['studentId', 'email', 'password', 'name', 'year', 'phoneNumber', 'department', 'course']
            : ['professorId', 'email', 'password', 'name', 'phoneNumber', 'department'];
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                newErrors[field] = 'This field is required';
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            await onSubmit({ ...formData, role: userType });
            onClose();
        } catch (err) {
            console.error("Error adding user:", err);
            const errorMessage = err.message || 'Failed to create user. Please try again.';
            setErrors({ 
                submit: errorMessage,
                ...(errorMessage.includes('already exists') && {
                    [userType === 'Student' ? 'studentId' : 'professorId']: 'ID already exists'
                })
            });
        }
    };
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <header className="flex justify-between items-center p-5 border-b">
                    {step === 2 && (
                        <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 mr-2">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-800">
                        {step === 1 ? 'Select User Type' : `Add New ${userType}`}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 ml-auto">
                        <X size={24} className="text-gray-600" />
                    </button>
                </header>
                {step === 1 && (
                    <div className="p-8 flex justify-center gap-6">
                        <button
                            onClick={() => handleRoleSelect('Student')}
                            className="w-40 h-24 text-lg font-semibold border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300"
                        >
                            Student
                        </button>
                        <button
                            onClick={() => handleRoleSelect('Professor')}
                            className="w-40 h-24 text-lg font-semibold border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300"
                        >
                            Professor
                        </button>
                    </div>
                )}
                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {userType === 'Student' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                name="studentId" 
                                                placeholder="Student ID" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.studentId ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                                        </div>
                                        <div>
                                            <input 
                                                name="name" 
                                                placeholder="Full Name" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <input 
                                            name="email" 
                                            type="email" 
                                            placeholder="Email Address (@phinmaed.com)" 
                                            onChange={handleChange} 
                                            className={`input w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="relative">
                                                <input 
                                                    name="password" 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password" 
                                                    onChange={handleChange} 
                                                    className={`input w-full border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <input 
                                                    name="confirmPassword" 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm Password" 
                                                    onChange={handleChange} 
                                                    className={`input w-full border rounded px-3 py-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        Password must:
                                        <ul className="list-disc pl-5">
                                            <li>Be between 8-16 characters</li>
                                            <li>Include at least one uppercase letter</li>
                                            <li>Include at least one number</li>
                                            <li>Include at least one special character</li>
                                        </ul>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                name="year" 
                                                placeholder="Year" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                                        </div>
                                        <div>
                                            <input 
                                                name="phoneNumber" 
                                                placeholder="Phone Number" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                name="department" 
                                                placeholder="Department" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                                        </div>
                                        <div>
                                            <input 
                                                name="course" 
                                                placeholder="Course" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.course ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                                        </div>
                                    </div>
                                </>
                            )}
                            {userType === 'Professor' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                name="professorId" 
                                                placeholder="Professor ID" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.professorId ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.professorId && <p className="text-red-500 text-sm mt-1">{errors.professorId}</p>}
                                        </div>
                                        <div>
                                            <input 
                                                name="name" 
                                                placeholder="Full Name" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <input 
                                            name="email" 
                                            type="email" 
                                            placeholder="Email Address (@phinmaed.com)" 
                                            onChange={handleChange} 
                                            className={`input w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="relative">
                                                <input 
                                                    name="password" 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password" 
                                                    onChange={handleChange} 
                                                    className={`input w-full border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <input 
                                                    name="confirmPassword" 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm Password" 
                                                    onChange={handleChange} 
                                                    className={`input w-full border rounded px-3 py-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        Password must:
                                        <ul className="list-disc pl-5">
                                            <li>Be between 8-16 characters</li>
                                            <li>Include at least one uppercase letter</li>
                                            <li>Include at least one number</li>
                                            <li>Include at least one special character</li>
                                        </ul>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input 
                                                name="department" 
                                                placeholder="Department" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                                        </div>
                                        <div>
                                            <input 
                                                name="phoneNumber" 
                                                placeholder="Phone Number" 
                                                onChange={handleChange} 
                                                className={`input w-full border rounded px-3 py-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <footer className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                Add User
                            </button>
                        </footer>
                    </form>
                )}
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
            console.error("Edit error:", err);
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

const ActionMenu = ({ user, onEdit, onDeactivate, onActivate }) => {
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
                    {user.isActive !== false ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); onDeactivate(user._id); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={16} className="mr-2" /> Deactivate
                        </a>
                    ) : (
                        <a href="#" onClick={(e) => { e.preventDefault(); onActivate(user._id); setIsOpen(false); }} className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                            <UserPlus size={16} className="mr-2" /> Activate
                        </a>
                    )}
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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError('');

                // Fetch all data in parallel
                const [studentsRes, profsRes, incidentsRes] = await Promise.all([
                    fetch('http://localhost:5000/user/allusers'),
                    fetch('http://localhost:5000/prof/allprofs'),
                    fetch('http://localhost:5000/incidents/admin/all')
                ]);

                let combinedUsers = [];

                // Process students
                if (studentsRes.ok) {
                    const students = await studentsRes.json();
                    combinedUsers = students.map(s => ({
                        ...s,
                        role: 'Student',
                        userId: s.StudentID || s.studentId,
                        department: s.department || 'N/A',
                        course: s.course || 'N/A',
                        year: s.year || 'N/A',
                        lastActivity: s.lastLoginDate || 'Never',
                        reportsCount: 0,
                        isActive: s.isActive !== false
                    }));
                }

                // Process professors
                if (profsRes.ok) {
                    const profs = await profsRes.json();
                    combinedUsers = [
                        ...combinedUsers,
                        ...profs.map(p => ({
                            ...p,
                            role: 'Professor',
                            userId: p.professorId,
                            department: p.department || 'N/A',
                            lastActivity: p.lastLoginDate || 'Never',
                            reportsCount: 0,
                            isActive: p.isActive !== false
                        }))
                    ];
                }

                // Count reports per user
                if (incidentsRes.ok) {
                    const incidents = await incidentsRes.json();
                    console.log('Fetched incidents:', incidents);
                    
                    const reportCounts = {};

                    incidents.forEach(incident => {
                        const incidentEmail = incident.UserEmail?.toLowerCase();
                        if (incidentEmail) {
                            console.log('Processing incident:', {
                                id: incident._id,
                                email: incidentEmail,
                                title: incident.title
                            });
                            reportCounts[incidentEmail] = (reportCounts[incidentEmail] || 0) + 1;
                        }
                    });

                    console.log('Report counts by email:', reportCounts);

                    // Attach counts to users using email to match
                    combinedUsers = combinedUsers.map(user => {
                        const userEmail = user.email?.toLowerCase();
                        const count = reportCounts[userEmail] || 0;
                        console.log(`User ${user.name} (${userEmail}): ${count} reports`);
                        return {
                            ...user,
                            reportsCount: count
                        };
                    });
                }

                if (combinedUsers.length === 0) {
                    setError('No users found.');
                }

                setUsers(combinedUsers);
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const createUser = async (userData) => {
        try {
            if (!userData.email.endsWith('@phinmaed.com')) {
                throw new Error('Email must be a @phinmaed.com address');
            }
            const endpoint = userData.role === 'Student' 
                ? 'http://localhost:5000/user/signup'
                : 'http://localhost:5000/prof/signup';
            const transformedData = userData.role === 'Student' 
                ? {
                    StudentID: userData.studentId,
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    year: userData.year,
                    phone: userData.phoneNumber,
                    department: userData.department,
                    course: userData.course
                }
                : {
                    professorId: userData.professorId,
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    phone: userData.phoneNumber,
                    department: userData.department
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transformedData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create user');
            }

            // Refresh list
            const [studentsRes, profsRes] = await Promise.all([
                fetch('http://localhost:5000/user/allusers'),
                fetch('http://localhost:5000/prof/allprofs')
            ]);
            const students = (await studentsRes.json()) || [];
            const profs = (await profsRes.json()) || [];
            const combined = [
                ...students.map(s => ({ ...s, role: 'Student', userId: s.StudentID, isActive: s.isActive !== false })),
                ...profs.map(p => ({ ...p, role: 'Professor', userId: p.professorId, isActive: p.isActive !== false }))
            ];
            setUsers(combined);
        } catch (error) {
            console.error('Create user error:', error);
            alert(error.message || 'Failed to create user');
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            // ✅ FIXED: Use /user/ instead of /users/
            const response = await fetch(`http://localhost:5000/user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error('Failed to update user');
            const updatedUser = await response.json();
            setUsers(prev => prev.map(u => u._id === userId ? updatedUser : u));
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update user');
        }
    };

    const deactivateUser = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await fetch(`http://localhost:5000/user/${userId}`, { method: 'DELETE' });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: false } : u));
        } catch (err) {
            console.error('Deactivate error:', err);
            alert('Failed to deactivate user');
        }
    };

    const activateUser = async (userId) => {
        if (!window.confirm('Are you sure you want to activate this user?')) return;
        try {
            await fetch(`http://localhost:5000/user/admin/${userId}/activate`, { method: 'POST' });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: true } : u));
        } catch (err) {
            console.error('Activate error:', err);
            alert('Failed to activate user');
        }
    };

    const [showDeactivated, setShowDeactivated] = useState(false);

    const filteredUsers = users.filter(user =>
        (roleFilter === 'All' || user.role === roleFilter) &&
        (showDeactivated ? true : user.isActive !== false)
    );

    if (loading) return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                    <span>Loading users...</span>
                </div>
            </main>
        </div>
    );

    if (error) return (
        <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </main>
        </div>
    );

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
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.isActive !== false).length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Students</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {users.filter(u => u.role === 'Student' && u.isActive !== false).length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">Professors</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                            {users.filter(u => u.role === 'Professor' && u.isActive !== false).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4 gap-4">
                        <div className="flex items-center">
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
                        <div className="flex items-center">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-green-600"
                                    checked={showDeactivated}
                                    onChange={(e) => setShowDeactivated(e.target.checked)}
                                />
                                <span className="ml-2 text-gray-700">Show Deactivated Users</span>
                            </label>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                        {roleFilter === 'Student' ? 'Course & Year' : 'Last Activity'}
                                    </th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    user.role === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                                {user.isActive === false && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Deactivated
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{user.department || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            {user.role === 'Student' 
                                                ? `${user.course || 'N/A'} - ${user.year || 'N/A'}`
                                                : user.lastActivity || 'Never'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-center text-gray-800">
                                            {user.reportsCount}
                                        </td>
                                        <td className="px-6 py-4 text-sm flex justify-center">
                                            <ActionMenu 
                                                user={user} 
                                                onEdit={setEditingUser}
                                                onDeactivate={deactivateUser}
                                                onActivate={activateUser}
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