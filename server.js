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
// Simplification du CORS pour être sûr que Vercel ne soit jamais bloqué
app.use(cors({
  origin: true, // Autorise toutes les origines en développement/prod pour débloquer
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// --- ROUTE DE TEST (Health Check) ---
// Tape https://emile-auto-backend.onrender.com/ dans ton navigateur pour voir si ça marche
app.get('/', (req, res) => {
  res.send("🚀 Serveur Emile Auto opérationnel !");
});

// --- BRANCHEMENT DES ROUTES ---
app.use('/api/notifications', notificationRoutes);

// --- ROUTE SPÉCIFIQUE : VIDER L'HISTORIQUE ---
app.delete('/api/notifications/clear-all', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Historique vidé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connecté à MongoDB Cloud"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// --- ROUTES AUTHENTIFICATION ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
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
// Assure-toi que ces routes ne sont pas REDÉFINIES dans un autre fichier de route
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

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Emile Auto en ligne sur le port ${PORT}`);
});