import bcrypt from "bcryptjs";
import { query } from "../db.js";

// Find a user by email address for login verification.
const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT users.id,
            users.name,
            users.email,
            users.password,
            users.created_at,
            roles.role_name AS "roleName"
     FROM users
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE LOWER(users.email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
};

// Verify a plain text password against a stored bcrypt hash.
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { findUserByEmail, verifyPassword };
