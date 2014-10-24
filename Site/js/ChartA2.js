/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart", "map", "controls"]});
bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=cwa2");
//bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
//bol.controller.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
//bol.controller.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2", img);
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

//checking averagemaxgraph data
function checkVariable(){
    if (typeof averagemax !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        img(json);
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}

function checkMap(){
    if (typeof coordinates !== "undefined" && coordinates != "NONE"){
        google.setOnLoadCallback(map());
    }
    else{
        window.setTimeout("checkMap();",100);
    }
}

function checkVariable1(){
    if (typeof averagemax !== "undefined" && typeof coordinates !== "undefined" && typeof temperature !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        google.setOnLoadCallback(map());
        google.setOnLoadCallback(drawTemp());
        bol.controller.Height('NO DATA', coordinates);
    }
    else{
        window.setTimeout("checkVariable1();",100);
    }
}

//checking heights data
function checkVariable2(){
    if (typeof heights !== "undefined"){
        google.setOnLoadCallback(drawHeights());
//        window.setTimeout("unhide();",100);
    }
    else{
        window.setTimeout("checkVariable2();",100);
    }
}

function img(json){
    for (i = json.length-12; i<json.length; i++){
        $("#thumbnails").append("<li>");
        $("#thumbnails li:last-child").attr("class", "col-sm-4 col-md-1 col-lg-1").append("<button>");
        $("#thumbnails li:last-child button").attr("class","thumbnail btn-default").attr("id", json[i]._id).attr("type", "button").append("<img>").append("<p>");
        $("#thumbnails li:last-child button img").attr("src", "foto/foto1.png").attr("class");
        $("#thumbnails li:last-child button p").text(json[i].startTime.slice(5,10));
    }

    $(".thumbnail").click(function () {
        coordinates = "NONE";
        URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/";
        URL = URL.concat(this.id);
        URL = URL.concat("/sensors");
        bol.controller.Coordinates('NO DATA', URL);
        checkMap();
    });
}

function drawAverageMaxAssistentsChart() {

    dataaveragemax = google.visualization.arrayToDataTable(averagemax);
    console.log(averagemax);

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
        $('#filter_mobile').removeClass("hidden");

        $( "#filter_mobile" ).rangeSlider({
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
    $(".map").removeClass("hidden");

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
    checkVariable1();
    checkVariable2();
});