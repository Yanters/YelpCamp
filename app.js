const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const exp = require('constants');
const Review = require('./models/review');
// const { urlencoded } = require('express');
// const exp = require('constants');

const campgroundsRoute = require('./routes/campgrounds')
const reviewRoute = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log('Database connected')
});

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);

app.get('/', (req, res) => {
    res.render('home');
})



// app.get('*', (req, res) => {
//     res.send('Wrong URL!');
// })

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    res.status(status).render('error', { err });
    // res.send('Something went wrong!');
})

app.listen(3000, () => {
    console.log('Working on port: 3000');
})
