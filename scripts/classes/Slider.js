export default class Slider {
    width; height;
    svg; slider; handle; yearDisplay; playButton;
    currentValue;

    startDate; endDate;

    /**
     * Constructor function to create a new instance of the Slider class.
     * @param {HTMLElement} container - The string id of HTML element where the slider will be rendered.
     * @param {number} width - The width of the slider.
     * @param {number} height - The height of the slider.
     * @param {Array<number>} margin - An array containing the top, bottom, left and right margins of the slider.
     * @param {number} startDate - The start date of the slider range.
     * @param {number} endDate - The end date of the slider range.
     * @param {function} onChange - A callback function to be called when the slider value changes.
     * @example
     * // Create a new instance of the Slider class
     * let slider = new Slider('#slider', 1000, 150, [20, 40, 60, 20], minDate, maxDate, sliderCallback)
     */
    constructor(container, width, height, margin, startDate, endDate, onChange) {
        this.container = container;
        this.margin = margin;
        this.startDate = startDate;
        this.endDate = endDate;
        this.onChange = onChange;
        this.currentValue = startDate;
        this.width = width;
        this.height = height;
        this.xScale = d3.scaleLinear([startDate, endDate], [margin[2], width - margin[2] - margin[3]])
            .interpolate(d3.interpolateRound)
            .clamp(true);

        this.svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.slider = this.svg.append('g')
            .attr('class', 'slider')
            .attr('height', height - margin[0] - margin[1])
            .attr('width', width - margin[2] - margin[3])
            .attr('transform', `translate(0, 0)`);

        // Track
        this.slider.append('line')
            .attr('class', 'track')
            .attr('y1', height / 2) // Align with handle vertically
            .attr('y2', height / 2) // Align with handle vertically
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('stroke', '#ddd')
            .attr('stroke-width', '6'); // Make the track thicker

        // Handle
        this.handle = this.slider.append('circle')
            .attr('cy', height / 2)
            .attr('class', 'handle')
            .attr('r', 9)
            .attr('cx', this.xScale(startDate)); // Position handle at start date

        // Track Overlay for capturing drag events
        this.slider.append('rect')
            .attr('class', 'track-overlay')
            .attr('y', 0)
            .attr('x', this.xScale.range()[0])
            .attr('width', width - margin[2] - margin[3])
            .attr('height', height - margin[0] - margin[1])
            .attr('opacity', 0) // Make it invisible
            .call(d3.drag()
                .on('start drag', (event) => {
                    // Invert the current x position to the corresponding value in the domain
                    const rawValue = this.xScale.invert(event.x);
                    // Round the value to the nearest whole number
                    const roundedValue = Math.round(rawValue);

                    this.currentValue = roundedValue;
                    // Update the handle position using the rounded value
                    this.handle.attr('cx', this.xScale(roundedValue));

                    // Use the callback function
                    this.onChange();
                    // Update the year display
                    this.#updateYearDisplay(roundedValue); 

                }));


        this.slider.insert('g', '.track-overlay')
            .attr('class', 'ticks')
            .attr('transform', `translate(0, ${height / 4})`)
            .selectAll('text')
            .data(this.xScale.ticks(20))
            .enter()
            .append('text')
            .attr('x', (d) => this.xScale(d) - 10)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .text((d) => (d));


        // Append a text element for displaying the current year above the handle.
        this.yearDisplay = this.slider.append('text')
            .attr('class', 'year-display')
            .attr('text-anchor', 'middle') // Center the text above the handle
            .attr('dy', '15')

        // Set text for the year display
        this.#updateYearDisplay(startDate);
    }

    /**
     * Private method to update the year displayed above the slider handle.
     * @param {number} year - The year to be displayed.
     * @example
     * // Update the year display with the current year
     * this.#updateYearDisplay(2023);
     */
    #updateYearDisplay(year) {
        // Update the text element with the current year and adjust its position
        this.yearDisplay.text(year)
            .attr('x', this.xScale(year))
    }

    /**
     * Method to append a play button to the slider.
     * @returns {Slider} The current instance of the Slider class.
     * @example
     * // Append a play button to the slider
     * slider.appendPlayButton();
     */
    appendPlayButton() {
        // Define button dimensions and position
        const buttonSize = 30;
        const buttonX = this.width - buttonSize - this.margin[3]; // Positioning the button on the right
        const buttonY = this.height / 2 - buttonSize / 2; // Position the button below the slider track

        // Append a group for the play button
        this.playButton = this.svg.append('g')
            .attr('class', 'play-button')
            .attr('transform', `translate(${buttonX},${buttonY})`)
            .style('cursor', 'pointer')
            .on('click', () => this.#toggleAnimation());

        // Append a rectangle for the button background
        this.playButton.append('rect')
            .attr('width', buttonSize)
            .attr('height', buttonSize)
            .attr('rx', 3)
            .attr('fill', '#ddd');

        // Overlay a play symbol
        this.playButton.append('path')
            .attr('icon', 'play')
            .attr('d', 'M 8,5 L 8,25 23,15 Z') // Play svg icon 
            .attr('fill', 'black');

        return this;
    }
    /**
     * Private method to toggle the animation of the slider.
     * @example
     * // Toggle the animation of the slider
     * this.#toggleAnimation();
     */
    #toggleAnimation() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            // Change the button icon to a pause icon
            this.playButton.select('path')
                .attr('d', 'M 8,5 L 8,25 M 8,5 L 12,5 L 12,25 L 8,25 Z M 16,5 L 16,25 M 16,5 L 20,5 L 20,25 L 16,25 Z');
            this.#animateSlider();
        } else {
            this.isPlaying = false;
            // Change the button icon to a play icon
            this.playButton.select('path')
                .attr('d', 'M 8,5 L 8,25 L 23,15 Z');
            this.handle.interrupt(); // Stop the handle's transition
            this.svg.interrupt(); // Stop the year display's transition
            this.yearDisplay.interrupt(); // Stop the year display's transition
        }
    }


    /**
     * Private method to animate the slider handle.
     * @example
     * // Animate the slider handle
     * this.#animateSlider();
     */
    #animateSlider() {
        const totalDuration = 8000; // Total duration for the full range from start to end
        const currentX = parseFloat(this.handle.attr('cx')); // Current position of the handle
        const currentProgress = this.xScale.invert(currentX); // Current value represented by the handle
        const progress = (currentProgress - this.startDate) / (this.endDate - this.startDate); // Progress as a fraction
        const remainingDuration = totalDuration * (1 - progress); // Calculate the remaining duration based on the current position

        const interpolateDate = d3.interpolate(currentProgress, this.endDate);

        // Animate the handle to the end of the range
        this.handle.transition()
            .duration(remainingDuration)
            .ease(d3.easeLinear)
            .attrTween('cx', () => t => this.xScale(interpolateDate(t)))
            .on('end', () => {
                this.isPlaying = false;
                this.playButton.select('path')
                    .attr('d', 'M 8,5 L 8,25 L 23,15 Z'); // Change to Play icon
            });

        // Update the displayed year, as the handle moves
        this.yearDisplay.transition()
            .duration(remainingDuration)
            .ease(d3.easeLinear)
            .tween('date', () => t => {
                const currentDate = Math.round(interpolateDate(t));
                this.onChange(currentDate);
                this.currentValue = currentDate; // Update the current value
                this.#updateYearDisplay(currentDate); // Update display
            });
    }





}
