/**
 * Created by Bernd on 7-11-2014.
 */
var KNOWNGROUPS = ['assistants', 'cwa2', 'CWB2'],
//URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/",
    imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/",
    groupURLbase = "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=",
    groupURL,   groupID = getUrlVars()["group"],
    is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent),
    interval,   AllTrips,   coordinates,    dataaveragemax,     dashboard,
    averagemax = "undefined";


//controleren of laatste letter in URL een "#" is
if (groupID[groupID.length-1] == "#"){
    groupID = groupID.slice(0,groupID.length-1)
}
groupURL = groupURLbase.concat(groupID);

bol.controller.DataAverageMax('NO DATA', groupURL);

//initialiseren buttons en basisfunctionaliteit
function main(){

    //$('li.switch').click(function() {
    //    var currentGroup = $("li.switch.active");
    //
    //    if (currentGroup.attr("id") == this.id){
    //        return false
    //    }
    //    $('#groupinfo').slideUp("slow");
    //    currentGroup.removeClass("active");
    //    $(this).addClass("active");
    //
    //    averagemax = "undefined";
    //    AllTrips = "undefined";
    //    groupURL = groupURLbase.concat(this.id);
    //    bol.controller.DataAverageMax('NO DATA', groupURL);
    //
    //    $("<p>loading...</p>").attr("id","loading").appendTo("#thumbnails");
    //    $('#tripinfo').addClass("hidden");
    //    $('#timelapse').children().remove();
    //    $('#thumbnails').children().remove();
    //    $('#map-canvas').children().remove();
    //    $('.slider-dots').children().remove();
    //
    //    //$('#groupinfo').slideDown("slow");
    //
    //    checkVariable();
    //});



    //klik-functie van pijl naar rechts
    $('.arrow-next').click(function() {
        if ($(this).hasClass("disabled")){
            return false
        }
        $(this).addClass("disabled");
        var currentSlide = $('.active-list');
        var nextSlide = currentSlide.prev();
        var currentDot = $('.active-dot');
        var nextDot = currentDot.next();

        if(nextSlide.length === 0) {
            nextSlide = $('.Outer').last();
            nextDot = $('.dot').first();
        }

        $.when(
            currentSlide.fadeOut(500).removeClass('active-list')
        ).done(function(){
                currentSlide.addClass("hidden")}
        ).done(function() {
                nextSlide.fadeIn(500).addClass('active-list').removeClass("hidden")}
        ).done(function() {
                $('.arrow-next').removeClass("disabled");
                currentDot.removeClass('active-dot');
                nextDot.addClass('active-dot');
            });

        return false
    });

    //klik-functie van pijl naar links
    $('.arrow-prev').click(function() {
        if ($(this).hasClass("disabled")){
            return false
        }
        $(this).addClass("disabled");
        var currentSlide = $('.active-list');
        var prevSlide = currentSlide.next();
        var currentDot = $('.active-dot');
        var prevDot = currentDot.prev();

        if(prevSlide.length === 0) {
            prevSlide = $('.Outer').first();
            prevDot = $('.dot').last();
        }

        $.when(
            currentSlide.fadeOut(500).removeClass('active-list')
        ).done(function(){
                currentSlide.addClass("hidden")}
        ).done(function() {
                prevSlide.fadeIn(500).addClass('active-list').removeClass("hidden")}
        ).done(function() {
                $('.arrow-prev').removeClass("disabled");
                currentDot.removeClass('active-dot');
                prevDot.addClass('active-dot');
            });

        return false
    });
}


//parameters uit URL halen
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


//checking averagemaxgraph data
function checkVariable(){
    if (averagemax !== "undefined"){
        //$.when(google.setOnLoadCallback(drawAverageMaxAssistentsChart())
        //).done(function(){
                thumbnail(AllTrips);
            //});
    }
    else{
        window.setTimeout("checkVariable()",100);
    }
}


//Controleren of coordinaten zijn opgehaald
function checkData(){
    if (typeof coordinates !== "undefined" && coordinates != "NONE" && TripInfo !== 'NONE'){
        google.setOnLoadCallback(map());
        images(TripInfo);
    }
    else{
        window.setTimeout("checkData();",100);
    }
}

function spinner(){
    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    var target = document.getElementById('loadicon');
    var spinner = new Spinner(opts).spin(target);
    $(target).data('spinner', spinner);
}

