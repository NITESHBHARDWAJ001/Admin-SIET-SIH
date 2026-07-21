const sheetsService = require("../services/googleSheets/sheetsService");
const { logAction } = require("../utils/auditLog");

const EDITABLE_FIELDS = ["name", "category", "url", "visible", "order"];

async function listResources(req, res) {
  const resources = await sheetsService.getRows("Resources");
  resources.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  res.json({ data: resources });
}

async function createResource(req, res) {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ message: "Name and URL are required" });

  const existing = await sheetsService.getRows("Resources");
  const created = await sheetsService.appendRow("Resources", {
    name,
    category: req.body.category || "General",
    url,
    visible: true,
    order: existing.length,
    createdAt: new Date().toISOString(),
  });

  await logAction(req, "Resource Uploaded", name);
  res.status(201).json({ data: created });
}

async function updateResource(req, res) {
  const patch = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      patch[field] = req.body[field];
    }
  }

  const updated = await sheetsService.updateRow("Resources", req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Resource not found" });

  await logAction(req, "Resource Updated", updated.name);
  res.json({ data: updated });
}

async function deleteResource(req, res) {
  const resource = await sheetsService.getRowById("Resources", req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });

  await sheetsService.deleteRow("Resources", req.params.id);
  await logAction(req, "Resource Deleted", resource.name);
  res.json({ message: "Resource deleted" });
}

module.exports = { listResources, createResource, updateResource, deleteResource };
