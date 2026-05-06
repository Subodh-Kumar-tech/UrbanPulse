const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Create complaint
router.post('/', async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const year = new Date().getFullYear();
    const trackingId = `UP-CIVIC-${year}-${(count + 1).toString().padStart(4, '0')}`;
    
    const complaint = new Complaint({
      ...req.body,
      trackingId,
      statusHistory: [{
        status: 'Pending',
        note: 'Issue reported by citizen and awaiting department review.'
      }]
    });
    
    const newComplaint = await complaint.save();

    // Notify Admins about new report
    await Notification.create({
      userId: 'admin', // Global admin notification
      message: `New ${req.body.category} report submitted: "${complaint.title}"`,
      complaintId: newComplaint._id,
      type: 'system'
    });

    res.status(201).json(newComplaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update status and details
router.patch('/:id', async (req, res) => {
  try {
    const { status, adminNote, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Track status changes in history
    if (status && status !== complaint.status) {
      if (!complaint.statusHistory) complaint.statusHistory = [];
      complaint.statusHistory.push({
        status,
        note: adminNote || `Status updated to ${status} by department admin.`
      });
      complaint.status = status;

      // Notify the user about status change
      const notificationMsg = `Your report "${complaint.title}" is now marked as ${status}.`;
      const targetUserId = complaint.userId || complaint.user;
      
      await Notification.create({
        userId: targetUserId,
        message: notificationMsg,
        complaintId: complaint._id
      });
    }
    
    if (adminNote !== undefined) complaint.adminNote = adminNote;
    if (priority) complaint.priority = priority;
    
    const updated = await complaint.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upvote complaint
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (!complaint.upvotes) complaint.upvotes = [];
    
    // Toggle upvote
    const index = complaint.upvotes.indexOf(userId);
    let isUpvoting = false;
    if (index === -1) {
      complaint.upvotes.push(userId);
      isUpvoting = true;
    } else {
      complaint.upvotes.splice(index, 1);
    }

    await complaint.save();

    // Notify creator on upvote
    if (isUpvoting) {
      const creatorId = complaint.userId ? complaint.userId.toString() : complaint.user;
      if (creatorId !== userId) {
        await Notification.create({
          userId: creatorId,
          message: `Someone upvoted your report: "${complaint.title}"`,
          complaintId: complaint._id
        });
      }
      
      // Notify Admin about upvote activity
      await Notification.create({
        userId: 'admin',
        message: `High engagement: A report just received a new upvote: "${complaint.title}"`,
        complaintId: complaint._id,
        type: 'system'
      });
    }

    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { user, text } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (!complaint.comments) complaint.comments = [];
    
    complaint.comments.push({ user, text });
    await complaint.save();
    
    // Notify the creator if someone else comments
    const creatorId = complaint.userId ? complaint.userId.toString() : complaint.user;
    if (creatorId !== user) {
       await Notification.create({
         userId: creatorId,
         message: `${user} commented on your report: "${complaint.title}"`,
         complaintId: complaint._id
       });
    }

    // Notify Admin about new activity
    await Notification.create({
      userId: 'admin',
      message: `${user} posted a new comment on report: "${complaint.title}"`,
      complaintId: complaint._id,
      type: 'system'
    });

    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Activity Feed — last 20 events
router.get('/meta/activity', async (req, res) => {
  try {
    const recent = await Complaint.find().sort({ createdAt: -1 }).limit(20);
    const events = [];
    recent.forEach(c => {
      events.push({ type: 'reported', user: c.user, title: c.title, id: c._id, date: c.createdAt, category: c.category });
      if (c.status !== 'Pending') {
        events.push({ type: 'status', user: 'Admin', title: c.title, id: c._id, date: c.createdAt, status: c.status });
      }
      (c.comments || []).forEach(cm => {
        events.push({ type: 'comment', user: cm.user, title: c.title, id: c._id, date: cm.date });
      });
    });
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(events.slice(0, 30));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leaderboard — top reporters by points
router.get('/meta/leaderboard', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    const userMap = {};
    complaints.forEach(c => {
      if (!userMap[c.user]) userMap[c.user] = { name: c.user, reports: 0, upvotesReceived: 0, resolvedCount: 0, comments: 0 };
      userMap[c.user].reports++;
      userMap[c.user].upvotesReceived += (c.upvotes || []).length;
      if (c.status === 'Resolved') userMap[c.user].resolvedCount++;
      userMap[c.user].comments += (c.comments || []).filter(cm => cm.user === c.user).length;
    });
    const leaderboard = Object.values(userMap).map(u => ({
      ...u,
      points: u.reports * 10 + u.upvotesReceived * 2 + u.resolvedCount * 20 + u.comments * 1
    })).sort((a, b) => b.points - a.points);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign department
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
