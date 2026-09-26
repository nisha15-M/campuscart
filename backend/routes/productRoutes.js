const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getRadarProducts,
  getImpactStats,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

// Create a new listing
router.post("/", protect, createProduct);

// Get all listings with search and filters
router.get("/", protect, getProducts);

// Get logged-in user's listings
// Keep this BEFORE /:id
router.get("/mine", protect, getMyProducts);

// Campus Radar - nearby campus items
// Keep this BEFORE /:id
router.get("/radar", protect, getRadarProducts);

// CampusLoop impact rollup - public homepage stat
// Keep this BEFORE /:id
router.get("/impact", getImpactStats);

// Get one listing
router.get("/:id", protect, getProductById);

// Update a listing
router.put("/:id", protect, updateProduct);

// Delete a listing
router.delete("/:id", protect, deleteProduct);

module.exports = router;