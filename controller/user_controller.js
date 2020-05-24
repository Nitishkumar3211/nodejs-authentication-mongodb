const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create and Save a new User
exports.create = async(req, res) => {

    const {
        username,
        email,
        password
    } = req.body;

    try {
        let user = await User.findOne({
            email
        })

        if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }

        user = new User({
            username,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        res.status(200).json({
            user
        });


    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }

}