import app from "./app.js";
import config from "./config/index.js";
import { initDB } from "./db/index.js";

const main = async () => {
  if (process.env.NODE_ENV !== "production") {
    await initDB();
  }
  const port = config.port;
  app.listen(port, () => {
    console.log(`DevPulse server listening on port ${port}`);
  });
};

main();

// Required for Vercel serverless — @vercel/node needs a default export
export default app;
