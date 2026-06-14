import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enableSqlLogging = String(process.env.ENABLE_SQL_LOGGING).toLowerCase() === "true";
const certificatePath = process.env.BYUI_CA_PATH || path.join(__dirname, "byui-ca.pem");

let sslOptions = false;

if (String(process.env.DB_SSL || "true").toLowerCase() !== "false") {
  if (fs.existsSync(certificatePath)) {
    if (enableSqlLogging) {
      console.log("Found BYUI CA certificate:", certificatePath);
    }

    sslOptions = {
      ca: fs.readFileSync(certificatePath, "utf8")
    };
  } else {
    if (enableSqlLogging) {
      console.log("No BYUI CA certificate was found, so SSL is using the loose setting.");
    }

    sslOptions = {
      rejectUnauthorized: false
    };
  }
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: sslOptions
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

async function query(sql, params = []) {
  if (enableSqlLogging) {
    console.log("SQL:", sql, params);
  }

  return pool.query(sql, params);
}

export { pool, query };
