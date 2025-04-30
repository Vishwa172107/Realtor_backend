const mongoose = require("mongoose")

const Contact_Schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number },
    message: { type: String, required: true }
}, { timestamps: true });

const Contacts = mongoose.model("Contacts", ContactSchema)
module.exports = Contacts