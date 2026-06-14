import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import routes from "./src/controllers/routes.js";
import { addLocalVariables } from "./src/middleware/global.js";
import { setupDatabase } from "./src/models/setup.js";
import { pool } from "./src/models/db.js";
import { startSessionCleanup } from "./src/utils/session-cleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || "development").toLowerCase();
const PgSession = connectPgSimple(session);

async function startServer() {
  await setupDatabase();

  const sessionStore = new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false
  });

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "src/views"));

  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "unit-3-secret",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
      }
    })
  );

  app.use(addLocalVariables);
  app.use("/", routes);

  app.use((req, res, next) => {
    const err = new Error("Page Not Found");
    err.status = 404;
    next(err);
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const status = err.status || 500;
    res.status(status).render(status === 404 ? "errors/404" : "errors/500", {
      title: status === 404 ? "Page Not Found" : "Server Error",
      error: NODE_ENV === "production" ? "Something went wrong" : err.message,
      stack: NODE_ENV === "production" ? null : err.stack
    });
  });

  startSessionCleanup();

  app.listen(PORT, () => {
    console.log(`Unit 3 app running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Unit 3 app:", error);
  process.exit(1);
});
