const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { createService } = require('../controllers/serviceController');
const { createReservation, history } = require('../controllers/reservationController');
const { auth } = require('../middleware/auth');

// Auth
router.post('/register', register);
router.post('/login', login);

// Services
router.post('/services', auth, createService);

// Reservations
router.post('/reservations', auth, createReservation);
router.get('/reservations/history', auth, history);

module.exports = router;
