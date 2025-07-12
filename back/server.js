require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const fs = require("fs-extra");

const userRouter = require('./src/routes/userRoutes.js');
const propertyRouter = require('./src/routes/propertyRoutes.js');

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// ✅ Route رئيسي للتأكد إن السيرفر شغال
app.get('/', (req, res) => {
  res.send('✅ Real Estate API is running.');
});

// ✅ Connect to MongoDB using URI from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
  });

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/users', userRouter);
app.use('/api/properties', propertyRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    error: message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
