export default class ToolTip {
    /**
    Constructor function to create a new ToolTip instance. For proper styling, add a CSS class 'tooltip' to your stylesheet.
    @example
    JavaScript:
    const tooltip = new ToolTip(); 

    CSS:
    .tooltip {
        background: white;
        border: 2px solid black;
        padding: 5px;
    }
    */
    constructor() {
        // Create a tooltip div and append it to the body
        // This assumes the existence of a CSS class 'tooltip' for styling
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0);

    }
    /**
    Shows the tooltip with the given HTML content and coordinates.
    @param {string} htmlContent - The HTML content to be displayed in the tooltip.
    @param {number[]} coords - An array containing the x and y coordinates for positioning the tooltip.
    @example
    let x = event.clientX;
    let y = event.clientY;
    tooltip.show("<h3>Tooltip Content</h3>", [x, y]);
    */
    show(htmlContent, coords) {
        this.tooltip.html(htmlContent)
            .style("opacity", 1)
        this.updateCoords(coords);
    }

    /**
    Updates the position of the tooltip based on the given coordinates.
    @param {number[]} coords - An array containing the x and y coordinates for positioning the tooltip.
    @example
    let x = event.clientX;
    let y = event.clientY;
    tooltip.updateCoords([x, y]);
    */
    updateCoords(coords) {
        const tooltipWidth = this.tooltip.node().offsetWidth;
        const tooltipHeight = this.tooltip.node().offsetHeight;
        const mouseX = coords[0];
        const mouseY = coords[1];
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let tooltipX = mouseX + 10; // default tooltip position
        let tooltipY = mouseY + 10; // default tooltip position

        if (tooltipX + tooltipWidth > windowWidth) { // if tooltip is going off screen to the right, flip it to the left
            tooltipX = mouseX - tooltipWidth - 10;
        }

        if (tooltipY + tooltipHeight > windowHeight) { // if tooltip is going off screen to the bottom, flip it to the top
            tooltipY = mouseY - tooltipHeight - 10;
        }

        this.tooltip.style('top', tooltipY + 'px').style('left', tooltipX + 'px');
    }

    /**
    Hides the tooltip by setting its opacity to 0.
    @example
    tooltip.hide();
    */
    hide() {
        this.tooltip.style("opacity", 0);
    }
}
