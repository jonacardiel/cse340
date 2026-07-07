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
    `SELECT users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
     FROM users
     LEFT JOIN roles ON users.role_id = roles.id
     ORDER BY users.id DESC`
  );

  return result.rows;
}

async function getUserById(id) {
  const result = await query(
    `SELECT users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
     FROM users
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateUser(id, name, email) {
  const result = await query(
    `UPDATE users
     SET name = $1,
         email = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, name, email, updated_at`,
    [name, email, id]
  );

  return result.rows[0] || null;
}

async function deleteUser(id) {
  const result = await query(
    `DELETE FROM users WHERE id = $1`,
    [id]
  );

  return result.rowCount > 0;
}

export { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser };
