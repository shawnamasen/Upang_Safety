import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, ImageIcon } from 'lucide-react';
import Sidebar from './Sidebar';

// --- SUB COMPONENTS (keep exactly as they are) ---
const StatusBadge = ({ status }) => {
    const colors = {
        Submitted: 'bg-gray-100 text-gray-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        'Under Review': 'bg-blue-100 text-blue-800',
        Resolved: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const ReportDetailsModal = ({ report, onClose, onUpdateStatus, onDelete }) => {
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [saving, setSaving] = useState(false);
    // Handle save status change
     const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateStatus(report._id, currentStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
      setSaving(false);
    }
  };

  // handleDelete 
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/incidents/${report.id || report._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete report');

      // Notify parent about deletion
      if (typeof onDelete === 'function') {
        onDelete(report.id || report._id);
      }
      onClose();
    } catch (error) {
      alert('Error deleting report: ' + error.message);
    }
  };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
                        <p className="text-sm text-gray-500">Report ID: {report.reportnumber || report.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={24} className="text-gray-600" />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left - Image */}
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[250px]">
                            {report.Photoevidence && report.Photoevidence.length > 0 ? (
                                <img 
                                    src={report.Photoevidence[0]} 
                                    alt="Incident" 
                                    className="max-w-full max-h-full object-contain rounded-md" 
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <ImageIcon size={48} className="mx-auto" />
                                    <p className="mt-2">No photo provided</p>
                                </div>
                            )}
                        </div>

                        {/* Right - Details */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">{report.category}</h3>
                                <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                            </div>
                            <div className="border-t pt-4 space-y-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <MapPin size={16} className="mr-3 text-gray-400" />
                                    <strong>Location:</strong><span className="ml-2">{report.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Calendar size={16} className="mr-3 text-gray-400" />
                                    <strong>Date:</strong><span className="ml-2">
                                        {report.createdAt ? new Date(report.createdAt).toISOString().split('T')[0] : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <User size={16} className="mr-3 text-gray-400" />
                                    <strong>Reporter:</strong><span className="ml-2">
                                        {report.Username || report.UserEmail?.split('@')[0] || 'Anonymous'}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <strong className="mr-3">Status:</strong>
                                    <StatusBadge status={currentStatus} />
                                </div>
                                <div>
                                    <strong>Category: </strong>
                                    <p className="flex items-center inline text-gray-600">{report.category || 'N/A'}</p>
                                </div>
                                <div>
                                    <strong>Priority Level: </strong>
                                    <p className="flex items-center inline text-gray-600">
                                            {report.priority ? report.priority.charAt(0).toUpperCase() + report.priority.slice(1) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t mt-6 pt-5">
                        <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="w-full sm:w-auto">
                                <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-1">Change Status</label>
                                <select
                                    id="status-update"
                                    value={currentStatus}
                                    onChange={(e) => setCurrentStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="flex justify-between items-center p-5 border-t bg-gray-50 rounded-b-lg">
                    <button 
                    onClick={() => {
                     if (window.confirm('Are you sure you want to delete this report?')) {
                        handleDelete();
                     }
                    }}
                    className='px-4 py-2 rounded-md text-white bg-red-700 hover:bg-red-600'
                    >
                        Delete Report
                    </button>

                <div className='flex gap-3'>
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Close</button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const ReportManagementPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedReport, setSelectedReport] = useState(null);

    // Fetch reports from backend
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/incidents/admin/all');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setReports(data);
            } catch (err) {
                console.error('Failed to fetch reports:', err);
                setError('Failed to load reports. Please check if backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Update status in backend
    const updateReportStatus = async (reportId, newStatus) => {
        const response = await fetch(`http://localhost:5000/incidents/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        const updatedReport = await response.json();
        
        // Update local state
        setReports(reports.map(report => 
            report._id === reportId ? { ...report, status: newStatus } : report
        ));
    };

    const filteredReports = reports.filter(
        report => statusFilter === 'All' || report.status === statusFilter
    );

    if (loading) return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div>Loading reports...</div>
            </main>
        </div>
    );

    if (error) return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="text-red-600">{error}</div>
            </main>
        </div>
    );

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
                        <p className="text-gray-500 mt-1">Monitor and manage campus safety reports</p>
                    </div>
                </header>

                {/* Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                        <label htmlFor="status" className="mr-2 font-medium text-gray-700">Status:</label>
                        <select
                            id="status"
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Report ID</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Reporter</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-800">{report.reportnumber || report._id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            {report.Username || report.UserEmail?.split('@')[0] || 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{report.category}</td>
                                        <td className="px-6 py-4 text-sm"><StatusBadge status={report.status} /></td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            {report.createdAt ? new Date(report.createdAt).toISOString().split('T')[0] : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button 
                                                onClick={() => setSelectedReport(report)} 
                                                className="text-green-600 hover:underline font-medium"
                                            >
                                                View details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            {selectedReport && (
                <ReportDetailsModal 
                    report={selectedReport} 
                    onClose={() => setSelectedReport(null)} 
                    onUpdateStatus={updateReportStatus}
                    onDelete={(id) => {
                        setReports(reports.filter(report => report._id !== id));
                    }}
                />
            )}
        </div>
    );
};

export default ReportManagementPage;