import { query } from "../db.js";

async function createContactForm(subject, message) {
  const result = await query(
    `INSERT INTO contact_form (subject, message)
     VALUES ($1, $2)
     RETURNING id, subject, message, submitted`,
    [subject, message]
  );

  return result.rows[0];
}

async function getAllContactForms() {
  const result = await query(
    `SELECT id, subject, message, submitted
     FROM contact_form
     ORDER BY submitted DESC, id DESC`
  );

  return result.rows;
}

export { createContactForm, getAllContactForms };
