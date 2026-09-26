require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');

const sampleActivities = [
  { type: 'listed', itemName: 'Engineering Mathematics Books', price: 450, userName: 'Ravi', location: 'Library' },
  { type: 'sold', itemName: 'Scientific Calculator', price: 650, userName: 'Anjali', location: 'Main Block' },
  { type: 'wishlisted', itemName: 'Hostel Study Lamp', userName: 'Kiran', location: 'Hostel Block C' },
  { type: 'listed', itemName: 'collegebackpack', price: 550, userName: 'Murali', location: 'Sports Complex' },
  { type: 'exchanged', itemName: 'Lab Coat', userName: 'Divya', location: 'Chemistry Block' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Activity.deleteMany();
    await Activity.insertMany(sampleActivities);
    console.log('✅ Activity data seeded');
    process.exit();
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();