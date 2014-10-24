var bol = bol || {};
var json;
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
            json = status;
            averagemax = [];
            averagemax[0] = ['Trip', 'Average Speed', 'Maximum Speed'];
            $.each(status, function(i, v) {
                averagemax[averagemax.length] = [averagemax.length, v.meta.averageSpeed, v.meta.maxSpeed];
                if (typeof averagemax[averagemax.length-1][1] === "undefined"){
                    averagemax[averagemax.length-1][1] = 0;
                    averagemax[averagemax.length-1][2] = 0;
                }
            });
            return averagemax
        }
    }

    function DataTemperature(status, URL){
        if (status == 'NO DATA'){
            return bol.controller.AJAX(URL, DataTemperature);
        }
        else {
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
            return temperature
        }
    }

    function Coordinates(status, URL){
        if (status === 'NO DATA'){
            return bol.controller.AJAX(URL, Coordinates);
        }
        else {
            coordinates = [];
            var C = status[0].sensorData;
            for (i=0; i < C.length; i++){
                if (C[i].sensorID == 1){
                    coordinates[coordinates.length] = [C[i].data[0].coordinates[0], C[i].data[0].coordinates[1]];
                }

            }
//            for (i=0;i<status.len)
//            coordinates[0] = ['Lat', 'Long'];
//            $.each(status, function(i, v) {
//                var C = v.sensorData[0].data[0].coordinates;
//                for (i = 0; i < C.length; i++) {
//                    coordinates[coordinates.length] = [C[i][1],C[i][0]];
//                }
//            });
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

    function Dataimg(status, URL, func){
        if (status === 'NO DATA'){
            return bol.controller.AJAX(URL, func);
        }
        else {
            image = []
            $.each(status, function(i, v) {
                var C = v.sensorData;
                for (i=0;i< C.length;i++){
                    if (C[i].sensorID == 8){
                        image[image.length] = C[i].data[0];
                    }
                }
            });
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
        AJAX:AJAX,
        DataAverageMax:DataAverageMax,
        Coordinates:Coordinates,
        Height:Height,
        DataTemperature:DataTemperature,
        Dataimg:Dataimg
    };

})();