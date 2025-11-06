import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  findOrCreateUserFromGoogle,
  getUserById,
} from "../models/userModel.js";

const router = express.Router();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.get("/auth/google", (req, res) => {
  const redirect_uri = `/auth/google/callback`; 
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri,                     
    response_type: "code",
    scope: ["openid","email","profile"].join(" "),
    access_type: "online",
    include_granted_scopes: "true",
    //prompt: "select_account",        
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${BACKEND_URL}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token } = tokenRes.data;

  const profileRes = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const profile = profileRes.data;
  const dbUser = await findOrCreateUserFromGoogle(profile);

  const appToken = jwt.sign(
    {
      uid: dbUser.id,
      sub: dbUser.google_id,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.picture,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("session", appToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: undefined
  });

  res.redirect(303, `${CLIENT_URL}/dashboard`);
});

router.get("/api/me", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.uid);
    if (!user) return res.status(401).json({ user: null });
    return res.json({ user });
  } catch {
    return res.status(401).json({ user: null });
  }
});

export default router;