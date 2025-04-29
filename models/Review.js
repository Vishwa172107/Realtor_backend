const mongoose = require("mongoose")

Review_Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true }
})

const Review = mongoose.model("Reviews", Review_Schema)

module.exports = Review