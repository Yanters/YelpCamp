const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { validateReview } = require('../middleware');


//validateReview,
router.post('/', catchAsync(async (req, res) => {
    const rating = parseInt(req.body.review.rating);
    const campground = await Campground.findById(req.params.id);
    const review = new Review({ body: req.body.review.body, rating: rating });
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review.')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review.')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;