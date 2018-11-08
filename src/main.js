import './css/normalize.css';
import './css/style.css';

const url = 'https://market.aqumon.com/v1/chartboard/summary?algo_type_id=1&access_token=M3za0PTfaNZg59FVwg0jVJo2uwirzMwZ';

var Highcharts = require('highcharts/highstock');

var echarts = require('echarts');

var F2 = require('@antv/f2/lib/index');
require('@antv/f2/lib/interaction/');
var ScrollBar = require('@antv/f2/lib/plugin/scroll-bar');

var G2 = require('@antv/g2');
var DataSet = require('@antv/data-set');
var Slider = require('@antv/g2-plugin-slider');

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
        createF2(seriesSet);
        createG2(seriesSet);
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
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
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
            // {
            //     type: 'inside',
            //     start: 0,
            //     end: 100
            // }
        ],
        series: seriesArr
    });
    function getFormattedDate(n) {
        var fullDate = new Date(n);
        var year = fullDate.getFullYear();
        var month = fullDate.getMonth() + 1;
        var date = fullDate.getDate();
        return `${year}/${month}/${date}`;
    }
}

function createF2(seriesSet) {
    var seriesArr = [];
    // structure of seriesArr:
    // [
    //     {
    //         type: '2_',
    //         date: '2003-01-01',
    //         value: 1.21
    //     },
    //     {
    //         type: '4_',
    //         date: '2003-01-01',
    //         value: 1.24
    //     },
    //     ...
    // ]
    for (let seriesName in seriesSet) {
        let dataObj = seriesSet[seriesName];
        for (let dateStr in dataObj) {
            seriesArr.push({
                type: `Risk index ${seriesName}`,
                date: new Date(dateStr),
                value: dataObj[dateStr]
            });
        }
    }
    // 1. create chart instance
    var chart = new F2.Chart({
        id: 'demo_f2',
        pixelRatio: window.devicePixelRatio,
        plugins: ScrollBar,
        padding: ['auto', 100]
    });

    // 2. load data
    chart.source(seriesArr);

    // 3. specify chart options
    // 1) data fields options
    chart.scale({
        date: {
            // specify type of `date` field
            // as time category
            type: 'timeCat'
        },
        value: {
            type: 'linear',
            formatter(e) {
                return `${e > 1 ? '+' : ''}${(e * 100 - 100)} %`
            }
        }
    });
    // 2) tooltip options
    chart.tooltip({
        showCrosshairs: true,
        showItemMarker: true,
        showTitle: true
    });
    // 3) axises options
    chart.axis('date', {
        label: function label(text, index, total) {
            var textCfg = {};
            if (index === 0) {
                textCfg.textAlign = 'left';
            } else if (index === total - 1) {
                textCfg.textAlign = 'right';
            }
            return textCfg;
        }
    });
    chart.line().position('date*value').color('type');

    // 4) interaction options
    // chart.interaction('pinch').interaction('pan');

    // 5) scroll bar options
    // chart.scrollBar({
    //     mode: 'x',
    //     xStyle: {
    //         offsetY: -5
    //     }
    // });

    // 6) legend options
    chart.legend({
        align: 'center',
        itemWidth: null
    });

    // 7) line
    chart.guide().line({
        top: false,
        start: ['min', 1],
        end: ['max', 1],
        style: {
            stroke: '#d3d3d3',
            lineWidth: 2,
            lineCap: 'round'
        }
    });

    // 4. Render chart
    chart.render();
}

function createG2(seriesSet) {
    var seriesArr = [];
    // structure of seriesArr:
    // [
    //     {
    //         type: '2_',
    //         date: '2003-01-01',
    //         value: 1.21
    //     },
    //     {
    //         type: '4_',
    //         date: '2003-01-01',
    //         value: 1.24
    //     },
    //     ...
    // ]
    for (let seriesName in seriesSet) {
        let dataObj = seriesSet[seriesName];
        for (let dateStr in dataObj) {
            seriesArr.push({
                type: `Risk index ${seriesName}`,
                date: dateStr,
                value: dataObj[dateStr]
            });
        }
    }

    // create dataset for slider
    var ds = new DataSet({
        state: {
            start: '2003-01-01',
            end: '2018-11-07'
        }
    });
    // create dataview based on dataset
    var dv = ds.createView();
    // specify dataview source data and transform logic
    dv.source(seriesArr).transform({
        type: 'filter',
        callback: obj => {
            return obj.date <= ds.state.end && obj.date >= ds.state.start;
        }
    });

    var chart = new G2.Chart({
        container: 'demo_g2',
        // force chart to fit parent container
        forceFit: true,
        height: 600,
        padding: ['auto', 100]
    });
    // specify dataview to be source of data
    chart.source(dv);
    chart.legend({
        position: 'top'
    });
    chart.scale({
        value: {
            type: 'linear',
            formatter(e) {
                return `${e > 1 ? '+' : ''}${(e * 100 - 100)} %`
            }
        }
    });
    chart.axis('value', {
        grid: {
            type: 'line',
            lineStyle: {
                stroke: '#ddd',
                lineWidth: 1,
                lineDash: [1, 0]
            }
        }
    });
    chart.guide().line({
        start: ['min', 1],
        end: ['max', 1],
        lineStyle: {
            stroke: '#d3d3d3',
            lineDash: [1],
            lineWidth: 2
        }
    });
    chart.line().position('date*value').color('type');
    chart.render();

    // create slider instance
    var slider = new Slider({
        container: 'demo_g2_slider',
        padding: ['auto', 100],
        start: '2003-01-01',
        end: '2018-11-07',
        data: seriesArr,
        xAxis: 'date',
        yAxis: 'value',
        onChange({startText, endText }) {
            ds.setState('start', startText);
            ds.setState('end', endText);
        }
    });
    // render slider
    slider.render();
}