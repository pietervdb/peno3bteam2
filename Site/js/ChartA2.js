/**
 * Created by Bernd on 11-10-2014.
 */
google.load("visualization", "1", {packages:["corechart"]});
AverageMaxA2 = bol.controller.DataAverageMax('NO DATA', "http://dali.cs.kuleuven.be:8080/qbike/trips?groupID=CW1A1");

function checkVariable(){
    if (typeof AverageMaxA2 !== "undefined"){
        console.log(AverageMaxA2);
        google.setOnLoadCallback(drawAverageMaxA2Chart());
    }
    else{
        console.log(AverageMaxA2);
        window.setTimeout("checkVariable();",100);
    }
}

checkVariable();

function drawAverageMaxB2Chart() {
    var data = google.visualization.arrayToDataTable(AverageMaxA2);

    var options = {
        title: 'Average Speed',
        backgroundColor: '#dcdcdc',
        vAxis: {maxValue: 33, minValue:0},
        hAxis: {title:"Tripnumber"}
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('averagemaxA2chart'));

    chart.draw(data, options);
}