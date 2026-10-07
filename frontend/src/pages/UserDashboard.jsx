import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaClock, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ReportCard from '../components/ReportCard';
import { useUser } from '../UserContext';

const ReportDetailsModal = ({ incident, onClose }) => {
  if (!incident) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  // Map backend status to user-friendly label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'On Hold': return 'On Hold';
      case 'On Process': return 'On Process';
      case 'In progress': return 'In Progress';
      case 'Resolved': return 'Resolved';
      default: return status || 'On Hold';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-600';
      case 'On Hold': return 'bg-yellow-500';
      case 'On Process': return 'bg-blue-500';
      case 'In progress': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{incident.title || 'Untitled Report'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <div className="space-y-3 text-gray-700">
          {/* Report ID */}
          <p><strong>Report ID:</strong> {incident.reportnumber || 'N/A'}</p>

          {/* Location */}
          <p><strong>Location:</strong> {incident.location || 'N/A'}</p>
          
          {/* Date */}
          <p><strong>Date Submitted:</strong> {formatDate(incident.createdAt)}</p>
          
          {/* Category */}
          <p><strong>Category:</strong> {incident.category || 'N/A'}</p>
          
          {/* Priority */}
          <p><strong>Priority Level:</strong> 
            <span className={`px-2 py-1 rounded text-white text-sm ml-2 ${
              incident.priority === 'high' ? 'bg-red-500' :
              incident.priority === 'medium' ? 'bg-yellow-500' :
              incident.priority === 'low' ? 'bg-green-500' :
              'bg-gray-500'
            }`}>
              {incident.priority || 'N/A'}
            </span>
          </p>

          {/* Status */}
          <p><strong>Status:</strong> 
            <span className={`px-2 py-1 rounded text-white text-sm ml-2 ${getStatusColor(incident.status)}`}>
              {getStatusLabel(incident.status)}
            </span>
          </p>

          {/* Description */}
          <div>
            <strong>Description:</strong>
            <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {incident.description || 'No description provided.'}
            </p>
          </div>
          {/* Photo Evidence */}
          {incident.Photoevidence && incident.Photoevidence.length > 0 && (
            <div>
              <strong>Uploaded Photos:</strong>
              <div className="flex gap-2 mt-2 flex-wrap">
                {incident.Photoevidence.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-20 h-20 object-cover border rounded"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { userEmail, logout } = useUser();

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };
  
  useEffect(() => {
    setLastRefresh(Date.now());
  }, []);

  const handleNewReport = () => {
    navigate('/report');
  };

  const handleShowDetails = (incident) => {
    setSelectedIncident(incident);
  };

  const closeModal = () => {
    setSelectedIncident(null);
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!userEmail) {
        console.log('No userEmail found');
        setError('Please sign in.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching incidents for email:', userEmail);
        setLoading(true);
        const response = await fetch(`http://localhost:5000/incidents?userEmail=${encodeURIComponent(userEmail)}&_=${Date.now()}`);
        
        if (!response.ok) {
          console.log('Response not OK:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const filteredIncidents = data.filter(incident => {
          const incidentEmail = incident.UserEmail || incident.userEmail;
          return incidentEmail && incidentEmail.toLowerCase() === userEmail.toLowerCase();
        });
        setIncidents(filteredIncidents);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [userEmail, lastRefresh]);

  // Update status filtering to use new labels
  const totalReports = incidents.length;
  const onHoldReports = incidents.filter(i => i.status === 'On Hold').length;
  const resolvedReports = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedIncident && (
        <ReportDetailsModal incident={selectedIncident} onClose={closeModal} />
      )}

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
            <div className='text-gray-700 text-sm'>
              Welcome, <span className='font-semibold'>{userEmail?.split('@')[0] || 'User'}</span>
            </div>
            <button onClick={() => navigate('/track-reports')} className="text-gray-700 hover:text-green-600 font-medium">Track Reports</button>
            <button onClick={() => navigate('/profile')} className="text-gray-700 hover:text-green-600 font-medium">Profile</button>
            <button 
              onClick={handleNewReport} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
            >
              + New Report
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-9 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-600">Track and manage your safety reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Reports" 
            value={totalReports} 
            icon={<FaFileAlt className="text-gray-500" />} 
          />
          <StatCard 
            title="On Hold Reports" 
            value={onHoldReports} 
            valueColor="text-yellow-500" 
            icon={<FaClock className="text-yellow-500" />} 
          />
          <StatCard 
            title="Resolved" 
            value={resolvedReports} 
            valueColor="text-green-500" 
            icon={<FaCheck className="text-green-500" />} 
          />
        </div>

        {/* My Reports Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-2">My Reports</h2>
          <p className="text-gray-600 mb-6">View and track all your submitted reports</p>

          {loading ? (
            <p className="text-gray-500">Loading reports...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : incidents.length === 0 ? (
            <p className="text-gray-500">No reports submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <ReportCard
                  key={incident._id}
                  title={incident.title}
                  location={incident.location}
                  date={incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : 'N/A'}
                  status={incident.status === 'On Hold' ? 'On Hold' :
                          incident.status === 'On Process' ? 'On Process' :
                          incident.status === 'In progress' ? 'In Progress' :
                          incident.status === 'Resolved' ? 'Resolved' : 'On Hold'}
                  statusColor={
                    incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    incident.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    incident.status === 'On Process' ? 'bg-blue-100 text-blue-700' :
                    incident.status === 'In progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-800'
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}