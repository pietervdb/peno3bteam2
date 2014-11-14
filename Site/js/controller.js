var bol = bol || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var coordinates;
var heights;
var temperature;
var image;
var GPS = 1;
var CAM = 8;

bol.controller = (function() {

    function DataAverageMax(status, URL){
        if (status == 'NO DATA'){
            return bol.controller.AJAX(URL, DataAverageMax);
        }
        else {
            AllTrips = status;
            averagemax = [];
            averagemax[0] = ['Trip', 'Average Speed', 'Maximum Speed'];
            $.each(status, function(i, v) {
                var k = averagemax.length;
                if (v.meta != null) {
                    averagemax.push([k, v.meta.averageSpeed, v.meta.maxSpeed]);
                }
                else {
                    averagemax.push([k, undefined, undefined])
                }
                if (typeof averagemax[k-1][1] === "undefined"){
                    averagemax[k-1][1] = 0;
                }
                if (typeof averagemax[k-1][2] === "undefined") {
                    averagemax[k-1][2] = 0;
                }
            });
            return averagemax
        }
    }

    function GetTrip(status, URL){
        if (status === 'NO DATA'){
            return bol.controller.AJAX(URL, GetTrip);
        }
        else {
            TripInfo = status;
            ExtractCoordinates(TripInfo);
        }
    }

    function ExtractTrip(json, trip){
        $.each(json, function(i, v) {
            if (v._id == trip){
                TripInfo = v;
                ExtractCoordinatesfromExtractTrip(TripInfo);
                return
            }
        });
    }

    function ExtractCoordinatesfromExtractTrip(json){
        coordinates = [];
        var C = json.sensorData;
        $.each(C,function() {
            if (this.sensorID == GPS && this.data[0].type == "MultiPoint") {
                $.each(this.data[0].coordinates, function(){
                    coordinates.push([this[0], this[1]]);
                });
            }
        });
    }

    function ExtractCoordinates(json){
        coordinates = [];
        var C = json[0].sensorData;
        $.each(C,function(){
            if (this.sensorID == GPS){
                coordinates.push([this.data[0].coordinates[0], this.data[0].coordinates[1]]);
            }
        });
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
                $.each(C,function(){
                    if (this.sensorID == THERMO){
                        temperature.push([i, this.data[0].value]);
                    }
                });
            });
            return temperature
        }
    }

//    function Coordinates(status, URL){
//        if (status === 'NO DATA'){
//            return bol.controller.AJAX(URL, Coordinates);
//        }
//        else {
//            coordinates = [];
//            var C = status[0].sensorData;
//            for (i=0; i < C.length; i++){
//                if (C[i].sensorID == 1){
//                    coordinates[coordinates.length] = [C[i].data[0].coordinates[0], C[i].data[0].coordinates[1]];
//                }
//
//            }
////            for (i=0;i<status.len)
////            coordinates[0] = ['Lat', 'Long'];
////            $.each(status, function(i, v) {
////                var C = v.sensorData[0].data[0].coordinates;
////                for (i = 0; i < C.length; i++) {
////                    coordinates[coordinates.length] = [C[i][1],C[i][0]];
////                }
////            });
//            return coordinates
//        }
//    }

    function Height(status, coordinates){
        var URL = "http://json2jsonp.com/?url=https://maps.googleapis.com/maps/api/elevation/json?locations=";
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
            image = [];
            $.each(status, function(i, v) {
                var C = v.sensorData;
                $.each(C,function(){
                    if (this.sensorID == CAM){
                        image.push(this.data[0]);
                    }
                });
            });
            return image
        }
    }

    function AJAX(URL, callback) {

        $.ajax({
            /*url: "http://dali.cs.kuleuven.be:8080/qbike/jsonp/trips",*/
            url: URL,
            // the name of the callback parameter, as specified by the YQL service
            jsonp: "callback",
            // tell jQuery we're expecting JSONP
            dataType: "jsonp",

            beforeSend: function(){
                console.log("a");
                $("#ajaxcall").removeClass("hidden");
            },

            complete: function(){
                console.log("b");
                $("#ajaxcall").addClass("hidden");
            },
            // work with the response
            success: function( response ) {
                console.log("c");
                return callback(response, URL); // server response
            }
        });

    }

    return {
        AJAX:AJAX,
        GetTrip:GetTrip,
        ExtractTrip:ExtractTrip,
        DataAverageMax:DataAverageMax,
        //Coordinates:Coordinates,
        Height:Height,
        DataTemperature:DataTemperature,
        Dataimg:Dataimg
    };

})();