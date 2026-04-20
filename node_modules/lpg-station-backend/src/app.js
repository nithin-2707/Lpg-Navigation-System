const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const stationRoutes = require("./routes/stationRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", stationRoutes);
app.use("/api", stationRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
  const indexFile = path.join(frontendDistPath, "index.html");

  if (fs.existsSync(indexFile)) {
    app.use(express.static(frontendDistPath));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(indexFile);
    });
  }
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
