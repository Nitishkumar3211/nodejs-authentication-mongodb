const jwt = require("jsonwebtoken");
const dbConfig = require("../config/db.config.js");
const randomString = dbConfig.randomString;
module.exports = function(req, res, next) {
    const token = req.session.token;
    if (!token) {

        return res.render('login', {
            message: "Authentication Error"
        });

    } else {
        try {
            const decoded = jwt.verify(token, randomString);
            req.user = decoded.user;
            next();
        } catch (e) {
            console.error(e);
            return res.render('login', {
                message: e.message || "Invalid Token"
            });
        }

    }

};