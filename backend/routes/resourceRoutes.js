const express = require("express");
const {
  listResources,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", listResources);
router.post("/", createResource);
router.patch("/:id", updateResource);
router.delete("/:id", deleteResource);

module.exports = router;
