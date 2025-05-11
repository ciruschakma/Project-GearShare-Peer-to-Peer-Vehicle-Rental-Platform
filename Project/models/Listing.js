const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Sedan, SUV
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String, default: 'car-placeholder.jpg' },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Available' }, // e.g., Available, Booked
});

module.exports = mongoose.model('Listing', listingSchema);
