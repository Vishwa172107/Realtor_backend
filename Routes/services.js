const express = require("express");
const router = express.Router();
const Services = require("../models/Services");

// POST - Create a service request
router.post("/services", async (req, res) => {
    try {
        const service = new Services(req.body);
        await service.save();
        res.status(201).json({ message: "Service request created successfully", data: service });
    } catch (err) {
        console.error("Error creating service:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// GET - Get all service requests
router.get("/services", async (req, res) => {
    try {
        const services = await Services.find().sort({ createdAt: -1 });
        res.status(200).json({ data: services });
    } catch (err) {
        console.error("Error fetching services:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// GET - Get a specific service request by ID
router.get("/services/:id", async (req, res) => {
    try {
        const service = await Services.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service request not found" });
        }
        res.status(200).json({ data: service });
    } catch (err) {
        console.error("Error fetching service:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// PUT - Update a service request by ID
router.put("/services/:id", async (req, res) => {
    try {
        const updatedService = await Services.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedService) {
            return res.status(404).json({ message: "Service request not found" });
        }
        res.status(200).json({ message: "Service request updated successfully", data: updatedService });
    } catch (err) {
        console.error("Error updating service:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// DELETE - Delete a service request by ID
router.delete("/services/:id", async (req, res) => {
    try {
        const deletedService = await Services.findByIdAndDelete(req.params.id);
        if (!deletedService) {
            return res.status(404).json({ message: "Service request not found" });
        }
        res.status(200).json({ message: "Service request deleted successfully", data: deletedService });
    } catch (err) {
        console.error("Error deleting service:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

module.exports = router;