/**
 * Created by Bernd on 7-11-2014.
 */
//URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/",
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var server = 8080; //8081 voor production
var groupURLbase = "http://dali.cs.kuleuven.be:" + server + "/qbike/trips?groupID=";
var groupID = getUrlVars()["group"];
var groupURL;
var group;
var groupHead;
var interval;
var coordinates;
var coor;
var dataaveragemax;
var dashboard;
var averagemax = "undefined";
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
var mindata = 0;
var totalimages;
var imagesloaded;
var UNITMULTIPLIER = 1;
var UNIT = "m/s";
var FilterStartDate = new Date(70,0,1,1,0,0,0);
var FilterEndDate = new Date(2015,0,1,1,0,0,0);

//TODO add filters: eenheid snelheid, datum(vanaf, tot, maand, jaar), temperatuur, 
//TODO datefilter

//controleren of laatste letter in URL een "#" is
if (groupID[groupID.length-1] == "#"){
    groupID = groupID.slice(0,groupID.length-1)
}
groupURL = groupURLbase.concat(groupID);

//Wat doen bij laden van pagina
$(document).ready(function(){
    group = document.getElementById(groupID);

    if (typeof groupID !== 'undefined' && group != null){
        group.setAttribute("class", "active");
        groupHead = group.firstChild.innerHTML;
        $(".jumbotron > h1").text(groupHead);
    }

    else if (typeof groupID !== 'undefined') {
        $(".jumbotron > h1").text(groupID);
    }

    loadMaps();
    spinner();
    main();
});

//Wat doen bij resize
$(window).resize(function(){
    dashboard.draw(dataaveragemax);
    google.maps.event.trigger(map, "resize");
});


//
//INIT
//
//initialiseren buttons en basisfunctionaliteit
function main(){

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

        var nextSlideEndYear = nextSlide.children(":last").find("p").text().slice(-4);
        var nextSlideStartYear = nextSlide.children(":first").find("p").text().slice(-4);
        var currentYear = $("#yearinfo").text();
        if (nextSlideEndYear != currentYear){
            $("#yearinfo").text("");
            if (nextSlideStartYear == nextSlideEndYear){
                $("#yearinfo").text(nextSlideStartYear);
            }
            else if (nextSlideEndYear == ""){
                $("#yearinfo").text(nextSlideStartYear);
            }
            else if (nextSlideStartYear == ""){
                $("#yearinfo").text(nextSlideEndYear);
            }
            else{
                $("#yearinfo").text(nextSlideStartYear + " - " + nextSlideEndYear);
            }
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

        var prevSlideEndYear = prevSlide.children(":last").find("p").text().slice(-4);
        var prevSlideStartYear = prevSlide.children(":first").find("p").text().slice(-4);
        var currentYear = $("#yearinfo").text();
        if (prevSlideStartYear != currentYear){
            $("#yearinfo").text("");
            if (prevSlideEndYear == prevSlideStartYear){
                $("#yearinfo").text(prevSlideStartYear);
            }
            else if (prevSlideEndYear == ""){
                $("#yearinfo").text(prevSlideStartYear);
            }
            else if (prevSlideStartYear == ""){
                $("#yearinfo").text(prevSlideEndYear);
            }
            else{
                $("#yearinfo").text(prevSlideStartYear + " - " + prevSlideEndYear);
            }
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

    //Checkbox "Get all trips"
    $('#filterall').change(function(){
        if (this.checked){
            mindata = -1
        }
        else {
            mindata = 0
        }
    });

    $("#FilterDateOn").change(function(){
        if (this.checked){
            $("#FilterDateFrom,#FilterDateTo").removeAttr("checked");
        }
    });

    $("#FilterDateFrom").change(function(){
        if (this.checked){
            $("#FilterDateOn").removeAttr("checked");
        }
    });

    $("#FilterDateTo").change(function(){
        if (this.checked){
            $("#FilterDateOn").removeAttr("checked");
        }
    });

    //Herladen
    $(".refresh").click(function () {

        spinner();
        var unitselection = $('input[name=unitradio]:checked', '#unitform').val().split(" ");
        UNITMULTIPLIER = unitselection[0];
        UNIT = unitselection[1];
        SetDates();
        //FilterStartDate.setFullYear($("#filteryear").val(),$("#filtermonth").val()-1,$("#filterday").val());
        $("#loadicon").fadeIn({
            complete:function(){
                $(".slider-dots").empty();
                $("#thumbnails").empty();
                lapse.getter.ExtractAverageMax(AllTrips);
                thumbnail(AllTrips);
            }
        });
    });

    $("#close").click(function () {
        $(".thumbnail.active").removeClass("active");
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: function () {
                coordinates = "NONE";
                $("#map-canvas").empty();
                $("#timelapse").empty();
                $("#heightsdiv").hide();
                $(".tripdata").remove();
                clearInterval(interval);
            }
        });
    });
}

