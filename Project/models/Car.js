const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, enum: ['SUV', 'Sedan', 'Electric', 'Luxury'], required: true },
    image: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Available', 'Rented'], default: 'Available' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Car', carSchema);
