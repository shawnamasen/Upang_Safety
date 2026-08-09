import React, { useState } from 'react';
import { FaCamera, FaCheck, FaExclamationTriangle, FaArrowLeft, FaClock } from 'react-icons/fa';
import CustomDropdown from '../components/CustomDropdown';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const buildingRooms = {
  'PTC Building': {
    'floors': ['2nd Floor', '3rd Floor', '4th Floor',],
    'rooms': {
      '2nd Floor': [
        '200 (2nd floor)',
        '201 (2nd floor)',
        'Mac Lab'
      ],
      '3rd Floor': [
        '302 (3rd floor)',
        '303 (3rd floor)',
        '304 (3rd floor)',
        '305 (3rd floor)',
        '306 (3rd floor)',
        'College of Law',
        'PTC Third Floor CR',
      ],
      '4th Floor': [
        'CITE Faculty',
        '403 (4th floor)',
        '404 (4th floor)',
        '405 (4th floor)',
        '406 (4th floor)',
        'College of Law Library'
      ],
    },
  },
  'NH Building': {
    'floors': ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'],
    'rooms': {
      '1st Floor': [
        '113 (1st floor)',
        '114 (1st floor)',
        '115 (1st floor)',
        '116 (1st floor)',
        '117 (1st floor)',
        '118 (1st floor)',
        '119 (1st floor)',
        '120 (1st floor)',
        '121 (1st floor)',
      ],
      '2nd Floor': [
        '213 (2nd floor)',
        '214 (2nd floor)',
        '215 (2nd floor)',
        '216 (2nd floor)',
        '217 (2nd floor)',
        '218 (2nd floor)',
        '219 (2nd floor)',
        '220 (2nd floor)',
        '221 (2nd floor)',
        '222 (2nd floor)',
      ],
      '3rd Floor': [
        '313 (3rd floor)',
        '314 (3rd floor)',
        '315 (3rd floor)',
        '316 (3rd floor)',
        '317 (3rd floor)',
        '318 (3rd floor)',
        '319 (3rd floor)',
        '320 (3rd floor)',
        '321 (3rd floor)',
        '322 (3rd floor)',
      ],
      '4th Floor': [
        '413 (4th floor)',
        '414 (4th floor)',
        '415 (4th floor)',
        '416 (4th floor)',
        '417 (4th floor)',
        '418 (4th floor)',
        '419 (4th floor)',
        '420 (4th floor)',
        '421 (4th floor)',
      ],
      '5th Floor': [
        '510 (5th floor)',
        '512 (5th floor)',
        '514 (5th floor)',
        '516 (5th floor)',
      ],
    },
  },
  'CMA Building': {
    'floors': ['1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    'rooms': {
      '1st Floor': [
        '123',
        '124',
        '125',
        '126',
        '127',
        '128',
        'CMA Ground Floor',
        'First Floor CR'
      ],
      '2nd Floor': [
        '223',
        '224',
        '225',
        '226',
        '227',
        '228',
        '229',
        'CMA FACULTY',
        '232',
        '233',
        '234'
      ],
      '3rd Floor': [
        '323',
        '324',
        '325',
        '326',
        '327',
        '328',
        '329',
        'CMA THIRD FLOOR CR',
        '330',
        '334'
      ],
      '4th Floor': [
        'BANQUET',
        '425',
        '426',
        '427',
        '428',
        'LOBBY'
      ],
    },
  },
};

