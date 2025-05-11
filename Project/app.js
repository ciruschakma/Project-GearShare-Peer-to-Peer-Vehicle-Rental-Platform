const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes'); // Includes /cars/seed
const requestRoutes = require('./routes/RequestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const mainRoutes = require('./routes/mainRoutes');
const { ensureAuthenticated } = require('./middleware/authMiddleware');

const app = express();

// Connect to MongoDB
mongoose
    .connect('mongodb://127.0.0.1:27017/GearShare', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Configure the views folder explicitly 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Use `true` if running with HTTPS
    })
);

// Authentication middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use("/requests", require("./routes/RequestRoutes"));

// Routes
app.use('/users', userRoutes); // User-related routes
app.use('/cars', carRoutes); // Car-related routes (including the /seed endpoint)
app.use('/requests', requestRoutes); // Request-related routes
app.use('/bookings', bookingRoutes); // Booking-related routes
app.use('/main', mainRoutes);

// Landing Page
app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/main', ensureAuthenticated, (req, res) => {
    res.render('main', {
        user: req.session.user, // Pass the user data from the session
        activePage: 'home',    // Set activePage to 'main'
        cars: []               // Add cars or fetch them from your database
    });
});

app.get('/users/seekers/profile', ensureAuthenticated, (req, res) => {
    res.render('seekers/profile', { activePage: 'profile' });
});

app.get('/cars/listings', ensureAuthenticated, (req, res) => {
    res.render('providers/listings', { activePage: 'listings' });
});

// 404 Page
app.use((req, res) => {
    res.status(404).render('404');
});

app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    next();
});

app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        // Redirect to the landing page
        res.redirect('/');
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
