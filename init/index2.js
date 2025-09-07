require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js"); // adjust path if needed

async function main() {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI); // 👈 debug log
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Delete old admin if exists
    await Listing.deleteMany({ username: "@admin" });

    // Create new admin
    const adminUser = new Listing({
      name: "Admin User",
      username: "@admin",
      age: 20,
      place: "rourkela",
      gender: "male",
      religion: "hindu",
      education: "bachelor",
      profession: "engineer",
      phone: "9876543210",
      password: "$2b$10$D3TL1O7DTy/uOwrLCL9BTO6tRp.ajJz8AYsZNcFbqzO4Ly5b8X0u.", // bcrypt hash
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