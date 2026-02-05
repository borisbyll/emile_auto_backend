const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  categorie: { 
    type: String, 
    required: true,
    enum: ['Voiture', 'Camion', 'Tracteur'] 
  },
  marque: { type: String, required: true, trim: true },
  modele: { type: String, required: true, trim: true },
  prix: { type: Number, required: true },
  annee: { type: Number },
  valeurCompteur: { type: Number },
  motorisation: { 
    type: String, 
    required: true,
    default: 'Diesel',
    enum: ['Diesel', 'Essence', 'Hybride', 'Electrique'] 
  },
  transmission: { 
    type: String, 
    default: 'Manuelle',
    enum: ['Manuelle', 'Automatique'] 
  },
  tonnage: { type: String, default: '' },
  description: { type: String, trim: true },
  images: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true } // AJOUT : indexation pour des tris rapides
});

module.exports = mongoose.model('Car', carSchema);