/*
 * GET home page.
 */

exports.index = function (req, res) {

    var fs = require('fs');

    fs.readdir('./public/songs', function(err, files){
        if(err) throw err;

        if(req.session.username){

        }
        var user = (req.session.username) ? req.session.username : '';

        res.render('index', { title:'Radio', songs: files, user: user});
    });
};

exports.addUser = function (req, res) {

    console.log("\n\n========\nAjax Request Received\n========");

    req.session.username = req.body.user;

    res.send('LOL');

};