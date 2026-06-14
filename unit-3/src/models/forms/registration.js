import { query } from "../db.js";

async function emailExists(email) {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists`,
    [email]
  );

  return result.rows[0].exists;
}

async function saveUser(name, email, password) {
  const result = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, password]
  );

  return result.rows[0];
}

async function getAllUsers() {
  const result = await query(
    `SELECT id, name, email, created_at
     FROM users
     ORDER BY id DESC`
  );

  return result.rows;
}

export { emailExists, saveUser, getAllUsers };
