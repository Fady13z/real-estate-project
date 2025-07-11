const express = require('express');
const router = express.Router(); // This line is crucial
const { register, login } = require('../controllers/userController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);


module.exports = router; // Make sure to export the router