function SetDates(){
    var filterday;
    var filtermonth;
    var filteryear;
    if ($("#FilterDateOn").prop("checked")){
        console.log("cc");
        filterday = $('input[name=day]', '#FormDateFromOn').val();
        var filterdayend = parseInt(filterday) + 1;
        filterdayend = filterdayend.toString();
        filtermonth = $('input[name=month]', '#FormDateFromOn').val()-1;
        filteryear = $('input[name=year]', '#FormDateFromOn').val();
        FilterStartDate.setFullYear(filteryear, filtermonth, filterday);
        FilterEndDate.setFullYear(filteryear, filtermonth, filterdayend);
        console.log(FilterStartDate, FilterEndDate);
    }

    else if ($("#FilterDateFrom").prop("checked") && $("#FilterDateTo").prop("checked") == false){
        filterday = $('input[name=day]', '#FormDateFromOn').val();
        filtermonth = $('input[name=month]', '#FormDateFromOn').val()-1;
        filteryear = $('input[name=year]', '#FormDateFromOn').val();
        FilterStartDate.setFullYear(filteryear, filtermonth, filterday);
        FilterEndDate.setFullYear(2015,0,1);

    }

    else if ($("#FilterDateFrom").prop("checked") == false && $("#FilterDateTo").prop("checked")){
        filterday = $('input[name=day]', '#FormDateTo').val();
        filtermonth = $('input[name=month]', '#FormDateTo').val()-1;
        filteryear = $('input[name=year]', '#FormDateTo').val();
        FilterStartDate.setFullYear(1970, 0, 1);
        FilterEndDate.setFullYear(filteryear, filtermonth, filterday);
    }

    else if ($("#FilterDateFrom").prop("checked") && $("#FilterDateTo").prop("checked")){
        filterday = $('input[name=day]', '#FormDateFromOn').val();
        filtermonth = $('input[name=month]', '#FormDateFromOn').val()-1;
        filteryear = $('input[name=year]', '#FormDateFromOn').val();
        FilterStartDate.setFullYear(filteryear, filtermonth, filterday);

        filterday = $('input[name=day]', '#FormDateTo').val();
        filtermonth = $('input[name=month]', '#FormDateTo').val()-1;
        filteryear = $('input[name=year]', '#FormDateTo').val();
        FilterEndDate.setFullYear(filteryear, filtermonth, filterday);
    }

    else {
        FilterStartDate.setFullYear(1970, 0, 1);
        FilterEndDate.setFullYear(2015,0,1);
    }
}

//parameters uit URL halen
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function CONDITION(sensors, date){
    return sensors != mindata && FilterStartDate <= date && FilterEndDate >= date

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
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    var target = document.getElementById('loadicon');
    var spinner = new Spinner(opts).spin(target);
    $(target).data('spinner', spinner);
}

//wat doen als er geen data is
function NODATA(){
    $("#groupinfo").hide();
    $("#nodata").show();
    $("#loadicon").hide().data('spinner').stop();
}


