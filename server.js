// 1. Charger les variables d'environnement
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Car = require('./models/Car');
const notificationRoutes = require('./routes/NotificationRoute');
const Notification = require('./models/Notification');

const app = express();

// --- MIDDLEWARES ---
// CORRECTION : Configuration CORS plus robuste pour le déploiement
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Ajout du port par défaut de Vite
  process.env.FRONTEND_URL // Ton futur lien Vercel/Netlify
];

app.use(cors({
  origin: function (origin, callback) {
    // Permet les requêtes sans origine (comme Postman ou les outils mobiles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS non autorisé pour cette origine'), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], // CRUCIAL pour le passage du Token Admin
  credentials: true
}));

app.use(express.json());

// --- BRANCHEMENT DES ROUTES ---
app.use('/api/notifications', notificationRoutes);

// --- ROUTE SPÉCIFIQUE : VIDER L'HISTORIQUE ---
app.delete('/api/notifications/clear-all', async (req, res) => {
  try {
    await Notification.deleteMany({});
    console.log("🗑️ Historique des notifications vidé");
    res.status(200).json({ message: "Historique vidé avec succès" });
  } catch (err) {
    console.error("❌ Erreur suppression notifications:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ ERREUR : La variable MONGODB_URI n'est pas définie");
  process.exit(1);
}

mongoose.set('strictQuery', false);
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connecté à MongoDB Cloud"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// --- ROUTES AUTHENTIFICATION ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Vérification stricte via le .env
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { userId: 'admin_emile_auto' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(200).json({ token });
  }
  res.status(401).json({ message: "Identifiants incorrects" });
});

// --- ROUTES API CARS ---
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Introuvable" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Erreur ID" });
  }
});

app.post('/api/cars/add', async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Retiré" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/cars/view/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json({ views: updatedCar.views });
  } catch (err) {
    res.status(500).json({ message: "Erreur vues" });
  }
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Emile Auto en ligne sur le port ${PORT}`);
});