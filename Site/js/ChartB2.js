/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart", "map", "controls"]});
bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2");
//bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
//bol.controller.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
//bol.controller.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2", img);
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
var interval

//checking averagemaxgraph data
function checkVariable(){
    if (typeof averagemax !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        thumbnail(json);
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}

function checkData(){
    if (typeof coordinates !== "undefined" && coordinates != "NONE" && TripInfo !== 'NONE'){
        google.setOnLoadCallback(map());
        images(TripInfo);
    }
    else{
        window.setTimeout("checkData();",100);
    }
}

//function checkVariable1(){
//    if (typeof averagemax !== "undefined" && typeof coordinates !== "undefined" && typeof temperature !== "undefined"){
//        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
//        google.setOnLoadCallback(map());
//        google.setOnLoadCallback(drawTemp());
//        bol.controller.Height('NO DATA', coordinates);
//    }
//    else{
//        window.setTimeout("checkVariable1();",100);
//    }
//}
//
////checking heights data
//function checkVariable2(){
//    if (typeof heights !== "undefined"){
//        google.setOnLoadCallback(drawHeights());
////        window.setTimeout("unhide();",100);
//    }
//    else{
//        window.setTimeout("checkVariable2();",100);
//    }
//}

function thumbnail(json){
    for (i = json.length-12; i<json.length; i++){
        var C = json[i].sensorData;
        $("#thumbnails").append("<div>");
        $("#thumbnails div:last-child").attr("class", "col-xs-3 col-sm-2 col-md-1 col-lg-1").append("<button>");
        $("#thumbnails div:last-child button").attr("class","thumbnail btn-default").attr("id", json[i]._id).attr("type", "button").append("<img>").append("<p>");
        $("#thumbnails div:last-child button img").attr("src", "foto/foto1.png");
        $("#thumbnails div:last-child button p").text(json[i].startTime.slice(5,10));
        for (j=0;j< C.length;j++) {
            if (C[j].sensorID == 8) {
                $("#thumbnails div:last-child button img").attr("src", imageURL.concat(C[j].data[0]));
                break
            }
        }
    }

    $(".thumbnail").click(function () {
        coordinates = "NONE";
        URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/";
        URL = URL.concat(this.id);
        //URL = URL.concat("/sensors");
        bol.controller.GetTrip('NO DATA', URL)
        bol.controller.Coordinates('NO DATA', URL.concat("/sensors"));
        $("#tripinfo").removeClass("hidden");
        clearInterval(interval);
        console.log($("#timelapse").children());
        while ($("#timelapse").children().length != 0) {
            console.log("remove");
            $("#timelapse img:first-child").remove();
        }
        checkData();
    });
}

function images(gegevens){
    var C = gegevens[0].sensorData;
    for (j=0;j< C.length;j++) {
        if (C[j].sensorID == 8) {
            $("#timelapse").append("<img>");
            $("#timelapse img:last-child").attr("src", imageURL.concat(C[j].data[0])).attr("class", "hidden");
        }
        $("#timelapse img:first-child").removeClass("hidden").addClass("active-img");
    }
    timelapse();
}

function timelapse() {

    interval = setInterval( showDiv, 100);

    function showDiv() {
        var currentimg = $('.active-img');
        var nextimg = currentimg.next();
        if(nextimg.length === 0) {
            nextimg = $('#timelapse img:first-child');
        }
        currentimg.removeClass('active-img').addClass("hidden");
        nextimg.addClass('active-img').removeClass("hidden");

    }}

function drawAverageMaxAssistentsChart() {

    dataaveragemax = google.visualization.arrayToDataTable(averagemax);

    dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));

    var chart = new google.visualization.ChartWrapper({
        'chartType': 'ColumnChart',
        'containerId': 'chart_div',
        'options': {
            'legend': 'top',
//            'title': 'Average Speed',
            'backgroundColor': '#dcdcdc',
            'vAxis': {maxValue: 33, minValue:0},
            'hAxis': {title:"Tripnumber"},
            'animation':{
                'duration':'250'
            }
        }
    });

    controlWrapper = new google.visualization.ControlWrapper({
        'controlType': 'ChartRangeFilter',
        'containerId': 'control_div',
        'options': {
            'width': "80%",
            'filterColumnLabel': 'Trip',
            'ui':{
                'chartType': 'AreaChart',
                'chartOptions':{
                    'backgroundColor':'#dcdcdc',
                    'chartArea': {
                        'width':'80%'
                    }
                }
            }
        }
    });

    dashboard.bind(controlWrapper, chart);
    dashboard.draw(dataaveragemax);

    if ( is_mobile )
    {
        $('#control_div').addClass("hidden");
        $('#filter_mobile').removeClass("hidden").rangeSlider({
            bounds: {
                min: 0,
                max: averagemax.length - 1
            },
            defaultValues: {
                min: averagemax.length -30,
                max: averagemax.length - 1
            },
            arrows: true,
            wheelMode: null
        }).bind('valuesChanged', function(e, data) {
            controlWrapper.setState({range: { start: data.values.min, end: data.values.max }});
            controlWrapper.draw();
        });
//        $( "#filter_mobile" ).editRangeSlider({type: "number"});
//        $('#filter_mobile').draggable();
    }

}

function map() {
    var coor = [];
    bounds  = new google.maps.LatLngBounds();

    for (i=0; i<coordinates.length; i++){
        coor[coor.length] = new google.maps.LatLng(coordinates[i][0],coordinates[i][1]);
        bounds.extend(coor[i])
    }
    var mapOptions = {
        scrollwheel: false
    };
    $("#tripinfo").removeClass("hidden");

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var marker = new google.maps.Marker({
        position: coor[0],
        map: map
    });

    var marker = new google.maps.Marker({
        position: coor[coor.length-1],
        map: map
    });

    map.fitBounds(bounds);
    map.panToBounds(bounds);
    var flightPath = new google.maps.Polyline({
        path: coor,
        geodesic: true,
        strokeColor: '#FF00FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);

}

function drawHeights() {
    var data = google.visualization.arrayToDataTable(heights);

    var options = {
        title: 'Elevation',
        backgroundColor: '#dcdcdc',
        hAxis: {title:"Distance"},
        legend:{
            position:'none'
        }
    };

    var chart = new google.visualization.AreaChart(document.getElementById('heightschart'));

    chart.draw(data, options);
}

function drawTemp() {
    var data = google.visualization.arrayToDataTable(temperature);

    var options = {
        title: 'Temperature',
        backgroundColor: '#dcdcdc',
        vAxis: {maxValue: 33, minValue:0},
        hAxis: {title:"Tripnumber"}

    };

    var chart = new google.visualization.AreaChart(document.getElementById('tempchart'));

    chart.draw(data, options);
}

// ChartRangeFilter doesn't work on mobile. Use a dateRangeSlider to manipulate it

$(window).resize(function(){
    dashboard.draw(dataaveragemax);
//    drawHeights();
//    drawTemp();
//    map();
});
$(document).ready(function(){
    checkVariable();
    //checkVariable1();
    //checkVariable2();
});