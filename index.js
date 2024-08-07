const express = require('express');
const dotenv = require('dotenv').config();
const session = require('express-session');
const ejsmate = require('ejs-mate');
const path = require('path');
const flash = require('connect-flash');
const connectDb = require('./config/db.js');
const ExpressError = require('./util/ExpressError.js');
const methodOverride = require('method-override');
const campgroundsRoute = require('./routes/campgrounds.js');
const reviewsRoute = require('./routes/reviews.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoute = require('./routes/users.js');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

connectDb();

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

const sessionConfig = {
    store,
    secret: 'thisisaseret',
    resave:true,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 27 * 7,
        maxAge: 1000 * 60 * 60 * 27 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
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
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs',ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));



app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home'); 
});

app.use('/campgrounds',campgroundsRoute);
app.use('/campgrounds/:id/reviews',reviewsRoute);
app.use('/auth',userRoute);





app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found',404))
})

app.use((err,req,res,next)=>{
    const{statusCode=400}=err;
    if(!err.message) err.message='Something went wrong'
    res.status(statusCode).render('error',{err});
})

app.listen(3000, () => {
    console.log('Server running...');
});
