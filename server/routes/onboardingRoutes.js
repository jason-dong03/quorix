
import express from "express";

import jwt from "jsonwebtoken";
import {
  getUserById,
  completedOnboarding,
  addPortfolio
} from "../models/userModel.js";

const router = express.Router();

router.get("/api/onboarding/status", async(req,res)=>{
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.uid);
    if (!user) 
      return res.status(401).json({ user: null });

    const isNewUser = await completedOnboarding(user.id);
    return res.json({isNewUser});
  } catch {
    return res.status(401).json({ user: null });
  }
});
router.post("/api/onboarding/finish", async (req, res) => {

  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { investmentGoal, riskTolerance, experience, portfolioName } = req.body;

    await addPortfolio(
      decoded.uid,
      portfolioName, 
      `${investmentGoal},${riskTolerance},${experience}`
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log("error: ", err);
    return res.status(500).json({ error: "Failed to add portfolio" });
  }
});
export default router;