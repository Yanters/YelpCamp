const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor, isLoggedInForAReview } = require('../middleware');
const reviewsController = require('../controllers/reviews')


//validateReview,
router.post('/', isLoggedInForAReview, validateReview, catchAsync(reviewsController.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewsController.deleteReview))

module.exports = router;