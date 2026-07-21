const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/registrations", registrationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
