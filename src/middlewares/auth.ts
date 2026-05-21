import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import config from "../config/index.js";
import { pool } from "../db/index.js";
import type { UserRole } from "../modules/auth/auth.interface.js";

const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized!!",
          errors: "Authorization token is required",
        });
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

      const { rows } = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [decoded["id"]],
      );
      const user = rows[0];

      if (!user) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized!!",
          errors: "User not found",
        });
      }

      if (roles.length > 0 && !roles.includes(user.role as UserRole)) {
        return res.status(403).send({
          success: false,
          message: "Forbidden!! You don't have permission to access this resource",
          errors: "Insufficient role permissions",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
