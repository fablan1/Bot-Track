/**
 * Created by Max on 10/02/16.
 */

var os = require('os');

helper = {};

helper.date = {};

helper.date.toMySQLDateFormat = function (iso) {

    return iso.split('T')[0];
}

helper.randomString = function (length)
{
    var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var randomString = '';
    for (var i = 0; i < length; i++) {
        randomString += characters[parseInt(Math.random()*characters.length)];
    }
    return randomString;
}

helper.getServerIp = function ()
{
    if (production)
    {
        return 'https://bot-track.com';
    }
    return os.networkInterfaces().en0[1].address;
}

//console.log(os.hostname());

module.exports = helper;