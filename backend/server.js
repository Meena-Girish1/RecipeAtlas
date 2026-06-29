require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const recipeRoutes = require('./routes/recipeRoutes');
const locationRoutes = require('./routes/locationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded recipe images statically, e.g. GET /uploads/169...-curry.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API routes ---
app.use('/api/recipes', recipeRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tags', tagRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RecipeAtlas API is running' });
});

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] RecipeAtlas API listening on http://localhost:${PORT}`);
  });
};

start();

module.exports = app;
