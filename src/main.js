import './css/normalize.css';
import './css/style.css';

const url = 'https://market.aqumon.com/v1/chartboard/summary?algo_type_id=1&access_token=M3za0PTfaNZg59FVwg0jVJo2uwirzMwZ';

var Highcharts = require('highcharts/highstock');
var echarts = require('echarts');

// enable Highcharts exporting module
require('highcharts/modules/exporting')(Highcharts);

window.onload = function () {
    fetch(url, {cache: 'force-cache'}).then(res => {
        return res.json();
    }).then(result => {
        var seriesSet = result['portfolio_ts'];
        // structure of seriesSet:
        // {
        //     '2_': {'2003-01-01': 1, '2003-01-02': 1.1},
        //     '4_': {...},
        //     ...
        // }
        createHighchart(seriesSet);
        createEchart(seriesSet);
    }).catch(err => {
        console.error(err);
    });
}

function createHighchart(seriesSet) {
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
    Highcharts.stockChart('demo_highcharts', {
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
        series: seriesArr
    });
}

function createEchart(seriesSet) {
    // process series set
    var seriesArr = [];
    // structure of seriesArr:
    // [
    //     {
    //         name: '2_',
    //         type: 'line',
    //         data: seriesData
    //     },
    //     ...
    // ]
    for (let seriesName in seriesSet) {
        let seriesObj = seriesSet[seriesName];
        let seriesData = [];
        for (let dateStr in seriesObj) {
            let fullDate = new Date(dateStr);
            let time = fullDate.getTime();
            seriesData.push({
                name: dateStr,
                value: [
                    time,
                    seriesObj[dateStr]
                ]
            });
        }
        seriesArr.push({
            name: `Risk index ${seriesName}`,
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: seriesData
        });
    }
    var elem = document.getElementById('demo_echarts');
    // initialize Echart
    var myEchart = echarts.init(elem);
    // set options
    myEchart.setOption({
        grid: {
            // plot's distance from bottom edge of the container
            bottom: 80,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            },
            right: '10%'
        },
        xAxis: {
            type: 'time',
            axisLabel: {
                formatter: function (value, index) {
                    let formattedDate = getFormattedDate(value);
                    return formattedDate;
                }
            }
        },
        yAxis: {
            type: 'value'
        },
        dataZoom: [
            // data slider below plot area
            {
                type: 'slider',
                start: 0,
                end: 100
            },
            // data zoomer for mouse roll and touch
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        series: seriesArr
    });
}

function getFormattedDate(n) {
    var fullDate = new Date(n);
    var year = fullDate.getFullYear();
    var month = fullDate.getMonth() + 1;
    var date = fullDate.getDate();
    return `${year}/${month}/${date}`;
}