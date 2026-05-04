const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user who should receive the notification (by name or ID)
  message: { type: String, required: true },
  complaintId: { type: String }, // Optional link to the related issue
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
