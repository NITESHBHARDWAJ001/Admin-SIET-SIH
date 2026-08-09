const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const userRoutes = require("./routes/userRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const syncRoutes = require("./routes/syncRoutes");
const publicRoutes = require("./routes/publicRoutes");
const repositoryRoutes = require("./routes/repositoryRoutes");

const app = express();

// Render (and most PaaS hosts) put the app behind a reverse proxy that sets
// X-Forwarded-For to the real client IP. Trusting exactly one hop lets
// express-rate-limit (in publicRoutes) key off the actual visitor instead of
// the proxy's own IP.
app.set("trust proxy", 1);

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/registrations", registrationRoutes);
app.use("/users", userRoutes);
app.use("/submissions", submissionRoutes);
app.use("/evaluations", evaluationRoutes);
app.use("/ranking", rankingRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/announcements", announcementRoutes);
app.use("/resources", resourceRoutes);
app.use("/settings", settingsRoutes);
app.use("/reports", reportRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/sync", syncRoutes);
app.use("/public", publicRoutes);
app.use("/repositories", repositoryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
