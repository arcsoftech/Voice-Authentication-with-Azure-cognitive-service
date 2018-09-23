/* jshint esversion: 6 */
// Author:Arihant Chhajed
// Description:This is a helper module to inject any handlebar helper.
'use strict';

function helpers(exphbs) {
    exphbs.registerHelper('toString', function (object) {
        return JSON.stringify(object);
    });
}

module.exports = {
    helpers: helpers
};