/*
 * GET home page.
 */

exports.index = function (req, res) {


    var fs = require('fs');

    fs.readdir('./public/songs/cicero', function(err, files){
        if(err) throw err;

        res.render('index', { title:'Radio', songs: files});
    });
};