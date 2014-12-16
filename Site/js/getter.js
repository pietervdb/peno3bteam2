var lapse = lapse || {};
var AllTrips;
var TripInfo = 'NONE';
var averagemax;
var ToolTipData;
var speeddataDual;
var GPS = 1;
var CAM = 8;
var BARO = 10;


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

    function ComputeAverage(array){
        var sum = 0;
        var l = array.length;
        $.each(array, function(i,v){
            sum += parseFloat(v);
        });
        var average = sum / l;
        average = parseFloat(average.toFixed(2));
        if (!average){
            average = 0;
        }
        return average
    }

    function ConfigureJSON(json){
        $.each(json,function(i,v){
            var endtime = new Date(70,0,1,1,0,0,0);
            var speeds = [];
            var maxspeed = 0;
            var averagespeed = 0;
            (function ConfigureSensorData(){
                if (!v.sensorData){
                    v.sensorData = [];
                }
            })();

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
                                var coortime = new Date(this.timestamp);
                                var currentspeed = this.data[0].speed[0];
                                var a = new google.maps.LatLng(this.data[0].coordinates[0],this.data[0].coordinates[1]);
                                route.push(a);
                                speeds.push(currentspeed);
                                if (coortime > endtime){
                                    endtime = coortime;
                                }
                                if (currentspeed > maxspeed){
                                    maxspeed = currentspeed;
                                }

                            }
                        }
                    });
                    if (route[0][0] >= 100){
                        $.each(route, function(){
                            var x = this[0];
                            var y = this[1];
                            var x1 = (x - x%100)/100;
                            var x2 = x%100 - x%1;
                            var x3 = (x%1)*100;
                            var ddx = x1 + x2/60 + x3/3600;
                            var y1 = (y - y%100)/100;
                            var y2 = y%100 - y%1;
                            var y3 = (y%1)*100;
                            var ddy =y1+y2/60 + y3/3600;

                            this[0] = ddx;
                            this[1] = ddy;
                        });
                    }
                    v.distance = google.maps.geometry.spherical.computeLength(route);
                    v.route = route;
                }
            })();

            (function ConfigureTime(){
                v.startTime = new Date(v.startTime);
                v.endTime = endtime;
                v.startTime = (v.startTime=='Invalid Date')? v.endTime:v.startTime;
            })();

            (function ConfigureSpeeds(){
                averagespeed = ComputeAverage(speeds);
                v.Speedavg = v.meta.averageSpeed || averagespeed;
                v.Speedmax = v.meta.maxSpeed || maxspeed;
            })();

        });
    }

    function GroupData(status, URL){
        if (status == 'NO DATA'){
            return lapse.getter.AJAX(URL, GroupData);
        }
        else {
            if (status.length == 0){
                AllTrips = [];
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
        averagemax = [['Trip', 'Average Speed (' + UNITSPEED + ')', 'Maximum Speed (' + UNITSPEED + ')']];
        $.each(json, function(i, v) {
            var currentDate = v.startTime;
            var C = v.sensorData;

            if (CONDITION(C.length, currentDate, json[i].Speedavg*UNITMULTIPLIER, json[i].distance/UNITMULTIPLIERDIST)) {
                var k = averagemax.length;
                averagemax.push([
                    k,
                    parseFloat((v.Speedavg*UNITMULTIPLIER).toFixed(2)),
                    parseFloat((v.Speedmax*UNITMULTIPLIER).toFixed(2))
                ]);
            }
        });
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
        ToolTipData = {Timestamp:[], Coordinates: json.route, Speed:[],Height:[], Images:[], Temp:[], Pressure:[]};
        speeddataDual = [];
        GMCoordinates = json.route;

        var starttime = json.startTime;
        var endtime = json.endTime;
        var averageSpeed = parseFloat((json.Speedavg*UNITMULTIPLIER).toFixed(2));
        var maxSpeed = parseFloat((json.Speedmax*UNITMULTIPLIER).toFixed(2));
        var textavg = (averageSpeed == 0)? "/" : averageSpeed + " " + UNITSPEED;
        var textmax = (maxSpeed == 0)? "/" : maxSpeed + " " + UNITSPEED;

        $("<p class='tripdata'>" + starttime.format("HH:MM:ss") +  " - " + endtime.format("HH:MM:ss") + ", " + starttime.format("dddd, mmmm d, yyyy")  + "</p>").appendTo($("#dateinfo"));
        $("<p class='tripdata'>").text(textavg).appendTo($("#AVSPEED"));
        $("<p class='tripdata'>").text(textmax).appendTo($("#MAXSPEED"));

        if (GMCoordinates.length > 0) {
            // Create an ElevationService.
            elevator = new google.maps.ElevationService();
            loadElev();
        }

        var C = json.sensorData;
        var timelapseid = $("#timelapse");
        $.each(C,function() {
            switch (this.sensorID) {
                case GPS: //coordinaten
                    if (this.data[0].type == "Point") {
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

                case BARO: //temperatuur
                    ToolTipData.Temp.push(this.data[0].temperature[0]);
                    var P = this.data[0].pressure[0];
                    if (800 < P && P < 1100){
                        ToolTipData.Pressure.push(this.data[0].pressure[0]);
                    }
                    else {
                        ToolTipData.Pressure.push(null);
                    }
                    break;

                case CAM: //images
                    var time = this.timestamp;
                    var timeindex = ToolTipData.Timestamp.indexOf(time);
                    var str = '<img src="' + imageURL.concat(this.data[0]) + '">';
                    var strhidden = '<img class="hidden" src="' + imageURL.concat(this.data[0]) + '">';
                    if (timeindex != -1){
                        ToolTipData.Images[timeindex] = str;
                    }
                    else{
                        ToolTipData.Images.push(str);
                    }
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
                drawTemp();
                timelapseid.children(":first").removeClass("hidden").addClass("active-img");
                //Starten van timelapse wanneer afbeeldingen geladen zijn
                if (timelapseid.children()[0]){
                    timelapseid.waitForImages(function(){
                        $("#timelapse-canvas").show();
                        var h = $("#left-column").height();
                        $("#map-canvas").height(h);
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
        ExtractTrip:ExtractTrip,
        ExtractData:ExtractData
    };

})();
