const express = require("express");
const { getRanking, setRankingStatus } = require("../controllers/rankingController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getRanking);
router.patch("/:id/status", setRankingStatus);

module.exports = router;
