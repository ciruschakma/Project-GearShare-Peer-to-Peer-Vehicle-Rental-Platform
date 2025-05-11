const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Ongoing', 'Completed', 'Rejected'], default: 'Pending' },
    totalPrice: { type: Number, required: true }, // Optional: Calculated based on duration
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
