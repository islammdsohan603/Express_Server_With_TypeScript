import type { Request, Response } from "express";
import { studentsService } from "./students.service.js";

const createStudents = async (req: Request, res: Response) => {
  try {
    const studentsData = await studentsService.createStudentsDB(req.body);

    return res.status(201).json({
      success: true,
      message: "Student Created Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    console.log("POST STUDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const studentsController = {
  createStudents,
};
