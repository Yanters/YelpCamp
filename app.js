if ( process.env.NODE_ENV !== 'production' )
{
    require( 'dotenv' ).config();
}


const express = require( 'express' );
const path = require( 'path' );
const mongoose = require( 'mongoose' );
const ExpressError = require( './utils/ExpressError' );
const methodOverride = require( 'method-override' );
const ejsMate = require( 'ejs-mate' );
const session = require( 'express-session' );
const flash = require( 'connect-flash' );
const passport = require( 'passport' );
const LocalStrategy = require( 'passport-local' );
const User = require( './models/user' );
const mongoSanitize = require( 'express-mongo-sanitize' )
const helmet = require( 'helmet' );
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const MongoStore = require('connect-mongo');

const campgroundsRoute = require( './routes/campgrounds' )
const reviewRoute = require( './routes/reviews' )
const userRoute = require( './routes/users' )

mongoose.connect(dbUrl , {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
} );

const db = mongoose.connection;
db.on( 'error', console.error.bind( console, "connection error" ) );
db.once( 'open', () =>
{
    console.log( 'Database connected' )
} );

const app = express();

app.engine( 'ejs', ejsMate );

app.set( 'view engine', 'ejs' );
app.set( 'views', path.join( __dirname, 'views' ) );

app.use( express.urlencoded( { extended: true } ) );
app.use( methodOverride( '_method' ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( mongoSanitize( {
    replaceWith: '#'
}));

const secret = process.env.SECRET || 'somesecretiwonttellyou';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error', function (e){
    console.log('Session store error',e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use( session( sessionConfig ) );
app.use( flash() );
app.use( helmet() );

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://ajax.googleapis.com/",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/wsedfigb/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use( passport.initialize() );
app.use( passport.session() );

passport.use( new LocalStrategy( User.authenticate() ) );

passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );

app.use( ( req, res, next ) =>
{
    // console.log( req.query );
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash( 'success' );
    res.locals.error = req.flash( 'error' );
    next();
} )

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'test@wp.pl', username: 'test' });
//     const newUser = await User.register(user, 'monkey');
//     res.send(newUser);
// })

app.use( '/campgrounds', campgroundsRoute );
app.use( '/campgrounds/:id/reviews', reviewRoute );
app.use( '/', userRoute );

app.get( '/', ( req, res ) =>
{
    res.render( 'home' );
} )



// app.get('*', (req, res) => {
//     res.send('Wrong URL!');
// })

app.all( '*', ( req, res, next ) =>
{
    next( new ExpressError( 'Page Not Found', 404 ) )
} )

app.use( ( err, req, res, next ) =>
{
    console.log('app.js err');
    const { status = 500 } = err;
    if ( !err.message ) err.message = 'Something Went Wrong';
    res.status( status ).render( 'error', { err } );
    // res.send('Something went wrong!');
} )

const port = process.env.PORT || 3000;

app.listen( port, () =>
{
    console.log( `Working on port: ${port}` );
} )
