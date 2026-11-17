import { Router } from "express";
import { studentsController } from "../students.controller.js";

const router = Router();

// POST - Create Student
router.post("/", studentsController.createStudents);

// GET - All Students
router.get("/", studentsController.getAllStudents);

// GET - Single Student
router.get("/:id", studentsController.getSingleStudent);

// PUT - Update Student
router.put("/:id", studentsController.updateStudent);

// DELETE - Delete Student
router.delete("/:id", studentsController.deleteStudent);

export const studentsRouter = router;
