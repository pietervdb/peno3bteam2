var lapse = lapse || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var coordinates;
var ToolTipData;
var speeddataDual;
var GPS = 1;
var THERMO = 10;
var CAM = 8;


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

    function Sort(json, property){
        json.sort(sortByProperty(property));
    }

    function ConfigureJSON(json){
        $.each(json,function(i,v){
            (function CalculateDistance(){
                if (!v.distance){
                    var route = [];
                    $.each(v.sensorData,function(){
                        if (this.sensorID == GPS){
                            if (this.data[0].type == "MultiPoint") {
                                $.each(this.data[0].coordinates, function(){
                                    var a = new google.maps.LatLng(this[0],this[1]);
                                    route.push(a);
                                });
                            }
                            else if (this.data[0].type == "Point") {
                                var a = new google.maps.LatLng(this.data[0].coordinates[0],this.data[0].coordinates[1]);
                                route.push(a);
                            }
                        }
                    });
                    v.distance = google.maps.geometry.spherical.computeLength(route);
                    v.route = route;
                }
            })();

            (function ConfigureTime(){
                v.startTime = v.startTime || v.endTime;
                v.endTime = v.endTime || v.startTime;
                v.startTime = new Date(v.startTime);
                v.endTime = new Date(v.endTime);
            })();

            (function ConfigureSpeeds(){
                v.Speedavg = v.meta.averageSpeed || 0;
                v.Speedmax = v.meta.maxSpeed || 0;
            })();

            (function ConfigureSensorData(){
                if (!v.sensorData){
                    v.sensorData = [];
                }
            })();
        });
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
                AllTrips = status;
                ConfigureJSON(AllTrips);
                AllTrips.sort(sortByProperty('startTime'));
                ExtractAverageMax(AllTrips);
                thumbnail(AllTrips);
            }
        }
    }


    function ExtractAverageMax(json){
        averagemax = [['Trip', 'Average Speed', 'Maximum Speed']];
        $.each(json, function(i, v) {
            var currentDate = v.startTime;
            var C = v.sensorData;

            if (CONDITION(C.length, currentDate)) {
                var k = averagemax.length;
                averagemax.push([
                    k,
                    parseFloat((v.Speedavg*UNITMULTIPLIER).toFixed(2)),
                    parseFloat((v.Speedmax*UNITMULTIPLIER).toFixed(2))
                ]);
            }
        });
        console.log(averagemax);
        if (averagemax.length > 1){
            drawAverageMaxChart();
        }
        else {
            NODATA();
        }
    }

    function ExtractTrip(json, trip){
        TripInfo = json[trip];
        ExtractData(TripInfo);
        return false
    }

    function ExtractData(json){
        //coordinates = [];
        ToolTipData = {Timestamp:[],Speed:[], Images:[], Temp:[]};
        speeddataDual = [];

        var time = json.startTime;
        var averageSpeed = parseFloat((json.Speedavg*UNITMULTIPLIER).toFixed(2));
        var maxSpeed = parseFloat((json.Speedmax*UNITMULTIPLIER).toFixed(2));
        var textavg = (averageSpeed == 0)? "/" : averageSpeed + " " + UNIT;
        var textmax = (maxSpeed == 0)? "/" : maxSpeed + " " + UNIT;

        $("<p class='tripdata'>" + dateFormat(time)+"</p>").appendTo($("#dateinfo"));
        $("<p class='tripdata'>").text(textavg).appendTo($("#AVSPEED"));
        $("<p class='tripdata'>").text(textmax).appendTo($("#MAXSPEED"));

        var C = json.sensorData;
        var timelapseid = $("#timelapse");
        $.each(C,function() {
            switch (this.sensorID) {
                case GPS: //coordinaten
                    if (this.data[0].type == "Point") {
                        console.log(this.timestamp);
                        ToolTipData.Timestamp.push(this.timestamp);
                        if (this.data[0].speed){
                            var sp = parseFloat((this.data[0].speed[0]*UNITMULTIPLIER).toFixed(2));
                            speeddataDual.push(sp);
                            ToolTipData.Speed.push(sp);
                        }
                        else{
                            speeddataDual.push(0);
                            ToolTipData.Speed.push(null);
                        }

                    }
                    break;

                case THERMO: //temperatuur
                    ToolTipData.Temp.push(this.data[0].temperature[0]);
                    break;

                case CAM: //images
                    var str = '<img src="' + imageURL.concat(this.data[0]) + '">';
                    var strhidden = '<img class="hidden" src="' + imageURL.concat(this.data[0]) + '">';
                    ToolTipData.Images.push(str);
                    $(strhidden).appendTo(timelapseid);
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
                map(json);
                timelapseid.children(":first").removeClass("hidden").addClass("active-img");
                //Starten van timelapse wanneer afbeeldingen geladen zijn
                if (timelapseid.children()[0]){
                    timelapseid.waitForImages(function(){
                        $("#timelapse-canvas").show();
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
        Sort:Sort,
        GroupData:GroupData,
        ExtractAverageMax:ExtractAverageMax,
        ExtractTrip:ExtractTrip
    };

})();