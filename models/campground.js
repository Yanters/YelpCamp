const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const cloudinary = require('cloudinary').v2;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_400');
})

ImageSchema.virtual('cardImage').get(function () {
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
})

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground.reviews) {
        await Review.deleteMany({ _id: { $in: campground.reviews } })
    }
    if (campground.images) {
        const seeds = [
            'Yelp-Camp/e7aeks9gr7iqnze26bs6',
            'Yelp-Camp/zzpftiece12vlgjn6bod',
        ]

        for (const img of campground.images) {
            if (!(img.filename in seeds)) {
                await cloudinary.uploader.destroy(img.filename);
            }
        }
    }
})
module.exports = mongoose.model('Campground', campgroundSchema);