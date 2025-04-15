const express = require("express");
const axios = require('axios');
const router = express.Router();
const House = require("../models/House");
const verifyToken = require("../utils/Auth");
const { upload } = require('../utils/cloudinary');

// Function to fetch coordinates from the Nominatim API
// async function getCoordinates(street, city, state, zip) {
//     try {
//         // Construct the full address for geocoding
//         const address = `${street}, ${city}, ${state}, ${zip}, USA`;

//         // Send a GET request to Nominatim API for geocoding
//         const response = await axios.get('https://nominatim.openstreetmap.org/search', {
//             params: {
//                 q: address,
//                 format: 'json',
//                 addressdetails: 1,
//                 limit: 1,
//             },
//         });

//         // If we get a valid response, return the latitude and longitude
//         if (response.data && response.data.length > 0) {
//             const { lat, lon } = response.data[0];
//             return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
//         } else {
//             // If no coordinates are found, return NaN values
//             return { latitude: NaN, longitude: NaN };
//         }
//     } catch (error) {
//         console.error('Error in geocoding:', error);
//         // Return NaN if there's an error with the API request
//         return { latitude: NaN, longitude: NaN };
//     }
// }

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
router.post('/houses', verifyToken, upload.array('images', 15), async (req, res) => {
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
            'address.street': street,
            'address.city': city,
            'address.state': state,
            'address.zip': zip,
            'address.country': country = 'USA'
        } = req.body;

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

        // Step 3: Upload images handled by multer-storage-cloudinary
        const imageUrls = req.files.map(file => ({
            url: file.path,
            caption: file.originalname,
        }));

        // Step 4: Get coordinates from Nominatim API (latitude, longitude)
        const { latitude, longitude } = await getCoordinates(street, city, state, zip);

        // Check if coordinates are valid
        const validCoordinates = !isNaN(latitude) && !isNaN(longitude)
            ? [longitude, latitude]
            : ["Not Available", "Not Available"];

        // Step 5: Create and save the house document
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
                street,
                city,
                state,
                zip,
                country,
                coordinates: {
                    type: 'Point',
                    coordinates: validCoordinates,
                },
            },
            images: imageUrls,
            createdBy: req.user.id,
        });

        await newHouse.save();
        res.status(201).json({ message: 'House created successfully', house: newHouse });
    } catch (error) {
        console.error('[HOUSE POST ERROR]', error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

// Edit house (Admin only)
router.put("/houses/:id", verifyToken, async (req, res) => {
    try {
        // Step 1: Destructure the fields from the request body
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

        // Step 2: Parse arrays (if they exist in the request)
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

        // Step 3: Process image uploads (if new images are included)
        const imageUrls = req.files ? req.files.map(file => ({
            url: file.path,
            caption: file.originalname,
        })) : [];

        // Step 4: Get the new coordinates (if address is updated)
        let coordinates = undefined;
        if (street && city && state && zip) {
            const { latitude, longitude } = await getCoordinates(street, city, state, zip);

            // If valid coordinates are found, use them
            coordinates = !isNaN(latitude) && !isNaN(longitude)
                ? [longitude, latitude]
                : ["Not Available", "Not Available"];
        }

        // Step 5: Update the house document in the database
        const updatedHouse = await House.findByIdAndUpdate(req.params.id, {
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
            address: {
                street,
                city,
                state,
                zip,
                country,
                ...(coordinates && { coordinates: { type: 'Point', coordinates } })
            },
            images: imageUrls.length > 0 ? imageUrls : undefined,
        }, { new: true });

        // Step 6: Handle cases where the house is not found
        if (!updatedHouse) return res.status(404).json({ error: "House not found" });

        res.json(updatedHouse);
    } catch (err) {
        console.error('[HOUSE PUT ERROR]', err);
        res.status(400).json({ error: err.message });
    }
});


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

module.exports = router;
