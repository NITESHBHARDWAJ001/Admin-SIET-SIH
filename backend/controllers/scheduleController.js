const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const EDITABLE_FIELDS = ["room", "judgeId", "judgeName", "teamId", "teamName", "time", "duration", "status"];

async function listSlots(req, res) {
  const slots = await sheetsService.getRows("PresentationSchedule");
  slots.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  res.json({ data: slots });
}

async function createSlot(req, res) {
  const { room, teamId, teamName, time } = req.body;
  if (!room || !teamId || !time) {
    return res.status(400).json({ message: "room, teamId and time are required" });
  }

  const created = await sheetsService.appendRow("PresentationSchedule", {
    room,
    judgeId: req.body.judgeId || "",
    judgeName: req.body.judgeName || "",
    teamId,
    teamName: teamName || "",
    time,
    duration: req.body.duration || "15 min",
    status: "Scheduled",
  });

  await logAction(req, "Presentation Slot Created", `${teamName} in ${room} at ${time}`);
  res.status(201).json({ data: created });
}

async function updateSlot(req, res) {
  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      patch[field] = req.body[field];
    }
  }

  const updated = await sheetsService.updateRow("PresentationSchedule", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Slot not found" });

  await logAction(req, "Presentation Slot Updated", `${updated.teamName} -> ${updated.room} at ${updated.time}`);
  res.json({ data: updated });
}

async function deleteSlot(req, res) {
  const slot = await sheetsService.getRowById("PresentationSchedule", req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });

  await sheetsService.deleteRow("PresentationSchedule", req.params.id);
  await logAction(req, "Presentation Slot Deleted", `${slot.teamName} (${slot.room}, ${slot.time})`);
  res.json({ message: "Slot deleted" });
}

module.exports = { listSlots, createSlot, updateSlot, deleteSlot };
