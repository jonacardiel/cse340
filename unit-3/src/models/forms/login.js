import { query } from "../db.js";

async function findUserForLogin(email) {
  const result = await query(
    `SELECT id, name, email, password
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  if (result.rows.length === 0) {
    return {};
  }

  return result.rows[0];
}

export { findUserForLogin };
