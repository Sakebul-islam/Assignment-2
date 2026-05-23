import { pool } from "../../db/index.js";
import type {
  ICreateIssue,
  IGetIssuesQuery,
  IUpdateIssue,
  IssueStatus,
  IssueType,
} from "./issue.interface.js";

const getAllIssues = async (query: IGetIssuesQuery) => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const values: (string | IssueType | IssueStatus)[] = [];
  let idx = 1;

  if (type) {
    conditions.push(`type = $${idx++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const { rows: issues } = await pool.query(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    values,
  );

  if (issues.length === 0) return [];

  // Fetch reporters in a single separate query — no JOINs
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id as number))];
  const placeholders = reporterIds.map((_, i) => `$${i + 1}`).join(", ");
  const { rows: reporters } = await pool.query(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    reporterIds,
  );

  const reporterMap = new Map(reporters.map((r) => [r.id as number, r]));

  return issues.map((issue) => {
    const reporterId = issue.reporter_id as number;
    const { reporter_id: _rid, ...rest } = issue as { reporter_id: number; [key: string]: unknown };
    return { ...rest, reporter: reporterMap.get(reporterId) ?? null };
  });
};

const getIssueById = async (id: string) => {
  const { rows } = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id],
  );
  const issue = rows[0];
  if (!issue) return null;

  // Fetch reporter separately — no JOINs
  const { rows: reporters } = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id],
  );

  return { ...issue, reporter: reporters[0] ?? null };
};

const createIssue = async (payload: ICreateIssue) => {
  const { title, description, type, reporter_id } = payload;

  const { rows } = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id],
  );

  return rows[0];
};

const updateIssue = async (payload: IUpdateIssue) => {
  const { id, title, description, type, status } = payload;

  const { rows } = await pool.query(
    `UPDATE issues
     SET
       title       = COALESCE($1, title),
       description = COALESCE($2, description),
       type        = COALESCE($3, type),
       status      = COALESCE($4, status),
       updated_at  = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [title ?? null, description ?? null, type ?? null, status ?? null, id],
  );

  return rows[0] ?? null;
};

const deleteIssue = async (id: string) => {
  const result = await pool.query(
    "DELETE FROM issues WHERE id = $1",
    [id],
  );
  return (result.rowCount ?? 0) > 0;
};

export const issueService = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
};
