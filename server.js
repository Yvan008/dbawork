const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});


db.run(`
  CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    course_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
  )
`);


app.post("/students", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  db.run(
    "INSERT INTO students (name, email) VALUES (?, ?)",
    [name, email],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: "Student registered successfully",
        student_id: this.lastID
      });
    }
  );
});


app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.post("/courses", (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Course title is required" });
  }

  db.run(
    "INSERT INTO courses (title, description) VALUES (?, ?)",
    [title, description],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: "Course added successfully",
        course_id: this.lastID
      });
    }
  );
});


app.get("/courses", (req, res) => {
  db.all("SELECT * FROM courses", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.post("/enrollments", (req, res) => {
  const { student_id, course_id } = req.body;

  if (!student_id || !course_id) {
    return res
      .status(400)
      .json({ message: "Student ID and Course ID are required" });
  }

  db.run(
    "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
    [student_id, course_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: "Student enrolled successfully",
        enrollment_id: this.lastID
      });
    }
  );
});


app.get("/enrollments", (req, res) => {
  const sql = `
    SELECT students.name, courses.title
    FROM enrollments
    JOIN students ON enrollments.student_id = students.student_id
    JOIN courses ON enrollments.course_id = courses.course_id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
