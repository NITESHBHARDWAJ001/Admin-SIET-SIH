const express = require("express");
const { listUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
