/**
 * Created by Bernd on 4-11-2014.
 */
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var groupURL = "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=";
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
var interval;

groupURL = groupURL.concat(groupID);
google.load("visualization", "1", {packages:["corechart", "map", "controls"]});
bol.controller.DataAverageMax('NO DATA', groupURL);
//bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
//bol.controller.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
//bol.controller.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2", img);


//initialiseren buttons
function main(){

    //klik-functie van pijl naar rechts
    $('.arrow-next').click(function() {
        var currentSlide = $('.active-list');
        var nextSlide = currentSlide.prev();

        var currentDot = $('.active-dot');
        var nextDot = currentDot.next();

        if(nextSlide.length === 0) {
            nextSlide = $('.Outer').last();
            nextDot = $('.dot').first();
        }

        currentSlide.fadeOut(600).removeClass('active-list').addClass("hidden");
        nextSlide.fadeIn(600).addClass('active-list').removeClass("hidden");

        currentDot.removeClass('active-dot');
        nextDot.addClass('active-dot');

        return false
    });

    //klik-functie van pijl naar links
    $('.arrow-prev').click(function() {
        var currentSlide = $('.active-list');
        var prevSlide = currentSlide.next();

        var currentDot = $('.active-dot');
        var prevDot = currentDot.prev();

        if(prevSlide.length === 0) {
            prevSlide = $('.Outer').first();
            prevDot = $('.dot').last();
        }

        currentSlide.fadeOut(600).removeClass('active-list').addClass("hidden");
        prevSlide.fadeIn(600).addClass('active-list').removeClass("hidden");

        currentDot.removeClass('active-dot');
        prevDot.addClass('active-dot');

        return false
    });
}

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
    var l = 12;
    var k = 0;
    for (i = json.length-1; i>-1; i = i-1){
        l = l + 1;
        if (l==13) {
            console.log("x");
            $("<div>").addClass("Outer").addClass("hidden").attr("id", k+1).appendTo("#thumbnails");
            $("<li>&bull;</li>").addClass("dot").appendTo($(".slider-dots"));
            l = 1;
            k = k + 1;
        }
        var C = json[i].sensorData;
        $("#"+k).prepend("<div>");
        $("#thumbnails div:last-child div:first-child").attr("class", "col-xs-3 col-sm-2 col-md-1 col-lg-1").append("<button>");
        $("#thumbnails div:last-child div:first-child button").attr("class","thumbnail btn-default").attr("id", json[i]._id).attr("type", "button").append("<img>").append("<p>");
        $("#thumbnails div:last-child div:first-child button img").attr("src", "foto/foto1.png");
        $("#thumbnails div:last-child div:first-child button p").text(json[i].startTime.slice(5,10));
        for (j=0;j< C.length;j++) {
            if (C[j].sensorID == 8) {
                $("#thumbnails div:last-child div:first-child button img").attr("src", imageURL.concat(C[j].data[0]));
                break
            }
        }
    }
    $(".slider-dots li:last-child").addClass("active-dot");
    $(window).load(function(){
        $("#loading").remove();
        $("#1").removeClass("hidden").addClass("active-list");
    });

    $(".thumbnail").click(function () {
        coordinates = "NONE";
        URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/";
        URL = URL.concat(this.id);
        bol.controller.GetTrip('NO DATA', URL);
        bol.controller.Coordinates('NO DATA', URL.concat("/sensors"));
        $("#tripinfo").removeClass("hidden");
        clearInterval(interval);
        while ($("#timelapse").children().length != 0) {
            $("#timelapse img:first-child").remove();
        }
        checkData();
    });
}

function images(gegevens){
    var C = gegevens[0].sensorData;
    var timelapseid = $("#timelapse");
    for (j=0;j< C.length;j++) {
        if (C[j].sensorID == 8) {
            timelapseid.append("<img>");
            timelapseid.children("img:last").attr("src", imageURL.concat(C[j].data[0])).attr("class", "hidden");
        }
        timelapseid.children(":first").removeClass("hidden").addClass("active-img");
    }
    timelapseid.load(timelapse());
}

function timelapse() {

    interval = setInterval( showDiv, 100);

    function showDiv() {
        var currentimg = $('.active-img');
        var nextimg = currentimg.next();
        var timelapseid = $("#timelapse");
        if(nextimg.length === 0) {
            nextimg = timelapseid.children(':first');
        }
        currentimg.removeClass('active-img').addClass("hidden");
        nextimg.addClass('active-img').removeClass("hidden");

    }
}

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
    var coor_default = [];
    bounds  = new google.maps.LatLngBounds();

    for (i=0; i<coordinates.length; i++){
        coor[coor.length] = new google.maps.LatLng(coordinates[i][0],coordinates[i][1]);
        bounds.extend(coor[i]);
    }
    if (coordinates.length === 0) {
        hoekpunten = [[50.864477,4.679248],[50.863807,4.672468],[50.865913, 4.687649],[50.861890,4.685460]];
        console.log(hoekpunten.length);
        for (j=0; j<hoekpunten.length; j++) {
            coor_default[coor_default.length] = new google.maps.LatLng(hoekpunten[j][0], hoekpunten[j][1]);
            bounds.extend(coor_default[j]);
        }
    }
    if ( is_mobile ) {
        var mapOptions = {
            scrollwheel: false
        };
    }

    else {
        var mapOptions = {
            scrollwheel: true
        }
    }

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        new FullScreenControl(map));

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

//function drawTemp() {
//    var data = google.visualization.arrayToDataTable(temperature);
//
//    var options = {
//        title: 'Temperature',
//        backgroundColor: '#dcdcdc',
//        vAxis: {maxValue: 33, minValue:0},
//        hAxis: {title:"Tripnumber"}
//
//    };
//
//    var chart = new google.visualization.AreaChart(document.getElementById('tempchart'));
//
//    chart.draw(data, options);
//}
$(document).ready(function(){
    main();
    checkVariable();
    //checkVariable1();
    //checkVariable2();
});

$(window).resize(function(){
    dashboard.draw(dataaveragemax);
    google.maps.event.trigger(map, "resize");
//    drawHeights();
//    drawTemp();
//    map();
});




