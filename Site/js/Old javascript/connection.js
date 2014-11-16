var bol = lapse || {};
var socket;

/**
 * This file adds the trackers
 */
bol.connectionHandler = (function() {

    var realtime = false;
    var connected = false;


    function init() {

        initConnection();

    }

    function initConnection(){
        console.log("initializing connection.");

        var conn_options = {
            'sync disconnect on unload':false
        };

        if (typeof io !== "undefined") {
            socket = io.connect("http://dali.cs.kuleuven.be:8080", conn_options);
            //socket = io.connect("http://localhost:8080", conn_options);

            socket.on('connect', function(){
                connected = true;
            });

            socket.on('server_message', function(data){
                $('#receiver').append('<li>' + JSON.stringify(data) + '</li>');
                if (data._id !== undefined){
                    bol.getter.setTripID(data._id);
                }
            });

        } else {
            console.log("woops...");
            //no fallback
        }
    }

    function connect(){
        if (!connected){

            initConnection();

        }   else {

            socket.socket.reconnect();

            if (socket.socket.connected) {
                $('#receiver').append('<li>Welcome back.</li>');
            }
        }
    }

    function startTrip(){
        //let the server know that this client will send attention data
        if (!connected){alert('not connected!')}
        else {
            var authentication_data =
            {
                "purpose": "realtime-sender",
                "userID": "u0044250",
                "groupID": "assistants"
            };
            socket.emit('start', JSON.stringify(authentication_data));
        }
    }

    //via socket.io (with fallback)
    function emitTripData(data){
        if (!connected){alert('not connected!')}
        else {
            socket.emit("rt-sensordata",JSON.stringify(data));
            console.log(data);
        }
    }

    function emitData_disconnect() {
        if (!connected){alert('not connected!')}
        else {

            console.log("bye bye");
            socket.emit('disconnect');
        }

    }

    function endTrip(data) {
        if (!connected){alert('not connected!')}
        else {

            socket.emit('endBikeTrip', JSON.stringify(data));
        }
    }

    function queryAll() {
        /*if (!connected){alert('not connected!')}
        else {

            socket.emit('trips');

        } */

        $.ajax({
            /*url: "http://dali.cs.kuleuven.be:8080/qbike/jsonp/trips",*/
			url: "http://dali.cs.kuleuven.be:8080/qbike/trips",
            // the name of the callback parameter, as specified by the YQL service
            jsonp: "callback",

            // tell jQuery we're expecting JSONP
            dataType: "jsonp",


            // work with the response
            success: function( response ) {
                $('#receiver').append('<li>' + JSON.stringify(response) + '</li>');
                console.log( response ); // server response
            }
        });

    }


    //do something when the page unloads
    $(window).bind('unload', function(){

        //emitData();
        socket.disconnect();
    });


    return {
        init: init,
        disconnect: emitData_disconnect,
        connect: connect,
        sendTripData: emitTripData,
        endTrip: endTrip,
        startTrip: startTrip,
        queryAll: queryAll

    };


})();

