/**
 * Created by Bernd on 7-11-2014.
 */
//URL = "http://dali.cs.kuleuven.be:8080/qbike/trips/",
var imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
var server; //8080 voor test, 8443 voor productie
var groupURLbase, groupURL, groupID = getUrlVars();
var group, groupHead;
var interval;
var averagemax = false;
var dataaveragemax, dashboard;
var GMCoordinates, ELEVData, ELEVCHART, ELEVToCall, TEMPCHART;
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
//Filtervariabelen
var mindata = 0;
var UNITMULTIPLIER = 1, UNITSPEED = "m/s", UNITDIST = "m", UNITMULTIPLIERDIST = 1;
var FilterStartDate = new Date(70,0,1,1,0,0,0), FilterEndDate = new Date(2015,0,1,1,0,0,0);
var FilterMinSpeed = 0, FilterMaxSpeed = 200;
var FilterMinDist = 0, FilterMaxDist = 1000000;
var total_refresh = false;

//Wat doen bij laden van pagina
$(document).ready(function(){
    (function(){
        server = $('input[name=serverradio]:checked', '#serverform').val();
        groupURLbase = "http://dali.cs.kuleuven.be:" + server + "/qbike/trips?";

        //controleren of laatste letter in URL een "#" is
        if (groupID[groupID.length-1] == "#"){
            groupID = groupID.slice(0,groupID.length-1)
        }
        groupURL = groupURLbase.concat(groupID);

        groupID = groupID.split('=')[1];
        group = document.getElementById(groupID);
        var $jumbotext = $("#jumbo").children("h1");

        if (groupID && group != null){
            group.setAttribute("class", "active");
            groupHead = group.firstChild.innerHTML;
            $jumbotext.text(groupHead);
        }

        else if (groupID) {
            $jumbotext.text(groupID);
        }
    })();
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
    $('#arrow-next').click(function() {
        if ($(this).hasClass("disabled")){
            return false
        }
        $(this).addClass("disabled");
        var $sliderdots = $("#slider-dots");
        var $thumbnails = $("#thumbnails");
        var currentSlide = $thumbnails.find(".active-list");
        var nextSlide = currentSlide.prev();
        var currentDot = $sliderdots.find(".active-dot");
        var nextDot = currentDot.next();

        if(nextSlide.length === 0) {
            nextSlide = $thumbnails.children(".Outer").last();
            nextDot = $sliderdots.find(".dot").first();
        }

        var $yearinfo = $("#yearinfo");
        var nextSlideEndYear = nextSlide.children(":last").find("p").text().slice(-4);
        var nextSlideStartYear = nextSlide.children(":first").find("p").text().slice(-4);
        var currentYear = $yearinfo.text();
        if (nextSlideEndYear != currentYear){
            $yearinfo.text("");
            if (nextSlideStartYear == nextSlideEndYear){
                $yearinfo.text(nextSlideStartYear);
            }
            else if (nextSlideEndYear == ""){
                $yearinfo.text(nextSlideStartYear);
            }
            else if (nextSlideStartYear == ""){
                $yearinfo.text(nextSlideEndYear);
            }
            else{
                $yearinfo.text(nextSlideStartYear + " - " + nextSlideEndYear);
            }
        }

        $.when(
            currentSlide.fadeOut(500).removeClass('active-list')
        ).done(function(){
                currentSlide.addClass("hidden")}
        ).done(function() {
                nextSlide.fadeIn(500).addClass('active-list').removeClass("hidden")}
        ).done(function() {
                $('#arrow-next').removeClass("disabled");
                currentDot.removeClass('active-dot');
                nextDot.addClass('active-dot');
            });

        return false
    });

    //klik-functie van pijl naar links
    $('#arrow-prev').click(function() {
        if ($(this).hasClass("disabled")){
            return false
        }
        $(this).addClass("disabled");
        var $thumbnails = $("#thumbnails");
        var $sliderdots = $("#slider-dots");
        var currentSlide = $thumbnails.find('.active-list');
        var prevSlide = currentSlide.next();
        var currentDot = $sliderdots.find('.active-dot');
        var prevDot = currentDot.prev();

        if(prevSlide.length === 0) {
            prevSlide = $thumbnails.find(".Outer").first();
            prevDot = $sliderdots.find('.dot').last();
        }

        var $yearinfo = $("#yearinfo");
        var prevSlideEndYear = prevSlide.children(":last").find("p").text().slice(-4);
        var prevSlideStartYear = prevSlide.children(":first").find("p").text().slice(-4);
        var currentYear = $yearinfo.text();
        if (prevSlideStartYear != currentYear){
            $yearinfo.text("");
            if (prevSlideEndYear == prevSlideStartYear){
                $yearinfo.text(prevSlideStartYear);
            }
            else if (prevSlideEndYear == ""){
                $yearinfo.text(prevSlideStartYear);
            }
            else if (prevSlideStartYear == ""){
                $yearinfo.text(prevSlideEndYear);
            }
            else{
                $yearinfo.text(prevSlideStartYear + " - " + prevSlideEndYear);
            }
        }

        $.when(
            currentSlide.fadeOut(500).removeClass('active-list')
        ).done(function(){
                currentSlide.addClass("hidden")}
        ).done(function() {
                prevSlide.fadeIn(500).addClass('active-list').removeClass("hidden")}
        ).done(function() {
                $('#arrow-prev').removeClass("disabled");
                currentDot.removeClass('active-dot');
                prevDot.addClass('active-dot');
            });

        return false
    });

    //Checkbox "Get all trips"
    $('#filterall').change(function(){
        mindata = (this.checked)? -1 : 0;
    });

    $('#unitform').find('.unit').change(function(){
        var unitselection = $('input[name=unitradio]:checked', '#unitform').val().split(" ");
        UNITSPEED = unitselection[1];
        UNITDIST = unitselection[2];
        UNITMULTIPLIER = unitselection[0];
        UNITMULTIPLIERDIST = (UNITMULTIPLIER == 3.6)? 1000 : 1;
        $("#distfilter").children(".dis").prop('placeholder', UNITDIST);
        $("#speedfilter").children(".spe").prop('placeholder', UNITSPEED);

        deleteTripInfo();
        lapse.getter.ExtractData(TripInfo);

    });
    $('#serverform').find('.server').change(function(){
        server = $('input[name=serverradio]:checked', '#serverform').val();
        total_refresh = true;
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
    $("#refresh").click(function () {

        spinner();
        var unitselection = $('input[name=unitradio]:checked', '#unitform').val().split(" ");
        SetDates();
        SetSpeed();
        SetDistances();
        $("#loadicon").fadeIn({
            complete:function(){
                $("#groupinfo").show();
                $("#nodata").hide();
                $("#slider-dots").empty();
                $("#thumbnails").empty();
                if (!total_refresh) {
                    lapse.getter.ExtractAverageMax(AllTrips);
                    thumbnail(AllTrips);
                }
                else {
                    groupURL = "http://dali.cs.kuleuven.be:" + server + "/qbike/trips?groupID=" + groupID;
                    mapsloaded();
                    total_refresh = false;
                }
            }
        });
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: deleteTripInfo()
        });

    });

    $("#Sort").children(":button").click(function(){
        var prop = $(this).val();
        function changecaret($button){
            if($button.children(".activesort").length == 0){
                $("#Sort").find(".activesort").removeClass("activesort").hide();
                $button.children(".up").addClass("activesort").show();
                lapse.getter.Sort(AllTrips, prop);
            }
            else{
                if($button.children(".up.activesort").length != 0){
                    $button.children(".up").removeClass("activesort").hide();
                    $button.children(".down").addClass("activesort").show();
                    AllTrips.reverse();
                }
                else{
                    $button.children(".down").removeClass("activesort").hide();
                    $button.children(".up").addClass("activesort").show();
                    AllTrips.reverse()
                }
            }
        }
        spinner();
        changecaret($(this));
        $("#loadicon").fadeIn({
            complete:function(){
                $("#slider-dots").empty();
                $("#thumbnails").empty();
                lapse.getter.ExtractAverageMax(AllTrips);
                thumbnail(AllTrips);
            }
        });
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: deleteTripInfo()
        });
    });

    $("#close").click(function () {
        $("#thumbnails").find(".thumbnail.active").removeClass("active");
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: function () {
                deleteTripInfo()
            }
        });
    });

    //
    //TIMELAPSE PLAY-PAUSE
    //
    $("#timelapse-play").click(function(){
        $("#timelapse-pause").removeClass("hidden");
        $(this).addClass("hidden");
        timelapse()
    });

    $("#timelapse-pause").click(function(){
        $("#timelapse-play").removeClass("hidden");
        $(this).addClass("hidden");
        clearInterval(interval);
    });
}

