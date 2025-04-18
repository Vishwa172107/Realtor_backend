const express = require("express");
const axios = require('axios');
const router = express.Router();
const House = require("../models/House");
const verifyToken = require("../utils/Auth");
const { upload } = require('../utils/cloudinary');

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
        // Step 1: Extract form data
        const {
            title,
            price,
            priceFrequency,
            status,
            propertyType,
            bedrooms,
            bathrooms,
            squareFootage,
            lotSize,
            overview,
            description,
            additionalNotes,
            virtualTourUrl,
            features,
            amenities,
            labels,
            availableFrom,
            isFeatured,
            isActive,
            address
        } = req.body;

        if (!address || !address.street || !address.city || !address.state || !address.zip) {
            return res.status(400).json({ error: 'Missing required address fields' });
        }

        // Step 2: Parse arrays (stringified in FormData)
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

        // Step 3: Process images
        const imageUrls = (req.files['images'] || []).map(file => ({
            url: file.path,
            caption: file.originalname,
        }));

        const coverImageFile = req.files['coverImg']?.[0];
        const coverImg = coverImageFile ? {
            url: coverImageFile.path,
            caption: coverImageFile.originalname
        } : null;

        // Step 4: Validate coordinates
        const longitude = parseFloat(address.longitude);
        const latitude = parseFloat(address.latitude);

        const validCoordinates = (!isNaN(longitude) && !isNaN(latitude))
            ? [longitude, latitude]
            : [0, 0];  // fallback to [0, 0] instead of "Not Available"

        // Step 5: Create and save house
        const newHouse = new House({
            title,
            price,
            priceFrequency,
            status,
            propertyType,
            bedrooms,
            bathrooms,
            squareFootage,
            lotSize,
            overview,
            description,
            additionalNotes,
            virtualTourUrl,
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
                country: address.country || 'USA',
                coordinates: {
                    type: 'Point',
                    coordinates: validCoordinates,
                },
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
router.put(
    "/houses/:id",
    verifyToken,
    uploadFields,
    async (req, res) => {
        try {
            const {
                title, price, priceFrequency, status, propertyType,
                bedrooms, bathrooms, squareFootage, lotSize,
                overview, description, additionalNotes,
                virtualTourUrl, features, amenities, labels,
                availableFrom, isFeatured, isActive,
                'address.street': street, 'address.city': city,
                'address.state': state, 'address.zip': zip,
                'address.country': country = 'USA'
            } = req.body;

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

            // Handle uploaded files
            const imageUrls = req.files?.images
                ? req.files.images.map(file => ({
                    url: file.path,
                    caption: file.originalname
                }))
                : [];

            const coverImgUrl = req.files?.coverImg?.[0]?.path || null;

            // Get updated coordinates if address fields are changed
            let coordinates = undefined;
            if (street && city && state && zip) {
                const { latitude, longitude } = await getCoordinates(street, city, state, zip);
                coordinates = !isNaN(latitude) && !isNaN(longitude)
                    ? [longitude, latitude]
                    : ["Not Available", "Not Available"];
            }

            const updateFields = {
                title,
                price,
                priceFrequency,
                status,
                propertyType,
                bedrooms,
                bathrooms,
                squareFootage,
                lotSize,
                overview,
                description,
                additionalNotes,
                virtualTourUrl,
                features: parsedFeatures,
                amenities: parsedAmenities,
                labels: parsedLabels,
                availableFrom,
                isFeatured,
                isActive,
                updatedAt: Date.now(),
                ...(imageUrls.length > 0 && { images: imageUrls }),
                ...(coverImgUrl && { coverImg: coverImgUrl }),
                ...(street && city && state && zip && {
                    address: {
                        street,
                        city,
                        state,
                        zip,
                        country,
                        ...(coordinates && { coordinates: { type: 'Point', coordinates } })
                    }
                })
            };

            // Ensure we don't overwrite the `propertyId` (as it's auto-generated)
            delete updateFields.propertyId;

            const updatedHouse = await House.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true }
            );

            if (!updatedHouse)
                return res.status(404).json({ error: "House not found" });

            res.json(updatedHouse);
        } catch (err) {
            console.error("[HOUSE PUT ERROR]", err);
            res.status(400).json({ error: err.message });
        }
    }
);


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

        // Location
        if (city) query["address.city"] = city;
        if (state) query["address.state"] = state;
        if (zip) query["address.zip"] = zip;
        if (country) query["address.country"] = country;

        // Price range
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

        // Square footage
        if (minArea || maxArea) {
            query.squareFootage = {};
            if (minArea) query.squareFootage.$gte = Number(minArea);
            if (maxArea) query.squareFootage.$lte = Number(maxArea);
        }

        // Type & Status
        if (status) query.status = status;
        if (propertyType) query.propertyType = propertyType;

        // Booleans
        if (isFeatured !== undefined) query.isFeatured = isFeatured === true || isFeatured === 'true';
        if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';

        // Fetch properties
        const houses = await House.find(query);
        res.status(200).json(houses);
    } catch (err) {
        console.error("[HOUSE SEARCH ERROR]", err);
        res.status(500).json({ error: "Search failed" });
    }
});

module.exports = router;
