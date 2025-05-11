const Car = require('../models/Car');

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find({ status: 'Available' }); // Fetch cars from the database
        console.log('Fetched Cars:', cars); // Debug: log cars
        res.render('main', { cars: cars || [] }); // Pass cars to the EJS view
    } catch (error) {
        console.error('Error fetching cars:', error.message);
        res.status(500).render('error', { message: 'Unable to fetch cars.' });
    }
};


exports.createCar = async (req, res) => {
    try {
        const { title, price, type, description, image } = req.body;

        // Create a new car document
        const newCar = new Car({
            title,
            price,
            type,
            description,
            image, // Assuming the image URL is provided
            providerId: req.session.user._id, // Link the car to the logged-in provider
            status: 'Available',
        });

        await newCar.save();
        console.log('New car listing saved:', newCar);

        // Redirect to the listings page
        res.redirect('/cars/listings');
    } catch (error) {
        console.error('Error creating car listing:', error);
        res.status(500).send('Error creating car listing.');
    }
};

exports.getProviderListings = async (req, res) => {
    try {
        // Fetch all cars for the logged-in provider
        const listings = await Car.find({ providerId: req.session.user._id });

        // Check if no cars are found
        if (!listings || listings.length === 0) {
            return res.render('cars/listings', {
                user: req.session.user,
                listings: [],
                message: 'No listings available. Add your first car!',
            });
        }

        // Render the listings page with the fetched cars
        res.render('cars/listings', {
            user: req.session.user,
            listings,
        });
    } catch (error) {
        console.error('Error fetching provider listings:', error.message);
        res.status(500).send('Error fetching provider listings.');
    }
};

exports.getProviderListings = async (req, res) => {
    try {
        // Fetch cars for the logged-in provider
        const listings = await Car.find({ providerId: req.session.user._id });

        res.render('cars/listings', {
            user: req.session.user,
            listings, // Pass listings to the view
        });
    } catch (error) {
        console.error('Error fetching provider listings:', error.message);
        res.status(500).send('Error fetching provider listings.');
    }
};

// Search cars
exports.searchCars = async (req, res) => {
    try {
        const { query, type } = req.query;

        const filters = {
            status: 'Available',
            ...(query && { title: new RegExp(query, 'i') }),
            ...(type && type !== 'all' && { type }),
        };

        const cars = await Car.find(filters);

        res.render('cars/listing', { cars });
    } catch (error) {
        console.error('Error searching cars:', error.message);
        res.status(500).send('Unable to search cars.');
    }
};

// Delete a car (Provider Only)
exports.deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const userId = req.session.user._id;

        const car = await Car.findOneAndDelete({ _id: carId, providerId: userId });

        if (!car) {
            return res.status(403).send('Unauthorized or car not found.');
        }

        res.redirect('/cars/listings');
    } catch (error) {
        console.error('Error deleting car:', error.message);
        res.status(500).send('Unable to delete car.');
    }
};

// Update a car (Provider Only)
exports.updateCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const userId = req.session.user._id;
        const updates = req.body;

        if (req.file) {
            updates.image = `/uploads/${req.file.filename}`;
        }

        const car = await Car.findOneAndUpdate(
            { _id: carId, providerId: userId },
            updates,
            { new: true }
        );

        if (!car) {
            return res.status(403).send('Unauthorized or car not found.');
        }

        res.redirect(`/cars/details?id=${carId}`);
    } catch (error) {
        console.error('Error updating car:', error.message);
        res.status(500).send('Unable to update car.');
    }
};
