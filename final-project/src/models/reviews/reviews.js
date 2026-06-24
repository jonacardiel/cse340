import { query } from "../db.js";

async function createVehicleReview({ vehicleSlug, userId, rating, reviewText }) {
  const result = await query(`
    INSERT INTO reviews (vehicle_id, user_id, rating, review_text)
    VALUES (
      (SELECT id FROM vehicles WHERE slug = $1),
      $2,
      $3,
      $4
    )
    ON CONFLICT (vehicle_id, user_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      review_text = EXCLUDED.review_text,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `, [vehicleSlug, userId, rating, reviewText]);

  return result.rows[0] || null;
}

async function getReviewById(reviewId) {
  const result = await query(`
    SELECT
      reviews.id,
      reviews.user_id,
      reviews.vehicle_id,
      reviews.rating,
      reviews.review_text,
      vehicles.slug AS vehicle_slug,
      vehicles.name AS vehicle_name
    FROM reviews
    INNER JOIN vehicles ON vehicles.id = reviews.vehicle_id
    WHERE reviews.id = $1
    LIMIT 1
  `, [reviewId]);

  return result.rows[0] || null;
}

async function updateReviewById({ reviewId, userId, rating, reviewText }) {
  const result = await query(`
    UPDATE reviews
    SET rating = $1,
        review_text = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND user_id = $4
    RETURNING id, vehicle_id
  `, [rating, reviewText, reviewId, userId]);

  return result.rows[0] || null;
}

async function deleteReviewById({ reviewId, userId }) {
  const result = await query(`
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [reviewId, userId]);

  return result.rows[0] || null;
}

export {
  createVehicleReview,
  getReviewById,
  updateReviewById,
  deleteReviewById
};
