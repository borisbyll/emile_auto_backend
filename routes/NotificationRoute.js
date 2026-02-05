const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Route pour enregistrer un clic WhatsApp
router.post('/add', async (req, res) => {
  try {
    const newNotif = new Notification({
      pageOrigin: req.body.page
      // read sera à 'false' par défaut grâce au modèle
    });
    await newNotif.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour récupérer les notifications dans l'Admin
router.get('/', async (req, res) => {
  try {
    // On récupère les 20 plus récentes
    const notifs = await Notification.find().sort({ date: -1 }).limit(20);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AJOUT : Marquer toutes les notifications comme lues ---
router.put('/mark-as-read', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ success: true, message: "Notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;