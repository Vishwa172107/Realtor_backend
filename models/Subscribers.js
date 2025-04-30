const mongoose = require("mongoose")

Subscriber_Schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
})

const Subscribers = mongoose.model("Subscribers", Subscriber_Schema)
module.exports = Subscribers