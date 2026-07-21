const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const users = await sheetsService.getRows("Users");
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  req.user = payload;
  await logAction(req, "User Login", `${user.email} logged in`);

  res.json({ token, user: payload });
}

async function logout(req, res) {
  await logAction(req, "User Logout", `${req.user.email} logged out`);
  res.json({ message: "Logged out" });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, me };
