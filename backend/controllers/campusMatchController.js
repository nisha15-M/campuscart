const Product = require("../models/Product");

// Points each criterion is worth. Only the criteria the student actually
// supplied count toward the maximum, so a perfect match is always 100%.
const WEIGHTS = {
  keyword: 50,
  budget: 20,
  category: 10,
  condition: 5,
  meetupPoint: 5,
  college: 5,
  urgent: 5,
};

const STOP_WORDS = new Set([
  "i", "need", "want", "looking", "for", "a", "an", "the", "some",
  "in", "on", "at", "of", "to", "and", "with", "my", "me", "please",
]);

// Turns "DBMS book under ₹400 near CSE block" into
// { words: ["dbms", "book"], budget: "400", locationHint: "cse block" }
const parseQuery = (rawKeyword, rawBudget) => {
  let text = String(rawKeyword || "").toLowerCase();
  let budget = rawBudget;

  const budgetMatch = text.match(
    /(?:under|below|within|less than|upto|up to|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/
  );
  if (budgetMatch) {
    if (budget === "" || budget === null || budget === undefined) {
      budget = budgetMatch[1];
    }
    text = text.replace(budgetMatch[0], " ");
  }

  let locationHint = "";
  const nearMatch = text.match(/\bnear\b\s+(.*)$/);
  if (nearMatch) {
    locationHint = nearMatch[1].trim();
    text = text.replace(nearMatch[0], " ");
  }

  const words = text
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  return { words, budget, locationHint };
};

const findCampusMatches = async (req, res, next) => {
  try {
    const {
      keyword = "",
      category = "",
      budget = "",
      condition = "",
      college = "",
      meetupPoint = "",
      urgent = false,
    } = req.body;

    const parsed = parseQuery(keyword, budget);
    const searchWords = parsed.words;
    const locationHint = parsed.locationHint;
    const wantsUrgent = urgent === true || urgent === "true";

    // ---- Validate budget ----
    let maxBudget = null;
    if (
      parsed.budget !== "" &&
      parsed.budget !== null &&
      parsed.budget !== undefined
    ) {
      maxBudget = Number(parsed.budget);
      if (!Number.isFinite(maxBudget) || maxBudget < 0) {
        return res.status(400).json({
          success: false,
          message: "Budget must be a valid positive number.",
        });
      }
    }

    // ---- Require at least one criterion ----
    const hasCriteria =
      searchWords.length > 0 ||
      maxBudget !== null ||
      category ||
      condition ||
      college ||
      meetupPoint ||
      locationHint ||
      wantsUrgent;

    if (!hasCriteria) {
      return res.status(400).json({
        success: false,
        message: "Tell us what you are looking for (keyword, budget, etc.).",
      });
    }

    // ---- Let MongoDB do the cheap filtering ----
    const query = { status: "active" };

    if (maxBudget !== null) {
      query.$or = [
        { listingType: "free" },
        { price: { $lte: maxBudget } },
      ];
    }

    // Don't recommend a student's own listings back to them
    if (req.user && req.user._id) {
      query.seller = { $ne: req.user._id };
    }

    // Only expose the seller's name, not their email
    const products = await Product.find(query).populate("seller", "name");

    const matches = products
      .map((product) => {
        const title = (product.title || "").toLowerCase();
        const description = (product.description || "").toLowerCase();

        const breakdown = [];
        const reasons = [];
        let earned = 0;
        let possible = 0;

        // fraction is 0..1 for how well this criterion was met
        const add = (key, label, fraction, reason) => {
          const weight = WEIGHTS[key];
          earned += weight * fraction;
          possible += weight;
          breakdown.push({ key, label, score: Math.round(fraction * 100) });
          if (fraction > 0 && reason) reasons.push(reason);
        };

        // 1. Keyword (required when supplied)
        if (searchWords.length > 0) {
          const allMatch = searchWords.every(
            (w) => title.includes(w) || description.includes(w)
          );
          if (!allMatch) return null;

          const allInTitle = searchWords.every((w) => title.includes(w));
          add(
            "keyword",
            "Keyword match",
            allInTitle ? 1 : 0.7,
            allInTitle
              ? "Keyword matches the item title"
              : "Keyword appears in the description"
          );
        }

        // 2. Budget (already enforced by the DB query)
        if (maxBudget !== null) {
          add(
            "budget",
            "Budget match",
            1,
            product.listingType === "free" ? "Free item" : "Fits your budget"
          );
        }

        // 3. Category
        if (category) {
          add(
            "category",
            "Category",
            product.category === category ? 1 : 0,
            "Same category"
          );
        }

        // 4. Condition
        if (condition) {
          add(
            "condition",
            "Condition",
            product.condition === condition ? 1 : 0,
            "Condition matches"
          );
        }

        // 5. Pickup location (explicit filter, or "near ..." from the text)
        if (meetupPoint) {
          add(
            "meetupPoint",
            "Pickup location",
            product.meetupPoint === meetupPoint ? 1 : 0,
            "Same pickup location"
          );
        } else if (locationHint) {
          const place = (product.meetupPoint || "").toLowerCase();
          const clg = (product.college || "").toLowerCase();
          const near =
            place.includes(locationHint) || clg.includes(locationHint);
          add("meetupPoint", "Pickup location", near ? 1 : 0, "Near your location");
        }

        // 6. College
        if (college) {
          add(
            "college",
            "College",
            product.college === college ? 1 : 0,
            "Same college"
          );
        }

        // 7. Urgent
        if (wantsUrgent) {
          add(
            "urgent",
            "Urgent",
            product.urgent ? 1 : 0,
            "Marked urgent"
          );
        }

        const matchScore = possible > 0 ? Math.round((earned / possible) * 100) : 0;

        return {
          ...product.toObject(),
          matchScore,
          matchReasons: reasons,
          breakdown, // powers the "Why this match?" panel on the frontend
        };
      })
      .filter((item) => item !== null && item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({
      success: true,
      count: matches.length,
      message:
        matches.length > 0
          ? "Campus matches found!"
          : "No matching campus items found.",
      matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findCampusMatches,
};