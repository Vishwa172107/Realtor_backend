const express = require("express");
const axios = require('axios');
const Testimonials = require("../models/Testimonials");
const Review = require("../models/Review");
const Subscribers = require("../models/Subscribers");
const Contacts = require("../models/Contacts")
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
            res.status(400).json({ message: "Missing fields!!!" })
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

router.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "No email received!" });
        }

        const existing_sub = await Subscribers.findOne({ email });

        if (existing_sub) {
            return res.status(200).json({ message: "User has already subscribed!" });
        }

        const sub = new Subscribers({ email });
        await sub.save();

        res.status(201).json({ message: "User successfully subscribed to the newsletter!" });
    } catch (err) {
        console.error("Subscription error:", err);
        res.status(500).json({ message: "An error occurred", error: err });
    }
});

router.post("/unsubscribe", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(403).json({ message: "No email found" });
        }

        const deleted_sub = await Subscribers.findOneAndDelete({ email });

        if (!deleted_sub) {
            return res.status(404).json({ message: "Email not found in subscribers list" });
        }

        res.status(200).json({ message: "Successfully unsubscribed", data: deleted_sub });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/contact", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body.contact;

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        const newContact = new Contacts({ firstName, lastName, email, phone, message });
        await newContact.save();

        res.status(201).json({ message: "Contact message submitted successfully!" });
    } catch (err) {
        console.error("Error in POST /contact:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

router.get("/contacts", async (req, res) => {
    try {
        const contacts = await Contacts.find().sort({ createdAt: -1 }); // newest first
        res.status(200).json({ data: contacts });
    } catch (err) {
        console.error("Error in GET /contacts:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

router.delete("/contact/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContact = await Contacts.findByIdAndDelete(id);

        if (!deletedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact deleted successfully", data: deletedContact });
    } catch (err) {
        console.error("Error in DELETE /contact/:id:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

module.exports = router