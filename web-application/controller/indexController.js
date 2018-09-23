var jwt = require('jsonwebtoken');
module.exports = {
    GET: {

        /**
         * Index page handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        indexHandler: (req, res) => {
            res.render('index', {
                title: 'Voice Authentication'
            });
        },

        /**
         * Signin page handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        signinHandler: (req, res) => {
            res.render('signin', {
                title: 'Voice Authentication'
            });
        },

        /**
         * Signup page handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        signupHandler: (req, res) => {
            res.render('signup', {
                title: 'Voice Authentication'
            });
        },

        /**
         * Dashboard page handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        dashboardHandler: (req, res) => {
            res.render('dashboard', {
                user: req.user,
                title: 'Voice Authentication'
            });
        }
    },
    POST: {

        /**
         *  Signup post request handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        signupHandler: (req, res, next) => {
            let user = req.user;
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                let options1 = {
                    httpOnly: true, // The cookie only accessible by the web server
                    expires: new Date(Date.now() + 60 * 60 * 1000), // expires after 1 hour
                    ephemeral: true
                };
                var token = jwt.sign(user, "voice", {
                    expiresIn: "1d" // expires in 24 hours
                });
                // Set cookie
                res.cookie('token', token, options1);
                return res.render('signup', {
                    title: 'Voice Authentication',
                    popup: true
                });
            });
        },

        /**
         * Signin post request handler.
         * @param {Object} req Request Object
         * @param {Object} res Response Object
         */

        signinHandler: (req, res, next) => {
            let token;
            let user = req.user;
            let options;
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                switch (req.params.type) {
                    case 'pwd':
                        {
                            options = {
                                httpOnly: true, // The cookie only accessible by the web server
                                expires: new Date(Date.now() + 60 * 60 * 1000), // expires after 1 hour
                                ephemeral: true
                            };
                            token = jwt.sign(user, "voice", {
                                expiresIn: "1d" // expires in 24 hours
                            })
                        }
                    case 'voice':
                        {
                            console.log("voice user", user)
                            options = {
                                httpOnly: true, // The cookie only accessible by the web server
                                expires: new Date(Date.now() + 60 * 60 * 1000), // expires after 1 hour
                                ephemeral: true
                            };
                            token = jwt.sign(user, "voice", {
                                expiresIn: "1d" // expires in 24 hours
                            })
                            res.clearCookie('ms-token', {
                                path: '/'
                            });
                            break;
                        }
                    default:
                        {
                            console.log("default user", user);
                            return res.render('signin', {
                                title: 'Voice Authentication',
                                popup: true,
                                user: user
                            });
                        }
                }
                console.log(token)
                res.cookie('token', token, options);
                return res.redirect(req.baseUrl + '/dashboard')
            });
        }
    }
}