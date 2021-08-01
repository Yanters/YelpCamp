const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const Reviews = require('../models/review');

if ( process.env.NODE_ENV !== 'production' )
{
    require( 'dotenv' ).config();
}


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

console.log(dbUrl); 

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log('Database connected')
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Reviews.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomprice = Math.floor(Math.random() * 100) + 0.99;
        const camp = new Campground({
            author: '610715df2387c65300dc3051',
            location: `${cities[random1000].city}-${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt aut, ducimus laboriosam architecto consequuntur soluta, laborum rerum deleniti delectus optio, distinctio ratione labore repudiandae quasi enim reprehenderit in eum! Magnam?',
            price: randomprice,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/wsedfigb/image/upload/v1626730952/Yelp-Camp/e7aeks9gr7iqnze26bs6.jpg',
                    filename: 'Yelp-Camp/e7aeks9gr7iqnze26bs6',
                },
                {
                    url: 'https://res.cloudinary.com/wsedfigb/image/upload/v1626735415/Yelp-Camp/zzpftiece12vlgjn6bod.jpg',
                    filename: 'Yelp-Camp/zzpftiece12vlgjn6bod'
                }
            ]

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})