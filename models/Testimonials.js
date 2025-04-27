const mongoose = require("mongoose")

const Testimonials_Schema = new mongoose.Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    role: { type: String, requierd: true },
    rating: { type: Number, required: true },
})

module.exports = mongoose.model("Testimonials", Testimonials_Schema)