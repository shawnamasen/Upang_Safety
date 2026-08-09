import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, ImageIcon, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';

// --- BADGES ---
const StatusBadge = ({ status }) => {
  const colors = {
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'On Process': 'bg-blue-100 text-blue-800',
    'In progress': 'bg-blue-100 text-blue-800',
    Resolved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    'N/A': 'bg-gray-100 text-gray-600',
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const lowercasePriority = priority?.toLowerCase() || 'n/a';
  
  return (
    <span className={`text-sm font-semibold px-3 ${priorityColors[lowercasePriority] || 'text-gray-600'}`}>
      {lowercasePriority === 'n/a' ? 'Not Set' : lowercasePriority}
    </span>
  );
};

// --- REPORT DETAILS MODAL ---
const ReportDetailsModal = ({ report, onClose, onUpdateStatus, onDelete }) => {
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [currentPriority, setCurrentPriority] = useState(report.priority?.toLowerCase() || 'low');
  const [saving, setSaving] = useState(false);
  const [savingPriority, setSavingPriority] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Can only change status if staff is assigned AND status is not Resolved
  const canChangeStatus = report.assignedTo && report.status !== 'Resolved';
  // Can only change priority if status is "On Hold"
  const canChangePriority = report.status === 'On Hold';

  const handlePrioritySave = async () => {
    if (!canChangePriority) {
      alert('Priority can only be set when the report is On Hold.');
      return;
    }
    
    try {
      setSavingPriority(true);
      await onUpdateStatus(report._id, report.status, currentPriority);
      report.priority = currentPriority;
    } catch (error) {
      console.error('Failed to update priority:', error);
      alert('Failed to update priority. Please try again.');
    } finally {
      setSavingPriority(false);
    }
  };

  const handleSave = async () => {
    if (!canChangeStatus) {
      alert('Please assign staff before changing the status.');
      return;
    }
    if (report.status === currentStatus) {
      onClose();
      return;
    }
    
    try {
      setSaving(true);
      await onUpdateStatus(report._id, currentStatus, report.priority);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/incidents/admin/${report._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete report');
      }

      onDelete(report._id);
      onClose();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
            <p className="text-sm text-gray-500">Report ID: {report.reportnumber || report._id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} className="text-gray-600" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[250px]">
              {report.Photoevidence?.length > 0 ? (
                <img
                  src={`http://localhost:5000${report.Photoevidence[0]}`}
                  alt="Incident"
                  className="max-w-full max-h-[300px] object-contain rounded-md"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <ImageIcon size={48} className="mx-auto" />
                  <p className="mt-2">No photo provided</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">{report.category || 'N/A'}</h3>
                <p className="text-sm text-gray-600 mt-2">{report.description || 'No description.'}</p>
              </div>
              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <strong>Location:</strong><span className="ml-2">{report.location || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <strong>Room:</strong><span className="ml-2">{report.room || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-3 text-gray-400" />
                  <strong>Created:</strong>
                  <span className="ml-2">
                    {report.createdAt ? (
                      <>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        <span className="mx-1">at</span>
                        <span className="font-medium">{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-3 text-gray-400" />
                  <strong>Reporter:</strong><span className="ml-2">{report.Username || report.UserEmail}</span>
                </div>

                {/* --- Assigned Staff Section --- */}
                <div className="flex items-center text-gray-600">
                  <strong className="mr-3">Assigned To:</strong>
                  <span className={`${report.assignedTo ? 'text-gray-800' : 'text-yellow-600 italic'}`}>
                    {report.assignedTo || 'Not yet assigned'}
                  </span>
                </div>

                {/* --- Status Section --- */}
                <div className="flex items-center text-gray-600">
                  <strong className="mr-3">Status:</strong>
                  {report.status === 'Resolved' ? (
                    <StatusBadge status={report.status} />
                  ) : !report.assignedTo ? (
                    <div className="flex items-center">
                      <StatusBadge status={report.status} />
                      <span className="ml-2 text-sm text-yellow-600 italic">
                        (Assign staff to change status)
                      </span>
                    </div>
                  ) : (
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {report.status === 'On Hold' ? (
                        <>
                          <option value="On Hold">On Hold</option>
                          <option value="On Process">On Process</option>
                        </>
                      ) : (
                        <>
                          <option value="On Process">On Process</option>
                          <option value="Resolved">Resolved</option>
                        </>
                      )}
                    </select>
                  )}
                </div>

                {/* --- Priority Section --- */}
                <div className="flex items-center text-gray-600 space-x-3">
                  <strong>Priority:</strong>
                  <div className="flex items-center space-x-2">
                    {!canChangePriority ? (
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        report.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                        report.priority?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        report.priority?.toLowerCase() === 'low' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {report.priority === 'N/A' ? 'Not Set' : report.priority?.toLowerCase()}
                      </span>
                    ) : (
                      <>
                        <select
                          value={currentPriority === 'N/A' ? '' : currentPriority}
                          onChange={(e) => setCurrentPriority(e.target.value)}
                          className={`border rounded-md px-3 py-1 text-sm font-medium ${
                            currentPriority === 'high' ? 'bg-red-50 text-red-800 border-red-200' :
                            currentPriority === 'medium' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                            currentPriority === 'low' ? 'bg-green-50 text-green-800 border-green-200' :
                            'border-gray-300'
                          } focus:ring-green-500 focus:border-green-500`}
                        >
                          <option value="low" className="bg-green-50 text-green-800">Low</option>
                          <option value="medium" className="bg-yellow-50 text-yellow-800">Medium</option>
                          <option value="high" className="bg-red-50 text-red-800">High</option>
                        </select>
                        {currentPriority !== report.priority && (
                          <button
                            onClick={handlePrioritySave}
                            disabled={savingPriority}
                            className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {savingPriority ? 'Saving...' : 'Save Priority'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex justify-between items-center p-5 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className='flex items-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50'
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete Report'}
          </button>

          <div className='flex gap-3'>
            <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Close</button>
            {canChangeStatus && (
              <button
                onClick={handleSave}
                disabled={saving || report.status === currentStatus}
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
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
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/incidents/admin/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError(`Failed to load reports: ${err.message}`);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleReportDeleted = (id) => {
    setReports(reports.filter(r => r._id !== id));
  };

  const updateReportStatus = async (id, newStatus, newPriority) => {
    const token = localStorage.getItem('adminToken');
    const updateData = {
      status: newStatus
    };

    if (newPriority !== undefined) {
      updateData.priority = newPriority;
    }

    const response = await fetch(`http://localhost:5000/incidents/admin/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update report');
    }

    setReports(reports.map(r => r._id === id ? { 
      ...r, 
      status: newStatus,
      priority: newPriority || r.priority
    } : r));
  };

  const filteredReports = reports.filter(r =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (priorityFilter === 'All' || r.priority === priorityFilter)
  );

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage campus safety reports</p>
          </div>
        </header>

        {loading && <div className="text-center py-10 text-gray-500">Loading reports...</div>}
        {error && <div className="text-orange-600 bg-orange-100 p-4 rounded-md mb-6">{error}</div>}

        {!loading && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <div>
                <label htmlFor="status" className="mr-2 font-medium text-gray-700">Status:</label>
                <select
                  id="status"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="On Hold">On Hold</option>
                  <option value="On Process">On Process</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="mr-2 font-medium text-gray-700">Priority:</label>
                <select
                  id="priority"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Report ID</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Reporter</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Title</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Room</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Priority</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{report.reportnumber || report._id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{report.Username || report.UserEmail}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{report.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{report.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{report.room || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm"><PriorityBadge priority={report.priority} /></td>
                        <td className="px-6 py-4 text-sm"><StatusBadge status={report.status} /></td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-green-600 hover:underline font-medium"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-500">
                        {error ? 'Could not load reports.' : 'No reports found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={updateReportStatus}
          onDelete={handleReportDeleted}
        />
      )}
    </>
  );
};

export default ReportManagementPage;