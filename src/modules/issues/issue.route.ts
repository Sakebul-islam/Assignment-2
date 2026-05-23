import { Router } from "express";
import { issueController } from "./issue.controller.js";
import authMiddleware from "../../middlewares/auth.js";
import { UserRoleEnum } from "../auth/auth.interface.js";

const router = Router();

router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.post("/", authMiddleware(), issueController.createIssue);
router.patch("/:id", authMiddleware(), issueController.updateIssue);
router.delete(
  "/:id",
  authMiddleware(UserRoleEnum.maintainer),
  issueController.deleteIssue,
);

export const issueRouter = router;
