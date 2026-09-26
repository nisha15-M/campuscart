const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Activity = require("../models/Activity");

const logActivity = (payload) => {
  Activity.create(payload).catch(() => {});
};

// @desc   Add a product to the logged-in user's wishlist
// @route  POST /api/wishlist
// @access Private
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const exists = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });
    if (exists) {
      res.status(400);
      throw new Error("Already in your wishlist");
    }

    const item = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    const product = await Product.findById(productId);
    if (product) {
      logActivity({
        type: "wishlisted",
        itemName: product.title,
        price: product.price,
        userName: req.user.name,
        location: product.meetupPoint,
      });
    }

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc   Get the logged-in user's wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate({
      path: "product",
      populate: { path: "seller", select: "name trustScore" },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc   Remove a product from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId,
    });
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
