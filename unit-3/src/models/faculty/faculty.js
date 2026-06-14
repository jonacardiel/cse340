import { query } from "../db.js";

async function getAllFaculty(sortBy = "name") {
  let orderBy = "name";

  if (sortBy === "department") {
    orderBy = "department";
  } else if (sortBy === "title") {
    orderBy = "title";
  }

  const result = await query(
    `SELECT id, first_name, last_name, name, slug, department, title, office, phone, email
     FROM faculty
     ORDER BY ${orderBy}, name`
  );

  return result.rows;
}

async function getFacultyBySlug(slugId) {
  const result = await query(
    `SELECT id, first_name, last_name, name, slug, department, title, office, phone, email
     FROM faculty
     WHERE slug = $1
     LIMIT 1`,
    [slugId]
  );

  if (result.rows.length === 0) {
    return {};
  }

  return result.rows[0];
}

export { getAllFaculty, getFacultyBySlug };