//
//VISUALISATIE
//
//aanmaken thumbnail navigatie + toevoegen dots
function thumbnail(json){
    var l = 12;
    var k = 0;
    var i;
    var previousDate = Date();

    for (i = json.length-1; i>-1; i = i-1){
        var startTime = new Date(json[i].startTime);
        var C = json[i].sensorData;
        if (startTime == 'Invalid Date'){
            startTime = previousDate;
        }
        if (C == null){
            C = [];
        }
        if (CONDITION(C.length, startTime)) {
            console.log("a");
            l = l + 1;

            if (l==13) {
                $('<div class="Outer hidden">').attr("id", k+1).appendTo("#thumbnails");
                $("<li>&bull;</li>").addClass("dot").appendTo($(".slider-dots"));
                l = 1;
                k = k + 1;
            }
            var toAdd = '<div class="col-xs-3 col-sm-2 col-md-1 col-lg-1 thumbtn col-centered">' +
                '<button class="thumbnail btn-default" type="button" id="' + json[i]._id + '" >' +
                '<img src="foto/foto1.png" class="thumbimg">';

            if (startTime != "Invalid Date") {
                toAdd = toAdd + '<p class="thumbp">'+ month[startTime.getMonth()] + " " + startTime.getDate() + " " + startTime.getFullYear() +'</p>' + '</button></div>';
            }
            else{
                console.log("aa");
                toAdd = toAdd + '<p class="thumbp">'+ month[previousDate.getMonth()] + " " + previousDate.getDate() + " " + previousDate.getFullYear() +'</p>' + '</button></div>';
            }

            $(toAdd).prependTo($("#" + k));
            previousDate = startTime;

            $.each(C, function () {
                if (this.sensorID == CAM) {
                    $("#thumbnails").find("div:last-child div:first-child button img").attr("src", imageURL.concat(this.data[0]));
                    return false
                }
            });
        }
    }

    $("#thumbnails").waitForImages(function(){
        var firstlist = $("#1");
        var startyear;
        var endyear;
        firstlist.removeClass("hidden").addClass("active-list");
        endyear = firstlist.children(":last").find("p").text().slice(-4);
        startyear = firstlist.children(":first").find("p").text().slice(-4);
        if (startyear == endyear){
            $("#yearinfo").text(startyear);
        }
        else if (endyear == ""){
            $("#yearinfo").text(startyear);
        }
        else if (startyear == ""){
            $("#yearinfo").text(endyear);
        }
        else{
            $("#yearinfo").text(startyear + " - " + endyear);
        }
        $("#loadicon").fadeOut({
            complete: function(){
                $("#loadicon").data('spinner').stop();
            }
        });
        equalHeight($(".thumbnail"));
    });

    $(".slider-dots li:last-child").addClass("active-dot");

    $(".thumbnail").click(function () {
        var tripid = this.id;
        $(".thumbnail.active").removeClass("active");
        $(this).addClass("active");
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: function () {
                coordinates = "NONE";
                $("#map-canvas").empty();
                $("#timelapse").empty();
                $("#heightsdiv").hide();
                $(".tripdata").remove();
                clearInterval(interval);
                lapse.getter.ExtractTrip(json,tripid);
            }
        });
    });
}



//thumbnails zelfde grootte maken
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
        $(window).load(timelapse());
    }
}

