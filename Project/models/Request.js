// const mongoose = require("mongoose");

// const requestSchema = new mongoose.Schema({
//     seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Seeker who sent the request
//     providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Provider receiving the request
//     carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true }, // Requested car
//     startDate: { type: Date, required: true }, // Start date of the request
//     endDate: { type: Date, required: true }, // End date of the request
//     pickupLocation: { type: String, required: true }, // Preferred pickup location
//     message: { type: String},
//     notes: { type: String }, // Additional notes from seeker
//     status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Request status
//     createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Request", requestSchema);

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    message: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);