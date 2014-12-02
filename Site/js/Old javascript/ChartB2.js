/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart", "map", "controls"]});
lapse.getter.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2");
//lapse.getter.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
//lapse.getter.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
//lapse.getter.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CWB2", img);
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
var interval


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

//controleren averagemax data
function checkVariable(){
    if (typeof averagemax !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        thumbnail(json);
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}
//controleren coordinaten data
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
//        lapse.getter.Height('NO DATA', coordinates);
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

//aanmaken van thumbnails
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
        $("#loading").addClass("hidden");
        $("#1").removeClass("hidden").addClass("active-list");
    });

    $(".thumbnail").click(function () {
        coordinates = "NONE";
        URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/";
        URL = URL.concat(this.id);
        //URL = URL.concat("/sensors");
        lapse.getter.GetTrip('NO DATA', URL)
        lapse.getter.Coordinates('NO DATA', URL.concat("/sensors"));
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

//Laden van afbeeldingen voor timelapse
function images(gegevens){
    var C = gegevens[0].sensorData;
    for (j=0;j< C.length;j++) {
        if (C[j].sensorID == 8) {
            $("#timelapse").append("<img>");
            $("#timelapse img:last-child").attr("src", imageURL.concat(C[j].data[0])).attr("class", "hidden");
        }
        $("#timelapse img:first-child").removeClass("hidden").addClass("active-img");
    }
    $(window).load(timelapse());
}

//Starten van timelapse
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

//tekenen van grafiek voor gemiddelden van trips
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

    //controleren op smartphone voor scroller
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

//tekenen van google map
function map() {
    var coor = [];
    bounds  = new google.maps.LatLngBounds();

    for (i=0; i<coordinates.length; i++){
        coor[coor.length] = new google.maps.LatLng(coordinates[i][0],coordinates[i][1]);
        bounds.extend(coor[i])
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

//tekenen van hoogtegrafiek
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

//tekenen van temperatuur grafiek
//function drawTemp() {
//    var data = google.visualization.arrayToDataTable(temperature);
//
//    var options = {
//        title: 'Temperature',
//        back groundColor: '#dcdcdc',
//        vAxis: {maxValue: 33, minValue:0},
//        hAxis: {title:"Tripnumber"}
//
//    };
//
//    var chart = new google.visualization.AreaChart(document.getElementById('tempchart'));
//
//    chart.draw(data, options);
//}


//hertekenen bij resize
$(window).resize(function(){
    dashboard.draw(dataaveragemax);
    google.maps.event.trigger(map, "resize");
//    drawHeights();
//    drawTemp();
//    map();
});

//eerste functies uit te voeren
$(document).ready(function(){
    checkVariable();
    main();
    //checkVariable1();
    //checkVariable2();
});