import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, ImageIcon } from 'lucide-react';

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

const ReportDetailsModal = ({ incident, onClose, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (incident) {
      setEditedData({
        location: incident.location || '',
        description: incident.description || '',
        category: incident.category || '',
      });
    }
  }, [incident]);

  if (!incident) return null;

  // Function to get complete photo URL
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://')) return photoPath;
    const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `http://localhost:5000${normalizedPath}`;
  };

  const locationOptions = [
    'PTC Building', 'CHS Building', 'BASIC ED Building', 'Student Plaza',
    'Gymnasium', 'Phinma Garden', 'CMA Building', 'FVR Building',
    'MBA Building', 'River Side Building', 'Parking Lot', 'Others'
  ];

  const categoryOptions = [
    'property damage',
    'missing equipment',
    'equipment malfunction',
    'needs cleaning',
    'others'
  ];



  const handleSave = async () => {
    try {
      const payload = {};
      // title is NOT included → users can't edit it
      if (editedData.description !== undefined) payload.description = editedData.description;
      if (editedData.location !== undefined) payload.location = editedData.location;
      if (editedData.category !== undefined) payload.category = editedData.category;

      const response = await fetch(`http://localhost:5000/incidents/${incident._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const updatedIncident = await response.json();
      onEdit(updatedIncident);
      setIsEditing(false);
    } catch (err) {
      alert('Error saving changes: ' + err.message);
    }
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Only allow editing if status is "Pending"
  const canEdit = incident.status === 'Pending';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
            <p className="text-sm text-gray-500">Report ID: {incident.reportnumber || incident._id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} className="text-gray-600" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Images */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[250px]">
                {incident.Photoevidence && incident.Photoevidence.length > 0 ? (
                  <img 
                    src={getPhotoUrl(incident.Photoevidence[0])}
                    alt="Incident" 
                    className="max-w-full max-h-full object-contain rounded-md" 
                    onError={(e) => {
                      console.error('Image failed to load:', incident.Photoevidence[0]);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <ImageIcon size={48} className="mx-auto" />
                    <p className="mt-2">No photo provided</p>
                  </div>
                )}
              </div>
              
              {/* Additional Photos */}
              {incident.Photoevidence && incident.Photoevidence.length > 1 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {incident.Photoevidence.slice(1).map((photo, index) => (
                      <img
                        key={index}
                        src={getPhotoUrl(photo)}
                        alt={`Incident photo ${index + 2}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                        onError={(e) => {
                          console.error('Image failed to load:', photo);
                          e.target.src = 'https://via.placeholder.com/150x150?text=Image+Not+Found';
                        }}
                        onClick={() => window.open(getPhotoUrl(photo), '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div className="space-y-4">
              {/* ✅ Title is ALWAYS read-only */}
              <h3 className="font-semibold text-gray-800">{incident.title}</h3>

              {isEditing ? (
                <textarea
                  value={editedData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-600">{incident.description || 'No description provided.'}</p>
              )}

              <div className="border-t pt-4 space-y-3 text-sm">
                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <strong>Location:</strong>
                  {isEditing ? (
                    <select
                      value={editedData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">Select Location</option>
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="ml-2">{incident.location || 'N/A'}</span>
                  )}
                </div>

                {/* Room */}
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <strong>Room:</strong>
                  <span className="ml-2">{incident.room || 'N/A'}</span>
                </div>

                {/* Date */}
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-3 text-gray-400" />
                  <strong>Date:</strong>
                  <span className="ml-2">
                    {incident.createdAt 
                      ? new Date(incident.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                {/* Reporter */}
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-3 text-gray-400" />
                  <strong>Reporter:</strong>
                  <span className="ml-2">
                    {incident.Username || incident.UserEmail?.split('@')[0] || 'Anonymous'}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center text-gray-600">
                  <strong className="mr-3">Status:</strong>
                  <StatusBadge status={incident.status} />
                </div>

                {/* Priority (read-only) */}
                <div className="flex items-center text-gray-600">
                  <strong className="mr-3">Priority:</strong>
                  <span className="ml-2">
                    {incident.priority === 'N/A' ? 'Not yet set' : incident.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t mt-6 pt-5">
            <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isEditing ? (
                canEdit ? ( // ✅ Only show "Edit" if status is "Pending"
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Editing is only allowed when status is "Pending".
                  </div>
                )
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 mr-3">
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ReportDetailsModal;