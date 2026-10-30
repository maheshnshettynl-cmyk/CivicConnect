const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "issues.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readIssues() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveIssues(issues) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(issues, null, 2));
}

// GET: return all complaints as JSON
app.get("/api/issues", (req, res) => {
  res.json({ success: true, issues: readIssues() });
});

// POST: validate and save a new complaint
app.post("/api/issues", (req, res) => {
  const { title, category, location, description } = req.body || {};
  if (![title, category, location, description].every(v => typeof v === "string" && v.trim())) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }
  if (title.trim().length > 80 || description.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Title or description is too long." });
  }

  const issues = readIssues();
  const issue = {
    id: Date.now().toString(),
    title: title.trim(),
    category: category.trim(),
    location: location.trim(),
    description: description.trim(),
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  issues.unshift(issue);
  saveIssues(issues);
  res.status(201).json({ success: true, issue });
});

// PATCH: update a complaint's status (demo/admin functionality)
app.patch("/api/issues/:id", (req, res) => {
  const allowed = ["Pending", "In Progress", "Resolved"];
  const { status } = req.body || {};
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status." });
  }
  const issues = readIssues();
  const issue = issues.find(item => item.id === req.params.id);
  if (!issue) return res.status(404).json({ success: false, message: "Complaint not found." });
  issue.status = status;
  saveIssues(issues);
  res.json({ success: true, issue });
});

app.get("/api/health", (req, res) => res.json({ success: true, message: "CivicConnect server is running." }));

app.listen(PORT, () => {
  console.log(`CivicConnect is running at http://localhost:${PORT}`);
});