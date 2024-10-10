const express = require("express");
const multer = require("multer");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const app = express();
const PORT = 3000;


app.set("view engine", "ejs");


app.use(express.static("public"));


const db = new sqlite3.Database("./music.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`
      CREATE TABLE IF NOT EXISTS music (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        filePath TEXT NOT NULL
      )
    `);
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/music"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });


app.get("/", (req, res) => {
  db.all("SELECT * FROM music", (err, rows) => {
    if (err) {
      console.error("Error retrieving music from database", err);
    } else {
      res.render("index", { musicList: rows });
    }
  });
});


app.post("/upload", upload.single("musicFile"), (req, res) => {
  const musicData = {
    title: req.body.title || "Untitled",
    filePath: `/music/${req.file.filename}`,
  };

  
  db.run(
    "INSERT INTO music (title, filePath) VALUES (?, ?)",
    [musicData.title, musicData.filePath],
    (err) => {
      if (err) {
        console.error("Error inserting music into database", err);
      } else {
        res.redirect("/");
      }
    }
  );
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});