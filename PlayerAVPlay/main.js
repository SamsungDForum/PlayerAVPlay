(function () {
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[PlayerAvplay]: ' + msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    var player;

    // flag to monitor UHD toggling
    var uhdStatus = false;

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = [
            'MediaPlay',	
            'MediaPause',
            'MediaStop',
            'MediaFastForward',
            'MediaRewind',            
            '0',
            '1',
            '2',
            '3'
        ];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 13:    // Enter
                    player.toggleFullscreen();
                    break;
                case 415:   // MediaPlay
		    player.play();
		    break;
                case 19:    // MediaPause
                    player.pause();
                    break;
                case 413:   // MediaStop
                    player.stop();
                    break;
                case 417:   // MediaFastForward
                    player.ff();
                    break;
                case 412:   // MediaRewind
                    player.rew();
                    break;
                case 48: //Key 0
                    log();
                    break;
                case 49: //Key 1
                    setUhd();
                    break;
                case 50: //Key 2
                    player.getTracks();
                    break;
                case 51: //Key 3
                    player.getProperties();
                    break;
                case 10009: // Return
                    if (webapis.avplay.getState() !== 'IDLE' && webapis.avplay.getState() !== 'NONE') {
                        player.stop();
                    }
                    tizen.application.getCurrentApplication().hide();
                    break;
                default:
                    log("Unhandled key");
            }
        });
    }

    function registerMouseEvents() {
        document.querySelector('.video-controls .play').addEventListener(
            'click',
            function () {
                player.play();
            }
        );
        document.querySelector('.video-controls .stop').addEventListener(
            'click',
            function () {
                player.stop();
            }
        );
        document.querySelector('.video-controls .pause').addEventListener(
            'click',
            function() {
            	player.pause();
            }
            
        );
        document.querySelector('.video-controls .ff').addEventListener(
            'click',
            function() {
            	player.ff()
            }
        );
        document.querySelector('.video-controls .rew').addEventListener(
            'click',
            function() {
            	player.rew();
            }
        );
        document.querySelector('.video-controls .fullscreen').addEventListener(
            'click',
            function() {
            	player.toggleFullscreen();
            }
        );
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    /**
     * Enabling uhd manually in order to play uhd streams
     */
    function setUhd() {
        if (!uhdStatus) {
            if (webapis.productinfo.isUdPanelSupported()) {
                log('4k enabled');
                uhdStatus = true;
            } else {
                log('this device does not have a panel capable of displaying 4k content');
            }

        } else {
            log('4k disabled');
            uhdStatus = false;
        }
        player.setUhd(uhdStatus);
    }


    /**
     * Function initialising application.
     */
    window.onload = function () {

        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
            return;
        }

        displayVersion();
        registerKeys();
        registerKeyHandler();

        /**
         * Player configuration object.
         *
         * @property {String}    url                     - content url
         * @property {HTML Element} player           - application/avplayer object
         * @property {HTML Div Element} controls     - player controls
         * @property {HTLM Div Element} info         - place to display stream info
         */
        var config = {
            url: 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
            player: document.getElementById('av-player'),
            controls: document.querySelector('.video-controls'),
            info: document.getElementById('info'),
            logger: log //Function used for logging

            /*Smooth Streaming examples*/
            //			url:
            // 'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
            // url: 'http://playready.directtaps.net/smoothstreaming/TTLSS720VC1/To_The_Limit_720.ism/Manifest'
        };


        //Check the screen width so that the AVPlay can be scaled accordingly
        tizen.systeminfo.getPropertyValue(
            "DISPLAY",
            function (display) {
                log("The display width is " + display.resolutionWidth);
                config.resolutionWidth = display.resolutionWidth;

                // initialize player - loaded from videoPlayer.js
                player = new VideoPlayer(config);
                player.open(config.url);
                registerMouseEvents();
            },
            function(error) {
                log("An error occurred " + error.message);
            }
        );

    }
}());
