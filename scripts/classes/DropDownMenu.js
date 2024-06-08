export default class DropDownChart {
    constructor(container, chart, labelOptions, dataOptions) {
        this.chart = chart;
        this.container = container;
        this.xLabel = Object.keys(dataOptions)[0];
        this.yLabel = labelOptions[this.xLabel];
        this.labelOptions = labelOptions;
        this.dataOptions = dataOptions;
        this.chart.setLabels(this.xLabel, this.yLabel);
    }

    // Set the labels for the x and y axis
    setLabels(xLabel, yLabel) {
        this.xLabel = xLabel;
        this.yLabel = yLabel;
        this.chart.setLabels(this.xLabel, this.yLabel);
    }

    // Render the bar chart
    render(data, clickFunc = (d) => { }) {
        this.chart.render(data, clickFunc);
    }

    // Create the dropdown menu in its own select element, separate from the bar chart
    createDropdown(labelOptions, dataOptions) {
        const dropdownMenu = d3.select(this.container)
            .append('div')
            .attr('class', 'dropdown-bar');

        const dropdown = dropdownMenu.append('select')
            .on('change', () => {
                this.xLabel = dropdown.property('value');
                this.yLabel = labelOptions[dropdown.property('value')];
                this.setLabels(this.xLabel, this.yLabel);
                this.render(dataOptions[dropdown.property('value')]);
            });

        dropdown.selectAll('option')
            .data(Object.keys(dataOptions))
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);

        return dropdownMenu;
    }
}