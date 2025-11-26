
import express from "express";

import jwt from "jsonwebtoken";
import {
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  setUserDefaultPortfolio
} from "../models/userModel.js";

const router = express.Router();

//create portfolio
router.post("/api/portfolios", async (req, res) => {

  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, description } = req.body;

    await addPortfolio(decoded.uid,name, description);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log("error: ", err);
    return res.status(500).json({ error: "Failed to create portfolio" });
  }
});

//update portfolio
router.put("/api/portfolios/:portfolioId", async (req, res) => {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const portfolioId = parseInt(req.params.portfolioId, 10);
  if (!portfolioId) {
    return res.status(400).json({ error: "Invalid portfolio ID" });
  }

  const { name, description } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const updatedPortfolio = await updatePortfolio(uid, portfolioId, {
      name,
      description,
    });

    if (!updatedPortfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    return res.json({ portfolio: updatedPortfolio });
  } catch (err) {
    console.error("Failed to update portfolio:", err);
    return res.status(500).json({ error: "Failed to update portfolio" });
  }
});

//delete portfolio
router.delete("/api/portfolios/:portfolioId", async (req, res) => {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const portfolioId = parseInt(req.params.portfolioId, 10);
  if (!portfolioId) {
    return res.status(400).json({ error: "Invalid portfolio ID" });
  }

  try {
    const deleted = await deletePortfolio(uid, portfolioId);

    if (!deleted) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete portfolio:", err);
    return res.status(500).json({ error: "Failed to delete portfolio" });
  }
});

//set default 
router.post("/api/portfolios/:portfolioId/set-default", async (req, res) => {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const portfolioId = parseInt(req.params.portfolioId, 10);
  if (!portfolioId) {
    return res.status(400).json({ error: "Invalid portfolio ID" });
  }

  try {
    const ok = await setUserDefaultPortfolio(uid, portfolioId);

    if (!ok) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to set default portfolio:", err);
    return res.status(500).json({ error: "Failed to set default portfolio" });
  }
});

export default router;
