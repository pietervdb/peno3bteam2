var lapse = lapse || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var coordinates;
var heights;
var temperature;
var image;
var GPS = 1;
var THERMO = 3;
var CAM = 8;

//TODO Delete unused code
//TODO calculate total distance
//TODO calculate average speed if possible


lapse.getter = (function() {

    function GroupData(status, URL){
        if (status == 'NO DATA'){
            return lapse.getter.AJAX(URL, GroupData);
        }
        else {
            if (status.length == 0){
                return NODATA()
            }
            else {
                AllTrips = status;
                ExtractAverageMax(AllTrips);
                thumbnail(AllTrips);
            }
        }
    }

    function ExtractAverageMax(json){
        averagemax = [];
        averagemax[0] = ['Trip', 'Average Speed', 'Maximum Speed'];
        $.each(json, function(i, v) {
            var C = v.sensorData;
            if (C == null){
                C = [];
            }
            if (C.length != mindata) {
                var k = averagemax.length;
                if (v.meta != null) {
                    averagemax.push([k, v.meta.averageSpeed, v.meta.maxSpeed]);
                }
                else {
                    averagemax.push([k, undefined, undefined])
                }
                if (typeof averagemax[k - 1][1] === "undefined") {
                    averagemax[k - 1][1] = 0;
                }
                if (typeof averagemax[k - 1][2] === "undefined") {
                    averagemax[k - 1][2] = 0;
                }
            }
        });
        google.setOnLoadCallback(drawAverageMaxChart());
        return averagemax
    }

    function ExtractTrip(json, trip){
        $.each(json, function(i, v) {
            if (v._id == trip){
                TripInfo = v;
                ExtractData(TripInfo);
                return false
            }
        });
    }

    function ExtractData(json){
        coordinates = [];
        temperature = [];
        var C = json.sensorData;
        var timelapseid = $("#timelapse");
        $.each(C,function() {
            switch (this.sensorID) {
                case GPS: //coordinaten
                    if (this.data[0].type == "MultiPoint") {
                        $.each(this.data[0].coordinates, function(){
                            coordinates.push([this[0], this[1]]);
                        });
                    }
                    else if (this.data[0].type == "Point") {
                        coordinates.push([this.data[0].coordinates[0], this.data[0].coordinates[1]]);
                    }
                    break;

                case THERMO: //temperatuur
                    temperature.push([this.data[0].value]);
                    break;

                case CAM: //images
                    timelapseid.append("<img>");
                    timelapseid.children("img:last").attr("src", imageURL.concat(this.data[0])).attr("class", "hidden");
                    break;


            }

        });
        $("#tripinfo").slideDown({
            duration:"slow",
            easing: "swing" ,
            step: function(){
                $('html, body').animate({ scrollTop:  $("#tripinfo").offset().top - 50 }, 0);
            },
            complete: function() {
                //$("html, body").stop();
                map();
                timelapseid.children(":first").removeClass("hidden").addClass("active-img");
            }});
        //map();

        //Starten van timelapse wanneer afbeeldingen geladen zijn
        if (typeof timelapseid.children()[0] !== "undefined"){
            $("img").load(timelapse());
        }
    }

    //unused
    function Height(status, coordinates){
        var URL = "http://json2jsonp.com/?url=https://maps.googleapis.com/maps/api/elevation/json?locations=";
        if (status == 'NO DATA'){
            for (i=0;i<coordinates.length;i++){
                URL = URL.concat(coordinates[i][0],",",coordinates[i][1],"|");
            }
            URL = URL.slice(0,URL.length-1);
            URL = URL.concat("&key=AIzaSyDCRwgWbgGGM5zVCUJFJDIE3qSIYs1pATU");
            URL = URL.concat("&callback=Height");
            return lapse.getter.AJAX(URL, Height);
        }
        else {
            heights = [];
            heights[0] = ['#', 'Height'];
            $.each(status.results, function(i,v) {
                heights.push(["", v.elevation])
            });
            //for (i = 0; i < status.results.length;i++){
            //    heights[heights.length] = [i,status.results[i].elevation];
            //}
            drawHeights();
            return coordinates
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
                $("#ajaxcall").removeClass("hidden");
            },

            complete: function(){
                $("#ajaxcall").addClass("hidden");
            },
            // work with the response
            success: function( response ) {
                return callback(response, URL); // server response
            }
        });

    }

    return {
        AJAX:AJAX,
        GroupData:GroupData,
        ExtractAverageMax:ExtractAverageMax,
        ExtractTrip:ExtractTrip,
        Height:Height
    };

})();