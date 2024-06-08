//The code below is adapted from code provided by Pierre Le Bras as part of the F20DV course. 
//Modifications/Additions were made to support multi-line support, animation, colour scales, legends, ,area between two lines and trend lines.

import ToolTip from './ToolTip.js';

export default class LineChart {

    // Object properties
    width; height; margin;
    svg; chart; line; dots; dotSize
    axisX; axisY; labelX; labelY;
    xScale; yScale;
    data;
    tooltip;

    // options
    showTrend;
    showAreaBetween;
    transDuration;

    // Scales and Functions
    colorScale;
    generateLine;
    curveType;

    /**
   * Creates a new LineChart in the specified container.
   * @param {string} container - The identifier for the container element where the chart will be rendered.
   * @param {number} width - The width of the chart in pixels.
   * @param {number} height - The height of the chart in pixels.
   * @param {Array} margin - An array of four numbers representing the top, bottom, left, and right margins of the chart area in pixels. Add more to margin[3] to fit the legend if needed.
   * @param {Function} [colorScale=d3.scaleOrdinal(d3.schemeCategory10)] - The color scale function for the lines. Defaults to the D3 category10 color scale.
   * @param {boolean} [showTrend=false] - Whether to show the trend line for the data. Defaults to false.
   * @param {boolean} [showAreaBetween=false] - Whether to show the area between the lines and the trend line. Defaults to false. Can only be shown if showTrend is true.
   * @param {number} [dotSize=60] - The size of the data point dots in pixels. Defaults to 60.
   * @param {Function} [curveType=d3.curveCardinal] - The curve interpolation function for the lines. Defaults to D3's cardinal curve.
   * @param {number} [transDuration=500] - The duration of the animation transitions in milliseconds. Defaults to 500.
   * @example
   * const lineChart = new LineChart('#chart-container', 800, 600, [20, 20, 40, 40]);
   */
    constructor(container, width, height, margin, colorScale = d3.scaleOrdinal(d3.schemeCategory10), showTrend = false, showAreaBetween = false, dotSize = 60, curveType = d3.curveCardinal, transDuration = 500) {
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.curveType = curveType;
        this.transDuration = transDuration;
        this.svg = d3.select(container).append('svg')
            .classed('linechart vis', true)
            .attr('width', this.width)
            .attr('height', this.height)
        this.tooltip = new ToolTip(this.svg);
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`);
        this.dots = this.chart.selectAll('path.dot');
        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.height - this.margin[1]})`)
            .attr("stroke-width", 2);
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`)
            .attr("stroke-width", 2);
        this.labelX = this.svg.append('text')
            .classed('legend', true)
            .attr('transform', `translate(${this.width / 2},${this.height})`)
            .style('text-anchor', 'middle')
            .style("font-size", "16px")
            .attr('dy', -3)
            .attr("stroke-width", 2);
        this.labelY = this.svg.append('text')
            .classed('legend', true)
            .attr('transform', `translate(0,${this.margin[0]})rotate(-90)`)
            .style('text-anchor', 'end')
            .style("font-size", "16px")
            .attr('dy', 20)
            .attr("stroke-width", 2);
        this.colorScale = colorScale;
        this.showTrend =  showTrend;
        this.showAreaBetween = showAreaBetween;
        this.dotSize = dotSize;
    }

    /**
     * Updates the scales based on the data.
     * @param {Array} data - The data to be used for updating the scales.
     * @returns {void}
     * @example
     * // Update the scales for the following data
     * const data = [[1, 2], [3, 4], [5, 6]];
     * #updateScales(data);
     */
    #updateScales(data) {
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];
        let rangeX = [0, chartWidth],
            rangeY = [chartHeight, 0];
        let domainX = d3.extent(data, d => d[0]),
            // increase the max of y by 1, min decrease 0.5 so all the line shows
            domainY = [d3.extent(data, d => d[1])[0] - 0.5, d3.extent(data, d => d[1])[1] + 1];
        this.xScale = d3.scaleLinear(domainX, rangeX);
        this.yScale = d3.scaleLinear(domainY, rangeY);
    }

    /**
     * Updates the axes based on the updated scales.
     * @returns {void}
     * @example
     * // Update the axes after updating the scales
     * #updateAxes();
     */
    #updateAxes() {
        const removeCommas = d3.format(".0f");
        let axisGenX = d3.axisBottom(this.xScale).tickFormat(removeCommas),
            axisGenY = d3.axisLeft(this.yScale);
        // add transition for update x-axis
        this.axisX.transition().duration(this.transDuration).call(axisGenX);
        // add transition for update y-axis
        this.axisY.transition().duration(this.transDuration).call(axisGenY);
    }


    /**
     * Updates the lines for each dataset.
     * @param {Array} datasets - The datasets to be rendered as lines. They should be suitable for the same scale.
     * @returns {void}
     * @example
     * // Render the following datasets as lines
     * const datasets = [ [ [1, 2], [3, 4] ], [ [5, 6], [7, 8] ] ];
     * #updateLines(datasets);
     */
    #updateLines(datasets) {
        // Create a line generator function
        const generateLine = d3.line()
            .curve(this.curveType)
            .x(d => this.xScale(d[0]))
            .y(d => this.yScale(d[1]));

        // Update lines for each dataset
        const lines = this.chart.selectAll('.line')
            .data(datasets);

        // Enter: Create new lines for new datasets
        lines.enter().append('path')
            .classed('line', true)
            .attr('fill', 'none')
            .attr('stroke', (d, i) => this.colorScale(i))
            .attr('stroke-width', 2)
            .attr('d', d => generateLine(d));

        // Update: Update existing lines
        lines.transition().duration(this.transDuration)
            .attr('d', d => generateLine(d));

        // Exit: Remove lines for datasets that no longer exist
        lines.exit().transition().duration(this.transDuration)
            .remove();

        let tooltip = this.tooltip;

        // add dot animation
        this.dots = this.dots
            .data(this.data.flat())
            .join(
                // add transiiton for dot
                enter => enter.append('path')
                    .transition().duration(this.transDuration)
                    .attr('transform', d => `translate(${this.xScale(d[0])},${this.yScale(d[1])})`)
                    .attr('d', d3.symbol(d3.symbolCircle, this.dotSize)),
                update => update.transition().duration(this.transDuration)
                    .attr('transform', d => `translate(${this.xScale(d[0])},${this.yScale(d[1])})`)
                    .attr('d', d3.symbol(d3.symbolCircle, this.dotSize)),
                exit => exit.transition().duration(this.transDuration)
                    .remove()
            )
            .classed('dot', true)
            // add a tool tip to show the value for each dot
            .on('mouseover', (e, d) => {
                d3.select(e.target).attr('fill-opacity', 1);
                const coords = [e.pageX, e.pageY];
                tooltip.show(`${d[0]}: ${d[1]}`, coords);
            })
            .on('mousemove', function (e) {
                const coords = [e.pageX, e.pageY];
                tooltip.updateCoords(coords);
            })
            .on('mouseout', (e, d) => {
                tooltip.hide();
            })
        // if user want to use showTrend, show it
        if (this.showTrend) {
            this.#showTrend();
        }
        // if user want to use showAreaBetween, show it
        if (this.showAreaBetween) {
            this.#showAreaBetween(datasets);
        }
    }




    /**
     * Creates the trend line data.
     * @returns {Array} The start and end points of the line [ [x1, y1], [x2, y2]]. 
     * @example
     * // Get the trend line data
     * const trendLineData = #trendLineData();
     */
    #trendLineData() {
        const linearRegression = this.#computeLinearRegression();

        // Compute the range of the trend line based on the data extent
        const xExtent = d3.extent(this.data.flat(), d => d[0]);
        const x1 = xExtent[0]; // Start point for the line
        const x2 = xExtent[1]; // End point for the line
        // y = mx + b, calculate y values
        const y1 = linearRegression.slope * x1 + linearRegression.intercept;
        const y2 = linearRegression.slope * x2 + linearRegression.intercept;

        // return data for line
        return [[x1, y1], [x2, y2]];
    }




    /**
     * Appends a single trend line for all datasets in the line chart.
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Show the trend line
     * lineChart.#showTrend();
     */
    #showTrend() {
        // Create the trend line data
        const trendLineData = this.#trendLineData();

        // Create the trend line path
        const trendLine = this.chart.selectAll('.trendLine')
            .data([trendLineData])
            .join(
                enter => enter.append('path')
                    .classed('trendLine', true)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2)
                    .attr('d', d3.line()
                        .x(d => this.xScale(d[0]))
                        .y(d => this.yScale(d[1])))
                    .transition()
                    .duration(this.transDuration)
                    .attr('d', d3.line()
                        .x(d => this.xScale(d[0]))
                        .y(d => this.yScale(d[1]))),
                update => update.transition()
                    .duration(this.transDuration)
                    .attr('d', d3.line()
                        .x(d => this.xScale(d[0]))
                        .y(d => this.yScale(d[1]))),
                exit => exit.remove()
            );

        return this;
    }


    /**
     * Computes the linear regression for the data.
     * @returns {Object} An object containing the slope and intercept of the linear regression line.
     * @example
     * // Get the linear regression parameters
     * const linearRegression = #computeLinearRegression();
     * let coordX = 5;
     * let coordY = linearRegression.slope * coordX + linearRegression.intercept;
     */

    #computeLinearRegression() {
        const xSum = d3.sum(this.data.flat(), d => d[0]);
        const ySum = d3.sum(this.data.flat(), d => d[1]);
        const xxSum = d3.sum(this.data.flat(), d => d[0] * d[0]);
        const xySum = d3.sum(this.data.flat(), d => d[0] * d[1]);
        const n = this.data.flat().length;

        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        const intercept = (ySum - slope * xSum) / n;

        // gradient and intercept whit y-axis
        return { slope, intercept };
    }

    /**
     * Creates an area and animation between the two lines.
     * @param {Array} datasets - The datasets used to create the line.
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Show the area between the lines for the following datasets
     * const datasets = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
     * #showAreaBetween(datasets);
     */
    #showAreaBetween(datasets) {
        const showAreaBetween = this.chart.selectAll('.area')
            .data(datasets)
            .join(
                enter => enter.append('path')
                    .classed('area', true)
                    .transition().duration(this.transDuration)
                    .attr("fill", "#00e2ff")
                    .attr("fill-opacity", 0.1)
                    .attr('d', d3.area()
                        // make it curve
                        .curve(this.curveType)
                        .x(d => this.xScale(d[0]))
                        // y curve line
                        .y0(d => this.yScale(d[1]))
                        // y straight
                        .y1(d => this.yScale(this.#linearExpression(d[0])))),
                update => update.transition().duration(this.transDuration)
                    .attr("fill", "#00e2ff")
                    .attr("fill-opacity", 0.1)
                    .attr('d', d3.area()
                        // make it curve
                        .curve(this.curveType)
                        .x(d => this.xScale(d[0]))
                        // y curve line
                        .y0(d => this.yScale(d[1]))
                        // y straight
                        .y1(d => this.yScale(this.#linearExpression(d[0])))),
                exit => exit.remove()

            );
        return this;
    }


    /**
     * Calculates a y value for a given x value.
     * @param {number} x - The x value for which to calculate the linear expression.
     * @returns {number} The y value of the linear expression for the given x value.
     * @example
     * // Get the y value of the linear expression for x = 10
     * const y = #linearExpression(10);
     */
    #linearExpression(x) {
        const trendLineDataArea = this.#trendLineData();
        const a = (trendLineDataArea[1][1] - trendLineDataArea[0][1]) / (trendLineDataArea[1][0] - trendLineDataArea[0][0]);
        const b = trendLineDataArea[0][1] - trendLineDataArea[0][0] * a
        return a * x + b;
    }


    /**
     * Renders the line chart with the given datasets.
     * @param {Array} datasets - The datasets to be rendered on the line chart.
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Render the following datasets on the line chart
     * const datasets = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
     * lineChart.render(datasets);
     */
    render(datasets) {
        // Update scales based on the combined data from all datasets
        this.data = datasets;
        // Only show a trend line if there is one dataset
        this.showTrend = datasets.length == 1 ? this.showTrend : false;
        // Only show the area between the lines if there is a trend line
        this.showAreaBetween = datasets.length == 1 ? (this.showAreaBetween && this.showTrend) : false;
        this.#updateScales(datasets.flat());
        this.#updateLines(datasets);
        this.#updateAxes();

        return this;
    }

    /**
     * Sets the labels for the x and y axes.
     * @param {string} labelX - The label for the x-axis.
     * @param {string} labelY - The label for the y-axis.
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Set the labels for the axes
     * lineChart.setLabels('Time', 'Value');
     */
    setLabels(labelX = 'x values', labelY = 'y values') {
        this.labelX.text(labelX);
        this.labelY.text(labelY);
        return this;
    }

    /**
     * Creates a legend for the line chart.
     * @param {Array} labels - Array of labels for the legend items. This should match the number of datasets
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Create a legend with the following labels
     * const labels = ['Dataset 1', 'Dataset 2'];
     * lineChart.createLegend(labels);
     */
    createLegend(labels) {
        // Create a legend group to add items to, set it in the margin of the chart.
        const legend = this.svg.append('g')
            .classed('legend', true)
            .attr('transform', `translate(${this.width - this.margin[3]}, 20)`)
            .selectAll('.legend-item')
            .data(labels)
            .join('g')
            .classed('legend-item', true)
            .attr('transform', (d, i) => `translate(0,${i * 20})`);

        // Add rectangles for each legend item
        legend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', (d, i) => this.colorScale(i));

        // Add text for each legend item
        legend.append('text')
            .text(d => d)
            .attr('x', 15)
            .attr('y', 10)
            .style('font-size', '12px')
            .style('fill', 'black');

        return this;
    }

}