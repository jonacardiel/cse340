import bcrypt from "bcryptjs";
import { query } from "../db.js";

// Find a user by email address for login verification.
const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT id, name, email, password, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
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
