const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// SQLite setup
const db = new sqlite3.Database("./contact_form.db", (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API endpoint
app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const stmt = db.prepare(
    "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)"
  );
  stmt.run(name, email, phone, message, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error." });
    }
    showModalToast({
      message: "تم إرسال الرسالة بنجاح!",
      type: "success",
      note: "سيتم التواصل معك قريبًا",
    });
    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/contacts", (req, res) => {
  db.all("SELECT * FROM contacts ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${3001}`);
});

function showModalToast({ message, type = "success", note = "" }) {
  const modal = document.getElementById("modal-toast");
  const icon = document.getElementById("modal-toast-icon");
  const msg = document.getElementById("modal-toast-message");
  const noteDiv = document.getElementById("modal-toast-note");

  msg.textContent = message;
  noteDiv.textContent = note;

  if (type === "success") {
    icon.innerHTML =
      '<span style="color:#4BB543;font-size:48px;">&#10004;</span>';
  } else {
    icon.innerHTML =
      '<span style="color:#e74c3c;font-size:48px;">&#10006;</span>';
  }

  modal.classList.add("show");
  setTimeout(() => {
    modal.classList.remove("show");
  }, 2000);
}
