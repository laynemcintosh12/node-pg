const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const router = new express.Router();

// Route to add a new industry
router.post("/industries", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query("INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry", [code, industry]);
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});


// Route to list all industries and associated company codes
router.get("/industries", async (req, res, next) => {
  try {
    const result = await db.query("SELECT i.code AS industry_code, i.industry, array_agg(ci.comp_code) AS company_codes " +
      "FROM industries AS i " +
      "LEFT JOIN company_industries AS ci ON i.code = ci.industry_code " +
      "GROUP BY i.code, i.industry");
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});


// Route to associate an industry with a company
router.post("/companies/:comp_code/industries/:industry_code", async (req, res, next) => {
  try {
    const { comp_code, industry_code } = req.params;
    const result = await db.query("INSERT INTO company_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code", [comp_code, industry_code]);
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
