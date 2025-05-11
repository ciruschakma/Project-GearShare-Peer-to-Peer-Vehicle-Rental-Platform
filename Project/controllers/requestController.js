const Request = require('../models/Request');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

exports.getSeekerRequests = async (req, res) => {
    try {
        const seekerId = req.session.user._id; // Assuming session contains user
        const requests = await Request.find({ seekerId })
            .populate("carId", "title") // Adjust fields based on your Car schema
            .populate("providerId", "name");

        console.log("Populated Requests:", requests);

        res.render("seekers/requests", {
            activePage: "requests",
            requests,
        });
    } catch (error) {
        console.error("Error fetching seeker requests:", error);
        res.status(500).send("Error fetching requests.");
    }
};
// Get requests for providers
exports.getRequests = async (req, res) => {
    try {
        const providerId = req.session.user._id;
        const requests = await Request.find({ providerId }).populate("carId seekerId");

        console.log("Fetched Provider Requests:", requests);

        res.render("providers/requests", {
            requests,
            activePage: "requests",
        });
    } catch (error) {
        console.error("Error fetching provider requests:", error);
        res.status(500).send("Error fetching provider requests.");
    }
};

exports.getRequestsForProvider = async (req, res) => {
    try {
        const providerId = req.session.user._id; // Assuming the provider's ID is stored in the session
        const requests = await Request.find({ providerId }).populate('carId seekerId');
        res.render('providers/requests', { requests });
    } catch (error) {
        console.error('Error fetching provider requests:', error.message);
        res.status(500).send('Error fetching provider requests.');
    }
};

exports.createRequest = async (req, res) => {
    try {
        // Extract submitted fields from the form
        const { carId, providerId, startDate, endDate,pickupLocation,message } = req.body;

        // Get seeker ID from the session
        const seekerId = req.session.user._id;

        // Validate required fields
        if (!carId || !providerId || !startDate || !endDate) {
            return res.status(400).send("Missing required fields.");
        }

        // Create a new request document
        const newRequest = new Request({
            carId,
            seekerId,
            providerId,
            pickupLocation: new String(pickupLocation), 
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            message: message || "No message provided.",
            status: "Pending", // Default status
        });

        // Save the request to the database
        await newRequest.save();

        // Redirect the user to their requests page
        res.redirect("/requests/seekers/requests");
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).send("Error creating request.");
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        // Find the request
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).send('Request not found.');
        }

        // Create a new booking from the request
        const booking = new Booking({
            seekerId: request.seekerId,
            providerId: request.providerId,
            carId: request.carId,
            startDate: request.startDate,
            endDate: request.endDate,
            totalPrice: calculateTotalPrice(request.startDate, request.endDate, request.carPrice),
            status: 'Ongoing',
        });

        await booking.save();

        // Update request status to "Approved"
        request.status = 'Approved';
        await request.save();

        res.redirect('/requests/providers');
    } catch (error) {
        console.error('Error approving request:', error.message);
        res.status(500).send('Error approving request.');
    }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id, action } = req.params;

        const updatedStatus = action === "approve" ? "Approved" : "Rejected";

        await Request.findByIdAndUpdate(id, { status: updatedStatus });

        res.redirect("/requests/providers/requests");
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).send("Error updating request status.");
    }
};

// Utility function for total price calculation
const calculateTotalPrice = (startDate, endDate, pricePerDay) => {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return days * pricePerDay;
};