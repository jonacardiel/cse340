import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import routes from "./src/controllers/routes.js";
import { addLocalVariables } from "./src/middleware/global.js";
import { setupDatabase } from "./src/models/setup.js";
import { createSessionStoreConfig, getSessionCookieConfig, hasDatabaseConfig } from "./src/models/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = (process.env.NODE_ENV || "development").toLowerCase();
const app = express();
const pgSession = connectPgSimple(session);

if (hasDatabaseConfig()) {
  app.use(session({
    store: new pgSession(createSessionStoreConfig()),
    secret: process.env.SESSION_SECRET || "development-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: getSessionCookieConfig(NODE_ENV)
  }));
} else {
  app.use(session({
    secret: process.env.SESSION_SECRET || "development-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: getSessionCookieConfig(NODE_ENV)
  }));
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
    error: NODE_ENV === "production" ? "Something went wrong" : err.message
  });
});

async function startServer() {
  if (hasDatabaseConfig()) {
    await setupDatabase();
  } else {
    console.warn("DB_URL not set. Database setup skipped until environment variables are configured.");
  }

  return app.listen(PORT, () => {
    console.log(`Final project app running on http://localhost:${PORT}`);
  });
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  startServer().catch((error) => {
    console.error("Failed to start app:", error);
    process.exit(1);
  });
}

export { app, startServer };
