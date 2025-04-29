const express = require("express");
const axios = require('axios');
const Testimonials = require("../models/Testimonials");
const Review = require("../models/Review");
const router = express.Router();

router.post("/testimonials", async (req, res) => {
    const { name, text, role, rating } = req.body
    try {
        const test = new Testimonials({ name, text, role, rating })
        await test.save()

        res.status(201).json({ status: "Successfully added Testimonial!" })
    } catch (err) {
        console.log("[TEXTIMONIAL POST ERROR]", err)
        res.status(500).json({ message: "Something Went Wrong!", error: err })
    }
})

router.get("/testimonials", async (req, res) => {
    try {
        const testimonials = await Testimonials.find()
        res.json(testimonials)
    } catch (err) {
        res.status(500).json({ error: err })
    }
})

router.post("/reviews", async (req, res) => {
    try {
        const { name, email, rating, review } = req.body
        if (!name || !email || !rating || !review) {
            res.status(403).json({ message: "Missing fields!!!" })
        }
        const new_review = new Review({ name, email, rating, review })

        await new_review.save()
        res.status(201).json({ message: "Succesfully added Review!" })
    } catch (err) {
        res.status(500).json({ message: "Something Went Wrong!", error: err })
    }
})

router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find()
        res.json(reviews)
    } catch (err) {
        res.status(500).json({ message: "Something Went Wrong!", error: err })
    }
})

module.exports = router