const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET

// Signup Route
router.post("/auth/signup", async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, role } = req.body.user

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(403).json({ error: "Email already registered!" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword
        })

        res.json({ response: "User Registered Successfully" })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// Login Route
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body.user

        const user = await User.findOne({ email })
        if (!user) return res.status(403).json({ error: "Email not registered!" })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(403).json({ error: "Invalid Password!" })

        const token = jwt.sign({ id: user._id, name: user.firstName + " " + user.lastName }, JWT_SECRET, { expiresIn: "7d" })

        res.json({ token })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router
