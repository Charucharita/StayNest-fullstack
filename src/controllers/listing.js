const Listing = require('../models/listing.js')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken })

module.exports.index = async (req, res) => {
    
    const search = req.query.search?.trim()
    let filter = {};

    if (search) {
        const searchText = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

        filter = {
            $or: [
                { title: { $regex: searchText, $options: "i" } },
                { location: { $regex: searchText, $options: "i" } },
                { country: { $regex: searchText, $options: "i" } }
            ]
        }
    }
    
    const listings = await Listing.find(filter)
    
    res.render('listings/index', {
        title: 'StayNest | Listings',
        description: 'A simple place to find your perfect stay.',
        listings,
        search
    })
}     

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new')
}

module.exports.showListing = async (req, res) => {

    const { id } = req.params
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
        })
        .populate('owner')

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect('/listings')
    }

    res.render('listings/show', { listing })
}

module.exports.createListing = async (req, res) => {
    const response = await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
    })
    .send()
    req.body.image = {
        url: req.file.path || req.file.secure_url,
        filename: req.file.filename || req.file.public_id
    }

    req.body.geometry = response.body.features[0].geometry

    const newListing = await Listing.create({ ...req.body, owner: req.user._id })
    
    req.flash("success", "New Listing Created!")
    res.redirect('/listings')
}

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params
    const listing = await Listing.findById(id)

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect('/listings')
    }

    let originalImageUrl = listing.image.url
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render('listings/edit', { listing, originalImageUrl })

}

module.exports.updateListing = async (req, res) => {

    // if (!req.body) {
    //     throw new ExpressError(400, 'Send valid Data for listing')
    // }

    const { id } = req.params

    if (typeof req.file !== "undefined") {
        req.body.image = {
            url: req.file.path,
            filename: req.file.filename
        }
    }
    const listing = await Listing.findByIdAndUpdate(id, req.body, { returnDocument: "after" })

    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`)

}

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params
    await Listing.findByIdAndDelete(id)

    req.flash("success", "Listing Deleted!")
    res.redirect('/listings')
}