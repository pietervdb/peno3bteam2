var lapse = lapse || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var coordinates;
var ToolTipData;
var heights;
var speeddata;
var speeddataDual;
var temperature;
var image;
var GPS = 1;
var THERMO = 10;
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

    function sortByProperty(property) {
        'use strict';
        return function (a, b) {
            var sortStatus = 0;
            if (a[property] < b[property]) {
                sortStatus = -1;
            } else if (a[property] > b[property]) {
                sortStatus = 1;
            }

            return sortStatus;
        };
    }

    function GroupData(status, URL){
        if (status == 'NO DATA'){
            return lapse.getter.AJAX(URL, GroupData);
        }
        else {
            if (status.length == 0){
                return NODATA()
            }
            else {
                status.sort(sortByProperty('startTime'));
                console.log(status);
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
            var currentDate = new Date(v.startTime);
            var C = v.sensorData;
            if (C == null){
                C = [];
            }
            if (CONDITION(C.length, currentDate)) {
                    var k = averagemax.length;
                if (v.meta != null) {
                    averagemax.push([k, (Math.round((v.meta.averageSpeed*UNITMULTIPLIER)*100))/100, (Math.round((v.meta.maxSpeed*UNITMULTIPLIER)*100))/100]);
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

    function ExtractTrip(json, trip, time){
        //$.each(json, function(i, v) {
        //    if (v._id == trip){
        //        TripInfo = v;
        //        ExtractData(TripInfo, time);
        //        return false
        //    }
        //});
        TripInfo = json[trip];
        ExtractData(TripInfo,time);
        return false
    }

    function ExtractData(json, time){
        coordinates = [];
        temperature = [];
        ToolTipData = {Timestamp:[],Speed:[], Images:[], Temp:[]};
        speeddata = [['distance', 'Speed']];
        speeddataDual = [];
        var B = json.meta;
        var averageSpeed = (Math.round((B.averageSpeed*UNITMULTIPLIER)*100))/100;
        var maxSpeed = (Math.round((B.maxSpeed*UNITMULTIPLIER)*100))/100;
        $("<p class='tripdata'>" + dateFormat(time)+"</p>").appendTo($("#dateinfo"));

        if (B.averageSpeed){
            $("<p class='tripdata'>").text(averageSpeed + " " + UNIT).appendTo($("#AVSPEED"));
        }
        else {
            $("<p class='tripdata'>").text("/").appendTo($("#AVSPEED"));
        }

        if (B.maxSpeed){
            $("<p class='tripdata'>").text(maxSpeed + " " + UNIT).appendTo($("#MAXSPEED"));
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
                            var sp = (Math.round((this.data[0].speed[0]*UNITMULTIPLIER)*100))/100;
                            speeddata.push(["", sp]);
                            speeddataDual.push(sp);
                            ToolTipData.Speed.push(sp);
                            ToolTipData.Timestamp.push(this.timestamp);
                        }
                    }
                    break;

                case THERMO: //temperatuur
                    console.log(this.data[0].temperature[0]);
                    temperature.push([this.data[0].temperature[0]]);
                    ToolTipData.Temp.push(this.data[0].temperature[0]);
                    break;

                case CAM: //images
                    var str = '<img src="' + imageURL.concat(this.data[0]) + '">';
                    var strhidden = '<img class="hidden" src="' + imageURL.concat(this.data[0]) + '">';
                    ToolTipData.Images.push(str);
                    $(strhidden).appendTo(timelapseid);
                    //timelapseid.append("<img>");
                    //timelapseid.children("img:last").attr("src", imageURL.concat(this.data[0])).attr("class", "hidden");
                    break;
            }

        });

        if ( timelapseid.children().length == 0){
            $("#left-column").hide();
            $("#right-column").attr("class", "col-md-12 col-lg-12").css("padding-left", "17px");
        }
        else {
            $("#left-column").show();
            $("#right-column").attr("class", "col-md-6 col-lg-6").css("padding-left", "2px");
        }

        $("#tripinfo").slideDown({
            duration:"slow",
            easing: "swing" ,
            step: function(){
                $('html, body').animate({ scrollTop:  $("#tripinfo").offset().top - 50 }, 0);
            },
            complete: function() {
                map();
                drawSpeeds();
                timelapseid.children(":first").removeClass("hidden").addClass("active-img");
                //Starten van timelapse wanneer afbeeldingen geladen zijn
                if (timelapseid.children()[0]){
                    timelapseid.waitForImages(function(){
                        $("#timelapse-canvas").show();
                        //timelapse()
                    })
                }
            }
        });
    }

    function AJAX(URL, callback) {

        $.ajax({
            /*url: "http://dali.cs.kuleuven.be:8080/qbike/jsonp/trips",*/
            url: URL,
            // the name of the callback parameter, as specified by the YQL service
            jsonp: "callback",
            // tell jQuery we're expecting JSONP
            dataType: "jsonp",

            error: function() {NODATA()},
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
