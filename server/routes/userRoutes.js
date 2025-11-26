import express from "express";
import jwt from "jsonwebtoken";
import {fetchUserPortfolios,getUserById} from "../models/userModel.js";

const router = express.Router();

router.get("/api/me/portfolios", async (req, res)=>{
    const token = req.cookies.session;
    if (!token) 
        return res.status(401).json({ user: null });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(decoded.uid);
        if (!user) 
            return res.status(401).json({ user: null });

        const portfolios = await fetchUserPortfolios(user.id);
        return res.json({portfolios});
    } catch (err){
        console.log(err);
        return res.status(401).json({ user: null });
    }
});

export default router;