import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useUser } from '../UserContext';
import ReportDetailsModal from '../components/ReportDetailsModal';

export default function TrackReports() {
  const navigate = useNavigate();
  const { userEmail } = useUser();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const handleNewReport = () => {
    navigate('/report');
  };

  useEffect(() => {
    const fetchReports = async () => {
      if (!userEmail) {
        setError('Please sign in to track your reports.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/incidents?userEmail=${encodeURIComponent(userEmail)}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();

        const userReports = data.filter((r) => {
          const owner = (r.UserEmail || r.Username || r.username || r.email || '').toString();
          const emailLower = userEmail.toLowerCase();
          const localPart = emailLower.split('@')[0];
          if (!owner) return false;
          const ownerLower = owner.toLowerCase();
          return ownerLower === emailLower || ownerLower === localPart;
        });

        setReports(userReports);
      } catch (err) {
        console.error('Fetch reports error:', err);
        setError(err.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userEmail]);

  const filteredReports = reports.filter(report =>
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportnumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-gray-100 text-gray-800';
      case 'On Process': return 'bg-blue-100 text-blue-700';
      case 'In progress': return 'bg-blue-100 text-blue-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-600';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'On Hold': return 25;
      case 'On Process': return 75;
      case 'In progress': return 75;
      case 'Resolved': return 100;
      default: return 0;
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-gray-300';
      case 'On Hold': return 'bg-yellow-300';
      case 'On Process': return 'bg-blue-300';
      case 'In progress': return 'bg-blue-300';
      case 'Resolved': return 'bg-green-300';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'N/A';
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
          <div className="flex flex-wrap justify-start sm:justify-end gap-6 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Profile
            </button>
            <button 
              onClick={handleNewReport} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
            >
              + New Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-9 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Track Your Reports</h1>
          <p className="text-gray-600">Monitor the progress of your incident reports and receive real-time updates</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Your Report</h2>
          <p className="text-sm text-gray-600 mb-4">Enter your report ID or search by title to track progress</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Report ID (e.g., RPT-001) or title..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => {}}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-10">Loading reports...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            No reports found.
            {searchTerm && <span> Try a different search term.</span>}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{report.category || 'N/A'}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{report.location || 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                  >
                    View Details →
                  </button>
                </div>

                {/* Progress Bar */}
                {['Submitted', 'On Hold', 'On Process', 'In progress'].includes(report.status) && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{getProgressPercentage(report.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(report.status)}`}
                        style={{ width: `${getProgressPercentage(report.status)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Report Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Submitted:</div>
                    <div className="text-sm text-gray-600">
                      {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Assigned to:</div>
                    <div className="text-sm text-gray-600">
                       {report.assignedTo || 'Not assigned yet'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600">
            If you have questions about your report or need to provide additional information, please contact our support team.
          </p>
        </div>

        {/* ✅ Modal */}
        {selectedReport && (
          <ReportDetailsModal
            incident={selectedReport}
            onClose={() => setSelectedReport(null)}
            onEdit={(updatedIncident) => {
              setReports(prev => prev.map(r => r._id === updatedIncident._id ? updatedIncident : r));
            }}
          />
        )}
      </main>
    </div>
  );
}