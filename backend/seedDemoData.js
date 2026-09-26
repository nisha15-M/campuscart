const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI;

// ===============================
// IMAGE MAP (title -> custom icon, embedded as data URI)
// These are drawn locally and embedded directly, so they always
// load instantly with no network/CDN dependency.
// ===============================

const imageMap = {
  "Engineering Mathematics Books": "/images/products/engineering-mathematics-books.png",
  "Scientific Calculator": "/images/products/scientific-calculator.png",
  "DBMS Textbook Exchange": "/images/products/dbms-textbook.png",
  "Study Lamp": "/images/products/study-lamp.png",
  "College Backpack": "/images/products/college-backpack.png",
  "Lab Coat": "/images/products/lab-coat.png",
  "Data Structures Textbook": "/images/products/data-structures-textbook.png",
  "Python Programming Book": "/images/products/python-programming-book.png",
  "Wireless Mouse": "/images/products/wireless-mouse.png",
  "USB Keyboard": "/images/products/usb-keyboard.png",
  "College Hoodie": "/images/products/college-hoodie.png",
  "Hostel Table Fan": "/images/products/hostel-table-fan.png",
  "Drawing Sheet Pack": "/images/products/drawing-sheet-pack.png",
  "Operating Systems Book": "/images/products/operating-systems-book.png",
  "Arduino Project Kit": "/images/products/arduino-project-kit.png",
  "College Shoes": "/images/products/college-shoes.png",
  "Hostel Mattress": "/images/products/hostel-mattress.png",
  "Java Programming Notes": "/images/products/java-programming-notes.png",
};
const demoProducts = [
  {
    title: "Engineering Mathematics Books",
    description:
      "Engineering Mathematics study books useful for semester preparation.",
    category: "Books",
    listingType: "sell",
    price: 350,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Scientific Calculator",
    description:
      "Scientific calculator suitable for engineering mathematics and exams.",
    category: "Electronics",
    listingType: "sell",
    price: 500,
    condition: "Like New",
    meetupPoint: "Main Gate",
    urgent: true,
  },

  {
    title: "DBMS Textbook Exchange",
    description:
      "Database Management Systems textbook available for exchange.",
    category: "Books",
    listingType: "exchange",
    exchangeFor: "Programming Books",
    price: 0,
    condition: "Used",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "Study Lamp",
    description:
      "LED study lamp perfect for hostel rooms and late-night studying.",
    category: "Electronics",
    listingType: "sell",
    price: 450,
    condition: "Like New",
    meetupPoint: "Hostel Block A",
    urgent: false,
  },

  {
    title: "College Backpack",
    description:
      "Durable college backpack with multiple compartments.",
    category: "Clothing",
    listingType: "sell",
    price: 600,
    condition: "Used",
    meetupPoint: "Canteen",
    urgent: false,
  },

  {
    title: "Lab Coat",
    description:
      "Clean and well-maintained laboratory coat for practical sessions.",
    category: "Lab Equipment",
    listingType: "sell",
    price: 250,
    condition: "Used",
    meetupPoint: "Academic Block",
    urgent: true,
  },

  {
    title: "Data Structures Textbook",
    description:
      "Data Structures textbook useful for CSE students.",
    category: "Books",
    listingType: "sell",
    price: 300,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Python Programming Book",
    description:
      "Python programming book for beginners and intermediate students.",
    category: "Books",
    listingType: "sell",
    price: 280,
    condition: "Like New",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Wireless Mouse",
    description:
      "Wireless optical mouse suitable for laptops and desktop computers.",
    category: "Electronics",
    listingType: "sell",
    price: 350,
    condition: "Like New",
    meetupPoint: "Canteen",
    urgent: false,
  },

  {
    title: "USB Keyboard",
    description:
      "USB wired keyboard in working condition.",
    category: "Electronics",
    listingType: "sell",
    price: 300,
    condition: "Used",
    meetupPoint: "Main Gate",
    urgent: false,
  },

  {
    title: "College Hoodie",
    description:
      "Comfortable college hoodie suitable for campus use.",
    category: "Clothing",
    listingType: "sell",
    price: 700,
    condition: "Like New",
    meetupPoint: "Canteen",
    urgent: false,
  },

  {
    title: "Hostel Table Fan",
    description:
      "Compact table fan suitable for hostel rooms.",
    category: "Electronics",
    listingType: "sell",
    price: 800,
    condition: "Used",
    meetupPoint: "Hostel Block A",
    urgent: true,
  },

  {
    title: "Drawing Sheet Pack",
    description:
      "Drawing sheets for engineering graphics and design work.",
    category: "Stationery",
    listingType: "sell",
    price: 120,
    condition: "New",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "Operating Systems Book",
    description:
      "Operating Systems textbook for CSE students.",
    category: "Books",
    listingType: "sell",
    price: 320,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Arduino Project Kit",
    description:
      "Arduino electronics project kit with components for college projects.",
    category: "Lab Equipment",
    listingType: "sell",
    price: 1200,
    condition: "Like New",
    meetupPoint: "Academic Block",
    urgent: true,
  },

  {
    title: "College Shoes",
    description:
      "Comfortable formal shoes suitable for college and presentations.",
    category: "Clothing",
    listingType: "sell",
    price: 900,
    condition: "Used",
    meetupPoint: "Main Gate",
    urgent: false,
  },

  {
    title: "Hostel Mattress",
    description:
      "Clean hostel mattress available for students.",
    category: "Furniture",
    listingType: "sell",
    price: 1000,
    condition: "Used",
    meetupPoint: "Hostel Block B",
    urgent: false,
  },

  {
    title: "Java Programming Notes",
    description:
      "Complete Java programming notes useful for semester preparation.",
    category: "Books",
    listingType: "free",
    price: 0,
    condition: "Used",
    meetupPoint: "Academic Block",
    urgent: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    let demoSeller = await User.findOne({
      email: "campuscart.demo@gmail.com",
    });

    const passwordHash = await bcrypt.hash("Demo@12345", 10);

    if (!demoSeller) {
      demoSeller = await User.create({
        name: "CampusCart Demo Seller",
        email: "campuscart.demo@gmail.com",
        password: passwordHash,
        college: "KSR College of Engineering",
        trustScore: 96,
        ratingsSum: 480,
        ratingsCount: 5,
        verified: true,
      });

      console.log("Demo seller created");
    } else {
      console.log("Demo seller already exists");
    }

    await Product.deleteMany({
      seller: demoSeller._id,
    });

    console.log("Old demo products removed");

    const productsToInsert = demoProducts.map((product) => ({
      ...product,

      seller: demoSeller._id,

      college: "KSR College of Engineering",

      images: [imageMap[product.title]],

      status: "active",

      semesterTag: "Fall2026",

      campusLoop: {
        originalOwner: demoSeller._id,
        currentOwner: demoSeller._id,
        resaleCount: 0,

        ownershipHistory: [
          {
            owner: demoSeller._id,
            transactionType: "initial_listing",
          },
        ],
      },
    }));

    await Product.insertMany(productsToInsert);

    console.log(`${productsToInsert.length} demo products inserted`);

    console.log(`
======================================
       CAMPUSCART SEED COMPLETE
======================================

Demo Login:
Email: campuscart.demo@gmail.com
Password: Demo@12345

Products added: ${productsToInsert.length}

You can now login from the frontend.
`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("SEED ERROR:");
    console.error(error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

seed();