//functie voor timelapse
function timelapse() {

    interval = setInterval( showIMG, 100);
    var h = $("div#left-column").height();
    $("div#map-canvas").height(h);

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
//GRAFIEKEN
//
function drawAverageMaxChart() {

    dataaveragemax = google.visualization.arrayToDataTable(averagemax);

    dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));

    var chart = new google.visualization.ChartWrapper({
        'chartType': 'ColumnChart',
        'containerId': 'chart_div',
        'options': {
            'legend': 'top',
//            'title': 'Average Speed',
            'backgroundColor': '#dcdcdc',
            'vAxis': {
                viewWindowMode:'explicit',
                //viewWindow:{
                //    max:15,
                //    min:0
                //}
            },
            'hAxis': {title:"Tripnumber"},
            'animation':{
                'duration':'250'
            }
        }
    });

    var control = new google.visualization.ControlWrapper({
        'controlType': 'ChartRangeFilter',
        'containerId': 'control_div',
        'state': {'range': {'start': averagemax.length - 12}},
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
        $('#filter_mobile').show().rangeSlider({
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

//Tekenen van hoogtegrafiek
function loadElev() {

    // Create a new chart in the elevation_chart DIV.
    ELEVCHART = new google.visualization.AreaChart(document.getElementById('heightschart'));

    // Create a PathElevationRequest object using this array.
    // Ask for 512 samples along that path.
    if (coor.length > 512) {
        var toshortencoor = coor;
        while (toshortencoor.length > 512) {
            var shortcoor =[];
            for (var i=0; i < toshortencoor.length-1; i=i+2){
                shortcoor.push(toshortencoor[i]);
               }
            shortcoor.push(toshortencoor[toshortencoor.length-1]);
            toshortencoor = shortcoor;
        }
        var pathRequest = {
                'path': shortcoor,
                'samples': 256
        };
    }

    else{
        var pathRequest = {
            'path': coor,
            'samples': 512
        };
    }

    // Initiate the path request.
    elevator.getElevationAlongPath(pathRequest, plotElevation);
}

function plotElevation(results, status) {
    if (status != google.maps.ElevationStatus.OK) {
        return;
    }
    $("#heightsdiv").show();
    var elevations = results;

    var options = {
        title: 'Elevation',
        backgroundColor: '#dcdcdc',
        hAxis: {title:"Distance"},
        legend: 'none',
        titleY: 'Elevation (m)'
    };

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    for (var i = 0; i < results.length; i++) {
        data.addRow(['', Math.round(elevations[i].elevation * 100) / 100]);
    }

    // Draw the chart using the data within its DIV.
    ELEVCHART.draw(data, options);
}

function drawSpeeds() {
    $("#speeddiv").removeClass("hidden");
    var data = google.visualization.arrayToDataTable(speeddata);

    var options = {
        title: 'Speed',
        backgroundColor: '#dcdcdc',
        hAxis: {title:"Distance"},
        legend:{
            position:'none'
        }
    };

    var chart = new google.visualization.AreaChart(document.getElementById('speedchart'));

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


//
// MAP
//
function loadMaps() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp?key=AIzaSyDCRwgWbgGGM5zVCUJFJDIE3qSIYs1pATU&libraries=geometry&' +
    'callback=mapsloaded';
    document.body.appendChild(script);
}

function mapsloaded(){
    lapse.getter.GroupData('NO DATA', groupURL);
}

function map() {
    coor = [];
    var coor_default = [];
    var HOEKPUNTEN;
    var mapstyle = [
        {"featureType":"administrative", "stylers":[{"visibility":"on"}]},
        {"featureType":"poi","stylers":[{"visibility":"simplified"}]},
        {"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},
        {"featureType":"water","stylers":[{"visibility":"simplified"}]},
        {"featureType":"transit","stylers":[{"visibility":"simplified"}]},
        {"featureType":"landscape","stylers":[{"visibility":"simplified"}]},
        {"featureType":"road.highway","stylers":[{"visibility":"off"}]},
        {"featureType":"road.local","stylers":[{"visibility":"on"}]},
        {"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},
        {"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},
        {"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}];
    var bounds  = new google.maps.LatLngBounds();

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

    else {
        $.each(coordinates, function(){
            var bound = new google.maps.LatLng(this[0],this[1]);
            coor.push(bound);
            bounds.extend(bound);
        });
    }
    if (coor.length >= 2) {
        // Create an ElevationService.
        elevator = new google.maps.ElevationService();
        loadElev();
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
    var bikePath = new google.maps.Polyline({
        path: coor,
        geodesic: true,
        strokeColor: '#4373B2',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    var dist = google.maps.geometry.spherical.computeLength(bikePath.getPath());

    if (dist > 1000){
        dist = Math.round((dist/1000) * 100) / 100;
        //dist = dist / 1000
        $("<p class='tripdata'>").text(dist + " km").appendTo($("#DIST"));
    }
    else {
        dist =  Math.round(dist * 100) / 100;
        $("<p class='tripdata'>").text(dist + " m").appendTo($("#DIST"));
    }

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        new FullScreenControl(map));
    map.fitBounds(bounds);
    map.panToBounds(bounds);
    bikePath.setMap(map);

}







