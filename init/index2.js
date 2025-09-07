require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js"); // adjust path if needed

async function main() {
  try {
    await mongoose.connect("mongodb+srv://rajkumarnathsharma_db_user:bLsYxDxVMwpQuVzx@hackodisha.jy6gpzj.mongodb.net/?retryWrites=true&w=majority&appName=hackodisha");
    console.log("✅ Connected to MongoDB Atlas");

    // Check if an admin already exists
    const existingAdmin = await Listing.findOne({ username: "admin" });
    if (existingAdmin) {
      await existingAdmin.deleteMany({});
    }

    // Create a new admin
    const adminUser = new Listing({
    name: 'Admin User',
    username: '@admin',
    age: 20,
    place: 'rourkela',
    gender: 'male',
    religion: 'hindu',
    education: 'bachelor',
    profession: 'engineer',
    phone: '9876543210',
    password: '$2b$10$D3TL1O7DTy/uOwrLCL9BTO6tRp.ajJz8AYsZNcFbqzO4Ly5b8X0u.',
    isAdmin: true,
    });

    await adminUser.save();
    console.log("🚀 Admin user created successfully:", adminUser.username);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    mongoose.connection.close();
  }
}

main();