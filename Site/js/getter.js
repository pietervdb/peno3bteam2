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
                    //if (v.meta.averageSpeed > 28){
                    //    averagemax.push([k,15, 18]);
                    //}
                    //else{
                        averagemax.push([k, v.meta.averageSpeed, v.meta.maxSpeed]);
                    //}
                }
                else {
                    averagemax.push([k, 0, 0])
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
        var B = json.meta;

        if (typeof B.averageSpeed !== "undefined"){
            $("<p class='tripdata'>").text(B.averageSpeed + " m/s").appendTo($("#AVSPEED"));
        }
        else {
            $("<p class='tripdata'>").text("/").appendTo($("#AVSPEED"));
        }

        if (typeof B.maxSpeed !== "undefined"){
            $("<p class='tripdata'>").text(B.maxSpeed + " m/s").appendTo($("#MAXSPEED"));
        }
        else{
            $("<p class='tripdata'>").text("/").appendTo($("#MAXSPEED"));
        }

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

        if ( timelapseid.children().length == 0){
            $("#left-column").hide();
            $("#right-column").attr("class", "col-md-12 col-lg-12");
        }
        else {
            $("#left-column").show();
            $("#right-column").attr("class", "col-md-6 col-lg-6");
        }

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

    function AJAX(URL, callback) {

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
        GroupData:GroupData,
        ExtractAverageMax:ExtractAverageMax,
        ExtractTrip:ExtractTrip
    };

})();