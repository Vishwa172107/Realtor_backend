const mongoose = require("mongoose");
const shortid = require("shortid");

const HouseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, default: "USD" },
    priceFrequency: { type: String, enum: ["Monthly", "Yearly", "One-Time"], required: true },
    status: { type: String, enum: ["Rent", "Sale", "Pending", "Sold/Rented"], required: true },
    propertyType: { type: String, enum: ["Townhouse", "Apartment", "Single Family", "Condo", "Villa", "Other"], required: true },

    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: "USA" },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
    },

    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    squareFootage: { type: Number, min: 0 },
    lotSize: { type: Number, min: 0 },
    overview: { type: String },
    description: { type: String },
    additionalNotes: { type: String },

    coverImg: {
        url: { type: String },
        public_id: { type: String }, // Added
        caption: { type: String }
    },

    images: [{
        url: { type: String, required: true },
        public_id: { type: String }, // Added
        caption: { type: String },
        isPrimary: { type: Boolean, default: false },
    }],

    virtualTourUrl: { type: String },
    features: [{ type: String }],
    amenities: [{ type: String }],
    labels: [{ type: String }],
    availableFrom: { type: Date },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String },

    propertyId: {
        type: String,
        unique: true,
        default: shortid.generate
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Indexes
HouseSchema.index({ "address.city": 1, "address.state": 1, "address.zip": 1 });
HouseSchema.index({ propertyId: 1 });
HouseSchema.index({ status: 1, propertyType: 1, bedrooms: 1, bathrooms: 1 });
HouseSchema.index({ "coordinates": "2dsphere" });

module.exports = mongoose.model("House", HouseSchema);
