if(process.env.NODE_ENV != 'production'){
    require("dotenv").config()
}
const express = require('express')
const connectDB = require('./src/config/db.js')

const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError.js')
const session = require('express-session')
const {MongoStore} = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./src/models/user.js')
const {setSearch} = require('./middleware.js')


const listingRouter = require('./src/routes/listing.js')
const reviewRouter = require('./src/routes/review.js')
const userRouter = require('./src/routes/user.js')

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
})

store.on("error",(error)=>{
    console.log("ERROR IN THE MONGO SESSION STORE",error)
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true 
    }
}

// app.get('/', (req, res) => {
//     res.send('Home')
// })


 
app.use(session(sessionOptions))
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(passport.initialize())
app.use(passport.session())


app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user 
    next()
})

app.use(setSearch)

app.use('/listings', listingRouter)
app.use('/listings/:id/reviews', reviewRouter)
app.use('/', userRouter)

//Handling Invalid Routes
app.all('/{*splat}', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

//Error-handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;

    res.status(statusCode).render('error', { message })
    //res.status(statusCode).send(message);
})

const startServer = async () => {
    await connectDB()
    app.listen(PORT, () => {
        console.log(`App listening on port http://localhost:${PORT}`)
    })
}
startServer()