//aanmaken thumbnail navigatie + toevoegen dots
function thumbnail(json){
    var l = 12;
    var k = 0;
    var i;
    for (i = json.length-1; i>-1; i = i-1){
        l = l + 1;
        if (l==13) {
            $("<div>").addClass("Outer").addClass("hidden").attr("id", k+1).appendTo("#thumbnails");
            $("<li>&bull;</li>").addClass("dot").appendTo($(".slider-dots"));
            l = 1;
            k = k + 1;
        }
        var C = json[i].sensorData;
        $("#"+k).prepend("<div>");
        $("#thumbnails div:last-child div:first-child").attr("class", "col-xs-3 col-sm-2 col-md-1 col-lg-1 thumbtn").append("<button>");
        $("#thumbnails div:last-child div:first-child button").attr("class","thumbnail btn-default").attr("id", json[i]._id).attr("type", "button").append("<img>").append("<p>");
        $("#thumbnails div:last-child div:first-child button img").attr("src", "foto/foto1.png").addClass("thumbimg");
        if (typeof json[i].startTime !== "undefined") {
            $("#thumbnails div:last-child div:first-child button p").text(json[i].startTime.slice(5, 10)).addClass("thumbp");
        }

        $.each(C,function(){
            if (this.sensorID == CAM){
                $("#thumbnails div:last-child div:first-child button img").attr("src", imageURL.concat(this.data[0]));
                return false
            }
        });
    }

    $(".slider-dots li:last-child").addClass("active-dot");
    $("img").load(function(){
        drawAverageMaxAssistentsChart();
        $("#loadicon").addClass("hidden");
        $('#loadicon').data('spinner').stop();
        $("#groupinfo").removeClass("hidden");
        $("#loading").remove();
        $("#1").removeClass("hidden").addClass("active-list");
        $("#slider").removeClass("hidden");
        //$(".arrows").removeClass("disabled");
        equalHeight($(".thumbnail"));
    });

    $(".thumbnail").click(function () {
        $(".thumbnail.active").removeClass("active");
        $(this).addClass("active");
        coordinates = "NONE";

        bol.controller.ExtractTrip(json,this.id);

        $("#tripinfo").removeClass("hidden");
        clearInterval(interval);
        while ($("#timelapse").children().length != 0) {
            $("#timelapse img:first-child").remove();
        }
        checkData();
    });
}


function equalHeight(group) {
    var tallest = 0;
    group.each(function() {
        var thisHeight = $(this).height();
        if(thisHeight > tallest) {
            tallest = thisHeight;
        }
    });
    group.each(function() { $(this).height(tallest); });
}


//Laden van foto's voor timelapse
function images(gegevens){
    var C = gegevens.sensorData;
    //Voor aparte opvraag van server
    //var C = gegevens[0].sensorData;
    var timelapseid = $("#timelapse");
    $.each(C, function(){
        if (this.sensorID == 8) {
            timelapseid.append("<img>");
            timelapseid.children("img:last").attr("src", imageURL.concat(this.data[0])).attr("class", "hidden");
        }
        timelapseid.children(":first").removeClass("hidden").addClass("active-img");
    });

    //Starten van timelapse wanneer afbeeldingen geladen zijn
    if (typeof timelapseid.children()[0] !== "undefined"){

        $("img").load(timelapse());
    }
}


//functie voor timelapse
function timelapse() {

    interval = setInterval( showIMG, 100);
    var h = $("#timelapse").height();
    $("#map-canvas").height(h);

    function showIMG() {
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
//
//GEMIDDELDEN GRAFIEK
//
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

    var control = new google.visualization.ControlWrapper({
        'controlType': 'ChartRangeFilter',
        'containerId': 'control_div',
        'options': {
            'width': "80%",
            'filterColumnIndex': 0,
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
    dashboard.bind(control, chart);
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
            control.setState({range: { start: data.values.min, end: data.values.max }});
            control.draw();
        });
    }

}
//
// MAP
//
function map() {
    var coor = [];
    var coor_default = [];
    var HOEKPUNTEN;
    var mapstyle = [
        {"featureType":"administrative", "stylers":[{"visibility":"off"}]},
        {"featureType":"poi","stylers":[{"visibility":"simplified"}]},
        {"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},
        {"featureType":"water","stylers":[{"visibility":"simplified"}]},
        {"featureType":"transit","stylers":[{"visibility":"simplified"}]},
        {"featureType":"landscape","stylers":[{"visibility":"simplified"}]},
        {"featureType":"road.highway","stylers":[{"visibility":"off"}]},
        {"featureType":"road.local","stylers":[{"visibility":"on"}]},
        {"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},
        {"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},
        {"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]
    bounds  = new google.maps.LatLngBounds();

    if (coordinates.length !== 0){
        if (coordinates[0][0] >= 100){
            $.each(coordinates, function(){
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
    }

    $.each(coordinates, function(){
        var bound = new google.maps.LatLng(this[0],this[1]);
        coor.push(bound);
        bounds.extend(bound);
    });

    if (coordinates.length === 0) {
        HOEKPUNTEN = [
            [50.864477,4.679248],
            [50.863807,4.672468],
            [50.865913,4.687649],
            [50.861890,4.685460]];
        $.each(HOEKPUNTEN, function(){
            var bound = new google.maps.LatLng(this[0],this[1]);
            coor_default.push(bound);
            bounds.extend(bound);
        });
    }

    var mapOptions = {
        scrollwheel: true,
        styles: mapstyle
    };
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
    var flightPath = new google.maps.Polyline({
        path: coor,
        geodesic: true,
        strokeColor: '#4373B2',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        new FullScreenControl(map));
    map.fitBounds(bounds);
    map.panToBounds(bounds);
    flightPath.setMap(map);

}


//Tekenen van hoogtegrafiek
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


//tekenen van temperatuurgrafiek
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


//Wat doen bij laden van pagina
$(document).ready(function(){
    if (typeof groupID !== 'undefined' && $.inArray(groupID,KNOWNGROUPS) != -1){
        group = document.getElementById(groupID);
        group.setAttribute("class", "active");
    }
    spinner();
    main();
    checkVariable();
    //checkVariable1();
    //checkVariable2();
});

//Wat doen bij resize
$(window).resize(function(){
    dashboard.draw(dataaveragemax);
    google.maps.event.trigger(map, "resize");
//    drawHeights();
//    drawTemp();
});