// Locations that don't have specific rooms
const locationsWithoutRooms = [
  'Student Plaza',
  'Gymnasium',
  'Phinma Garden',
  'Parking Lot'
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const { userEmail } = useUser();
  const [step, setStep] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState('');
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    room: '',
    description: '',
    date: getTodayDate(),
    files: []
  });
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalFiles = formData.files.length + newFiles.length;
    
    if (totalFiles > 4) {
      setFileError('Maximum of 4 photos allowed.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles].slice(0, 4)
    }));
    if (newFiles.length > 0) setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');

    if (!userEmail) {
      setFileError('You must be logged in to submit a report.');
      return;
    }

    if (formData.files.length === 0) {
      setFileError('Please upload at least one photo.');
      return;
    }

    try {
      setLoading(true);

      const status = 'On Hold';

      console.log('Starting submission with email:', userEmail);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('category', formData.title);
      formDataToSend.append('room', formData.room);
      formDataToSend.append('status', status);
      formDataToSend.append('UserEmail', userEmail);
      
      // Add files to form data
      console.log('Files to upload:', formData.files);
      formData.files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        formDataToSend.append('files', file);
      });
      
      // Log the full form data
      console.log('Form data entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }

      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch('http://localhost:5000/incidents', {
        method: 'POST',
        headers,
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        const trackingId = data.reportNumber || `RPT-${Date.now().toString().slice(-6)}`;
        setTrackingId(trackingId);
        setStep(3);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Incident submit failed', { status: response.status, body: errorData });
        const backendMessage = errorData.message || errorData.error || (errorData.errors ? JSON.stringify(errorData.errors) : null);
        setFileError(backendMessage || 'Failed to submit incident.');
      }
    } catch (err) {
      setFileError('Network error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const goToStep2 = () => {
    const newErrors = {};

    if (!formData.title) newErrors.title = 'Please select an incident type.';
    if (!formData.location.trim()) newErrors.location = 'Please enter a location.';
    if (!formData.room.trim()) newErrors.room = 'Please select a room.';
    if (!formData.description.trim()) newErrors.description = 'Please enter a description.';
    if (!formData.date) newErrors.date = 'Please select a date.';
    if (formData.files.length === 0) newErrors.files = 'Please upload at least one photo.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const goToStep1 = () => {
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <img src="/images/upang-logo.png" alt="UPANG Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-gray-800">UPANG Facility Management</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {step !== 3 &&(
        <FaArrowLeft 
          className="text-gray-600 cursor-pointer text-xl mb-4" 
          onClick={() => {
            if (step === 1) {
              navigate('/dashboard');
            } else if (step === 2) {
              setStep(1);
            }
          }} 
        />
        )}

        <div className="">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Report a Facility Issue</h3>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Help us maintain UPANG's campus facilities by reporting damage, missing equipments, or equipment issues.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}>1</div>
              <span className={`ml-2 text-sm font-medium ${
                step >= 1 ? 'text-green-600' : 'text-gray-500'
              }`}>Report Details</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}>2</div>
              <span className={`ml-2 text-sm font-medium ${
                step >= 2 ? 'text-green-600' : 'text-gray-500'
              }`}>Review & Submit</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}>3</div>
              <span className={`ml-2 text-sm font-medium ${
                step >= 3 ? 'text-green-600' : 'text-gray-500'
              }`}>Track Progress</span>
            </div>
          </div>
        </div>

        {/* Step 1: Report Details */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Incident Report Form</h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please provide as much detail as possible to help us address your concern effectively.
            </p>

            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Title <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    <option value="">Select Type of Issue</option>
                    <option value="property damage">Property Damage</option>
                    <option value="missing equipment">Missing Equipment</option>
                    <option value="equipment malfunction">Equipment Malfunction</option>
                    <option value="needs cleaning">Needs Cleaning</option>
                    <option value="others">Others</option>
                  </select>
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={(e) => {
                      const newLocation = e.target.value;
                      const newRoom = locationsWithoutRooms.includes(newLocation) ? 'N/A' : '';
                      setSelectedFloor('');
                      setFormData({...formData, location: newLocation, room: newRoom});
                    }}
                    className={`w-full px-4 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    <option value="">Select Location</option>
                    <option value="PTC Building">PTC Building</option>
                    <option value="NH Building">NH Building</option>
                    <option value="CMA Building">CMA Building</option>
                    <option value="MBA Building">MBA Building</option>
                    <option value="CHS Building">CHS Building</option>
                    <option value="River Side Building">River Side Building</option>
                    <option value="FVR Building">FVR Building</option>
                    <option value="BASIC ED Building">BASIC ED Building</option>
                    <option value="Student Plaza">Student Plaza</option>
                    <option value="Gymnasium">Gymnasium</option>
                    <option value="Phinma Garden">Phinma Garden</option>
                    <option value="Parking Lot">Parking Lot</option>
                  </select>
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room <span className="text-red-600">*</span>
                  </label>
                  {locationsWithoutRooms.includes(formData.location) ? (
                    <input
                      type="text"
                      name="room"
                      value="N/A"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  ) : (
                    <>
                      {(formData.location === 'NH Building' || formData.location === 'CMA Building' || formData.location === 'PTC Building') ? ( // For buildings with specific rooms, show dynamic dropdown
                        <CustomDropdown
                          placeholder="Select Floor/Room"
                          value={formData.room || selectedFloor}
                          error={errors.room}
                          onChange={(value) => {
                            if (value === 'back_to_floors') {
                              setSelectedFloor('');
                              setFormData({...formData, room: ''});
                            } else if (buildingRooms[formData.location].floors.includes(value)) {
                              setSelectedFloor(value);
                            } else {
                              setFormData({...formData, room: value});
                            }
                          }}
                          options={[
                            { value: '', label: 'Select Floor/Room', isTitle: true },
                            ...(selectedFloor 
                              ? [
                                  // Show rooms for selected floor
                                  { value: '', label: `Rooms - ${selectedFloor}`, isTitle: true },
                                  // Add back to floors option
                                  { 
                                    value: 'back_to_floors', 
                                    label: '← Back to Floors',
                                    isBack: true 
                                  },
                                  ...buildingRooms[formData.location].rooms[selectedFloor].map(room => ({
                                    value: room,
                                    label: room
                                  }))
                                ]
                              : [
                                  // Show floors
                                  { value: '', label: 'Select Floor', isTitle: true },
                                  ...buildingRooms[formData.location].floors.map(floor => ({
                                    value: floor,
                                    label: floor,
                                    isFloor: true
                                  }))
                                ]
                            )
                          ]}
                        />
                      ) : (
                        <select
                          name="room"
                          value={formData.room}
                          onChange={(e) => setFormData({...formData, room: e.target.value})}
                          className={`w-full px-4 py-2 border ${errors.room ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        >
                          <option value="">Select Room</option>
                          <option value="N/A">Select building first</option>
                        </select>
                      )}
                    </>
                  )}
                  {errors.room && <p className="mt-1 text-sm text-red-600">{errors.room}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={getTodayDate()}
                    max={getTodayDate()}
                    className={`w-full px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Please provide a detailed description of what happened, when it occurred, and any other relevant information..."
                  rows="4"
                  className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Photos Related to the Incident (Maximum 4 photos)
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors.files ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}>
                <FaCamera className="mx-auto text-gray-400 text-4xl mb-2" />
                <p className="text-sm text-gray-500 mb-2">Upload up to 4 photos related to the incident.</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-700 transition"
                >
                  Choose Files
                </label>
                {fileError && (
                  <p className="mt-2 text-sm text-red-600">{fileError}</p>
                )}

                {/* Show uploaded photos */}
                {formData.files.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = formData.files.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, files: newFiles }));
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
           </div>
        </div>

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2"><FaCheck className='inline'/> What happens next?</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Your report will be assigned a tracking ID.</li>
                  <li>Expected response time: 2-4 hours during business hours.</li>
                  <li>Track the progress of your report in your profile.</li>
                </ul>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={goToStep2}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
                >
                  Next →
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-red-600 mt-0.5 mr-3" />
                <div>
                  <h5 className="font-semibold text-red-800">Emergency Situations</h5>
                  <p className="text-sm text-red-700">
                    For immediate emergencies requiring urgent attention, please call:<br/>
                    Campus Security: (555) 123-4567 or Emergency Services: 911
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Review Incident Report Form</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title</label>
                <p className="font-medium">{formData.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="font-medium">{formData.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="font-medium">{formData.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <p className="font-medium">{formData.room}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="font-medium">{formData.date}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="whitespace-pre-wrap">{formData.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence</label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                {formData.files.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.files.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-32 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No photos uploaded</p>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">
                <FaClock className='inline'/> What happens next?
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Your report will be assigned a tracking ID.</li>
                <li>Expected response time: 2-4 hours during business hours.</li>
                <li>Track the progress of your report in your profile.</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaCheck className="inline mr-2" /> {loading ? 'Submitting...' : 'Submit your report'}
              </button>
            </div>

            {fileError && (
              <div className="mt-4 text-center text-red-600">
                {fileError}
              </div>
            )}

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-red-600 mt-0.5 mr-3" />
                <div>
                  <h5 className="font-semibold text-red-800">Emergency Situations</h5>
                  <p className="text-sm text-red-700">
                    For immediate emergencies requiring urgent attention, please call:<br/>
                    Campus Security: (555) 123-4567 or Emergency Services: 911
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 text-center">
            <button
              onClick={goToStep1}
              className="text-gray-600 hover:text-green-600 text-sm"
            >
              ← Edit Report Details
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-xl" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">Your facility issue ({trackingId}) is now with our team.</h3>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
            >
              Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}