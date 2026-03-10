const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { createService, getServices, getServiceById, deleteService } = require('../controllers/serviceController');
const { createReservation, cancelReservation, history } = require('../controllers/reservationController');
const { auth, isCliente, isPrestador } = require('../middleware/auth');

// Auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, require('../controllers/authController').me);

// Services
router.get('/services', auth, getServices);
router.post('/services', auth, isPrestador, createService);
router.get('/services/:id', auth, getServiceById);
router.delete('/services/:id', auth, isPrestador, deleteService);

// Reservations
router.post('/reservations', auth, isCliente, createReservation);
router.delete('/reservations/:id', auth, isCliente, cancelReservation);
router.get('/reservations/history', auth, history);
router.get('/reservations', auth, history);

module.exports = router;
