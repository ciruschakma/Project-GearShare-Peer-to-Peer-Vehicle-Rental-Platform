const express = require("express");
const {
    createRequest,
    updateRequestStatus,
    getRequests,
    getSeekerRequests,
    approveRequest,
    getRequestsForProvider,
} = require("../controllers/requestController");
const { ensureAuthenticated, ensureRole } = require("../middleware/authMiddleware");
const router = express.Router();

// Create a request (Car Seekers)
router.post("/create", ensureAuthenticated, ensureRole("seeker"), createRequest);

// Approve or reject a request (Car Providers)
router.post("/:id/:action", ensureAuthenticated, ensureRole("provider"), updateRequestStatus);

// View all requests for the user (Seeker or Provider)
router.get("/manage", ensureAuthenticated, getRequests);

// View requests specific to seekers
router.get("/seekers/requests", ensureAuthenticated, ensureRole("seeker"), getSeekerRequests);

router.get('/providers/requests', ensureAuthenticated, ensureRole('provider'), getRequestsForProvider);

// Render the manage requests page for Providers (or use the getRequests handler directly)
router.get("/providers/requests", ensureAuthenticated, ensureRole("provider"), async (req, res) => {
    try {
        const requests = await getRequestsForProvider(req.session.user._id); // Ensure this helper is defined in your controller
        res.render("requests/manage", {
            user: req.session.user,
            activePage: "requests",
            requests,
        });
    } catch (error) {
        console.error("Error rendering provider requests:", error);
        res.status(500).send("Error loading requests.");
    }
});

router.get("/seekers/requests", ensureAuthenticated, ensureRole("seeker"), async (req, res) => {
    try {
        const seekerId = req.session.user?._id;
        if (!seekerId) {
            return res.status(401).send("Unauthorized");
        }
        const requests = await Request.find({ seekerId }).populate("carId providerId");
        res.render("seekers/requests", { activePage: "requests", requests });
    } catch (error) {
        console.error("Error fetching seeker requests:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/approve/:id', ensureAuthenticated, ensureRole('provider'), approveRequest);

router.post('/requests/create', ensureAuthenticated, async (req, res) => {
    try {
        const { carId, providerId, startDate, endDate, message } = req.body;
        const seekerId = req.session.user._id;

        const newRequest = new Request({
            carId,
            providerId,
            seekerId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            pickupLocation, 
            message: message || 'No message provided.',
            status: 'Pending',
        });

        await newRequest.save();
        res.redirect('/requests/seekers/requests');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Render the main dashboard page
router.get("/main", ensureAuthenticated, (req, res) => {
    res.render("main", {
        user: req.session.user,
        activePage: "main",
    });
});

module.exports = router;