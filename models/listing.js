const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // Import bcrypt

const listingSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        match: [/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces.']
    },
    username: {
        type: String,
        required: [true, 'Username is required.'],
        minlength: [4, 'Username must be at least 4 characters long.'],
        unique: true 
    },
    age: {
        type: Number,
        required: [true, 'Age is required.'],
        min: [18, 'You must be at least 18 years old.'],
        max: [100, 'Age cannot exceed 100.'],
    },
    place: {
        type: String,
        required: [true, 'Place is required.'],
        match: [/^[A-Za-z\s]+$/, 'Place can only contain letters and spaces.']
    },
    gender: String,
    religion: String,
    education: String,
    profession: String,
    phone: {
        type: String,
        required: [true, 'Phone number is required.'],
        match: [/^[0-9]{10}$/, 'Phone number must be a 10-digit number.']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minlength: [8, 'Password must be at least 8 characters long.'],
    },
    isAdmin: {
        type: Boolean,
        default: false // New field to track if the user is an admin
    }
});

// Mongoose pre-save hook to hash the password before saving a new user
listingSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        // Hash the password with a salt round of 10
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
