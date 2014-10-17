var bol = bol || {};
var averagemax;
var coordinates;
var heights;
var temperature;
var image;

/**
 * This file serves as the controller and depends on everything in the js folder
 */

bol.controller = (function() {

    var assets; //all our ajax-loaded assets (templates and json data)
    var realtime = false;
    var tripID;

    function init() {

        //init trackers
        //bol.connectionHandler.init();

        $("#connect")
            .click(function( event ) {
                event.preventDefault();
                bol.connectionHandler.connect();
            });

        $("#startTrip")
            .click(function( event ) {
                event.preventDefault();
                bol.connectionHandler.startTrip();
            });


        $("#sendTestData")
            .click(function( event ) {
                event.preventDefault();
                bol.controller.sendTripData();
            });

        $("#endTrip")
            .click(function( event ) {
                event.preventDefault();
                bol.controller.endTrip();
            });

        $("#queryAll")
            .click(function( event ) {
                event.preventDefault();
                bol.controller.queryAll();
            });

        $("#clearMessages")
            .click(function( event ) {
                event.preventDefault();
                $('#receiver').empty();
            });
        $("#trips")
            .click(function( event ) {
                event.preventDefault();
                bol.controller.tripsassistants();
            });
    }

    // Example sensor data: array of sensor readings (cfr. wiki how to encode which sensors)
    var tripSensorDataArray = [
        {
            "sensorID": 0, //eg nb of breaks
            "timestamp": (new Date()).getTime(), //time of this sensor update
            "data": [
                {   "nbOfBreakHits":8,
                    "breaks":[(new Date()).getTime(), (new Date()).getTime(),(new Date()).getTime()]
                }]
        },
        {
            "sensorID": 1, //eg gps
            "timestamp": (new Date()).getTime(), //time of the update
            "data": [ //geoJSON - see http://geojson.org/
                { "type": "MultiPoint",
                    "coordinates": [ [100.0, 0.0], [101.0, 1.0] ]
                }
            ]
        }

    ];

    // Example sensor data: array of sensor readings (cfr. wiki how to encode which sensors)
    var tripSensorDataArray2 = [
        {
            "sensorID": 1, //eg gps
            "timestamp": (new Date()).getTime(), //time of the update
            "data": [ //geoJSON - see http://geojson.org/
                { "type": "MultiPoint",
                    "coordinates": [ [100.0, 4.0], [101.0, 4.0] ]
                }
            ]
        }

    ];

    function DataAverageMax(status, URL){
        if (status == 'NO DATA'){
            return bol.controller.AJAX(URL, DataAverageMax);
        }
        else {
            averagemax = [];
            averagemax[0] = ['Trip', 'Average Speed', 'Maximum Speed'];
            $.each(status, function(i, v) {
                averagemax[averagemax.length] = [averagemax.length, v.meta.averageSpeed, v.meta.maxSpeed];
            });
            if (averagemax.length > 50) {
                averagemax = averagemax.slice(averagemax.length - 50);
                averagemax.splice(0, 0, ['Trip', 'Average Speed', 'Maximum Speed']);
            }
            return averagemax
        }
    }

    function DataTemperature(status, URL){
        if (status == 'NO DATA'){
            return bol.controller.AJAX(URL, DataTemperature);
        }
        else {
            console.log(status);
            temperature = [];
            temperature[0] = ['Tijd', 'Temperature'];
            $.each(status, function(i, v) {
                var C = v.sensorData;
                for (i=0;i< C.length;i++){
                    if (C[i].sensorID == 3){
                        temperature[temperature.length] = [i, C[i].data[0].value];
                    }
                }
            });
            console.log(temperature);
            return temperature
        }
    }

    function Coordinates(status, URL){
        if (status === 'NO DATA'){
            return bol.controller.AJAX(URL, Coordinates);
        }
        else {
            coordinates = [];
//            coordinates[0] = ['Lat', 'Long'];
            $.each(status, function(i, v) {
                var C = v.sensorData[0].data[0].coordinates;
                for (i = 0; i < C.length; i++) {
                    coordinates[coordinates.length] = [C[i][1],C[i][0]];
                }
            });
            return coordinates
        }
    }

    function Height(status, coordinates){
        var URL = "http://json2jsonp.com/?url=https://maps.googleapis.com/maps/api/elevation/json?locations="
        if (status == 'NO DATA'){
            for (i=0;i<coordinates.length;i++){
                URL = URL.concat(coordinates[i][0],",",coordinates[i][1],"|");
            }
            URL = URL.slice(0,URL.length-1);
            URL = URL.concat("&key=AIzaSyDCRwgWbgGGM5zVCUJFJDIE3qSIYs1pATU");
            URL = URL.concat("&callback=Height");
            console.log(URL);
            return bol.controller.AJAX(URL, Height);
        }
        else {
            heights = [];
            heights[0] = ['#', 'Height'];
            for (i = 0; i < status.results.length;i++){
                heights[heights.length] = [i,status.results[i].elevation];
            }
            return coordinates
        }
    }

    function Dataimg(status, URL){
        if (status === 'NO DATA'){
            return bol.controller.AJAX(URL, Dataimg);
        }
        else {
            $.each(status, function(i, v) {
                var C = v.sensorData;
                for (i=0;i< C.length;i++){
                    if (C[i].sensorID == 8){
                        image = C[i].data[0];
                    }
                }
            });
            console.log(image);
            return image
        }
    }

    function AJAX(URL, callback) {
        /*if (!connected){alert('not connected!')}
         else {
         socket.emit('trips');
         } */

        $.ajax({
            /*url: "http://dali.cs.kuleuven.be:8080/qbike/jsonp/trips",*/
            url: URL,
            // the name of the callback parameter, as specified by the YQL service
            jsonp: "callback",
            // tell jQuery we're expecting JSONP
            dataType: "jsonp",

            // work with the response
            success: function( response ) {
                return callback(response, URL); // server response
            }
        });

    }

    return {
        init: init,
        AJAX:AJAX,
        DataAverageMax:DataAverageMax,
        Coordinates:Coordinates,
        Height:Height,
        DataTemperature:DataTemperature,
        Dataimg:Dataimg
    };

})();

$(document).ready(bol.controller.init);
