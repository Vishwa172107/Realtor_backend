const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const cors = require("cors")
const authRoutes = require("./Routes/AuthRoutes")
const houseRoutes = require("./Routes/houseRoutes")

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        callback(null, origin)
    },
    credentials: true,
}));

// Middleware
app.use(express.json())

// Routes
app.use(authRoutes)
app.use(houseRoutes)

// API Docs Route
app.get("/docs", (req, res) => {
    res.json({
        message: "🧾 Real Estate API Documentation",
        routes: [
            {
                method: "POST",
                route: "/auth/signup",
                description: "Register a new user",
                body: {
                    firstName: "string",
                    lastName: "string",
                    username: "string",
                    email: "string",
                    password: "string"
                }
            },
            {
                method: "POST",
                route: "/auth/login",
                description: "Login with email and password",
                body: {
                    email: "string",
                    password: "string"
                }
            },
            {
                method: "POST",
                route: "/houses",
                description: "Create a new house listing (Admin Only)",
                headers: {
                    Authorization: "Bearer <token>",
                    ContentType: "multipart/form-data"
                },
                body: {
                    title: "string",
                    price: "number",
                    priceFrequency: "Monthly | Yearly | One-Time",
                    status: "Rent | Sale | Pending | Sold/Rented",
                    propertyType: "Townhouse | Apartment | Single Family | Condo | Villa | Other",
                    bedrooms: "number",
                    bathrooms: "number",
                    squareFootage: "number",
                    lotSize: "number",
                    overview: "string",
                    description: "string",
                    additionalNotes: "string",
                    virtualTourUrl: "string",
                    features: "[string]",
                    amenities: "[string]",
                    labels: "[string]",
                    availableFrom: "Date string",
                    isFeatured: "boolean",
                    isActive: "boolean",
                    address: {
                        street: "string",
                        city: "string",
                        state: "string",
                        zip: "string",
                        country: "string (default: USA)"
                    },
                    images: "[files - max 15]",
                    coverImg: "[file - primary image]"
                }
            },
            {
                method: "GET",
                route: "/houses",
                description: "Get all house listings (Public)"
            },
            {
                method: "PUT",
                route: "/houses/:id",
                description: "Update a house listing (Admin Only)",
                headers: {
                    Authorization: "Bearer <token>",
                    ContentType: "multipart/form-data"
                },
                body: {
                    // Same structure as POST /houses
                }
            },
            {
                method: "DELETE",
                route: "/houses/:id",
                description: "Delete a house listing (Admin Only)",
                headers: {
                    Authorization: "Bearer <token>"
                }
            },
            {
                method: "POST",
                route: "/houses/search",
                description: "Search houses with optional filters (Public)",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    city: "string (optional)",
                    state: "string (optional)",
                    zip: "string (optional)",
                    country: "string (optional)",
                    minPrice: "number (optional)",
                    maxPrice: "number (optional)",
                    minBedrooms: "number (optional)",
                    maxBedrooms: "number (optional)",
                    minBathrooms: "number (optional)",
                    maxBathrooms: "number (optional)",
                    minArea: "number (optional)",
                    maxArea: "number (optional)",
                    status: "Rent | Sale | Pending | Sold/Rented (optional)",
                    propertyType: "Townhouse | Apartment | Single Family | Condo | Villa | Other (optional)",
                    isFeatured: "boolean (optional)",
                    isActive: "boolean (optional)"
                }
            }
        ]
    });
});


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connection to MongoDB established!"))
    .catch(error => console.error("❌ MongoDB Connection Failed:", error))

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
})
