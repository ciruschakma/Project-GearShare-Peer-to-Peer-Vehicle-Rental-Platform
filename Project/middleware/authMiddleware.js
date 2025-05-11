exports.ensureAuthenticated = (req, res, next) => {
    console.log("Session Data:", req.session);
    if (req.session && req.session.user) {
        return next();
    }
    console.log("Unauthorized access attempt");
    res.redirect("/login");
};

exports.ensureRole = (role) => (req, res, next) => {
    if (req.session.user.role === role) {
        return next();
    }
    res.status(403).send("Unauthorized.");
};
