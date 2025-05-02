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

router.put("/testimonials/:id", async (req, res) => {
    const { name, email, role, rating } = req.body;
    const { id } = req.params;

    try {
        const testimonial = await Testimonials.findByIdAndUpdate(
            id,
            { name, email, role, rating },
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        res.status(200).json({ message: "Successfully Updated!", data: testimonial });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});


router.get("/testimonials", async (req, res) => {
    try {
        const testimonials = await Testimonials.find()
        res.json(testimonials)
    } catch (err) {
        res.status(500).json({ error: err })
    }
})

router.delete("/testimonials/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Testimonials.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Testimonial not found" });
        }

        res.status(200).json({ message: "Testimonial deleted successfully", data: deleted });
    } catch (err) {
        res.status(500).json({ message: "Error deleting testimonial", error: err });
    }
});


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

router.put("/reviews/:id", async (req, res) => {
    const { name, email, rating, review } = req.body;
    const { id } = req.params;

    try {
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { name, email, rating, review },
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review updated successfully", data: updatedReview });
    } catch (err) {
        res.status(500).json({ message: "Error updating review", error: err });
    }
});


router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find()
        res.json(reviews)
    } catch (err) {
        res.status(500).json({ message: "Something Went Wrong!", error: err })
    }
})

router.delete("/reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Review.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review deleted successfully", data: deleted });
    } catch (err) {
        res.status(500).json({ message: "Error deleting review", error: err });
    }
});


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
        const { firstName, lastName, email, phone, message } = req.body;

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

router.put("/contact/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, message } = req.body;

        const updatedContact = await Contacts.findByIdAndUpdate(
            id,
            { firstName, lastName, email, phone, message },
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact updated successfully", data: updatedContact });
    } catch (err) {
        res.status(500).json({ message: "Error updating contact", error: err });
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