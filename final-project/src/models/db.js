import fs from "fs";
import pg from "pg";

const { Pool } = pg;

const hasDatabaseConfig = () => Boolean(process.env.DB_URL);

const readCaCertificate = () => {
  const certPath = process.env.BYUI_CA_CERT_PATH;

  if (!certPath || !fs.existsSync(certPath)) {
    return undefined;
  }

  return fs.readFileSync(certPath, "utf8");
};

const buildSslConfig = () => {
  const ca = readCaCertificate();

  if (!ca) {
    return { rejectUnauthorized: false };
  }

  return {
    ca,
    rejectUnauthorized: true,
    checkServerIdentity: () => {
      return undefined;
    }
  };
};

const createSessionStoreConfig = () => {
  return {
    conObject: {
      connectionString: process.env.DB_URL,
      ssl: buildSslConfig()
    },
    tableName: "session",
    createTableIfMissing: true
  };
};

const getSessionCookieConfig = (nodeEnv) => {
  return {
    secure: !nodeEnv.includes("dev"),
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  };
};

let pool;

const getPool = () => {
  if (!hasDatabaseConfig()) {
    throw new Error("DB_URL is not configured.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DB_URL,
      ssl: buildSslConfig()
    });

    pool.on("error", (error) => {
      console.error("Unexpected PostgreSQL pool error:", error);
    });
  }

  return pool;
};

async function query(sql, params = []) {
  return getPool().query(sql, params);
}

export { createSessionStoreConfig, getSessionCookieConfig, hasDatabaseConfig, query };
