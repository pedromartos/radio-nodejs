$(document).ready(function () {

    var socket = io.connect('http://187.55.96.212:3000/');

    // JPLAYER
    /*
     * jQuery UI ThemeRoller
     */
    var myPlayer = $("#jquery_jplayer_1"),
        myPlayerData,
        loadTime,
        fixFlash_mp4, // Flag: The m4a and m4v Flash player gives some old currentTime values when changed.
        fixFlash_mp4_id, // Timeout ID used with fixFlash_mp4
        ignore_timeupdate, // Flag used with fixFlash_mp4
        options = {
            errorAlerts: true,
            ready: function (event) {
                // Hide the volume slider on mobile browsers. ie., They have no effect.
                if(event.jPlayer.status.noVolume) {
                    // Add a class and then CSS rules deal with it.
                    $(".jp-gui").addClass("jp-no-volume");
                }
                // Determine if Flash is being used and the mp4 media type is supplied. BTW, Supplying both mp3 and mp4 is pointless.
                fixFlash_mp4 = event.jPlayer.flash.used && /m4a|m4v/.test(event.jPlayer.options.supplied);
            },
            timeupdate: function(event) {
                if(!ignore_timeupdate) {
                    myControl.progress.slider("value", event.jPlayer.status.currentPercentAbsolute);
                }
            },
            volumechange: function(event) {
                if(event.jPlayer.options.muted) {
                    myControl.volume.slider("value", 0);
                } else {
                    myControl.volume.slider("value", event.jPlayer.options.volume);
                }
            },
            loadstart: function(event){
                loadTime = new Date();
            },
            pause: function(event){
                socket.emit('songPause');
            },
            play: function(event){

            },
            swfPath: "/js/jplayer",
            supplied: "mp3",
            solution: "flash, html",
            cssSelectorAncestor: "#jp_container_1",
            wmode: "window",
            keyEnabled: true
        },
        myControl = {
            progress: $(options.cssSelectorAncestor + " .jp-progress-slider"),
            volume: $(options.cssSelectorAncestor + " .jp-volume-slider")
        };

    // Instance jPlayer
    myPlayer.jPlayer(options);

    // A pointer to the jPlayer data object
    myPlayerData = myPlayer.data("jPlayer");

    // Define hover states of the buttons
    $('.jp-gui ul li').hover(
        function() { $(this).addClass('ui-state-hover'); },
        function() { $(this).removeClass('ui-state-hover'); }
    );

    // Create the progress slider control
    myControl.progress.slider({
        animate: "fast",
        max: 100,
        range: "min",
        step: 0.1,
        value : 0,
        slide: function(event, ui) {
            var sp = myPlayerData.status.seekPercent;
            if(sp > 0) {
                // Apply a fix to mp4 formats when the Flash is used.
                if(fixFlash_mp4) {
                    ignore_timeupdate = true;
                    clearTimeout(fixFlash_mp4_id);
                    fixFlash_mp4_id = setTimeout(function() {
                        ignore_timeupdate = false;
                    },1000);
                }
                // Move the play-head to the value and factor in the seek percent.
                var value = ui.value * (100 / sp);
                myPlayer.jPlayer("playHead", value);
                socket.emit('songSeek', value);
            } else {
                // Create a timeout to reset this slider to zero.
                setTimeout(function() {
                    myControl.progress.slider("value", 0);
                }, 0);
            }
        }
    });

    // Create the volume slider control
    myControl.volume.slider({
        animate: "fast",
        max: 1,
        range: "min",
        step: 0.01,
        value : $.jPlayer.prototype.options.volume,
        slide: function(event, ui) {
            myPlayer.jPlayer("option", "muted", false);
            myPlayer.jPlayer("option", "volume", ui.value);
        }
    });

    // Playlist
    $('.playlist a').click(function(){
        var data = {'song' : $(this).attr('song')}
        socket.emit('setsong', data);
    });

    $('.jp-stop').click(function(){
        socket.emit('songStop');
    });

    $('.jp-play').click(function(){
        var sp = myPlayerData.status.seekPercent;
        var value = myControl.progress.slider('value') * (100 / sp);

        socket.emit('songPlay', value);
    });


    /**
     *
     * REAL-TIME EVENTS
     *
     */


    // Send play evento to server
    socket.on('play', function(data){
        myPlayer.jPlayer("setMedia", {
            mp3: data.song
        }).jPlayer('play');
    });

    socket.on('updateSongProgress', function(data){
        myPlayer.jPlayer("playHead", data);
    });

    socket.on('stop', function(){
        myPlayer.jPlayer("stop");
    });

    socket.on('pause', function(){
        myPlayer.jPlayer('pause');
    });

    socket.on('playFrom', function(data){
        console.log(data);
        myPlayer.jPlayer("playHead", data).jPlayer('play');
    });

});