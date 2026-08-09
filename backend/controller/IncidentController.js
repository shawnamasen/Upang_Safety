const Incident = require('../model/IncidentModel');
const mongoose = require('mongoose');

// Create report
exports.createIncident = async (req, res) => {
  try {
    const { title, description, location, room, date, status: incomingStatus, category, UserEmail } = req.body;
    
    if (!UserEmail) {
      return res.status(400).json({ message: 'UserEmail is required' });
    }

    if (!title || !description || !location || !room || !date || !category) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let photoEvidence = [];
    console.log('Files in request:', req.files);
    
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log('Processing files...');
      photoEvidence = req.files.map(file => {
        // Store just the relative path, let frontend construct full URL
        const photoPath = `/uploads/${file.filename}`;
        console.log('Processing file:', {
          originalName: file.originalname,
          savedAs: file.filename,
          path: photoPath,
          fileSize: file.size,
          mimeType: file.mimetype
        });
        return photoPath;
      });
      console.log('Final photo paths:', photoEvidence);
    } else {
      console.log('No files found in request');
    }

    console.log('Request body:', req.body);
    const tokenUser = req.user || null;
    const userEmail = req.body.UserEmail || req.body.userEmail || null;
    console.log('Creating incident for userEmail:', userEmail);
    
    // Log all possible email variations
    console.log('Possible email fields:', {
      UserEmail: req.body.UserEmail,
      userEmail: req.body.userEmail,
      email: req.body.email,
      rawBody: req.body
    });
    
    const username = req.body.Username || req.body.username || (userEmail ? userEmail.split('@')[0] : (tokenUser?.id || 'Anonymous'));

    const finalStatus = incomingStatus || 'On Hold';

    // Normalize the email to lowercase
    const normalizedEmail = userEmail ? userEmail.toLowerCase() : null;
    console.log('Normalized email:', normalizedEmail);

    // Log the photo evidence before saving
    console.log('Before creating incident:', {
      files: req.files,
      photoEvidence: photoEvidence
    });

    const incidentData = {
      Username: username,
      UserEmail: normalizedEmail,
      title,
      description,
      location,
      room,
      date,
      status: finalStatus,
      category,
      Photoevidence: photoEvidence // Note: capital P to match schema
    };

    console.log('Creating incident with data:', incidentData);
    const newIncident = await Incident.create(incidentData);
    console.log('Created incident:', {
      id: newIncident._id,
      photos: newIncident.Photoevidence
    });
    
    console.log('Created incident:', {
      id: newIncident._id,
      email: newIncident.UserEmail,
      title: newIncident.title
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      reportNumber: newIncident.reportnumber,
      id: newIncident._id
    });
  } catch (error) {
    console.error('Create incident error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all incidents
exports.getUserIncidents = async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log('Fetching incidents for userEmail:', userEmail);

    if (!userEmail) {
      console.log('No userEmail provided in request');
      return res.status(400).json({ message: 'userEmail is required' });
    }

    // Case-insensitive query
    // Log the query we're about to make
    console.log('Making query with email:', userEmail);
    
    // Find all incidents and filter in memory for more flexibility
    const allIncidents = await Incident.find().sort({ createdAt: -1 });
    
    console.log('All incidents before filtering:', allIncidents.map(inc => ({
      id: inc._id,
      email: inc.UserEmail,
      title: inc.title
    })));
    
    const incidents = allIncidents.filter(incident => {
      const incidentEmail = (incident.UserEmail || '').toLowerCase();
      const queryEmail = userEmail.toLowerCase();
      const matches = incidentEmail === queryEmail;
      console.log(`Comparing: ${incidentEmail} with ${queryEmail} = ${matches}`);
      return matches;
    });

    console.log('Found incidents:', incidents.length);
    console.log('Incident emails:', incidents.map(inc => inc.UserEmail));

    res.status(200).json(incidents);
  } catch (error) {
    console.error('Fetch user incidents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ALL incidents (for admin)
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    
    // Log each incident's details for debugging
    incidents.forEach(incident => {
      console.log('Incident:', {
        id: incident._id,
        UserEmail: incident.UserEmail,
        Username: incident.Username,
        title: incident.title,
        status: incident.status
      });
    });
    
    console.log(`Total incidents found: ${incidents.length}`);
    res.status(200).json(incidents);
  } catch (error) {
    console.error('Fetch all incidents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update incident status and details for admin and user
exports.updateIncident = async (req, res) => {
  try {
    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Incident not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete incident (for admin)
exports.deleteIncident = async (req, res) => {
  try {
     const deleted = await Incident.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};