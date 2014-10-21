/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart", "map", "controls"]});
bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=assistants");
bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
bol.controller.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
bol.controller.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2", img);
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";


//checking averagemaxgraph data
function checkVariable1(){
    if (typeof averagemax !== "undefined" && typeof coordinates !== "undefined" && typeof temperature !== "undefined" && typeof image !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        google.setOnLoadCallback(map());
        google.setOnLoadCallback(drawTemp());
        bol.controller.Height('NO DATA', coordinates);
//        var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
//        for (i = 0; i<image.length; i++){
//            $("#image").prepend("<img>");
//            $("#image img:nth-child(1)").attr("src", imageURL.concat(image[i])).removeClass("hidden");
//        }
//        $("#imagethumb").attr("src", imageURL.concat(image[0]));
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
function select() {
    $(".thumbnail").click(function () {
        console.log("click");
        $(".charts").removeClass("hidden");
    });
}

function img(json, URL){
    image = []
    $.each(json, function(i, v) {
        var C = v.sensorData;
        for (i=0;i< C.length;i++){
            if (C[i].sensorID == 8){
                image[image.length] = C[i].data[0];
            }
        }
    });
    for (i = 5; i<image.length; i++){
        $("#thumbnails").append("<li>");
        $("#thumbnails li:last-child").attr("class", "col-sm-6 col-md-2 col-lg-2");
        $("#thumbnails li:last-child").append("<button>");
        $("#thumbnails li:last-child button").attr("class","thumbnail btn-default").attr("href", "#");
        $("#thumbnails li:last-child button").append("<img>");
        $("#thumbnails li:last-child button img").attr("src", imageURL.concat(image[i])).attr("class", "image-responsive");
        }
    return image
}

function unhide(){
    console.log("unhide");
    $('.charts').fadeIn(200).removeClass("hidden");
    dashboard.draw(dataaveragemax);
    drawHeights();
    drawTemp();
    map();
    $("#image").fadeIn(500).removeClass("hidden");


}

function drawAverageMaxAssistentsChart() {
    dataaveragemax = google.visualization.arrayToDataTable(averagemax);

    dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));

    var chart = new google.visualization.ChartWrapper({
        'chartType': 'ColumnChart',
        'containerId': 'chart_div',
        'options': {
            'legend': 'right',
            'title': 'Average Speed',
            'backgroundColor': '#dcdcdc',
            'vAxis': {maxValue: 33, minValue:0},
            'hAxis': {title:"Tripnumber"},
            'animation':{
                'duration':'0'
            }
        }
    });

    var RangeSlider = new google.visualization.ControlWrapper({
        'controlType': 'ChartRangeFilter',
        'containerId': 'control_div',
        'options': {
            'filterColumnLabel': 'Trip',
            'ui':{
                'chartType': 'AreaChart',
                'chartOptions':{
                    'backgroundColor':'#dcdcdc'
                }
            }
        }
    });

    dashboard.bind(RangeSlider, chart);
    dashboard.draw(dataaveragemax);
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

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    for (i=0; i<coordinates.length; i++){
        var marker = new google.maps.Marker({
            position: coor[i],
            map: map
        });
    }

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

$(window).resize(function(){
    dashboard.draw(dataaveragemax);
//    drawHeights();
//    drawTemp();
//    map();
});
$(document).ready(function(){
    checkVariable1();
    checkVariable2();
    select();
});