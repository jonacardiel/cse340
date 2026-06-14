import { query } from "../db.js";

async function getAllCourses() {
  const result = await query(
    `SELECT course_code, name, credit_hours, department, slug
     FROM courses
     ORDER BY course_code`
  );

  return result.rows;
}

async function getCourseBySlug(slugId) {
  const courseResult = await query(
    `SELECT course_code, name, credit_hours, department, slug
     FROM courses
     WHERE slug = $1
     LIMIT 1`,
    [slugId]
  );

  if (courseResult.rows.length === 0) {
    return {};
  }

  const course = courseResult.rows[0];
  const sectionsResult = await query(
    `SELECT id, course_code, course_name, professor, professor_slug, time, room
     FROM sections
     WHERE course_code = $1
     ORDER BY id`,
    [course.course_code]
  );

  course.sections = sectionsResult.rows;
  return course;
}

export { getAllCourses, getCourseBySlug };
