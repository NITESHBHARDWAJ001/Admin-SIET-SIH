const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const EDITABLE_FIELDS = ["title", "description", "priority", "visibility", "publishDate", "expiryDate", "pinned"];

async function listAnnouncements(req, res) {
  const announcements = await sheetsService.getRows("Announcements");
  announcements.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.publishDate || "").localeCompare(a.publishDate || "");
  });
  res.json({ data: announcements });
}

async function createAnnouncement(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const created = await sheetsService.appendRow("Announcements", {
    title,
    description: description || "",
    priority: req.body.priority || "Normal",
    visibility: req.body.visibility || "Public",
    publishDate: req.body.publishDate || new Date().toISOString().slice(0, 10),
    expiryDate: req.body.expiryDate || "",
    pinned: false,
    createdAt: new Date().toISOString(),
  });

  await logAction(req, "Announcement Published", title);
  res.status(201).json({ data: created });
}

async function updateAnnouncement(req, res) {
  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      patch[field] = req.body[field];
    }
  }

  const updated = await sheetsService.updateRow("Announcements", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Announcement not found" });

  await logAction(req, "Announcement Edited", updated.title);
  res.json({ data: updated });
}

async function deleteAnnouncement(req, res) {
  const announcement = await sheetsService.getRowById("Announcements", req.params.id);
  if (!announcement) return res.status(404).json({ message: "Announcement not found" });

  await sheetsService.deleteRow("Announcements", req.params.id);
  await logAction(req, "Announcement Deleted", announcement.title);
  res.json({ message: "Announcement deleted" });
}

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
