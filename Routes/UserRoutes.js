const express = require("express");
const axios = require('axios');
const Testimonials = require("../models/Testimonials");
const router = express.Router();

router.post("/testimonials", async (requestAnimationFrame, res) => {
    const { name, text, role, rating } = requestAnimationFrame.body
    try {
        const test = new Testimonials({ name, text, role, rating })
        await test.save()

        res.status(201).json({ status: "Successfully added Testimonial!" })
    } catch (err) {
        console.log("[TEXTIMONIAL POST ERROR]", err)
        res.status(500).json({ message: "Something Went Wrong!", error: err })
    }
})

router.get("/testimonials", async (res, res) => {
    try {
        const testimonials = await Testimonials.find()
        res.json(testimonials)
    } catch (err) {
        res.status(500).json({ error: err })
    }
})