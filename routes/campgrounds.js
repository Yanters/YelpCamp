const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground, isCampground } = require('../middleware');
const campgroundController = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(catchAsync(campgroundController.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgroundController.createCampground))


router.get('/new', isLoggedIn, campgroundController.renderNewForm)

router.route('/:id')
    .get(isCampground, catchAsync(campgroundController.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundController.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))

router.get('/:id/edit',isCampground, isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm))


module.exports = router;