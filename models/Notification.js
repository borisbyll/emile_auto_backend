const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  pageOrigin: { 
    type: String, 
    required: true 
  },
  // État de lecture : conservé tel quel
  read: {
    type: Boolean,
    default: false,
    index: true // Optimise la recherche des notifications "non lues"
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true // Optimise le tri chronologique pour l'admin
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);