function SetDates(){
    var filterday;
    var filtermonth;
    var filteryear;
    if ($("#FilterDateOn").prop("checked")){
        filterday = $('input[name=day]', '#FormDateFromOn').val();
        var filterdayend = parseInt(filterday) + 1;
        filtermonth = $('input[name=month]', '#FormDateFromOn').val()-1;
        filteryear = $('input[name=year]', '#FormDateFromOn').val();
        FilterStartDate.setFullYear(filteryear, filtermonth, filterday);
        FilterEndDate.setFullYear(filteryear, filtermonth, filterdayend);
    }

    else if ($("#FilterDateFrom").prop("checked") && !$("#FilterDateTo").prop("checked")){
        filterday = $('input[name=day]', '#FormDateFromOn').val();
        filtermonth = $('input[name=month]', '#FormDateFromOn').val()-1;
        filteryear = $('input[name=year]', '#FormDateFromOn').val();
        FilterStartDate.setFullYear(filteryear, filtermonth, filterday);
        FilterEndDate.setFullYear(2015,0,1);

    }

    else if (!$("#FilterDateFrom").prop("checked") && $("#FilterDateTo").prop("checked")){
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

function SetSpeed(){
    var filtermin;
    var filtermax;
    if ($("#FilterSpeedFrom").prop("checked")){
        filtermin = $('input[name=minspeed]', '#speedfilter').val();
        FilterMinSpeed = filtermin;
    }
    else {
        FilterMinSpeed = 0;
    }
    if ($("#FilterSpeedTo").prop("checked")){
        filtermax = $('input[name=maxspeed]', '#speedfilter').val();
        FilterMaxSpeed = filtermax;
    }
    else {
        FilterMaxSpeed = 200;
    }
}

function SetDistances(){
    var filtermin;
    var filtermax;
    if ($("#FilterDistFrom").prop("checked")){
        filtermin = $('input[name=distmin]', '#distfilter').val();
        FilterMinDist = filtermin;
    }
    else {
        FilterMinDist = 0;
    }
    if ($("#FilterDistTo").prop("checked")){
        filtermax = $('input[name=distmax]', '#distfilter').val();
        FilterMaxDist = filtermax;
    }
    else {
        FilterMaxDist = 10000000;
    }
}

//parameters uit URL halen
function getUrlVars() {
    //var vars = {};
    var vars;
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars = key + '=' + value;
    });
    return vars;
}

