import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const globalErrorHandlers = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized!!",
      errors: err.message,
    });
  }

  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err instanceof Error ? err.message : err,
  });
};

export default globalErrorHandlers;