import { Router } from "express";
import { studentsController } from "../students.controller.js";

const router = Router();

// POST Method - Create Student

router.post("", studentsController.createStudents);

export const studentsRouter = router;
