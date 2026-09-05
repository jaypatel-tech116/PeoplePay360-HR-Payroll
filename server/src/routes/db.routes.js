const express = require("express");
const { getDatabaseAnalysis } = require("../controllers/db.controller");

const router = express.Router();

// GET /api/db/analysis - Comprehensive database analysis
router.get("/analysis", getDatabaseAnalysis);

module.exports = router;
