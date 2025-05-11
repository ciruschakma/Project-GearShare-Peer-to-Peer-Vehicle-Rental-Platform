const User = require('../models/User');
const bcrypt = require('bcrypt');
const Listing = require('../models/Listing'); 
const Booking = require('../models/Booking');
const Car = require('../models/Car');


// Hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare passwords
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

exports.providerSignup = async (req, res) => {
    try {
        const { name, email, password, phone, idNumber, dob, age } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !idNumber || !dob || !age) {
            throw new Error('All fields are required.');
        }

        // Handle profile photo
        const profilePhoto = req.file
            ? `/uploads/${req.file.filename}`
            : '/images/profile-photo-placeholder.jpg';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save provider to DB
        const provider = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            idNumber,
            dob,
            age,
            photo: profilePhoto,
            role: 'provider',
        });

        await provider.save();
        res.redirect('/users/providers/login');
    } catch (error) {
        console.error('Error during provider signup:', error.message);
        res.status(500).send(`Provider signup failed: ${error.message}`);
    }
};



exports.seekerSignup = async (req, res) => {
    try {
        const { name, email, password, phone, license, age, dob } = req.body;
        const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '/images/profile-photo-placeholder.jpg';

        // Validate required fields
        if (!name || !email || !password || !phone || !license || !age || !dob) {
            throw new Error('Missing required fields.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword, // Store the hashed password
            phone,
            license,
            age,
            dob,
            photo: profilePhoto,
            role: 'seeker',
        });

        await user.save();
        res.redirect('/users/seekers/login');
    } catch (error) {
        console.error('Error during seeker signup:', error.message);
        res.status(500).send(`Seeker signup failed: ${error.message}`);
    }
};

exports.providerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the provider by email
        const user = await User.findOne({ email, role: 'provider' });

        // Simulate delay for timing attack protection
        if (!user) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return res.render('providers/login', { error: 'Invalid email or password.' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('providers/login', { error: 'Invalid email or password.' });
        }

        // Save user session
        req.session.user = {
            _id: user._id,
            email: user.email,
            role: user.role,
        };

        // Set session timeout (optional)
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day

        // Redirect to the provider dashboard or main page
        res.redirect('/main'); // Change to '/providers/dashboard' if applicable
    } catch (error) {
        console.error('Error during provider login:', error.message);
        res.status(500).render('error', { message: 'An unexpected error occurred. Please try again later.' });
    }
};


exports.seekerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email and role
        const user = await User.findOne({ email, role: 'seeker' });

        // Validate credentials
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials.');
        }

        // Set user session
        req.session.user = {
            _id: user._id,
            email: user.email,
            role: user.role,
        };

        // Redirect to the main page
        res.redirect('/main');
    } catch (error) {
        console.error('Error during seeker login:', error.message);
        res.status(500).send('Error during seeker login.');
    }
};

exports.getProviderProfile = async (req, res) => {
    try {
        const provider = await User.findById(req.session.user._id).lean();
        const listings = await Car.find({ providerId: req.session.user._id });
        const cars = await Car.find({ providerId: req.session.user._id });
        const bookings = await Booking.find({ carId: { $in: cars.map(car => car._id) } })
        .populate('carId')
        .populate('seekerId');
        console.log('Fetched listings:', listings); // Debugging
        res.render('providers/profile', {
            user: provider,
            listings,
            cars,
            bookings,
            activePage: 'profile'
        });
    } catch (error) {
        console.error('Error fetching provider profile:', error.message);
        res.status(500).send('Error fetching provider profile.');
    }
};


exports.getSeekerProfile = async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'seeker') {
            return res.status(401).send('Unauthorized: Please log in as a car seeker.');
        }

        const seeker = await User.findById(req.session.user._id).populate('bookings.car').exec();

        if (!seeker) {
            return res.status(404).send('Seeker profile not found.');
        }
        const bookings = await Booking.find({ seekerId: req.session.user._id })
            .populate('carId')
            .populate('providerId'); // If you need provider details

        res.render('seekers/profile', {
            user: seeker,
                  bookings,
            activePage: 'profile', // Pass the active page variable
        });
    } catch (error) {
        console.error('Error fetching seeker profile:', error.message);
        res.status(500).send('Error fetching seeker profile.');
    }
};

// Update Provider Profile
exports.updateProviderProfile = async (req, res) => {
    try {
        const { name, email, phone, license } = req.body;

        if (req.session.user.role !== 'provider') {
            return res.status(403).send('Unauthorized access.');
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            { name, email, phone, license },
            { new: true }
        );

        req.session.user = updatedUser; // Update session with new user data
        res.redirect('/users/providers/profile');
    } catch (error) {
        console.error('Error updating provider profile:', error);
        res.status(500).send('Error updating provider profile.');
    }
};

// Update Seeker Profile
exports.updateSeekerProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (req.session.user.role !== 'seeker') {
            return res.status(403).send('Unauthorized access.');
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.user._id,
            { name, email, phone },
            { new: true }
        );

        req.session.user = updatedUser; // Update session with new user data
        res.redirect('/users/seekers/profile');
    } catch (error) {
        console.error('Error updating seeker profile:', error);
        res.status(500).send('Error updating seeker profile.');
    }
};
