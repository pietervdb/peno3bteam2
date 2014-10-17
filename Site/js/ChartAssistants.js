/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart"]});
google.load('visualization', '1', { 'packages': ['map'] });
bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=assistants");
bol.controller.Coordinates('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips/543632e2d06680ec647a990a/sensors" );

//checking averagemaxgraph data
function checkVariable(){
    if (typeof averagemax !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxAssistentsChart());
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}
//checking coordinates data
function checkVariable1(){
    if (typeof coordinates !== "undefined"){
        google.setOnLoadCallback(map());
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
    }
    else{
        window.setTimeout("checkVariable2();",100);
    }
}
checkVariable();
checkVariable1();
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
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);

}


//function drawMap() {
//    var data = google.visualization.arrayToDataTable(coordinates);
//
//    var options = { showTip: true,
//        showLine: true,
//        enableScrollWheel: true
//    };
//
//    var map = new google.visualization.Map(document.getElementById('chart_div'));
//
//    map.draw(data, options);
//}

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