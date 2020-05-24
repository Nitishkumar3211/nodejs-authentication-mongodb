var express = require('express');
var router = express.Router();

const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const user = require('../controller/user_controller');
const { validationResult, check } = require('express-validator');
const dbConfig = require("../config/db.config.js");
const randomString = dbConfig.randomString;

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
router.get('/', ifNotLoggedin, auth, (req, res, next) => {
    return User.findById({
        _id: req.session.userID
    }).then(userData => {
        res.render('profile', {
            user: userData
        });

    }, error => {
        res.render('login', {
            message: error.message || "Something went wrong"
        });
    })
})


//Login
router.post('/', ifLoggedin, [
    check("username", "Please Enter a valid Username")
    .not()
    .isEmpty(),
    check("password", "Please enter a valid password").isLength({
        min: 6
    })
], (req, res, next) => {

    const validation_result = validationResult(req);
    const { username, password } = req.body;


    if (!validation_result.isEmpty()) {
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });

        res.render('login', {
            message: allErrors
        });
    } else {


        return User.findOne({
            username
        }).then(userData => {
            if (!userData) {

                res.render('login', {
                    message: "Invalid username or password!"
                });

            } else {

                bcrypt.compare(password, userData.password).then(result => {

                    if (result == true) {

                        req.session.isLoggedIn = true;
                        req.session.userID = userData.id;
                        req.session.username = userData.username;
                        const payload = {
                            user: {
                                id: userData.id
                            }
                        };

                        //Genearting jwt
                        jwt.sign(payload, randomString, { expiresIn: 3600 }, (err, token) => {
                            if (err) {
                                console.log("error" + err)
                            }
                            req.session.token = token;
                            res.redirect('/');
                        })



                    } else {
                        res.render('login', {
                            message: 'Invalid Password!'
                        });
                    }
                }).catch(err => {
                    if (err) throw err;
                });

            }

        }, error => {
            res.render('login', {
                message: error.message || "Something went wrong"
            });
        })


    }




})

router.get('/registration', (req, res, next) => {
    res.render('registration', { message: "" });
})

router.post('/registration', [
    check("username", "Please Enter a Username")
    .not()
    .isEmpty(),
    check("password").isLength({
        min: 6
    }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i").withMessage('Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long'),
    check('email', "Please enter valid email Id").isEmail().normalizeEmail(),
], async(req, res, next) => {


    const validation_result = validationResult(req);
    const { username, password, email, dateOfBirth, name } = req.body;


    // IF validation_result HAS NO ERROR
    if (validation_result.isEmpty()) {

        try {
            let user = await User.findOne({
                username
            })

            if (user) {

                message = 'User Already Exists.';
                res.render('registration', { message: message })

            } else {



                user = new User({
                    username,
                    password,
                    email,
                    name,
                    dateOfBirth
                });

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save().then(data => {

                    req.session.isLoggedIn = true;
                    req.session.userID = data.id;
                    const payload = {
                        user: {
                            id: data.id
                        }
                    };

                    jwt.sign(payload, randomString, { expiresIn: 3600 }, (err, token) => {
                        if (err) {
                            console.log("error" + err)
                        }
                        req.session.token = token;
                        res.redirect('/');
                    })

                    // res.send(`your account has been created successfully, Now you can <a href="/">Login</a>`);

                }).catch(err => {

                    res.render('registration', {
                        message: err.message || "Some error occurred while creating the User.",
                        old_data: req.body
                    });

                });

            }

        } catch (err) {

            message = 'Error in Saving.';
            res.render('registration', { message: message })
        }



    } else {

        // message = 'Some error occurred .';
        // res.render('registration', { message: message })
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        // REDERING login-register PAGE WITH VALIDATION ERRORS
        res.render('registration', {
            message: allErrors,
            old_data: req.body
        });

    }



});



// LOGOUT

router.get('/logout', (req, res) => {
    //session destroy
    req.session = null;
    res.redirect('/');
});



//USER LIST
router.get('/userlist', auth, (req, res) => {

    return User.find({
        _id: { $ne: req.session.userID }
    }).sort('-updated_at').then(userList => {
        return User.findOne({
            _id: req.session.userID
        }).then(user => {

            res.render('userlist', {
                userlist: userList,
                user: user
            });

        }, error => {
            console.log("eror" + error);
            res.redirect('/');
        })

    }, error => {
        console.log("eror" + error);
        res.redirect('/');
    })
})


module.exports = router;