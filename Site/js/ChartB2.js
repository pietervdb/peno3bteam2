/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart"]});
bol.controller.DataAverageMax('NO DATA',"http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CW1A1");

function checkVariable(){
    if (typeof averagemax !== "undefined"){
        google.setOnLoadCallback(drawAverageMaxB2Chart());
    }
    else{
        window.setTimeout("checkVariable();",100);
    }
}

checkVariable();

function drawAverageMaxB2Chart() {
    var data = google.visualization.arrayToDataTable(averagemax);

    var options = {
        title: 'Average Speed',
        backgroundColor: '#dcdcdc',
        vAxis: {maxValue: 33, minValue:0},
        hAxis: {title:"Tripnumber"}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('averagemaxB2chart'));

    chart.draw(data, options);
}