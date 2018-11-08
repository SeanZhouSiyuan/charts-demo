# Charts Demo

This site contains demos of four charting libraries:

* Highcharts
* Echarts
* Antv F2
* Antv G2

Comparisons:

- `Highcharts` only requires a little amount of configuration to format the data and draw the chart.
- `Echarts` requires setting many options manually to achieve the same results, as it contains no specified libraries for stock data. Other drawbacks are as follows:
  - No intelligent X-axis label formatting
  - No responsiveness by default
  - Display problem: content near left and right container edges may overflow.
- `F2` does not support native mouse hover events by default, making it difficult to properly display tooltips and implement scrolling & zooming functionalities on PC.
- `G2`, on the other hand, does not support native touch events. Also, `G2` requires a separate library to enable sliding & zooming functionalities.
## Test run

```bash
npm install
npm run dev
```

## build

```bash
npm run build
```