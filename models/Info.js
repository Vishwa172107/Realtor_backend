const mongoose = require("mongoose");

const InfoSchema = new mongoose.Schema({
    stats: [{
        value: { type: Number, required: true },
        prefix: { type: String, required: false },
        suffix: { type: String, required: true },
        label: { type: String, required: true },
        icon: { type: String, required: false }
    }]
});

const Info = mongoose.model("Info", InfoSchema);
module.exports = Info;