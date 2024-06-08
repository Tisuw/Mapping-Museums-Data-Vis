/**
 * 
 * This DoughnutChart class, adapted from Pierre Le Bras's work for the F20DV course, provides enhanced features
 * including a legend, a colourscheme, tooltips when bars are hovered, and transition animations.
 * 
 * Usage:
 *  1. Run the constructor with the container div id, width
 *  2. Render data with the render function - data should be formatted as an array of key value pairs; [[k,v],...]
 *  3. Set the chart title with the setTitle function
 * 
 **/

import ToolTip from './ToolTip.js';

export default class DoughnutChart {
    svg; chart; arcs; color; // selections
    width; // size
    data; // data
    labels; title; // segment labels and chart title
    tooltip; // tooltip

    /**
    Constructs a new DoughnutChart instance.
    @param {string} container - The container element for the chart.
    @param {number} width - The width of the chart in pixels.
    @example
    let doughnut = new DoughnutChart(container: id for container element e.g. "div#id", width: integer width value); 
    */
    constructor(container, width) {
        this.width = width;
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', width + 300)
            .attr('height', width + 100)
            .classed('doughnutchart', true);


        this.tooltip = new ToolTip(this.svg);

        this.chart = this.svg
            .append('g');

        this.chart.attr("transform", `translate(${width / 2},${width / 2})`)
            .style('fill-opacity', 0.1);

        this.title = this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.width + 30})`)
            .style('text-anchor', 'middle').attr('dy', -5);
        this.arcs = this.chart.selectAll('path.arc');
        // sort by key/label
        this.pieGenerator = d3.pie()
            .padAngle(0.02)
            .sort((a, b) => d3.ascending(a[0], b[0]))
            .value(d => d[1]);
    }

    #mergeData(dataA, dataB) {
        let keySetB = new Set(dataB.map(d => d[0]));
        let zeroesA = dataA.filter(d => !keySetB.has(d[0]))
            .map(d => [d[0], 0]);
        let merged = dataB.concat(zeroesA).sort((a, b) => d3.ascending(a[0], b[0]));
        return merged;
    }

    /**
    Creates the chart arcs and adds them to the svg
    @returns {void}
    @example
    updateChart();
    */
    #updateChart() {
        let dur = 500;
        let pieGen = d3.pie()
            .padAngle(0)
            .sort(null)
            .value(d => d[1]);
        let pieData = pieGen(this.data);

        let tooltip = this.tooltip;

        d3.select('body').selectAll('#tooltip-pie').remove();

        // set the color scale
        this.color = d3.scaleOrdinal()
            .domain(this.data)
            .range(this.colourScheme);

        // creating an arc generator
        let arcGen = d3.arc()
            .innerRadius(this.width / 4)
            .outerRadius(this.width / 2 - 5);

        //The animation part code below is adapted from code provided by Pierre Le Bras as part of the F20DV course. 
        //Modifications/Additions were made to support other functions.
        let arcInterpolator = function (d) {
            let interpolate = d3.interpolate(this._d, d);
            return (t) => {
                this._d = interpolate(t);
                return arcGen(this._d)
            }
        }

        // query old data, returns exisiting data if it's the first render
        let oldData = this.arcs.empty() ? this.data : this.arcs.data().map(d => d.data);
        // make two addtional sets of sparse data
        // so that new arcs start with value 0 and old arcs finish with value 0
        let was = this.#mergeData(this.data, oldData),
            is = this.#mergeData(oldData, this.data);

        // drawing the arcs
        this.arcs = this.chart.selectAll('path')
            .data(pieData, d => d.data[0])
            .join('path')
            .attr('fill', this.color).attr('fill-opacity', 0.8)
            .attr('stroke', 'black').attr('stroke-width', 2)
            .attr('d', arcGen)
            // bind and join sparse old data (new elements in with value 0)
            .data(this.pieGenerator(was), d => d.data[0])
            .join(
                // create new arcs, with value 0
                enter => enter.insert('path').classed('arc', true).each(function (d) { this._d = d }),
                update => update,
                exit => exit
            )
            // bind and join sparse new data (old elements kept with value 0)
            .data(this.pieGenerator(is), d => d.data[0])
            .join(
                enter => enter,
                // interpolate new and old arcs
                update => update.transition().duration(dur).attrTween('d', arcInterpolator),
                exit => exit
            )
            // bind and join final data (only new elements)
            .data(this.pieGenerator(this.data), d => d.data[0])
            .join(
                enter => enter,
                update => update,
                // destroy old arcs (after interpolation is finished) add .attr('stroke',none) to see a different result
                exit => exit.transition().duration(dur).delay(dur).remove())
            .on("click", (e, d) => {
                // flash the bar by darkening it
                d3.select(e.target).attr('fill-opacity', 0.5);
                setTimeout(() => {
                    d3.select(e.target).attr('fill-opacity', 0.8);
                }, 100);
                this.clickFunc(d[0]);
            })
            .on('mouseover', (e, d) => {
                d3.select(e.target).attr('fill-opacity', 1);
                const coords = [e.pageX, e.pageY];
                tooltip.show(`${d.data[0]}: ${d.data[1]}`, coords);
            })
            .on('mousemove', function (e) {
                const coords = [e.pageX, e.pageY];
                tooltip.updateCoords(coords);
            })
            .on('mouseout', (e, d) => {
                tooltip.hide();
            });

        // legend for the chart
        this.chart.selectAll('circle').remove()
        this.chart.selectAll('legendLabels').remove()

        this.dots = this.chart.selectAll('legendDots')
            .data(pieData)
            .enter()
            .append('circle')
            .attr("cx", 240)
            .attr("cy", function (d, i) { return -150 + i * 25 })
            .attr("r", 7)
            .style("fill", this.color)
            .style("stroke", "black")
            .style('fill-opacity', 1)

        this.labels = this.chart.selectAll('legendLabels')
            .data(pieData)
            .enter()
            .append('text')
            .classed("label", true)
            .text(function (d) { return d.data[0] })
            .attr("x", 250)
            .attr("y", function (d, i) { return -146 + i * 25 })
            .style("font-size", 12)
            .style('fill-opacity', 1);
    }

    /**
    Sets the title of the doughnut chart.
    @param {string} label - The title for the chart.
    @returns {void}
    @example
    doughnut.setTitle("My Doughnut Chart")
    */
    setTitle(label) {
        if (label.length != 0) {
            this.title.text(label);
        }
        else {
            this.title.text("No Data Selected");
        }
        return this;
    }

    /**
    Render data to the chart.
    @param {string} data - The data to be rendered (formatted [[k,v],...]).
    @param {array} colours - The colourscheme for the arcs.
    @returns {void}
    @example
    doughnut.render(data, ["red", "blue", "green", "purple"])
    */
    render(data, colours = d3.schemeSet2) {
        this.data = data;
        this.colourScheme = colours;
        this.chart.selectAll(".label").remove(); // remove any existing labels
        this.#updateChart();
    }

    /**
    Clears the chart.
    @returns {void}
    @example
    doughnut.clear();
    */
    clear() {
        this.arcs.remove();
        this.dots.remove();
        this.labels.remove();
        this.title.text("");
    }
}