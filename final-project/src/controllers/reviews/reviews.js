import { body, validationResult } from "express-validator";
import {
  createVehicleReview,
  getReviewById,
  updateReviewById,
  deleteReviewById
} from "../../models/reviews/reviews.js";

const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5."),
  body("reviewText")
    .trim()
    .isLength({ min: 5, max: 1500 })
    .withMessage("Review text must be between 5 and 1500 characters.")
];

const createReview = [reviewValidation, async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error(errors.array().map((entry) => entry.msg).join(" "));
    err.status = 400;
    return next(err);
  }

  try {
    await createVehicleReview({
      vehicleSlug: req.params.vehicleSlug,
      userId: req.session.user.id,
      rating: Number(req.body.rating),
      reviewText: req.body.reviewText
    });

    return res.redirect(`/inventory/${req.params.vehicleSlug}`);
  } catch (error) {
    return next(error);
  }
}];

const showEditReviewPage = async (req, res, next) => {
  try {
    const review = await getReviewById(Number(req.params.reviewId));

    if (!review || Number(review.user_id) !== Number(req.session.user.id)) {
      const err = new Error("Review not found.");
      err.status = 404;
      return next(err);
    }

    return res.render("reviews/edit", {
      title: "Edit Review",
      review,
      errors: []
    });
  } catch (error) {
    return next(error);
  }
};

const updateReview = [reviewValidation, async (req, res, next) => {
  const errors = validationResult(req);

  try {
    const review = await getReviewById(Number(req.params.reviewId));

    if (!review || Number(review.user_id) !== Number(req.session.user.id)) {
      const err = new Error("Review not found.");
      err.status = 404;
      return next(err);
    }

    if (!errors.isEmpty()) {
      return res.status(400).render("reviews/edit", {
        title: "Edit Review",
        review: {
          ...review,
          rating: Number(req.body.rating),
          review_text: req.body.reviewText
        },
        errors: errors.array()
      });
    }

    await updateReviewById({
      reviewId: Number(req.params.reviewId),
      userId: req.session.user.id,
      rating: Number(req.body.rating),
      reviewText: req.body.reviewText
    });

    return res.redirect(`/inventory/${review.vehicle_slug}`);
  } catch (error) {
    return next(error);
  }
}];

const deleteReview = async (req, res, next) => {
  try {
    const review = await getReviewById(Number(req.params.reviewId));

    if (!review || Number(review.user_id) !== Number(req.session.user.id)) {
      const err = new Error("Review not found.");
      err.status = 404;
      return next(err);
    }

    await deleteReviewById({
      reviewId: Number(req.params.reviewId),
      userId: req.session.user.id
    });

    return res.redirect(`/inventory/${review.vehicle_slug}`);
  } catch (error) {
    return next(error);
  }
};

export {
  createReview,
  showEditReviewPage,
  updateReview,
  deleteReview
};
