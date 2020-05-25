var express = require('express');
var router = express.Router();

const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user_controller = require('../controller/user_controller');
const { validationResult, check } = require('express-validator');


const auth = require("../middleware/auth");

/* GET users listing. */

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('login', { message: "" });
    }
    next();
}

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/profile');
    }
    next();
}


// Dashboard
router.get('/', ifNotLoggedin, auth, user_controller.profile)


//LOGIN
router.post('/', ifLoggedin, [
    check("username", "Please Enter a valid Username")
    .not()
    .isEmpty(),
    check("password", "Please enter a valid password").isLength({
        min: 5
    })
], user_controller.login);


//GET REGISTRATION FORM
router.get('/registration', user_controller.registrationform);


//USER REGISTRATION
router.post('/registration', [
    check("username", "Please Enter a Username")
    .not()
    .isEmpty(),
    check("password", "Please enter password").isLength({
        min: 6
    }),
], user_controller.register);



// LOGOUT
router.get('/logout', user_controller.logout);



//USER LIST
router.get('/userlist', auth, user_controller.userList)


router.get('/delete/:id', auth, user_controller.deleteUser);

router.get('/editprofile/:id', auth, user_controller.editprofile);

router.post('/editprofile/:id', auth, user_controller.updateProfile)


module.exports = router;