import { query } from "../db.js";

async function createContactMessage({ userId, fullName, email, subject, message }) {
  const result = await query(`
    INSERT INTO contact_messages (user_id, full_name, email, subject, message, status)
    VALUES ($1, $2, $3, $4, $5, 'Received')
    RETURNING id
  `, [userId || null, fullName, email, subject, message]);

  return result.rows[0] || null;
}

async function getAllContactMessages() {
  const result = await query(`
    SELECT
      id,
      full_name,
      email,
      subject,
      message,
      status,
      created_at
    FROM contact_messages
    ORDER BY created_at DESC
  `);

  return result.rows;
}

async function updateContactMessageStatus({ messageId, status }) {
  const result = await query(`
    UPDATE contact_messages
    SET status = $1
    WHERE id = $2
    RETURNING id
  `, [status, messageId]);

  return result.rows[0] || null;
}

export { createContactMessage, getAllContactMessages, updateContactMessageStatus };
