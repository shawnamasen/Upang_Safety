const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  reportnumber: { type: String, required: false, unique: true },
  Username: { type: String, required: false },
  UserEmail: { type: String, required: false },
  assignedTo: { 
    type: String, 
    default: null,
    enum: [null, 'JSD', 'ITS', 'Iclean'],
    validate: {
      validator: function(v) {
        return v === null || ['JSD', 'ITS', 'Iclean'].includes(v);
      },
      message: 'Staff assignment must be JSD, ITS, or Iclean'
    }
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: [true, 'Please select a category'], 
    enum: [
      'property damage',
      'missing equipment',
      'equipment malfunction',
      'needs cleaning',
      'others'
    ]
  },
  location: { type: String, required: [true, 'Please provide a location'], enum: ['PTC Building', 'CHS Building', 'BASIC ED Building',
    'Student Plaza', 'Gymnasium', 'Phinma Garden', 'CMA Building', 'FVR Building', 'MBA Building', 'River Side Building', 'Parking Lot', 'NH Building']
  },
  room: { 
    type: String, 
    required: [true, 'Please provide a room']
  },
  priority: { 
    type: String, 
    enum: ['N/A', 'low', 'medium', 'high'], 
    default: 'N/A' 
  },
  Photoevidence: { type: [String], default: [] },
  status: { 
  type: String, 
  default: 'On Hold', 
  enum: ['On Hold', 'On Process', 'In progress', 'Resolved'] 
},
  createdAt: { type: Date, default: Date.now },
});

IncidentSchema.pre('save', async function(next) {
  if (!this.reportnumber) {
    const count = await mongoose.model('Incident').countDocuments();
    this.reportnumber = `RPT-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Incident', IncidentSchema);