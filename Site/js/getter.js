var lapse = lapse || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var coordinates;
var heights;
var speeddata;
var temperature;
var image;
var GPS = 1;
var THERMO = 3;
var CAM = 8;
var month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];


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
            var currentDate = new Date(v.startTime);
            if (C == null){
                C = [];
            }
            if (CONDITION(C.length,currentDate)) {
                var k = averagemax.length;
                if (v.meta != null) {
                    averagemax.push([k, v.meta.averageSpeed*UNITMULTIPLIER, v.meta.maxSpeed*UNITMULTIPLIER]);
                }
                else {
                    averagemax.push([k, 0, 0])
                }
                if (!averagemax[k - 1][1]) {
                    averagemax[k - 1][1] = 0;
                }
                if (!averagemax[k - 1][2]) {
                    averagemax[k - 1][2] = 0;
                }
            }
        });
        drawAverageMaxChart();
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
        speeddata = [['distance', 'Speed']];
        var Start = new Date(json.startTime);
        var B = json.meta;
        var averageSpeed = (Math.round((B.averageSpeed*UNITMULTIPLIER)*100))/100;
        var maxSpeed = (Math.round((B.maxSpeed*UNITMULTIPLIER)*100))/100;

        if (B.averageSpeed){
            $("<p class='tripdata'>").text(averageSpeed + " " + UNIT).appendTo($("#AVSPEED"));
        }
        else {
            $("<p class='tripdata'>").text("/").appendTo($("#AVSPEED"));
        }

        if (B.maxSpeed){
            $("<p class='tripdata'>").text(maxSpeed*UNITMULTIPLIER + " " + UNIT).appendTo($("#MAXSPEED"));
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
                        if (this.data[0].speed) {
                            speeddata.push(["", this.data[0].speed[0] * UNITMULTIPLIER]);
                        }
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
                drawSpeeds();
                timelapseid.children(":first").removeClass("hidden").addClass("active-img");
            }});
        //map();

        //Starten van timelapse wanneer afbeeldingen geladen zijn
        if (timelapseid.children()[0]){
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