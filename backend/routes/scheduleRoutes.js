const express = require("express");
const { listSlots, createSlot, updateSlot, deleteSlot } = require("../controllers/scheduleController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listSlots);
router.post("/", createSlot);
router.patch("/:id", updateSlot);
router.delete("/:id", deleteSlot);

module.exports = router;
