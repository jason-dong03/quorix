import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  findOrCreateUserFromGoogle,
  getUserById,
} from "../models/userModel.js";

const router = express.Router();

router.get("/auth/google", (req, res) => {
  const redirect_uri = encodeURIComponent(
    "http://localhost:4000/auth/google/callback"
  );
  const scope = encodeURIComponent(["openid", "email", "profile"].join(" "));

  const oauthUrl = `
    https://accounts.google.com/o/oauth2/v2/auth
      ?client_id=${process.env.GOOGLE_CLIENT_ID}
      &redirect_uri=${redirect_uri}
      &response_type=code
      &scope=${scope}
      &access_type=online
      &prompt=consent
  `
    .replace(/\s+/g, "")
    .trim();

  res.redirect(oauthUrl);
});


//after auth , call back flow
router.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:4000/auth/google/callback",
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
  const dbUser = await findOrCreateUserFromGoogle(profile); //add to users

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
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect("http://localhost:5173/dashboard");
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
