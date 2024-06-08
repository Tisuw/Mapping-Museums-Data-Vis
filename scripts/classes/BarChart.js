import ToolTip from './ToolTip.js';

/**
 * 
 * This BarChart class, adapted from Pierre Le Bras's work for the F20DV course, provides enhanced features
 * including click functionality on bars, tooltips when bars are hovered, and transition animations.
 * 
 * Usage:
 *  1. Run the constructor with the container div id, width, height, margin dimensions
 *  2. Render data with the render function - data should be formatted as an array of key value pairs; [[k,v],...]
 *  3. Set the chart labels with the setLabels function
 * 
 **/

export default class BarChart {
    width; height; // size
    svg; chart; bars; labelX; labelY; // selections
    data; // internal data
    scaleX; scaleY; // scales
    tooltip; // tooltip
    rotation = 0; // rotation of x-axis labels

    /**
     * Constructor for the BarChart class, creates a new BarChart object in the specified container
     * @param {string} container - the id of the container div 
     * @param {number} width - the width of the chart
     * @param {number} height - the height of the chart
     * @param {number} margin - the margin of the chart [top, bottom, left, right]
     * @param {number} rotation  - the rotation of the x-axis labels
     * @example
     * const barChart = new BarChart('#bar-chart', 800, 400, [20, 20, 50, 50], 0);
     */
    constructor(container, width, height, margin, rotation = 0) {
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.rotation = rotation;

        // Create the SVG element
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Using the ToolTip class to create a tooltip
        this.tooltip = new ToolTip(this.svg);

        // Create the chart and axis groups
        this.chart = this.svg.append('g')
            .attr('transform', // translate the chart to the margin
                `translate(${this.margin[2]},${this.margin[0]})`); // margin[2] is left, margin[0] is top
        this.bars = this.chart.selectAll('rect.bar'); // selection of all bars

        // Create the axis groups
        this.axisX = this.svg.append('g')
            .attr('transform', 
                `translate(${this.margin[2]},${this.height - this.margin[1]})`); // translate to the bottom
        this.axisY = this.svg.append('g')
            .attr('transform',
                `translate(${this.margin[2]},${this.margin[0]})`); // translate to the left
 
        // Create the axis labels
        this.labelX = this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.height})`) // translate to the bottom
            .style('text-anchor', 'middle').attr('dy', -5); // center the label

        // Create the y-axis label
        this.labelY = this.svg.append('text') 
            .attr('transform', `translate(0,${this.margin[0]})rotate(-90)`)
            .style('text-anchor', 'end').attr('dy', 15); // rotate and align to the left


    }

    // Private methods

    /**
     * Update the scales based on the current data
     * @param {Array} data - the data to be used for the scales
     * @returns {void}
     * @example
     * #updateScales();
     */
    #updateScales() {
        // set the range for the scales
        let chartWidth = this.width - this.margin[2] - this.margin[3],
            chartHeight = this.height - this.margin[0] - this.margin[1];
        let rangeX = [0, chartWidth],
            rangeY = [chartHeight, 0];

        // set the domain for the scales
        let domainX = this.data.map(d => d[0]),
            domainY = [0, d3.max(this.data, d => d[1])];

        // create the scales
        this.scaleX = d3.scaleBand(domainX, rangeX).padding(0.2);
        this.scaleY = d3.scaleLinear(domainY, rangeY);
    }

    /**
     * Update the bars based on the current data
     * @param {Array} data - the data to be used for the bars
     * @returns {void}
     * @example
     * #updateBars();
     */
    #updateBars() {
        let tooltip = this.tooltip
        d3.select('body').selectAll('#tooltip').remove(); // remove all tooltips
        // set the color scale
        this.color = d3.scaleOrdinal()
            .domain(this.data)
            .range(d3.schemeSet2);

        // Join
        this.bars = this.bars
            .data(this.data, d => d[0]);

        // Update
        this.bars
            .transition()
            .duration(500)
            .attr('x', d => this.scaleX(d[0]))
            .attr('y', d => this.scaleY(d[1]))
            .attr('width', this.scaleX.bandwidth())
            .attr('height', d => this.scaleY(0) - this.scaleY(d[1]));

        // Enter
        this.bars.enter()
            .append('rect') // create a new rect for each data element
            .classed('bar', true) // add the class 'bar'
            .attr('x', d => this.scaleX(d[0])) // set the x position
            .attr('y', this.scaleY(0)) // set the y position to the bottom
            .attr('width', this.scaleX.bandwidth()) // set the width
            .attr('height', 0) 
            .attr('fill', this.color)
            .attr('fill-opacity', 0.8)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .on("click", (e, d) => { 
                // flash the bar by darkening it
                d3.select(e.target).attr('fill-opacity', 0.5);
                setTimeout(() => { // we use the standard setTimeout function to delay the next action
                    d3.select(e.target).attr('fill-opacity', 0.8); // reset the opacity after 100ms
                }, 100);
                this.clickFunc(d[0]);
            })
            .on("mouseover", (event, d) => { // show tooltip on hover
                const coords = [event.pageX, event.pageY];
                tooltip.show(`<p>Key: ${d[0]}<br>Value: ${d[1]}</p>`, coords); // show the tooltip with the key and value

            })
            .on("mousemove", (event) => { // update tooltip position on mousemove
                const coords = [event.pageX, event.pageY];
                tooltip.updateCoords(coords); // update the tooltip position
            })
            .on("mouseout", function () { // hide tooltip on mouseout
                tooltip.hide();
            })
            .transition() // animate the bars
            .duration(500)
            .attr('y', d => this.scaleY(d[1]))
            .attr('height', d => this.scaleY(0) - this.scaleY(d[1]));
    }

    /**
     * Update the axes based on the current data
     * @param {Array} data - the data to be used for the axes
     * @returns {void}
     * @example
     * #updateAxes();
     */
    #updateAxes() {
        let axisGenX = d3.axisBottom(this.scaleX),
            axisGenY = d3.axisLeft(this.scaleY);
        this.axisX.call(axisGenX) // call the axis generator
            .selectAll('text')
            .attr('transform', `rotate(${this.rotation})`) // rotate the labels
            .attr('dx', -8) // move the labels to the left
            .attr('dy', 8); // move the labels down
        this.axisY.call(axisGenY);
    }

    /**
     * 
     * @param {Array} dataset - the data to be rendered
     * @param {Function} clickFunc - the function to be called when a bar is clicked
     * @returns {Object} - the BarChart object {BarChart}
     * @example
     * // Render the data
     * barChart.render(data, clickFunc);
     */
    render(dataset, clickFunc) {
        // Clear previous bars
        this.chart.selectAll('.bar').remove(); // remove all bars
        this.axisX.selectAll("*").remove(); // remove all x-axis elements
        this.axisY.selectAll("*").remove(); // remove all y-axis elements
 
        // set data and render the chart
        this.data = dataset;
        this.clickFunc = clickFunc;
        this.#updateScales();
        this.#updateBars();
        this.#updateAxes();
        return this; // to allow chaining
    }

    /**
     * Sets the labels for the x and y axes.
     * @param {string} labelX - The label for the x-axis.
     * @param {string} labelY - The label for the y-axis.
     * @returns {Object} The LineChart instance for chaining.
     * @example
     * // Set the labels for the axes
     * barChart.setLabels('Categories', 'Values');
     */
    setLabels(labelX = 'categories', labelY = 'values') {
        this.labelX.text(labelX); // set the x-axis label
        this.labelY.text(labelY); // set the y-axis label
        return this; // to allow chaining
    }
}