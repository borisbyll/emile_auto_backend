const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// 1. Récupérer toutes les voitures
router.get('/', async (req, res) => {
    try {
        const voitures = await Car.find().sort({ _id: -1 }); // Les plus récentes en premier
        res.json(voitures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Ajouter une voiture
router.post('/add', async (req, res) => {
    try {
        const nouvelleVoiture = new Car(req.body);
        await nouvelleVoiture.save();
        res.status(201).json(nouvelleVoiture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Supprimer une voiture
router.delete('/:id', async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: "Voiture supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;