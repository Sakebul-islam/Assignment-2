import type { Request, Response } from "express";
import { issueService } from "./issue.service.js";
import sendResponse from "../../utility/sendResponse.js";
import {
  IssueStatusEnum,
  IssueTypeEnum,
  type IssueStatus,
  type IssueType,
} from "./issue.interface.js";
import { UserRoleEnum } from "../auth/auth.interface.js";

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query as {
      sort?: "newest" | "oldest";
      type?: IssueType;
      status?: IssueStatus;
    };

    if (type && !Object.values(IssueTypeEnum).includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `type must be one of: ${Object.values(IssueTypeEnum).join(", ")}`,
      });
    }
    if (status && !Object.values(IssueStatusEnum).includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `status must be one of: ${Object.values(IssueStatusEnum).join(", ")}`,
      });
    }

    const data = await issueService.getAllIssues({
      ...(sort && { sort }),
      ...(type && { type }),
      ...(status && { status }),
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { statusCode: 500, success: false, message });
  }
};

const getIssueById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    const { reporter_id: _rid, ...data } = issue as { reporter_id: unknown; [key: string]: unknown };
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { statusCode: 500, success: false, message });
  }
};

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body as {
      title?: string;
      description?: string;
      type?: IssueType;
    };

    if (!title || !description || !type) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "title, description, and type are required",
      });
    }
    if (title.length > 150) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "title must not exceed 150 characters",
      });
    }
    if (description.length < 20) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "description must be at least 20 characters",
      });
    }
    if (!Object.values(IssueTypeEnum).includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `type must be one of: ${Object.values(IssueTypeEnum).join(", ")}`,
      });
    }

    const reporter_id = req.user!["id"] as number;
    const data = await issueService.createIssue({
      title,
      description,
      type,
      reporter_id,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { statusCode: 500, success: false, message });
  }
};

const updateIssue = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const role = currentUser["role"] as string;
    const userId = currentUser["id"] as number;

    const { title, description, type, status } = req.body as {
      title?: string;
      description?: string;
      type?: IssueType;
      status?: IssueStatus;
    };

    if (type && !Object.values(IssueTypeEnum).includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `type must be one of: ${Object.values(IssueTypeEnum).join(", ")}`,
      });
    }
    if (status && !Object.values(IssueStatusEnum).includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: `status must be one of: ${Object.values(IssueStatusEnum).join(", ")}`,
      });
    }
    if (title !== undefined && title.length > 150) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "title must not exceed 150 characters",
      });
    }
    if (description !== undefined && description.length < 20) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "description must be at least 20 characters",
      });
    }

    const existing = await issueService.getIssueById(id);
    if (!existing) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    if (role === UserRoleEnum.contributor) {
      const existingAny = existing as Record<string, unknown>;
      if ((existingAny["reporter_id"] as number) !== userId) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!! You can only update your own issues",
        });
      }
      if ((existingAny["status"] as string) !== IssueStatusEnum.open) {
        return sendResponse(res, {
          statusCode: 409,
          success: false,
          message: "Conflict!! You can only update open issues",
        });
      }
      if (status) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!! Contributors cannot change issue status",
        });
      }
    }

    const data = await issueService.updateIssue({
      id,
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { statusCode: 500, success: false, message });
  }
};

const deleteIssue = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const deleted = await issueService.deleteIssue(req.params.id);
    if (!deleted) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { statusCode: 500, success: false, message });
  }
};

export const issueController = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};
