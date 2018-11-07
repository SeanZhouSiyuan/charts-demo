import './css/normalize.css';
import './css/style.css';

const url = 'https://market.aqumon.com/v1/chartboard/summary?algo_type_id=1&access_token=M3za0PTfaNZg59FVwg0jVJo2uwirzMwZ';

var Highcharts = require('highcharts/highstock');

// enable exporting module
require('highcharts/modules/exporting')(Highcharts);

function createHighchart (seriesOptions) {
    Highcharts.stockChart('demo_highchart', {
        chart: {
            height: 600
        },
        rangeSelector: {
            selected: 4
        },
        yAxis: {
            // move Y-axis to left of chart
            opposite: false,
            labels: {
                formatter: function () {
                    return (this.value > 0 ? '+' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },
        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },
        tooltip: {
            pointFormat: '<span>Risk index {series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },
        series: seriesOptions
    });
}

window.onload = function () {
    fetch(url, {cache: 'force-cache'}).then(res => {
        return res.json();
    }).then(data => {
        var seriesSet = data['portfolio_ts'];
        // structure of seriesSet:
        // {
        //     '2_': {'2003-01-01': 1, '2003-01-02': 1.1},
        //     '4_': {...},
        //     ...
        // }
        var seriesArr = [];
        // structure of seriesArr:
        // [
        //     {
        //         name: '2_',
        //         data: [
        //             [
        //                 1041379200000,
        //                 1.10
        //             ],
        //             ...
        //         ]
        //     },
        //     ...
        // ]
        for (let seriesName in seriesSet) {
            var dataObj = seriesSet[seriesName];
            var dataArr = [];
            for (let dateStr in dataObj) {
                dataArr.push([
                    new Date(dateStr).getTime(),
                    dataObj[dateStr]
                ]);
            }
            seriesArr.push({
                name: seriesName,
                data: dataArr
            });
        }
        createHighchart(seriesArr);
    }).catch(err => {
        console.error(err);
    });
}