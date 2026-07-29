import { Router, type Response } from "express";
import { zEnrollmentBody } from "../libs/zodValidators.ts";
import { authenticateToken } from "../middlewares/authMiddleware.ts";
import type { CustomRequest, Enrollment } from "../libs/types.ts";
import { enrollments } from "../db/db.ts";

const router = Router();

router.get("/", authenticateToken, (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role === "ADMIN") {
      return res.status(200).json({
        ok: true,
        enrollments: enrollments,
      });
    }

    const studentEnrollments = enrollments.filter(
      (e: Enrollment) => e.studentId === req.user?.studentId,
    );
    return res.status(200).json({
      ok: true,
      enrollments: studentEnrollments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.post("/", authenticateToken, (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role === "ADMIN") {
      return res.status(403).json({
        ok: true,
        message: "Only Student can access this API route",
      });
    }

    const body = req.body;
    const result = zEnrollmentBody.safeParse(body);
    if (!result.success) {
      return res.status(200).json({
        message: "You are student",
      });
    }

    const new_enrollment: Enrollment = {
      studentId: body.studentId,
      courseId: body.courseId,
    };
    enrollments.push(new_enrollment);

    return res.status(201).json({
      success: true,
      data: new_enrollment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/", authenticateToken, (req: CustomRequest, res: Response) => {
  try {
    if (req.user?.role === "ADMIN") {
      return res.status(403).json({
        ok: true,
        message: "Only Student can access this API route",
      });
    }

    const { courseId } = req.body;
    const studentId = req.user?.studentId;

    const foundIndex = enrollments.findIndex(
      (e: Enrollment) => e.studentId === studentId && e.courseId === courseId,
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Enrollment not found",
      });
    }

    enrollments.splice(foundIndex, 1);

    return res.status(200).json({
      ok: true,
      message: "You has dropped from this course. See you next semester.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
