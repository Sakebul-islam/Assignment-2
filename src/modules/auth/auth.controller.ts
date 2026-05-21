import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import sendResponse, { handleControllerError } from "../../utility/sendResponse.js";
import { UserRoleEnum, type UserRole } from "./auth.interface.js";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!name || !email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "name, email, and password are required",
      });
    }

    if (role && !Object.values(UserRoleEnum).includes(role)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `role must be one of: ${Object.values(UserRoleEnum).join(", ")}`,
      });
    }

    const data = await authService.signup({ name, email, password, role });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "email and password are required",
      });
    }

    const data = await authService.login({ email, password });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
};

export const authController = { signup, login };
