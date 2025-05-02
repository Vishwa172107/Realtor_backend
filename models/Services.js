const mongoose = require("mongoose")

const Services_Schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    propertyType: { type: String, enum: ["Commercial", "Condo", "House", "Residential", "Apartment"], required: true },
    condition: { type: String, enum: ["Excellent", "Good", "Poor", "Fair"], required: true },
    doYouWant: { type: String, enum: ["Buy a Property", "Sell a Property", "Rent a Property"], required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String }
})

const Services = mongoose.model("Services", Services_Schema)
module.exports = Services