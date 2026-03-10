const express = require('express');
const router = express.Router();

const { register, login, me, topup } = require('../controllers/authController');
const { createService, getServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');
const { createReservation, cancelReservation, completeReservation, history } = require('../controllers/reservationController');
const { auth, isCliente, isPrestador } = require('../middleware/auth');

// Auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.post('/wallet/topup', auth, isCliente, topup);

// Services
router.get('/services', auth, getServices);
router.post('/services', auth, isPrestador, createService);
router.get('/services/:id', auth, getServiceById);
router.put('/services/:id', auth, isPrestador, updateService);
router.delete('/services/:id', auth, isPrestador, deleteService);

// Reservations
router.post('/reservations', auth, isCliente, createReservation);
router.patch('/reservations/:id/complete', auth, isPrestador, completeReservation);
router.delete('/reservations/:id', auth, isCliente, cancelReservation);
router.get('/reservations/history', auth, history);
router.get('/reservations', auth, history);

module.exports = router;
