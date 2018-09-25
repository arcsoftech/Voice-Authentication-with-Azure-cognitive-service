const request = require("request");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fields: 1,
        files: 1,
        parts: 2
    }
});
module.exports = Account => {
    return {
        GET: {

            /**
             * Create request handler.
             * @param {Object} req Request Object
             * @param {Object} res Response Object
             */

            createHandler: (req, res) => {

                var options = {
                    method: 'POST',
                    url: `${process.env.MS_API_ENDPOINT}/verificationProfiles`,
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json',
                        'ocp-apim-subscription-key': process.env.MS_SUBSCRIPTION_KEY
                    },
                    body: {
                        locale: 'en-US'
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) res.send(error.message)
                    Account.update({
                            profileId: body.verificationProfileId,
                            voiceEnrolledCount: 0
                        }, {
                            where: {
                                id: req.user.id
                            }
                        })
                        .then(function (rowsUpdated) {
                            res.send(body)
                        })
                        .catch(err => {
                            res.status(422).send(err)
                        })
                })

            },

            /**
             * List request handler.
             * @param {Object} req Request Object
             * @param {Object} res Response Object
             */

            listHandler: (req, res) => {
                var options = {
                    method: 'GET',
                    url: `${process.env.MS_API_ENDPOINT}/verificationPhrases`,
                    qs: {
                        locale: 'en-us'
                    },
                    headers: {
                        'cache-control': 'no-cache',
                        'ocp-apim-subscription-key': process.env.MS_SUBSCRIPTION_KEY
                    }
                };
                request(options, function (error, response, body) {
                    if (error) res.send(error.message)
                    res.send(body)
                });

            }
        },
        POST: {


            /**
             * Enroll request handler.
             * @param {Object} req Request Object
             * @param {Object} res Response Object
             */

            enrollHandler: (req, res) => {
                upload.single('file')(req, res, (err) => {
                    if (err) {
                        return res.status(400).json({
                            message: `Upload Request Validation Failed:-${err.message}`
                        });
                    }
                    var ConvertOptions = {
                        method: 'POST',
                        url: `http://${process.env.APP_SERVER_USER}:${process.env.APP_SERVER_PASS}@${process.env.APP_SERVER}/convert`,
                        body: req.file.buffer
                    }
                    var options = {
                        method: 'POST',
                        url: `${process.env.MS_API_ENDPOINT}/verificationProfiles/${req.params.id}/enroll`,
                        headers: {
                            'ocp-apim-subscription-key': process.env.MS_SUBSCRIPTION_KEY
                        },
                        encoding: null,
                    };
                    request(ConvertOptions).pipe(request(options, function (error, response, body) {
                        if (error) res.send(error.message)
                        body = JSON.parse(body.toString('utf8'))
                        Account.update({
                                voiceEnrolledCount: body.enrollmentsCount,
                                voicePhrase: body.phrase
                            }, {
                                where: {
                                    id: req.user.id
                                }
                            })
                            .then(function (rowsUpdated) {
                                res.send(body)
                            })
                            .catch(err => {
                                res.status(422).send(err)
                            })
                    }))
                });
            },

            /**
             * Verify request handler.
             * @param {Object} req Request Object
             * @param {Object} res Response Object
             */

            verifyHandler: (req, res) => {
                upload.single('file')(req, res, (err) => {
                    if (err) {
                        return res.status(400).json({
                            message: `Upload Request Validation Failed:-${err.message}`
                        });
                    }
                    var ConvertOptions = {
                        method: 'POST',
                        url: `http://${process.env.APP_SERVER_USER}:${process.env.APP_SERVER_PASS}@${process.env.APP_SERVER}/convert`,
                        body: req.file.buffer
                    }
                    var options = {
                        method: 'POST',
                        url: `${process.env.MS_API_ENDPOINT}/verify`,
                        qs: {
                            verificationProfileId: req.params.id
                        },
                        headers: {
                            'ocp-apim-subscription-key': process.env.MS_SUBSCRIPTION_KEY
                        },
                        encoding: null,
                    };
                    request(ConvertOptions).pipe(request(options, function (error, response, body) {
                        if (error) res.status(401).send(error.message)
                        body = JSON.parse(body.toString('utf8'))
                        if (body.result == "Accept") {
                            let options = {
                                httpOnly: true, // The cookie only accessible by the web server
                                expires: new Date(Date.now() + 60 * 60 * 1000), // expires after 1 hour
                                ephemeral: true
                            };
                            let status = body;
                            status.profileId = req.params.id
                            var token = jwt.sign(status, "voice", {
                                expiresIn: "1d" // expires in 24 hours
                            });
                            // Set cookie
                            res.cookie('ms-token', token, options);
                            console.log(body);
                            res.send({
                                SuccessMsg: "Voice Verified SuccessFull"
                            })
                        } else {
                            res.status(401).send({
                                Reason: "Voice verfication failed"
                            })
                        }
                    }))
                });
            }
        }
    }
}