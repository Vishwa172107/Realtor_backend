const jwt = require("jsonwebtoken")

const Auth = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]

    if (!token) res.status(401).json({ Error: "Access Denied" })

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) res.status(400).json({ Error: "Invalid Token" })
        req.user = user
        next()
    })
}

module.exports = Auth