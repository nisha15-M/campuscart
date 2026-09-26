const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['listed', 'sold', 'wishlisted', 'exchanged'],
    required: true,
  },
  itemName: { type: String, required: true },
  price: { type: Number },
  userName: { type: String, required: true }, // display name, e.g. "Priya"
  location: { type: String }, // e.g. "Library", "Hostel Block C"
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);