const bcrypt = require("bcryptjs");
const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const ROLES = ["SuperAdmin", "FacultyCoordinator", "StudentCoordinator", "Judge"];

function toSafeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function listUsers(req, res) {
  const users = await sheetsService.getRows("Users");
  const filtered = req.query.role ? users.filter((u) => u.role === req.query.role) : users;
  res.json({ data: filtered.map(toSafeUser) });
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password and role are required" });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` });
  }

  const existing = await sheetsService.getRows("Users");
  if (existing.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: "A user with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await sheetsService.appendRow("Users", { name, email, passwordHash, role });
  await logAction(req, "User Created", `${name} (${email}) as ${role}`);
  res.status(201).json({ data: toSafeUser(created) });
}

async function updateUser(req, res) {
  const patch = {};
  ["name", "email", "role"].forEach((field) => {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  });
  if (req.body.password) {
    patch.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  const updated = await sheetsService.updateRow("Users", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "User not found" });

  await logAction(req, "User Updated", `${updated.name} (${updated.email})`);
  res.json({ data: toSafeUser(updated) });
}

async function deleteUser(req, res) {
  const user = await sheetsService.getRowById("Users", req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await sheetsService.deleteRow("Users", req.params.id);
  await logAction(req, "User Deleted", `${user.name} (${user.email})`);
  res.json({ message: "User deleted" });
}

module.exports = { listUsers, createUser, updateUser, deleteUser, ROLES };
