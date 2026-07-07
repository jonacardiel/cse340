import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enableSqlLogging = String(process.env.ENABLE_SQL_LOGGING).toLowerCase() === "true";
const certificatePath = process.env.BYUI_CA_PATH || path.join(__dirname, "byui-ca.pem");
const disableDbSsl = String(process.env.DB_SSL).toLowerCase() === "false";

let caCert = "";
if (fs.existsSync(certificatePath)) {
  caCert = fs.readFileSync(certificatePath, "utf8");
  if (enableSqlLogging) {
    console.log("Found BYUI CA certificate:", certificatePath);
  }
} else if (enableSqlLogging) {
  console.log("BYUI CA certificate was not found at", certificatePath);
}

function buildSslConfig() {
  if (disableDbSsl || !process.env.DB_URL) {
    return false;
  }

  if (caCert) {
    return {
      ca: caCert,
      rejectUnauthorized: true,
      checkServerIdentity: () => {
        return undefined;
      }
    };
  }

  return {
    rejectUnauthorized: false
  };
}

const connectionConfig = {
  connectionString: process.env.DB_URL
};

if (!process.env.DB_URL && process.env.DB_PORT) {
  connectionConfig.port = Number(process.env.DB_PORT);
}

const sslConfig = buildSslConfig();
if (sslConfig) {
  connectionConfig.ssl = sslConfig;
}

const pool = new Pool(connectionConfig);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

async function query(sql, params = []) {
  if (enableSqlLogging) {
    console.log("SQL:", sql, params);
  }

  return pool.query(sql, params);
}

export { pool, query, connectionConfig };