/**
 * @return {boolean}
 */
function CONDITION(sensors, date, Speed, Distance){
    return sensors != mindata
        && FilterStartDate <= date
        && FilterEndDate >= date
        && FilterMinSpeed<=Speed
        && FilterMaxSpeed>=Speed
        && FilterMinDist <= Distance
        && Distance <= FilterMaxDist
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

    for (var i = json.length-1; i>-1; i = i-1){
        var startTime = json[i].startTime;
        var C = json[i].sensorData;

        if (CONDITION(C.length, startTime, json[i].Speedavg*UNITMULTIPLIER, json[i].distance/UNITMULTIPLIERDIST)) {
            l = l + 1;
            var tripid = json[i]._id;
            var endTime = json[i].endTime;
            var tooltip;

            if (l==13) {
                $('<div class="Outer hidden">').attr("id", k+1).appendTo("#thumbnails");
                $("<li>&bull;</li>").addClass("dot").appendTo($("#slider-dots"));
                l = 1;
                k = k + 1;
            }
            tooltip = startTime.format("HH:MM");
            tooltip = (startTime == endTime)? tooltip : tooltip + ' - ' + endTime.format("HH:MM");

            var toAdd = '<div class="col-xs-3 col-sm-2 col-md-1 col-lg-1 thumbtn col-centered">' +
                '<button class="thumbnail btn-default" type="button" data-toggle="tooltip" data-original-title="' +
                tooltip + '" data-placement="top" id="' +tripid + '" value="'+i+'">' +
                '<img src="foto/logozondernaam.png" class="thumbimg">' +
                '<p class="thumbp">'+ startTime.format("mmm dd yyyy")+
                '</p></button></div>';

            $(toAdd).prependTo($("#" + k));

            $.each(C, function () {
                if (this.sensorID == CAM) {
                    $("#thumbnails").find("div:last-child div:first-child button img").attr("src", imageURL.concat(this.data[0]));
                    return false
                }
            });
        }
    }

    $("#slider-dots").find("li:last-child").addClass("active-dot");
    var $thumbnails = $("#thumbnails");

    $thumbnails.waitForImages(function(){
        var firstlist = $("#1");
        firstlist.removeClass("hidden").addClass("active-list");
        $("#loadicon").fadeOut({
            complete: function(){
                $("#loadicon").data('spinner').stop();
            }
        });
        equalHeight($("#thumbnails").find(".thumbnail"));
        $('[data-toggle="tooltip"]').tooltip({
            placement: "top"
        });
    });

    $thumbnails.find(".thumbnail").click(function () {
        var tripid = $(this).val();
        $("#thumbnails").find(".thumbnail.active").removeClass("active");
        $(this).addClass("active");
        $("#tripinfo").slideUp({
            duration:"slow",
            complete: function(){
                GMCoordinates = "NONE";
                $("#timelapse-pause").addClass("hidden");
                $("#timelapse-play").removeClass("hidden");
                $("#map-canvas").empty();
                $("#timelapse").empty();
                $("#visual-container").children(".visual").hide();
                $("#tripinfo").find(".tripdata").remove();
                clearInterval(interval);
                lapse.getter.ExtractTrip(json,tripid);
            }
        });
    });
}

