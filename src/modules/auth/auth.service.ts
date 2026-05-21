import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../db/index.js";
import config from "../../config/index.js";
import type { ISignup, ILogin } from "./auth.interface.js";

const signup = async (payload: ISignup) => {
  const { name, email, password, role } = payload;

  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );
  if ((existing.rowCount ?? 0) > 0) {
    const err = Object.assign(new Error("Email already in use"), {
      statusCode: 409,
    });
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role ?? null],
  );

  return rows[0];
};

const login = async (payload: ILogin) => {
  const { email, password } = payload;

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );

  if (rows.length === 0) {
    const err = Object.assign(new Error("Invalid credentials"), {
      statusCode: 401,
    });
    throw err;
  }

  const user = rows[0]!;
  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    const err = Object.assign(new Error("Invalid credentials"), {
      statusCode: 401,
    });
    throw err;
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.JWT_SECRET, { expiresIn: "1d" });

  const { password: _pw, ...userWithoutPassword } = user as {
    password: string;
    [key: string]: unknown;
  };

  return { token, user: userWithoutPassword };
};

export const authService = { signup, login };
