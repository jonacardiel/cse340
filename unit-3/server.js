import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import routes from "./src/controllers/routes.js";
import { addLocalVariables } from "./src/middleware/global.js";
import flash from "./src/middleware/flash.js";
import { setupDatabase } from "./src/models/setup.js";
import { connectionConfig } from "./src/models/db.js";
import { startSessionCleanup } from "./src/utils/session-cleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const NODE_ENV = (process.env.NODE_ENV || "development").toLowerCase();

const app = express();

// Initialize PostgreSQL session store
const pgSession = connectPgSimple(session);

// Configure session middleware
app.use(session({
  store: new pgSession({
    conObject: connectionConfig,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV.includes("dev") !== true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(addLocalVariables);
app.use(flash);
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

async function startServer() {
  try {
    await setupDatabase();
  } catch (error) {
    console.warn("Database setup was skipped for now:", error.message);
  }

  // Start automatic session cleanup
  startSessionCleanup();

  app.listen(PORT, () => {
    console.log(`Unit 3 app running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start app:", error);
  process.exit(1);
});
