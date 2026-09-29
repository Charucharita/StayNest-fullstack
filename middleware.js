const Listing = require("./src/models/listing.js")
const Review = require('./src/models/review.js')
const ExpressError = require('./utils/ExpressError.js') 
const { listingSchema, reviewSchema } = require('./schema.js')

const setSearch = (req, res, next) => {
    res.locals.search = req.query.search || ""
    next()
}

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "You must be logged in!")
        return res.redirect('/login')
    }
    next()
}

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

const isOwner = async (req, res, next) => {
    const { id } = req.params
    const listing = await Listing.findById(id)
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

//Listing Validation middleware
const validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(req.body)
    
    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ") 
        throw new ExpressError(400, errMsg)
    }
    next()
}

//Review Validation middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)

    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ")
        throw new ExpressError(400, errMsg)
    }
    next()
}

const isReviewAuthor = async (req, res, next) => {
    const { id,reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review")
        return res.redirect(`/listings/${id}`)
    }
    next()
}


module.exports = {
    isLoggedIn,
    saveRedirectUrl,
    isOwner,
    validateListing,
    validateReview,
    isReviewAuthor,
    setSearch
}