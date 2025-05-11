const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    idNumber: { type: String, required: function () { return this.role === 'provider'; } },
    license: { type: String, required: function () { return this.role === 'seeker'; } }, // Required only for seekers
    age: { type: Number, required: true },
    dob: { type: Date, required: true },
    photo: { type: String, default: '/images/profile-photo-placeholder.jpg' },
    role: { type: String, required: true, enum: ['seeker', 'provider'] },
    bookings: [
        {
            car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
            status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
