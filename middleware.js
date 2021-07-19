const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    // console.log('Req.user: ', req.user);
    // console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl;
    console.log('Link to go back to:', req.session.returnTo);
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do that.')
        return res.redirect('/login');
    }
    next();
}

module.exports.isLoggedInForAReview = (req, res, next) => {
    // console.log('Req.user: ', req.user);
    console.log(req.originalUrl);
    req.session.returnTo = req.originalUrl.replace('/reviews', '');
    console.log('Link to go back to:', req.session.returnTo);
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do that.')
        req.session.reviewData = req.body.review;
        req.session.reviewData.url = req.originalUrl.replace('/reviews', '');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log('ValidateReview Error');
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', `You don't have permissions to edit that.`);
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', `You don't have permissions to delete that.`);
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

