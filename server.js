const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const cors = require("cors")
const authRoutes = require("./Routes/AuthRoutes")
const houseRoutes = require("./Routes/houseRoutes")
const UserRoutes = require("./Routes/UserRoutes")
const services = require("./Routes/services")
const adminRoutes = require("./Routes/AdminRoutes")

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
app.use(adminRoutes)
app.use(houseRoutes)
app.use(UserRoutes)
app.use(services)

// API Docs Route
app.get("/docs", (req, res) => {
    res.json({
        message: "🧾 Real Estate API Documentation",
        routes: [
            // Auth Routes
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

            // House Routes
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
                    // Same as POST /houses
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
            },

            // Stats Routes
            {
                method: "POST",
                route: "/stats",
                description: "Upload new statistics data (Admin Only)",
                headers: {
                    Authorization: "Bearer <token>",
                    ContentType: "application/json"
                },
                body: {
                    stats: "[{ title: string, value: number, icon: string, color: string }]"
                }
            },
            {
                method: "PUT",
                route: "/stats",
                description: "Update existing statistics data (Admin Only)",
                headers: {
                    Authorization: "Bearer <token>",
                    ContentType: "application/json"
                },
                body: {
                    stats: "[{ title: string, value: number, icon: string, color: string }]"
                }
            },
            {
                method: "GET",
                route: "/stats",
                description: "Get current statistics data (Public)"
            },

            // CONTACT ROUTES
            {
                method: "POST",
                route: "/contact",
                description: "Submit a contact message",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    firstName: "string",
                    lastName: "string",
                    email: "string",
                    phone: "number",
                    message: "string"
                }
            },
            {
                method: "PUT",
                route: "/contact/:id",
                description: "Update a contact message by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                },
                body: {
                    firstName: "string (optional)",
                    lastName: "string (optional)",
                    email: "string (optional)",
                    phone: "number (optional)",
                    message: "string (optional)"
                }
            },
            {
                method: "GET",
                route: "/contacts",
                description: "Get all contact messages",
                headers: {
                    ContentType: "application/json"
                }
            },
            {
                method: "GET",
                route: "/contact/:id",
                description: "Get a contact message by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                }
            },
            {
                method: "DELETE",
                route: "/contact/:id",
                description: "Delete a contact message by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                }
            },

            // REVIEWS ROUTES
            {
                method: "POST",
                route: "/reviews",
                description: "Submit a review",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    name: "string",
                    email: "string",
                    rating: "number",
                    review: "string"
                }
            },
            {
                method: "PUT",
                route: "/reviews/:id",
                description: "Update a review by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                },
                body: {
                    name: "string (optional)",
                    email: "string (optional)",
                    rating: "number (optional)",
                    review: "string (optional)"
                }
            },
            {
                method: "GET",
                route: "/reviews",
                description: "Get all reviews",
                headers: {
                    ContentType: "application/json"
                }
            },
            {
                method: "GET",
                route: "/reviews/:id",
                description: "Get a review by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                }
            },
            {
                method: "DELETE",
                route: "/reviews/:id",
                description: "Delete a review by ID",
                headers: {
                    ContentType: "application/json"
                },
                params: {
                    id: "string"
                }
            },

            // SERVICES ROUTES
            {
                method: "POST",
                route: "/services",
                description: "Submit a property service request",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    firstName: "string",
                    lastName: "string",
                    propertyType: "Commercial | Condo | House | Residential | Apartment",
                    condition: "Excellent | Good | Poor | Fair",
                    doYouWant: "Buy a Property | Sell a Property | Rent a Property",
                    email: "string",
                    phone: "string (optional)",
                    message: "string (optional)"
                }
            },
            {
                method: "GET",
                route: "/services",
                description: "Get all service requests"
            },
            {
                method: "GET",
                route: "/services/:id",
                description: "Get service request by ID"
            },
            {
                method: "PUT",
                route: "/services/:id",
                description: "Update a service request",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    firstName: "string (optional)",
                    lastName: "string (optional)",
                    propertyType: "string (optional)",
                    condition: "string (optional)",
                    doYouWant: "string (optional)",
                    email: "string (optional)",
                    phone: "string (optional)",
                    message: "string (optional)"
                }
            },
            {
                method: "DELETE",
                route: "/services/:id",
                description: "Delete a service request"
            },

            // TESTIMONIALS ROUTES
            {
                method: "POST",
                route: "/testimonials",
                description: "Create a testimonial",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    name: "string",
                    text: "string",
                    role: "string",
                    rating: "number"
                }
            },
            {
                method: "PUT",
                route: "/testimonials/:id",
                description: "Update a testimonial",
                headers: {
                    ContentType: "application/json"
                },
                body: {
                    name: "string (optional)",
                    text: "string (optional)",
                    role: "string (optional)",
                    rating: "number (optional)"
                }
            },
            {
                method: "GET",
                route: "/testimonials",
                description: "Get all testimonials"
            },
            {
                method: "GET",
                route: "/testimonials/:id",
                description: "Get testimonial by ID"
            },
            {
                method: "DELETE",
                route: "/testimonials/:id",
                description: "Delete testimonial by ID"
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
