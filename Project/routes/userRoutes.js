const express = require('express');
const {
    providerSignup,
    seekerSignup,
    providerLogin,
    seekerLogin,
    getProviderProfile,
    getSeekerProfile,
    updateProviderProfile,
    updateSeekerProfile,
} = require('../controllers/userController'); // Import necessary controllers
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware'); // Import auth middleware
const upload = require('../middleware/fileUpload');
const router = express.Router();

// Routes for Car Providers
router.get('/providers/signup', (req, res) => res.render('providers/signup')); // Signup page
router.post('/providers/signup', upload.single('profilePhoto'), providerSignup); // Handle signup with photo upload

router.get('/providers/login', (req, res) => res.render('providers/login')); // Login page
router.post('/providers/login', providerLogin); // Handle login

router.get('/providers/profile', ensureAuthenticated, ensureRole('provider'), getProviderProfile); // View profile
router.post('/providers/profile', ensureAuthenticated, ensureRole('provider'), updateProviderProfile); // Update profile

// Routes for Car Seekers
router.get('/seekers/signup', (req, res) => res.render('seekers/signup')); // Signup page
router.post('/seekers/signup', upload.single('profilePhoto'), seekerSignup); // Handle signup with photo upload

router.get('/seekers/login', (req, res) => res.render('seekers/login')); // Login page
router.post('/seekers/login', seekerLogin); // Handle login

router.get('/seekers/profile', ensureAuthenticated, ensureRole('seeker'), getSeekerProfile); // View profile
router.post('/seekers/profile', ensureAuthenticated, ensureRole('seeker'), updateSeekerProfile); // Update profile


router.get('/listings', ensureAuthenticated, ensureRole('provider'), async (req, res) => {
    try {
        const cars = await Car.find({ providerId: req.session.user._id });
        if (!cars || cars.length === 0) {
            return res.render('cars/listings', { cars: [], message: 'No cars found.' });
        }
        res.render('cars/listings', { cars });
    } catch (error) {
        console.error('Error fetching provider listings:', error.message);
        res.status(500).send('Error fetching provider listings.');
    }
});


router.get('/users/providers/profile', ensureAuthenticated, (req, res) => {
    res.render('providers/profile', {
        user: req.session.user,
        activePage: 'profile'
    });
});

router.get("/users/seekers/profile", ensureAuthenticated, ensureRole("seeker"), (req, res) => {
    res.render("seekers/profile", {
        user: req.session.user,
        activePage: "profile", // Highlight the Profile tab
    });
});

router.get('/main', ensureAuthenticated, (req, res) => {
    res.render('main', {
        user: req.session.user,
        activePage: 'main',
    });
});

module.exports = router;