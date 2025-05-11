const express = require('express');
const Car = require('../models/Car');
const router = express.Router();
const { 
    getAllCars, 
    createCar, 
    getCarListings, 
    searchCars, 
    deleteCar,
    getProviderListings, 
    updateCar 
} = require('../controllers/carController');
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload'); // Import file upload middleware

router.get('/seed', async (req, res) => {
    const mockCars = [
        {
            providerId: '64a7f9b8c7e4fc1d6d29c822',
            title: 'Tesla Model S',
            type: 'Electric',
            price: 80000,
            description: 'A luxury electric car with autopilot.',
            image: '/images/tesla.jpg',
            status: 'Available'
        },
        {
            providerId: '64a7f9b8c7e4fc1d6d29c822',
            title: 'Toyota Camry',
            type: 'Sedan',
            price: 30000,
            description: 'Reliable and fuel-efficient sedan.',
            image: '/images/camry.jpg',
            status: 'Available'
        }
    ];

    try {
        await Car.deleteMany({});
        await Car.insertMany(mockCars);
        res.send('Mock cars seeded successfully.');
    } catch (error) {
        res.status(500).send('Error seeding cars: ' + error.message);
    }
});

router.get('/cars/listings', ensureAuthenticated, (req, res) => {
    res.render('cars/listings', {
        user: req.session.user,
        activePage: 'listings',
        cars: [],
    });
});

router.get('/main', ensureAuthenticated, (req, res) => {
    res.render('main', {
        user: req.session.user,
        activePage: 'main',
    });
});

router.get('/details/:id', ensureAuthenticated, async (req, res) => {
    try {
        const carId = req.params.id;

        // Fetch the car by its ID
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).send('Car not found.');
        }

        // Render the car details page
        res.render('cars/details', { car });
    } catch (error) {
        console.error('Error fetching car details:', error.message);
        res.status(500).send('Error fetching car details.');
    }
});

// Route to render the "Add Car" page
router.get('/add', ensureAuthenticated, ensureRole('provider'), (req, res) => {
    res.render('cars/addCar', { user: req.session.user });
});

// Route to handle adding a new car
router.post('/add', ensureAuthenticated, ensureRole('provider'), createCar);

// Routes
router.get('/main', getAllCars);

router.get('/listings', ensureAuthenticated, ensureRole('provider'), getProviderListings);

router.get('/search', searchCars);
router.post('/delete/:id', ensureAuthenticated, ensureRole('provider'), deleteCar);
router.post('/update/:id', ensureAuthenticated, ensureRole('provider'), upload.single('image'), updateCar);

module.exports = router;
