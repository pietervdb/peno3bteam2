/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart"]});
google.load('visualization', '1', { 'packages': ['map'] });
bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=assistants");
bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );
bol.controller.DataTemperature('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543bd7fcc3b754432f4db783" );
bol.controller.Dataimg('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips/543fafc6c786e80f0ec75bcd");
//checking averagemaxgraph data
function checkVariable(){
    if (typeof averagemax !== "undefined" && typeof coordinates !== "undefined" && typeof temperature !== "undefined" && typeof image !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
        google.setOnLoadCallback(map());
        google.setOnLoadCallback(drawTemp());
        bol.controller.Height('NO DATA', coordinates);
        imageURL = "http://dali.cs.kuleuven.be:8080/qbike/images/";
        imageURL = imageURL.concat(image);
        console.log(imageURL);
        $("#image").prepend("<img src='imageURL'/>")
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}

//checking heights data
function checkVariable2(){
    if (typeof heights !== "undefined"){
        google.setOnLoadCallback(drawHeights());
    }
    else{
        window.setTimeout("checkVariable2();",100);
    }
}
checkVariable();
checkVariable2();


function drawAverageMaxAssistentsChart() {
    var data = google.visualization.arrayToDataTable(averagemax);

    var options = {
        title: 'Average Speed',
        backgroundColor: '#dcdcdc',
        vAxis: {maxValue: 33, minValue:0},
        hAxis: {title:"Tripnumber"}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('averagemaxassistantschart'));

    chart.draw(data, options);
}

function map() {
    var coor = [];
    for (i=0; i<coordinates.length; i++){
        coor[coor.length] = new google.maps.LatLng(coordinates[i][0],coordinates[i][1]);
    }
    var mapOptions = {
//        center: coor[0],
//        zoom: 6
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    bounds  = new google.maps.LatLngBounds();

    for (i=0; i<coordinates.length; i++){
        var marker = new google.maps.Marker({
            position: coor[i],
            map: map,
        });
        var loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(loc);
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
        title: 'Average Speed',
        backgroundColor: '#dcdcdc',
        vAxis: {maxValue: 33, minValue:0},
        hAxis: {title:"Tripnumber"}
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