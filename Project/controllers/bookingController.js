const Booking = require('../models/Booking');
const Request = require('../models/Request');
const Car = require('../models/Car');

// exports.createBooking = async (req, res) => {
//     try {
//         const { requestId } = req.body;

//         // Find the request
//         const request = await Request.findById(requestId);
//         if (!request) {
//             return res.status(404).send('Request not found.');
//         }

//         // Create the booking
//         const booking = new Booking({
//             seekerId: request.seekerId,
//             providerId: request.providerId,
//             carId: request.carId,
//             startDate: request.startDate,
//             endDate: request.endDate,
//             totalPrice: calculateTotalPrice(request), // Define logic to calculate price
//             status: 'Ongoing',
//         });

//         await booking.save();

//         // Update the request status to Approved
//         request.status = 'Approved';
//         await request.save();

//         res.redirect('/requests/providers');
//     } catch (error) {
//         console.error('Error creating booking:', error.message);
//         res.status(500).send('Error creating booking.');
//     }
// };

// exports.approveBooking = async (req, res) => {
//     try {
//         const bookingId = req.params.id;

//         const booking = await Booking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).send('Booking not found.');
//         }

//         booking.status = 'Ongoing';
//         await booking.save();

//         res.redirect('/bookings/providers');
//     } catch (error) {
//         console.error('Error approving booking:', error.message);
//         res.status(500).send('Error approving booking.');
//     }
// };

// exports.rejectBooking = async (req, res) => {
//     try {
//         const bookingId = req.params.id;

//         const booking = await Booking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).send('Booking not found.');
//         }

//         booking.status = 'Rejected';
//         await booking.save();

//         res.redirect('/bookings/providers');
//     } catch (error) {
//         console.error('Error rejecting booking:', error.message);
//         res.status(500).send('Error rejecting booking.');
//     }
// };

// Fetch bookings for a seeker
exports.getSeekerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ seekerId: req.session.user._id })
            .populate('carId')
            .populate('providerId');

        res.render('seekers/bookings', {
            user: req.session.user,
            bookings,
        });
    } catch (error) {
        console.error('Error fetching seeker bookings:', error.message);
        res.status(500).send('Error fetching seeker bookings.');
    }
};


// Fetch bookings for a provider
exports.getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ providerId: req.session.user._id })
            .populate('carId')
            .populate('seekerId');

        res.render('providers/bookings', {
            user: req.session.user,
            bookings,
        });
    } catch (error) {
        console.error('Error fetching provider bookings:', error.message);
        res.status(500).send('Error fetching provider bookings.');
    }
};

// // Rate a booking
// exports.rateBooking = async (req, res) => {
//     try {
//         const { rating } = req.body;
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) {
//             return res.status(404).send('Booking not found.');
//         }
//         booking.rating = rating;
//         await booking.save();
//         res.redirect('/renters/bookings');
//     } catch (error) {
//         console.error('Error rating booking:', error);
//         res.status(500).send('Error rating booking.');
//     }
// };