function deleteTripInfo() {
    GMCoordinates = "NONE";
    $("#timelapse-pause").addClass("hidden");
    $("#timelapse-play").removeClass("hidden");
    $("#map-canvas").empty();
    $("#timelapse").empty();
    $("#visual-container .visual").hide();
    $("#tripinfo .tripdata").remove();
    clearInterval(interval);
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

//functie voor timelapse
function timelapse() {

    interval = setInterval( showIMG, 500);


    function showIMG() {
        var $timelapse = $("#timelapse");
        var currentimg = $timelapse.children(".active-img");
        var nextimg = currentimg.next();
        if(nextimg.length === 0) {
            nextimg = $timelapse.children(':first');
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
            'backgroundColor': '#dcdcdc',
            'vAxis': {
                viewWindowMode:'explicit'
            },
            //'hAxis': {title:"Tripnumber"},
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

function drawTemp(){
    if (ToolTipData.Temp.length < 1){
        return false
    }
    else {
        var datatemp = new google.visualization.DataTable();
        datatemp.addColumn('number', 'Sample');
        datatemp.addColumn('number', 'Temperature');
        $.each(ToolTipData.Temp, function (i, v) {
            datatemp.addRow([i, v]);
        });
        $("#temp-canvas").show();

        var options = {
            //title: 'Elevation',
            backgroundColor: '#dcdcdc',
            hAxis: {
                title: "Time"
            },
            legend: 'none',
            titleY: 'Temperature [°C]',
            curveType: 'function'
        };
        TEMPCHART = new google.visualization.LineChart(document.getElementById('tempchart'));
        TEMPCHART.draw(datatemp, options);
    }
}

//Tekenen van hoogtegrafiek
function loadElev() {
    ELEVCHART = new google.visualization.ComboChart(document.getElementById('heightschart'));
    ELEVData = [];
    ELEVToCall = GMCoordinates;
    var locationRequest;

    if (ELEVToCall.length > 512) {
        var ELEVCalling = ELEVToCall.splice(0,511);
        locationRequest = {
            'locations': ELEVCalling
        };
        elevator.getElevationForLocations(locationRequest, MoreElev);
    }

    else{
        locationRequest = {
            'locations': ELEVToCall
        };
        elevator.getElevationForLocations(locationRequest, plotElevation);
    }
}

function MoreElev(results){
    for (var i=0; i<results.length; i++){
        ELEVData.push(results[i].elevation)
    }
    var locationRequest;
    if (ELEVToCall.length > 512) {
        var ELEVCalling = ELEVToCall.splice(0,511);
        locationRequest = {
            'locations': ELEVCalling
        };
        elevator.getElevationForLocations(locationRequest, MoreElev);
    }

    else{
        locationRequest = {
            'locations': ELEVToCall
        };
        elevator.getElevationForLocations(locationRequest, plotElevation);
    }
}

function plotElevation(results, status) {
    if (status != google.maps.ElevationStatus.OK) {
        return;
    }
    for (i=0; i<results.length; i++){
        ELEVData.push(results[i].elevation)
    }
    ToolTipData.Height = ELEVData;
    if (ELEVData.length == 1){
        return false
    }

    $("#heights-canvas").show();

    var options = {
        //title: 'Elevation',
        backgroundColor: '#dcdcdc',
        hAxis: {gridlines:{color:'#FF0000'},
        title:"Time"},
        //legend: 'none',
        //titleY: 'Elevation (m)',
        seriesType: "line",
        curveType: 'function',
        series: {1: {
            //type: "line",
            targetAxisIndex: 1
        }},
        vAxes: [
            {title: 'Elevation [m]',
                titleTextStyle: {color: '#0000FF'}},
            {title: 'Speed [' + UNITSPEED + ']',
                titleTextStyle: {color: '#FF0000'}}
        ]
    };

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    data.addColumn('number', 'Speed');

    for (var i = 0; i < results.length; i++) {
        data.addRow(['', parseFloat(ELEVData[i].toFixed(2)), speeddataDual[i]]);
    }

    // Draw the chart using the data within its DIV.
    var dataview = new google.visualization.DataView(data);
    ELEVCHART.draw(dataview, options);
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

function map(json) {
    GMCoordinates = json.route;
    var bounds  = new google.maps.LatLngBounds();
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

    var mapOptions = {
        scrollwheel: true,
        styles: mapstyle
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    (function ConfigureCoordinatesBounds(){

        if (GMCoordinates.length === 0) {
            HOEKPUNTEN = [
                [50.864477,4.679248],
                [50.863807,4.672468],
                [50.865913,4.687649],
                [50.861890,4.685460]];
            $.each(HOEKPUNTEN, function(){
                var bound = new google.maps.LatLng(this[0],this[1]);
                bounds.extend(bound);
            });
        }

        else {
            $.each(GMCoordinates, function(i,v){
                bounds.extend(v);
            });
        }
    })();

    (function makeMarkers(){
        var infowindow = new google.maps.InfoWindow({
        });

        (function startMarker(){
            var textstart = '<div>';

            if (ToolTipData.Timestamp[0]){
                var timestamp = new Date(ToolTipData.Timestamp[0]);
                timestamp = timestamp.format("HH:MM:ss");
                textstart += '<p>Time: ' + timestamp + '</p>';
            }
            if (ToolTipData.Speed[0]) {
                textstart += '<p>Speed: ' + ToolTipData.Speed[0] + ' ' + UNITSPEED + '</p>';
            }
            if (ToolTipData.Temp[0]){
                textstart += '<p>Temperature: ' + ToolTipData.Temp[0] + ' °C' + '</p>';
            }
            if (ToolTipData.Height[0]){
                textstart += '<p>Height: ' + parseFloat(ToolTipData.Height[0].toFixed(2)) + ' m' + '</p>';
            }
            if (ToolTipData.Pressure[0]){
                textstart += '<p>Pressure: ' + ToolTipData.Pressure[0] + ' °hPa' + '</p>';
            }
            if (ToolTipData.Images[0]){
                textstart += ToolTipData.Images[0];
            }

            textstart += '</div>';

            var markerstarticon = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=A|00FF00|000000");
            var markerstart = new google.maps.Marker({
                position: GMCoordinates[0],
                map: map,
                icon: markerstarticon,
                customData: textstart,
                customPoint: 0
            });

            google.maps.event.addListener(markerstart, 'click', function() {
                infowindow.setContent(this.customData);
                infowindow.open(map,markerstart);
            });

            google.maps.event.addListener(markerstart, 'mouseover', function(){
                ELEVCHART.setSelection([{row:0}]);
                TEMPCHART.setSelection([{row:0}]);
            });
        })();

        (function otherMarkers(){
            for (var i=1; i<GMCoordinates.length-1; i++){
                var text = '<div>';
                var color = '#428bcb';
                var strcolor = '#428bca';


                if (ToolTipData.Timestamp[i]){
                    var timestamp = new Date(ToolTipData.Timestamp[i]);
                    timestamp = timestamp.format("HH:MM:ss");
                    text += '<p>Time: ' + timestamp + '</p>';
                }
                if (ToolTipData.Speed[i]) {
                    text += '<p>Speed: ' + ToolTipData.Speed[i] + ' ' + UNITSPEED + '</p>';
                }
                if (ToolTipData.Temp[i]){
                    text += '<p>Temperature: ' + ToolTipData.Temp[i] + ' °C' + '</p>';
                }
                if (ToolTipData.Height[0]){
                    text += '<p>Height: ' + parseFloat(ToolTipData.Height[i].toFixed(2)) + ' m' + '</p>';
                }
                if (ToolTipData.Pressure[i]){
                    text += '<p>Pressure: ' + ToolTipData.Pressure[i] + ' °hPa' + '</p>';
                }
                if (ToolTipData.Images[i]){
                    text += ToolTipData.Images[i];
                    color = '#ff1919';
                    strcolor = '#ff0000';
                }
                text += '</div>';

                var markerimg = new google.maps.Circle({
                    position: GMCoordinates[i],
                    center: GMCoordinates[i],
                    map: map,
                    radius: 2.5,
                    strokeColor: strcolor,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: color,
                    fillOpacity: 0.35,
                    customData: text,
                    customPoint: i
                });

                google.maps.event.addListener(markerimg, 'click', function () {
                    infowindow.setContent(this.customData);
                    infowindow.open(map, this);
                });

                google.maps.event.addListener(markerimg, 'mouseover', function(){
                    ELEVCHART.setSelection([{row:this.customPoint}]);
                    TEMPCHART.setSelection([{row:this.customPoint}]);
                });
            }
        })();

        (function endMarker(){
            var textend = '<div>';

            if (ToolTipData.Timestamp[ToolTipData.Timestamp.length - 1]){
                var timestamp = new Date(ToolTipData.Timestamp[ToolTipData.Timestamp.length - 1]);
                timestamp = timestamp.format("HH:MM:ss");
                textend += '<p>Time: ' + timestamp + '</p>';
            }
            if (ToolTipData.Speed[ToolTipData.Speed.length - 1]) {
                textend += '<p>Speed: ' + ToolTipData.Speed[ToolTipData.Speed.length - 1] + ' ' + UNITSPEED + '</p>';
            }
            if (ToolTipData.Temp[ToolTipData.Temp.length - 1]){
                textend += '<p>Temperature: ' + ToolTipData.Temp[ToolTipData.Temp.length - 1] + ' °C' + '</p>';
            }
            if (ToolTipData.Height[ToolTipData.Height.length - 1]){
                textend += '<p>Height: ' + parseFloat(ToolTipData.Height[ToolTipData.Height.length - 1].toFixed(2)) + ' m' + '</p>';
            }
            if (ToolTipData.Pressure[ToolTipData.Pressure.length - 1]){
                textend += '<p>Pressure: ' + ToolTipData.Pressure[ToolTipData.Pressure.length - 1] + ' °hPa' + '</p>';
            }
            if (ToolTipData.Images[ToolTipData.Images.length - 1]){
                textend += ToolTipData.Images[ToolTipData.Images.length - 1];
            }

            textend += '</div>';

            var markerendicon = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=B|FF0000|000000");
            var markerend = new google.maps.Marker({
                position: GMCoordinates[GMCoordinates.length-1],
                map: map,
                icon: markerendicon,
                customData: textend,
                customPoint: GMCoordinates.length-1
            });

            google.maps.event.addListener(markerend, 'click', function() {
                infowindow.setContent(this.customData);
                infowindow.open(map,markerend);
            });

            google.maps.event.addListener(markerend, 'mouseover', function(){
                ELEVCHART.setSelection([{row:GMCoordinates.length-1}]);
                TEMPCHART.setSelection([{row:GMCoordinates.length-1}]);
            });
        })();
    })();

    (function GetDistance(){
        var dist = json.distance;

        if (dist > 1000){
            dist = parseFloat((dist/1000).toFixed(2));
            $("<p class='tripdata'>").text(dist + " km").appendTo($("#DIST"));
        }
        else {
            dist =  parseFloat(dist.toFixed(2));
            $("<p class='tripdata'>").text(dist + " m").appendTo($("#DIST"));
        }
    })();

    var bikePath = new google.maps.Polyline({
        path: GMCoordinates,
        geodesic: true,
        strokeColor: '#4373B2',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    var h = $("#left-column").height();
    $("#map-canvas").height(h);

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
        new FullScreenControl(map));
    map.fitBounds(bounds);
    map.panToBounds(bounds);
    bikePath.setMap(map);
}
