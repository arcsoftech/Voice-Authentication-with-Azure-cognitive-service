const bcrypt = require('bcrypt-nodejs');
// generating a hash
const generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
const validPassword = function (password, encryptedPass) {
    return bcrypt.compareSync(password, encryptedPass);
};
const CustomStrategy = require('passport-custom')
    .Strategy;
var jwt = require('jsonwebtoken');
const FindToken = req => {
    let token = false;
    if (typeof req.token !== 'undefined') {
        token = req.token;
        return token;
    }
    if (req.cookies['token']) {
        token = req.cookies['token'];
        return token;
    }
    if (req.cookies['token-aws']) {
        token = req.cookies['token-aws'];
        return token;
    }
    if (req.cookies['ms-token']) {
        token = req.cookies['ms-token'];
        return token;
    }
    return false;
};
module.exports = function (passport, Account) {
    var LocalStrategy = require('passport-local').Strategy;
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            Account.findOne({
                    where: {
                        email: email.toLowerCase()
                    }
                })
                .then((user) => {
                    if (user) {
                        return done(null, false, {
                            message: 'That email is already taken'
                        });
                    } else {
                        let userPassword = generateHash(password);
                        let data = {
                            email: email,
                            password: userPassword,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            username: req.body.username
                        };
                        Account.create(data).then(function (user, created) {
                            if (!user) {
                                return done(null, false, {
                                    message: 'Something went wrong...'
                                });
                            }
                            if (user) {
                                console.log(user.dataValues);
                                return done(null, user.dataValues);
                            }
                        });
                    }
                });
        }
    ));

    passport.use('local-signin', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {
            console.log(email, password);
            let check_condition = {
                email: email
            }
            if (req.params.type === 'voice') {
                let token = FindToken(req);
                decodedToken = jwt.verify(token, 'voice');
                profileId = decodedToken.profileId;
                check_condition = {
                    profileId: profileId
                }
            }
            Account.findOne({
                where: check_condition
            }).then(function (user) {
                if (!user) {
                    console.log(user)
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }
                if (req.params.type !== 'voice' && !validPassword(password, user.password)) {
                    console.log(validPassword(password, user.password))
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });
        }
    ));
    // Jwt strategy
    passport.use(
        'JWT',
        new CustomStrategy(function (req, done) {
            let token = FindToken(req);
            console.log('token found', token);
            try {
                if (token) {
                    var user = jwt.verify(token, 'voice');
                    console.log("sdasdasdasd", user)
                    if (user) {
                        return done(null, user);
                    } else {
                        throw new Error("Not Authorized");
                    }

                } else {
                    throw new Error('Session expired.');
                }
            } catch (err) {
                return done(null, false, {
                    message: err.message
                });
            }
        })
    );
    passport.use(
        'pre-signin',
        new CustomStrategy(function (req, done) {
            console.log(req.body.email)
            let email = req.body.email;
            Account.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                if (!user) {
                    console.log(user)
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }
                var userinfo = user.get();
                return done(null, userinfo);
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });
        })
    );
    // serialize
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // deserialize user
    passport.deserializeUser(function (req, id, done) {
        Account.findById(id, {
            raw: true
        }).then(user => {
            if (user) {
                done(null, user);
            } else {
                done(new Error('User not found'), null);
            }
        }).catch(err => {
            done(err.message, null);
        })
    });
}