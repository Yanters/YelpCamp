const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomprice = Math.floor(Math.random() * 100) + 0.99;
        const camp = new Campground({
            location: `${cities[random1000].city}-${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt aut, ducimus laboriosam architecto consequuntur soluta, laborum rerum deleniti delectus optio, distinctio ratione labore repudiandae quasi enim reprehenderit in eum! Magnam?',
            price: randomprice
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})