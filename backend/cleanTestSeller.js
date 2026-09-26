const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Product = require("./models/Product");

async function cleanTestSeller() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    const seller = await User.findOne({
      name: "Test Seller",
    });

    if (!seller) {
      console.log("Test Seller not found");
      await mongoose.connection.close();
      return;
    }

    console.log("Test Seller found");

    const result = await Product.deleteMany({
      seller: seller._id,
    });

    console.log(`Deleted ${result.deletedCount} Test Seller products`);

    await mongoose.connection.close();

    console.log("Cleanup complete");
  } catch (error) {
    console.error("CLEANUP ERROR:");
    console.error(error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

cleanTestSeller();