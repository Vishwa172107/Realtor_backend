const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/Auth");
const Info = require("../models/Info");

// POST - Upload new stats
router.post("/stats", verifyToken, async (req, res) => {
    try {
        const stats = req.body.stats;
        if (!Array.isArray(stats) || stats.length === 0) {
            return res.status(400).json({ message: "Invalid payload!" });
        }

        const upload = new Info({ stats });
        await upload.save();
        res.status(201).json({ message: "Uploaded successfully!" });
    } catch (err) {
        console.error("[POST /stats ERROR]", err);
        res.status(500).json({ message: "Something went wrong!", error: err.message });
    }
});

// PUT - Update existing stats (assuming only 1 stats document exists)
router.put("/stats", verifyToken, async (req, res) => {
    try {
        const stats = req.body.stats;
        if (!Array.isArray(stats) || stats.length === 0) {
            return res.status(400).json({ message: "Invalid payload!" });
        }

        const existingInfo = await Info.findOne();
        if (!existingInfo) {
            return res.status(404).json({ message: "Stats not found to update!" });
        }

        existingInfo.stats = stats;
        await existingInfo.save();

        res.status(200).json({ message: "Stats updated successfully!", stats: existingInfo.stats });
    } catch (err) {
        console.error("[PUT /stats ERROR]", err);
        res.status(500).json({ message: "Something went wrong!", error: err.message });
    }
});

// GET - Fetch stats
router.get("/stats", async (req, res) => {
    try {
        const info = await Info.findOne();
        if (!info) {
            return res.status(404).json({ message: "No stats found!" });
        }
        res.status(200).json(info.stats);
    } catch (err) {
        console.error("[GET /stats ERROR]", err);
        res.status(500).json({ message: "Something went wrong!", error: err.message });
    }
});

module.exports = router;