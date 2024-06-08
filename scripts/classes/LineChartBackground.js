export default class LineChartBackground {

    width; height; margin;
    lineChart; slider;
    svg;

    /**
    * Constructor function to initialize the LineChartBackground object.
    * @param {Object} lineChart - The line chart object.
    * @param {Object} slider - The slider object. 
    */
    constructor(lineChart, slider,) {
        this.container = lineChart.container;
        this.width = lineChart.width;
        this.height = lineChart.height;
        this.margin = lineChart.margin;
        this.lineChart = lineChart;
        this.slider = slider;
        this.svg = d3.select(this.container).append('svg')
            .classed('linechart background', true)
            .attr('width', this.width)
            .attr('height', this.height)
        this.bg = this.lineChart.svg.append('rect')
            .attr('width', 0)
            .attr('height', this.height - this.margin[1] - this.margin[0])
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`)
            .attr('fill', 'blue')
            .attr('opacity', 0.2);
        
    }
    /**
    * Updates the width of the background based on the slider's position.
    * @returns {void}
    * @example
    // Call the updateWidth method to update the background width
    lineChartBackground.updateWidth(); 
    */
    updateWidth() {
        // Calculate new dimensions based on the slider's position
        const sliderValue = this.slider.currentValue;
        const newWidth = this.#calculateWidthBasedOnSlider(sliderValue);
        // Apply the calculated changes to the background
        this.bg.transition().duration(10)
            .attr('width', newWidth);
    }

    /**
    * Calculates the width of the background based on the slider's value.
    * @param {number} value - The value of the slider.
    * @returns {number} The calculated width for the background.
    * @example
    * // Calculate the background width for a slider value of 50
    * const backgroundWidth = lineChartBackground.#calculateWidthBasedOnSlider(50); 
    */
    #calculateWidthBasedOnSlider(value) {
        let newWidth = this.lineChart.xScale(value);
        return newWidth;
    }
}
