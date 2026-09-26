
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Books",
        "Electronics",
        "Lab Equipment",
        "Furniture",
        "Clothing",
        "Sports",
        "Stationery",
        "Other",
      ],
    },

    // Buy, free giveaway, or exchange
    listingType: {
      type: String,
      enum: ["sell", "free", "exchange"],
      default: "sell",
      required: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    // What the seller wants in exchange
    exchangeFor: {
      type: String,
      trim: true,
      default: "",
    },

    condition: {
      type: String,
      enum: ["New", "Like New", "Used", "Heavily Used"],
      required: true,
    },

    images: [{ type: String }],

    // Urgent listing for students who need items quickly
    urgent: {
      type: Boolean,
      default: false,
    },

    // Predefined campus meetup locations
    meetupPoint: {
      type: String,
      enum: [
        "Library",
        "Main Gate",
        "Hostel Block A",
        "Hostel Block B",
        "Canteen",
        "Academic Block",
        "Sports Complex",
        "Other",
      ],
      default: "Main Gate",
    },

    college: {
      type: String,
      required: true,
      trim: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // CampusLoop: tracks the complete ownership journey
    campusLoop: {
      originalOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      currentOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      resaleCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      ownershipHistory: [
        {
          owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },

          acquiredAt: {
            type: Date,
            default: Date.now,
          },

          transactionType: {
            type: String,
            enum: [
              "initial_listing",
              "sale",
              "exchange",
              "giveaway",
            ],
            default: "sale",
          },
        },
      ],
    },

    status: {
      type: String,
      enum: ["active", "reserved", "sold", "archived"],
      default: "active",
    },

    // Semester-based listing management
    semesterTag: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Search index
productSchema.index({
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Product", productSchema);