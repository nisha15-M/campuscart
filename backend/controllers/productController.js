const Product = require("../models/Product");
const Activity = require("../models/Activity");

// Fire-and-forget activity log - never blocks or fails the main request
const logActivity = (payload) => {
  Activity.create(payload).catch(() => {});
};

// @desc   Create a new product listing
// @route  POST /api/products
// @access Private
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      listingType,
      price,
      exchangeFor,
      condition,
      images,
      urgent,
      meetupPoint,
      semesterTag,
    } = req.body;

    if (!title || !description || !category || !condition) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }

    const product = await Product.create({
      title,
      description,
      category,
      listingType: listingType || "sell",
      price: listingType === "sell" ? price : 0,
      exchangeFor,
      condition,
      images,
      urgent: !!urgent,
      meetupPoint,
      college: req.user.college,
      seller: req.user._id,
      semesterTag: semesterTag || "Fall2026",
      // CampusLoop: every item starts its ownership journey with its lister
      campusLoop: {
        originalOwner: req.user._id,
        currentOwner: req.user._id,
        resaleCount: 0,
        ownershipHistory: [
          {
            owner: req.user._id,
            transactionType: "initial_listing",
          },
        ],
      },
    });

    logActivity({
      type: "listed",
      itemName: product.title,
      price: product.price,
      userName: req.user.name,
      location: product.meetupPoint,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc   Get all active products
// @route  GET /api/products
// @access Private
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      listingType,
      condition,
      minPrice,
      maxPrice,
      urgent,
      sameCollegeOnly,
    } = req.query;

    const filter = {
      status: "active",
    };

    // Smart Match Search
    // Searches both title and description
    if (keyword) {
      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Listing type filter
    if (listingType) {
      filter.listingType = listingType;
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Urgent products filter
    if (urgent === "true") {
      filter.urgent = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Show only products from the same college
    if (sameCollegeOnly === "true" && req.user?.college) {
  filter.college = req.user.college;
}

    const products = await Product.find(filter)
      .populate("seller", "name trustScore ratingsCount")
      .sort({
        urgent: -1,
        createdAt: -1,
      });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc   Get nearby campus items
// @route  GET /api/products/radar
// @access Private
const getRadarProducts = async (req, res, next) => {
  try {
    const { keyword, meetupPoint } = req.query;

    const filter = {
      status: "active",
      college: req.user.college,
    };

    // Search by item title or description
    if (keyword) {
      filter.$or = [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    // Filter by campus location
    if (meetupPoint) {
      filter.meetupPoint = meetupPoint;
    }

    const products = await Product.find(filter)
      .populate("seller", "name trustScore ratingsCount")
      .sort({
        urgent: -1,
        createdAt: -1,
      });

    // Group products by meetup location
    const radarData = {};

    products.forEach((product) => {
      const location = product.meetupPoint || "Other";

      if (!radarData[location]) {
        radarData[location] = {
          location,
          itemCount: 0,
          products: [],
        };
      }

      radarData[location].itemCount += 1;
      radarData[location].products.push(product);
    });

    res.status(200).json(Object.values(radarData));
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product by ID
// @route  GET /api/products/:id
// @access Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email trustScore ratingsCount college")
      .populate("campusLoop.ownershipHistory.owner", "name");

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user's products
// @route  GET /api/products/mine
// @access Private
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this product");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this product");
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Campus-wide reuse impact stats (CampusLoop rollup)
// @route  GET /api/products/impact
// @access Public
const getImpactStats = async (req, res, next) => {
  try {
    const products = await Product.find({}, "price status campusLoop.resaleCount");

    let itemsInLoop = 0;
    let totalResales = 0;
    let moneySaved = 0;

    products.forEach((p) => {
      const resales = p.campusLoop?.resaleCount || 0;
      totalResales += resales;
      if (resales > 0) itemsInLoop += 1;
      if (p.status === "sold") moneySaved += p.price || 0;
    });

    // Rough campus-relatable estimate: ~2.5kg CO2 avoided per item kept in circulation
    const co2SavedKg = Math.round(totalResales * 2.5 + itemsInLoop * 1.2);

    res.json({
      itemsInLoop,
      totalResales,
      moneySaved,
      co2SavedKg,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getRadarProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getImpactStats,
};