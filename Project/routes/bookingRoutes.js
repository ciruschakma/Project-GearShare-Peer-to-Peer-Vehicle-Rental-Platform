const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware');
const {
    getProviderBookings,
    getSeekerBookings,
} = require('../controllers/bookingController');


router.get('/providers', ensureAuthenticated, ensureRole('provider'), getProviderBookings);
router.get('/seekers', ensureAuthenticated, ensureRole('seeker'), getSeekerBookings);

module.exports = router;
