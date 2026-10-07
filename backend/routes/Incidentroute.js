const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const IncidentController = require('../controller/IncidentController');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Saving file to uploads directory');
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename)
  }
});

const upload = multer({ storage: storage });
router.post('/', upload.array('files'), IncidentController.createIncident);
router.get('/', IncidentController.getUserIncidents);
router.put("/:id", IncidentController.updateIncident);
router.get('/admin/all', IncidentController.getAllIncidents);
router.delete("/admin/:id", IncidentController.deleteIncident);
// Update incident (for admin)
router.put('/admin/:id', IncidentController.updateIncident);
/*
router.get("/user/:userEmail/:id", IncidentController.getUserIncidentById);
router.get("/admin/pending", IncidentController.getAllPendingIncidents);
router.get("/admin/under-review", IncidentController.getAllUnderReviewIncidents);
router.get("/admin/resolved", IncidentController.getAllResolvedIncidents);
*/

module.exports = router;