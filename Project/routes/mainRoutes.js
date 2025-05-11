const express = require('express');
const router = express.Router();
const { getAllCars } = require('../controllers/carController'); // Import the controller
const Car = require('../models/Car'); // Import the Car model
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Main route for logged-in users
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find({ status: 'Available' }); // Fetch available cars
        console.log('Cars fetched:', cars); // Debugging: Log fetched cars
        res.render('main', { cars }); // Pass cars to main.ejs
    } catch (error) {
        console.error('Error fetching cars:', error.message);
        res.status(500).render('error', { message: 'Unable to load car listings.' });
    }
});

router.get('/main', ensureAuthenticated, (req, res) => {
    console.log('Session User:', req.session.user);
    res.render('main', {
        user: req.session.user, // Ensure user data is passed
        activePage: 'home',    // Define activePage for the navbar
    });
});
// Route for /main
router.get('/main', getAllCars); // Use the getAllCars controller

module.exports = router;
