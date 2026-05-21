import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

interface Config {
  port: number;
  dbUrl: string;
  JWT_SECRET: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  dbUrl: process.env.DB_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
};

export default config;
