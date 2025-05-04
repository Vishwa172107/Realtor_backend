const mongoose = require("mongoose");

const InfoSchema = new mongoose.Schema({
    stats: [{
        title: { type: String, required: true },
        value: { type: Number, required: true },
        icon: { type: String, required: false },
        color: { type: String, required: true }
    }]
});

const Info = mongoose.model("Info", InfoSchema);
module.exports = Info;