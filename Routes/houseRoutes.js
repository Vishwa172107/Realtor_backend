const express = require("express");
const axios = require('axios');
const router = express.Router();
const House = require("../models/House");
const verifyToken = require("../utils/Auth");
const { upload, deleteFromCloudinary } = require('../utils/cloudinary');

// Function to fetch coordinates from the Nominatim API
async function getCoordinates(street, city, state, zip) {
    try {
        // Construct the full address for geocoding
        const address = `${street}, ${city}, ${state}, ${zip}, USA`;

        // Send a GET request to Nominatim API for geocoding
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                addressdetails: 1,
                limit: 1,
            },
        });

        // If we get a valid response, return the latitude and longitude
        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            // If no coordinates are found, return NaN values
            return { latitude: NaN, longitude: NaN };
        }
    } catch (error) {
        console.error('Error in geocoding:', error);
        // Return NaN if there's an error with the API request
        return { latitude: NaN, longitude: NaN };
    }
}

// Get all houses (Public)
router.get("/houses", async (req, res) => {
    try {
        const houses = await House.find({ isActive: true });
        res.json(houses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New House (Admin Only)
const uploadFields = upload.fields([
    { name: 'images', maxCount: 15 },
    { name: 'coverImg', maxCount: 1 },
]);

router.post('/houses', verifyToken, uploadFields, async (req, res) => {
    try {
        const {
            title, price, priceFrequency, status, propertyType,
            bedrooms, bathrooms, squareFootage, lotSize,
            overview, description, additionalNotes, virtualTourUrl,
            features, amenities, labels, availableFrom, isFeatured, isActive, address
        } = req.body;

        if (!address || !address.street || !address.city || !address.state || !address.zip) {
            return res.status(400).json({ error: 'Missing required address fields' });
        }

        const parseField = field => {
            if (!field) return [];
            try {
                return JSON.parse(field);
            } catch {
                return Array.isArray(field) ? field : [field];
            }
        };

        const parsedFeatures = parseField(features);
        const parsedAmenities = parseField(amenities);
        const parsedLabels = parseField(labels);

        const imageUrls = (req.files['images'] || []).map(file => ({
            url: file.path,
            caption: file.originalname,
            public_id: file.originalname.replace(/\.[^/.]+$/, '')
        }));

        const coverImageFile = req.files['coverImg']?.[0];
        const coverImg = coverImageFile ? {
            url: coverImageFile.path,
            caption: coverImageFile.originalname,
            public_id: coverImageFile.originalname.replace(/\.[^/.]+$/, '')
        } : null;

        const longitude = parseFloat(address.longitude);
        const latitude = parseFloat(address.latitude);

        const validCoordinates = (!isNaN(longitude) && !isNaN(latitude))
            ? [longitude, latitude]
            : [0, 0];

        const newHouse = new House({
            title, price, priceFrequency, status, propertyType,
            bedrooms, bathrooms, squareFootage, lotSize,
            overview, description, additionalNotes, virtualTourUrl,
            features: parsedFeatures,
            amenities: parsedAmenities,
            labels: parsedLabels,
            availableFrom,
            isFeatured,
            isActive,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: (address.country || 'USA'),
                coordinates: {
                    type: 'Point',
                    coordinates: validCoordinates,
                }
            },
            coverImg,
            images: imageUrls,
            createdBy: req.user._id,
        });

        await newHouse.save();
        res.status(201).json({ message: 'House created successfully', house: newHouse });
    } catch (error) {
        console.error('[HOUSE POST ERROR]', error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

// Edit house (Admin only)
router.put('/houses/:id', verifyToken, uploadFields, async (req, res) => {
    try {
        const {
            title, price, priceFrequency, status, propertyType,
            bedrooms, bathrooms, squareFootage, lotSize,
            overview, description, additionalNotes, virtualTourUrl,
            features, amenities, labels, availableFrom, isFeatured, isActive, address
        } = req.body;

        if (!address || !address.street || !address.city || !address.state || !address.zip) {
            return res.status(400).json({ error: 'Missing required address fields' });
        }

        const parseField = (field) => {
            if (!field) return [];
            try {
                return JSON.parse(field);
            } catch {
                return Array.isArray(field) ? field : [field];
            }
        };

        const parsedFeatures = parseField(features);
        const parsedAmenities = parseField(amenities);
        const parsedLabels = parseField(labels);

        const imageUrls = (req.files['images'] || []).map(file => ({
            url: file.path,
            caption: file.originalname,
            public_id: file.originalname.replace(/\.[^/.]+$/, '')
        }));

        const coverImageFile = req.files['coverImg']?.[0];
        const coverImg = coverImageFile ? {
            url: coverImageFile.path,
            caption: coverImageFile.originalname,
            public_id: coverImageFile.originalname.replace(/\.[^/.]+$/, '')
        } : null;

        const longitude = parseFloat(address.longitude);
        const latitude = parseFloat(address.latitude);

        const validCoordinates = (!isNaN(longitude) && !isNaN(latitude))
            ? [longitude, latitude]
            : [0, 0];

        const updatedHouseData = {
            title, price, priceFrequency, status, propertyType,
            bedrooms, bathrooms, squareFootage, lotSize,
            overview, description, additionalNotes, virtualTourUrl,
            features: parsedFeatures,
            amenities: parsedAmenities,
            labels: parsedLabels,
            availableFrom,
            isFeatured,
            isActive,
            images: imageUrls,
            ...(coverImg && { coverImg }),
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: (address.country || 'USA'),
                coordinates: {
                    type: 'Point',
                    coordinates: validCoordinates,
                },
            },
            updatedAt: Date.now(),
        };

        const updatedHouse = await House.findByIdAndUpdate(req.params.id, updatedHouseData, {
            new: true,
            runValidators: true
        });

        if (!updatedHouse) {
            return res.status(404).json({ error: 'House not found' });
        }

        res.json({ message: 'House updated successfully', house: updatedHouse });

    } catch (err) {
        console.error('[HOUSE PUT ERROR]', err);
        res.status(500).json({ message: 'Something went wrong!', error: err });
    }
});

router.get("/houses/:id", async (req, res) => {
    try {
        const house = await House.findById(req.params.id).populate("features").populate("amenities").
            populate("labels").populate("images").populate("coverImg").populate("address");
        if (!house)
            return res.status(404).json({ error: "House not found" });
        res.json(house);
    } catch (err) {
        console.error("[HOUSE GET ERROR]", err);
        res.status(400).json({ error: err.message });
    }
})

// Delete house (Admin only)
router.delete("/houses/:id", verifyToken, async (req, res) => {

    try {
        const deletedHouse = await House.findByIdAndDelete(req.params.id);
        if (!deletedHouse) return res.status(404).json({ error: "House not found" });

        res.json({ message: "House deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post("/houses/search", async (req, res) => {
    try {
        const {
            city,
            state,
            zip,
            country,
            minPrice,
            maxPrice,
            minBedrooms,
            maxBedrooms,
            minBathrooms,
            maxBathrooms,
            minArea,
            maxArea,
            status,
            propertyType,
            isFeatured,
            isActive
        } = req.body;

        const query = {};

        // Address fields with partial, case-insensitive match
        if (city) query["address.city"] = { $regex: city, $options: "i" };
        if (state) query["address.state"] = { $regex: state, $options: "i" };
        if (zip) query["address.zip"] = { $regex: zip, $options: "i" };
        if (country) query["address.country"] = { $regex: country, $options: "i" };

        // Price
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Bedrooms
        if (minBedrooms || maxBedrooms) {
            query.bedrooms = {};
            if (minBedrooms) query.bedrooms.$gte = Number(minBedrooms);
            if (maxBedrooms) query.bedrooms.$lte = Number(maxBedrooms);
        }

        // Bathrooms
        if (minBathrooms || maxBathrooms) {
            query.bathrooms = {};
            if (minBathrooms) query.bathrooms.$gte = Number(minBathrooms);
            if (maxBathrooms) query.bathrooms.$lte = Number(maxBathrooms);
        }

        // Area
        if (minArea || maxArea) {
            query.squareFootage = {};
            if (minArea) query.squareFootage.$gte = Number(minArea);
            if (maxArea) query.squareFootage.$lte = Number(maxArea);
        }

        // Status & type with case-insensitive partial match
        if (status) query.status = { $regex: status, $options: "i" };
        if (propertyType) query.propertyType = { $regex: propertyType, $options: "i" };

        // Boolean fields
        if (isFeatured !== undefined) query.isFeatured = isFeatured === true || isFeatured === 'true';
        if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';

        const houses = await House.find(query);
        res.status(200).json(houses);
    } catch (err) {
        console.error("[HOUSE SEARCH ERROR]", err);
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;