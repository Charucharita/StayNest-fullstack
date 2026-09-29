
const mongoose = require('mongoose')
const Listing = require('../models/listing.js')
const initData = require('./data.js')

const connectDB = async()=> {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")

        await Listing.deleteMany({})
        initData.data = initData.data.map((obj) => ({
            ...obj, owner: '6aa6cd2d8417d1d15abd0b50'
        }))
        await Listing.insertMany(initData.data)

    } catch (error) {
        console.log("Error connecting to MongoDB",error)
    }
}

module.exports = connectDB


