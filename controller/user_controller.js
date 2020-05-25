const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbConfig = require("../config/db.config.js");
const randomString = dbConfig.randomString;
const { validationResult, check } = require('express-validator');
var moment = require('moment');
// Create and Save a new User
exports.login = (req, res) => {

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


}


exports.profile = (req, res) => {

    return User.findById({
        _id: req.session.userID
    }).then(userData => {
        res.render('profile', {
            user: userData,
            moment: moment
        });

    }, error => {
        res.render('login', {
            message: error.message || "Something went wrong"
        });
    })

}


exports.registrationform = (req, res) => {
    res.render('registration', { message: "" });
}

exports.register = async(req, res) => {
    const validation_result = validationResult(req);

    req.body.dateOfBirth = new Date(req.body.dateOfBirth)
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

}



exports.logout = (req, res) => {
    //session destroy
    req.session = null;
    res.redirect('/');
}

exports.userList = (req, res) => {
    return User.find({
        _id: { $ne: req.session.userID }
    }).sort('-updated_at').then(userList => {
        return User.findOne({
            _id: req.session.userID
        }).then(user => {
            res.render('userlist', {
                userlist: userList,
                user: user,
                moment: moment
            });
        }, error => {
            console.log("error" + error);
            res.redirect('/');
        })

    }, error => {
        console.log("error" + error);
        res.redirect('/');
    })
}


exports.deleteUser = (req, res) => {

    User.findByIdAndRemove({
        _id: req.params.id
    }).then(removeData => {
        console.log("Successfully removed")
        res.redirect('/userlist');

    }, error => {
        console.log("error" + error);
        res.redirect('/userlist');
    })
}


exports.editprofile = (req, res) => {

    User.findById({
        _id: req.params.id
    }).then(userData => {

        User.findById({
            _id: req.session.userID
        }).then(user => {
            console.log("Successfully removed")
            res.render('updateprofile', {
                old_data: userData,
                message: "",
                moment: moment,
                user: user
            });

        }, error => {
            console.log("error" + error);
            res.redirect('/userlist');
        })

    }, error => {
        console.log("error" + error);
        res.redirect('/userlist');
    })



}

exports.updateProfile = (req, res) => {



    User.findByIdAndUpdate({
        _id: req.params.id
    }, req.body).then(updateData => {
        console.log("Updated successfully")
        res.redirect('/');

    }, error => {
        console.log("error" + error);
        res.redirect('/');
    })
}