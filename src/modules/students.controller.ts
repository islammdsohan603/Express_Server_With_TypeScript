import type { Request, Response } from "express";

import AppError from "../errors/app-error.js";
import { studentsService } from "./students.service.js";
// Handle Errors
const handleError = (res: Response, error: unknown, message: string) => {
  console.error("STUDENT CONTROLLER ERROR:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

// Reusable Student ID Handler
const getStudentId = (req: Request): string => {
  const id = req.params.id;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError(400, "Invalid Student ID");
  }

  return id;
};

// 1. Create Student
const createStudents = async (req: Request, res: Response) => {
  try {
    const studentsData = await studentsService.createStudentsDB(req.body);

    return res.status(201).json({
      success: true,
      message: "Student Created Successfully",
      data: studentsData,
    });
  } catch (error) {
    return handleError(res, error, "Internal Server Error");
  }
};

// 2. Get All Students
const getAllStudents = async (req: Request, res: Response) => {
  try {
    const studentsData = await studentsService.getAllStudentsDB();

    return res.status(200).json({
      success: true,
      message: "Students Data Retrieved Successfully",
      data: studentsData,
    });
  } catch (error) {
    return handleError(res, error, "Failed to Retrieve Students");
  }
};

// 3. Get Single Student
const getSingleStudent = async (req: Request, res: Response) => {
  try {
    const id = getStudentId(req);

    const studentsData = await studentsService.getSingleStudentDB(id);

    return res.status(200).json({
      success: true,
      message: "Student Data Retrieved Successfully",
      data: studentsData,
    });
  } catch (error) {
    return handleError(res, error, "Failed to Retrieve Student");
  }
};

// 4. Update Student
const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = getStudentId(req);

    const studentsData = await studentsService.updateStudentDB(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Student Data Updated Successfully",
      data: studentsData,
    });
  } catch (error) {
    return handleError(res, error, "Failed to Update Student");
  }
};

// 5. Delete Student
const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = getStudentId(req);

    const studentsData = await studentsService.deleteStudentDB(id);

    return res.status(200).json({
      success: true,
      message: "Student Deleted Successfully",
      data: studentsData,
    });
  } catch (error) {
    return handleError(res, error, "Failed to Delete Student");
  }
};

// Export All Controllers
export const studentsController = {
  createStudents,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
