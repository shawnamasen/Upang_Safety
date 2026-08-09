import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, X } from 'lucide-react';
import Sidebar from './Sidebar';

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    const colors = {
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'On Process': 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

// --- Priority Badge ---
const PriorityBadge = ({ level }) => {
    const priorityColors = {
        low: 'text-green-600',
        medium: 'text-yellow-600',
        high: 'text-red-600',
        'n/a': 'text-gray-400'
    };

    const lowercaseLevel = level?.toLowerCase() || 'n/a';
    
    return (
        <span className={`text-sm font-semibold ${priorityColors[lowercaseLevel] || 'text-gray-600'}`}>
            {lowercaseLevel === 'n/a' ? 'Not yet set' : lowercaseLevel}
        </span>
    );
};

// --- CONFIRMATION MODAL ---
const getFullDepartmentName = (shortName) => {
    switch (shortName) {
        case 'JSD':
            return 'JSD (Janitorial Service Department)';
        case 'ITS':
            return 'ITS (IT Services)';
        case 'Iclean':
            return 'Iclean';
        default:
            return shortName;
    }
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, count, staffName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <header className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-yellow-500" />
                        <h2 className="text-xl font-bold text-gray-800">Confirm Assignment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={24} className="text-gray-600" />
                    </button>
                </header>
                <div className="p-6 text-center">
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to assign <strong className="font-semibold">{count}</strong> selected report(s) to <strong className="font-semibold">{getFullDepartmentName(staffName)}</strong>?
                    </p>
                </div>
                <footer className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors font-medium"
                    >
                        Confirm Assignment
                    </button>
                </footer>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const AssignStaffPage = () => {
    const [pendingReports, setPendingReports] = useState([]);
    const [selectedReportIds, setSelectedReportIds] = useState(new Set());
    const [selectedStaff, setSelectedStaff] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch pending reports
    useEffect(() => {
        const fetchPendingReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/incidents/admin/all', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // ✅ FIX: Filter by 'On Hold' instead of 'Pending'
                const pendingOnly = data.filter(report => 
                    report.status === 'On Hold' && !report.assignedTo
                );

                setPendingReports(pendingOnly);
            } catch (err) {
                console.error('Failed to fetch pending reports:', err);
                setError('Failed to load pending reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingReports();
    }, []);

    const handleCheckboxChange = (report) => {
        // Check if priority is set (not N/A or empty)
        if (!report.priority || report.priority === 'N/A') {
            alert('Cannot assign staff to a report without a priority level. Please set the priority first.');
            return;
        }

        setSelectedReportIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(report._id)) newSet.delete(report._id);
            else newSet.add(report._id);
            return newSet;
        });
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            const reportsWithPriority = filteredReports.filter(
                report => report.priority && report.priority !== 'N/A'
            );
            
            if (reportsWithPriority.length === 0) {
                alert('No reports with priority level set available for selection.');
                e.target.checked = false;
                return;
            }

            setSelectedReportIds(new Set(reportsWithPriority.map(r => r._id)));
        } else {
            setSelectedReportIds(new Set());
        }
    };

    const prepareBulkAssign = () => {
        if (!selectedStaff) return alert("Please select a staff member.");
        if (selectedReportIds.size === 0) return alert("Please select at least one report.");
        setIsConfirmModalOpen(true);
    };

    const confirmAssignment = async () => {
        try {
            if (!selectedStaff) {
                alert("Please select a staff/team before assigning.");
                return;
            }
    
            // Convert Set to Array of report numbers (IDs)
            const reportIds = Array.from(selectedReportIds);
    
            if (reportIds.length === 0) {
                alert("Please select at least one report to assign.");
                return;
            }
    
            console.log("📤 Sending to backend:", {
                reportIds,
                assignedTo: selectedStaff,
            });
    
            const response = await fetch("http://localhost:5000/assign/assign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reportIds,
                    assignedTo: selectedStaff,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error("❌ Assign error:", data);
                alert(data.message || "Failed to assign staff. Please try again.");
                return;
            }
    
            console.log("✅ Backend response:", data);
    
            alert("Staff successfully assigned and notified via email!");
    
            // ✅ Soft refresh: re-fetch the latest pending reports
            const token = localStorage.getItem('token');
            const response2 = await fetch('http://localhost:5000/incidents/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            if (response2.ok) {
                const data2 = await response2.json();
                const pendingOnly = data2.filter(report =>
                    report.status === 'On Hold' && !report.assignedTo
                );
                setPendingReports(pendingOnly);
            }
    
            // ✅ Reset everything
            setSelectedReportIds(new Set());
            setSelectedStaff("");
            setIsConfirmModalOpen(false);
    
        } catch (error) {
            console.error("❌ Error assigning staff:", error);
            alert("Failed to assign staff. Please try again.");
        }
    };
    
        
    

    const filteredReports =
        priorityFilter === "All"
            ? pendingReports
            : pendingReports.filter(report => report.priority === priorityFilter);

    const isAllSelected = filteredReports.length > 0 && selectedReportIds.size === filteredReports.length;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-8 lg:ml-64">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Assign Staff</h1>
                        <p className="text-gray-500 mt-1">Assign pending reports to available staff.</p>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800">Pending Reports</h2>

                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <label htmlFor="priorityFilter" className="text-sm font-medium text-gray-700">
                                    Filter by Priority:
                                </label>
                                <select
                                    id="priorityFilter"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-green-500 focus:border-green-500 text-sm"
                                >
                                    <option value="All">All</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                    <option value="N/A">Not yet set</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <label htmlFor="bulkAssignStaff" className="text-sm font-medium text-gray-700">
                                    Assign Selected To:
                                </label>
                                <select
                                    id="bulkAssignStaff"
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-1.5 focus:ring-green-500 focus:border-green-500 text-sm"
                                    disabled={selectedReportIds.size === 0}
                                >
                                    <option value="">-- Select Staff --</option>
                                    <option value="JSD">JSD (Janitorial Service Department)</option>
                                    <option value="ITS">ITS (IT Services)</option>
                                    <option value="Iclean">Iclean</option>
                                </select>
                                <button
                                    onClick={prepareBulkAssign}
                                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedReportIds.size === 0 || !selectedStaff}
                                >
                                    <UserCheck size={16} className="inline mr-1.5" />
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[768px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            checked={isAllSelected}
                                            onChange={handleSelectAllChange}
                                            ref={el => el && (el.indeterminate = selectedReportIds.size > 0 && !isAllSelected)}
                                            disabled={loading || filteredReports.length === 0}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Report ID</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Priority Level</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-500">
                                            Loading pending reports...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report._id}
                                            className={`transition-colors ${selectedReportIds.has(report._id)
                                                ? 'bg-green-50'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-4 py-4 text-center">
                                                <div className="relative group">
                                                    <input
                                                        type="checkbox"
                                                        className={`form-checkbox h-4 w-4 border-gray-300 rounded focus:ring-green-500 
                                                            ${(!report.priority || report.priority === 'N/A') 
                                                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                                                : 'text-green-600'}`}
                                                        checked={selectedReportIds.has(report._id)}
                                                        onChange={() => handleCheckboxChange(report)}
                                                        disabled={!report.priority || report.priority === 'N/A'}
                                                    />
                                                    {(!report.priority || report.priority === 'N/A') && (
                                                        <div className="hidden group-hover:block absolute z-10 -top-1 left-6 bg-black text-white text-xs rounded py-1 px-2 w-48">
                                                            Set priority level before assigning staff
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{report.reportnumber || report._id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">{report.Username || report.UserEmail}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{report.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{report.location}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <PriorityBadge level={report.priority} />
                                                    {(!report.priority || report.priority === 'N/A') && (
                                                        <span className="text-xs text-red-500 font-medium">
                                                            Required for assignment
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <StatusBadge status={report.status || 'On Hold'} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-500">
                                            No pending reports found matching the filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmAssignment}
                count={selectedReportIds.size}
                staffName={selectedStaff}
            />
        </div>
    );
};

export default AssignStaffPage;