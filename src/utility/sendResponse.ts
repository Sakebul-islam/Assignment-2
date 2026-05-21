import type { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | undefined;
  data?: T;
  errors?: unknown;
};

const HTTP_REASON: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  if (payload.success) {
    const body: Record<string, unknown> = { success: true };
    if (payload.message !== undefined) body["message"] = payload.message;
    if (payload.data !== undefined) body["data"] = payload.data;
    res.status(payload.statusCode).send(body);
  } else {
    res.status(payload.statusCode).send({
      success: false,
      message: payload.message,
      errors: payload.errors ?? HTTP_REASON[payload.statusCode] ?? "Error",
    });
  }
};

export const handleControllerError = (res: Response, error: unknown): void => {
  const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
  const message = error instanceof Error ? error.message : "Internal Server Error";
  sendResponse(res, { statusCode, success: false, message });
};

export default sendResponse;
