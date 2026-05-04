const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  img: { type: String, default: 'https://picsum.photos/seed/issue/500/300' },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  user: { type: String, required: true }, // Store user name or reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String, default: 'Just now' },
  createdAt: { type: Date, default: Date.now },
  upvotes: [{ type: String }],
  comments: [{
    user: String,
    text: String,
    date: { type: Date, default: Date.now }
  }],
  coordinates: {
    lat: Number,
    lng: Number
  },
  adminNote: { type: String, default: "" },
  assignedTo: { type: String, default: "" },
  escalated: { type: Boolean, default: false },
  photoUrls: [{ type: String }],
  trackingId: { type: String, unique: true },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
});

module.exports = mongoose.model('Complaint', complaintSchema);
