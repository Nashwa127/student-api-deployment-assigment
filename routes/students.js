const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "student.json");


async function readStudents() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
    return [];
  }
}

router.get("/", async (req, res) => {
  try {
    const students = await readStudents();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read students" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { name, age, course, year, status } = req.body;

    
    if (!name || !course || !year) {
      return res.status(400).json({ error: "name, course, and year are required" });
    }

    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum <= 0) {
      return res.status(400).json({ error: "age must be a number greater than 0" });
    }

    const students = await readStudents();

    const newStudent = {
      id: uuidv4(),
      name: String(name).trim(),
      age: ageNum,
      course: String(course).trim(),
      year: String(year).trim(),
      status: status ? String(status).trim() : "active",
      createdAt: new Date().toISOString(),
    };

    students.push(newStudent);
    await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));

    res.status(201).json(newStudent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add student" });
  }
});

module.exports = router;