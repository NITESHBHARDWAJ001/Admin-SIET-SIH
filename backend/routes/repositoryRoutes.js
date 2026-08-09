const express = require("express");
const {
  listRepositories,
  getRepository,
  createAndInviteRepository,
  syncRepository,
  syncAllRepositories,
  lockRepository,
  unlockRepository,
  archiveRepository,
  deleteRepository,
} = require("../controllers/repositoryController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

const router = express.Router();

const canManage = requireRole("SuperAdmin", "FacultyCoordinator");

router.use(requireAuth);

router.get("/", listRepositories);
router.get("/:teamId", getRepository);
router.post("/sync-all", canManage, syncAllRepositories);
router.post("/:teamId/create-and-invite", canManage, createAndInviteRepository);
router.post("/:teamId/sync", canManage, syncRepository);
router.post("/:teamId/lock", canManage, lockRepository);
router.post("/:teamId/unlock", canManage, unlockRepository);
router.post("/:teamId/archive", canManage, archiveRepository);
router.delete("/:teamId", canManage, deleteRepository);

module.exports = router;
