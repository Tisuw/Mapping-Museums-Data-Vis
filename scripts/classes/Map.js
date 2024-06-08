/**
 * This Map class, adapted from Pierre Le Bras's work for the F20DV course, provides enhanced features
 * including region selection, highlighting, and dynamic data filtering, alongside grouping of closely
 * situated points for improved data visualization.
 *
 * Features:
 * - Zooming: Allows users to zoom in/out for detailed geographic inspection.
 * - Region Selection: Enables users to select/deselect geographic regions, affecting data visibility.
 * - Color Scales: Supports custom color scales for distinguishing between different regions.
 * - Grouping Points: Groups nearby points to reduce visual clutter and enhance readability.
 *
 * Usage:
 * 1. Initialize the Map with dimensions, color scale, and region selection callback:
 *    `let mapRegions = new Map('#map', 1000, 800, d3.scaleSequential(d3.interpolateBlues));`
 * 2. Render the base map using GeoJSON data:
 *    `mapRegions.baseMap(regionsData, d3.geoWinkel3);`
 * 3. Display data points, automatically grouping those that are close:
 *    `mapRegions.renderGroupedPoints(pointsData);`
 * 4. Update displayed points based on new data or selected regions:
 *    `mapRegions.updatePoints(newPointsData);` for fresh data,
 *    or utilize the `filterOnSubject` function for region-based filtering.
 *
 * Data Handling:
 * - `data`: Stores the original dataset.
 * - `filteredData`: Should be used to store the first filter on the data, usually the regionSelectCallback.
 *    Example:
 *      function filterOnSubject(region, selectedRegions) {
            try {
                let newData = this.data.filter(d => selectedRegions.has(d[2]));
                this.filteredData = newData;
            }
            catch (e) {
                console.log(e);

            }
        }
        Where d[2] has the region name for the data point.
 * - `updatePoints`: Renders points without altering the original or currently filtered data sets. This should be used to apply a second filter.
 *   Example:
 *      
 *      function mapRegionsFilterOnDate(date) {
 *          filterOnDate(mapRegions, date);
 *      }
 *      function filterOnDate(map, date) {
            try {
                let newData = map.filteredData.filter(d => d[4] <= date && (d[5] >= date || isNaN(d[5]));
                map.updatePoints(newData);
            }
            catch (e) {
                console.log(e);
            }
        }
 * - Region selection updates are facilitated through callbacks, allowing for flexible data filtering.
 * Note: The class manages region selection via mouse clicks, enabling dynamic filtering of displayed data points.
 */
import ToolTip from "./ToolTip.js";

export default class Map {

    width; height;

    svg; mapGroup; pointGroup;
    projection; pathGen;

    zoom; zoomable;

    regions;
    selectedRegions;
    data;
    regionColorScale;
    pointScale;
    maxRadius; groupRadius;
    tooltip;



    /**
    Constructs a new Map instance.
    @param {string} container - The container element selector for the map.
    @param {number} width - The width of the map in pixels.
    @param {number} height - The height of the map in pixels.
    @param {function} colorScale - A D3 color scale function for coloring regions (optional). Use d3.scaleSequential(d3.interpolateBlues) by default.
    @param {function} regionSelectCallback - A callback function called when a region is selected/deselected (optional).
    @param {boolean} zoomable - Flag indicating whether the map should be zoomable (optional, default: true).
    @example
    let mapRegions = new Map('#map', 1000, 800, d3.scaleSequential(d3.interpolateBlues)); 
    */
    constructor(container, width, height, colorScale = d3.scaleSequential(d3.interpolateBlues), regionSelectCallback = (d) => { }, zoomable = true) {
        this.width = width;
        this.height = height;

        // setting up selections
        this.svg = d3.select(container).append('svg')
            .classed('vis map', true)
            .attr('width', width)
            .attr('height', height);
        this.mapGroup = this.svg.append('g')
            .classed('map', true);
        this.pointGroup = this.svg.append('g')
            .classed('points', true);
        this.regionColorScale = colorScale;
        this.regionSelectCallback = regionSelectCallback;

        // // setting the zoom
        if (zoomable) {
            this.#setZoom();
        }
        this.tooltip = new ToolTip(this.svg);

    }

    /**
    Sets up the zoom behavior for the map. Source: Pierre Le Bras's work for the F20DV course.
    @private 
    */
    #setZoom() {
        this.zoom = d3.zoom()
            .extent([[0, 0], [this.width, this.height]])
            .translateExtent([[0, 0], [this.width, this.height]])
            .scaleExtent([1, 8])
            .on('zoom', ({ transform }) => {
                // applies transform and call render map to update zoom scales
                this.mapGroup.attr('transform', transform);
                this.pointGroup.attr('transform', transform);
            })
        this.svg.call(this.zoom)
    }

    /**
    Renders the base UK map with regions. Source: Pierre Le Bras's work for the F20DV course.
    Additional features include region selection and highlighting.
    Ireland, Isle of Man, and Channel Islands are classed as the background.
    @param {Object} projection - The D3 geographic projection function to use.
    @private
     */
    #renderMap(projection) {
        this.projection = projection()
            .fitSize([this.width, this.height], this.regions);
        this.pathGen = d3.geoPath()
            .pointRadius(4)
            .projection(this.projection);

        let regions = this.mapGroup.selectAll('path.regions')
            .data(this.regions.features)
            .join('path')
            .classed('regions', true)
            .attr('fill', d => this.regionColorScale(d.properties.name))
            .attr('name', d => d.properties.name)
            .attr("data-highlighted", "true")
            .attr('d', this.pathGen)
            .classed('back', d => d.id === 'IRL' || d.id === 'IOM' || d.id === 'CHI');

        // Set all regions as selected initially
        this.selectedRegions = new Set(this.regions.features.map(region => region.properties.name));

        // OnClick event for region selection
        regions.on("click", (event, d) => {
            const region = d3.select(event.target);
            this.#toggleRegion(d, region);

            // Now, filter the dataset and update the visualisation
            this.regionSelectCallback(region, this.selectedRegions);
        });


    }

    /**
    Renders a base map with regions. Source: Pierre Le Bras's work for the F20DV course.
    @param {Object[]} regions - The GeoJSON data for the regions.
    @param {function} projection - The D3 geographic projection function to use (optional, default: d3.geoEqualEarth).
    @returns {Map} The current Map instance.
    @example
    mapRegions.baseMap(regionsData, d3.geoWinkel3); 
    */
    baseMap(regions = [], projection = d3.geoEqualEarth) {
        this.regions = regions;
        this.#renderMap(projection);
        return this;
    }

    /**
    Renders points on the map, grouping nearby points into larger circles.
    @param {Array[]} dataset - The dataset containing point data in the format [[lat, lon, region, ...], ...].
    @param {number} maxRadius - The maximum radius for individual points (optional, default: 15).
    @param {number} groupRadius - The radius threshold for grouping nearby points, this is in Kilometers (optional, default: 40).
    @returns {Map} The current Map instance.
    @example
    mapRegions.renderGroupedPoints(pointsData); 
    */
    renderGroupedPoints(dataset, maxRadius = 15, groupRadius = 40) {
        this.data = dataset;
        this.filteredData = dataset;
        this.maxRadius = maxRadius;
        this.groupRadius = groupRadius;
        this.pointScale = this.#createSqrtScale(dataset);
        this.#renderGroupedPoints(dataset, groupRadius);
        return this;
    }

    /**
    Updates the displayed points on the map with new data.
    @param {Array[]} newData - The new dataset to be displayed (optional, defaults to the original dataset in the format [[lat, lon, region, ...], ...])
    @returns {Map} The current Map instance.
    @example
    mapRegions.updatePoints(newPointsData); */
    updatePoints(newData = this.data) {
        this.#renderGroupedPoints(newData);
        return this;
    }

    /**
    Renders grouped points on the map.
    @param {Array[]} data - The dataset to be rendered (optional, defaults to the current dataset).
    @private 
    */
    #renderGroupedPoints(data = this.data) {
        let groupedData = this.#groupCoordinates(data, this.groupRadius);
        let tooltip = this.tooltip;
        this.#addTotalPoints(groupedData);

        // Select all points and bind them to the groupedData, an array of [[lat, lon], count]
        this.pointGroup
            .selectAll('circle.point')
            .data(groupedData)
            .join(
                enter => enter.append('circle').classed('point', true)
                    .attr('fill', 'red')
                    .on("mouseover", (event, d) => {
                        const coords = [event.pageX, event.pageY];
                        tooltip.show(`<p>Coordinates: ${d[0]} <br>Size of group: ${d[1]}</p>`, coords);
                    })
                    .on("mousemove", (event) => {
                        const coords = [event.pageX, event.pageY];
                        tooltip.updateCoords(coords);
                    })
                    .on("mouseout", function () {
                        tooltip.hide();
                    }),
                update => update.attr('transform', d => `translate(${this.projection([d[0][1], d[0][0]])})`)
                    .attr('r', d => this.pointScale(d[1])),
                exit => exit.remove()
            )
    }

    /**
    Groups coordinates into an array of [[lat, lon], count].
    @param {Array[]} coordinates - The coordinates to be grouped in the format [[lat, lon, ...], ...].
    @param {number} maxDistance - The maximum distance threshold for grouping points.
    @returns {Array[]} The grouped coordinates in the format [[lat, lon], count].
    @private 
    */
    #groupCoordinates(coordinates, maxDistance) {
        // Calculate the haversine distance between two coordinates in kilometers
        // See for details: https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128#:~:text=All%20of%20these%20can%20be,longitude%20of%20the%20two%20points.

        const haversineDistance = (coords1, coords2) => {
            const [lat1, lon1] = coords1;
            const [lat2, lon2] = coords2;
            // Earth radius in kilometers
            const R = 6371;
            // Convert latitude and longitude from degrees to radians
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            // Haversine formula
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            // Distance in kilometers
            const distance = R * c;
            return distance;
        };

        // Merge a point into the closest group
        const mergeIntoClosestGroup = (point, groups) => {
            let closestGroup = null;
            let shortestDistance = maxDistance;

            // Find the closest group and distance
            for (let i = 0; i < groups.length; i++) {
                const distance = haversineDistance(point, groups[i][0]);
                if (distance < shortestDistance) {
                    closestGroup = i;
                    shortestDistance = distance;
                }
            }

            if (closestGroup !== null) {
                // Update existing group, count and average coordinates
                const group = groups[closestGroup];
                const [groupPoint, count] = group;
                const newLat = (groupPoint[0] * count + point[0]) / (count + 1);
                const newLon = (groupPoint[1] * count + point[1]) / (count + 1);
                group[0] = [newLat, newLon];
                group[1] += 1;
            } else {
                // Create new group
                groups.push([[point[0], point[1]], 1]);
            }
        };

        const groups = [];
        coordinates.forEach(point => {
            mergeIntoClosestGroup(point, groups);
        });
        return groups.map(group => ([group[0], group[1]]));
    }


    /**
    Toggles the selection/deselection of a region.
    @param {Object} elementData - The data object for the region element.
    @param {d3.selection} region - The D3 selection for the region element.
    @private 
    */
    #toggleRegion(elementData, region) {
        const isHighlighted = region.attr("data-highlighted") === "true";
        // Determine the new fill color based on whether it's currently highlighted
        const newFill = isHighlighted ? "#f7f7f7" : this.regionColorScale(elementData.properties.name);
        // Apply the new fill color with a transition
        region.transition()
            .duration(250)
            .attr('fill', newFill);
        // Update the data attribute to reflect the new state
        region.attr("data-highlighted", !isHighlighted);
        // Update the selection set
        if (!isHighlighted) {
            this.selectedRegions.add(region.attr("name"));
        } else {
            this.selectedRegions.delete(region.attr("name"));
        }
    }

    /**
    Creates a square root scale for point sizes based on the dataset.
    @param {Array[]} data - The dataset to use for calculating the scale.
    @returns {function} The D3 square root scale function.
    @private 
    */
    #createSqrtScale(data) {
        let groups = this.#groupCoordinates(data, this.groupRadius);
        const max = d3.max(groups, d => d[1]);
        return d3.scaleSqrt([0, max], [0, this.maxRadius]);
    }

    /**
    Calculates the total number of points in the grouped dataset. [[lat, lon], count]
    @param {Array[]} data - The dataset to count points from.
    @returns {number} The total number of points.
    @private 
    */
    #totalNumberOfPoints(data) {
        return d3.sum(data, d => d[1]);
    }

    /**
    Adds a text element displaying the total number of points on the map.
    @param {Array[]} data - The grouped dataset to calculate the total number of points from in the form [[lat, lon], count]
    @private 
    */
    #addTotalPoints(data) {
        let total = this.#totalNumberOfPoints(data);
        let totalPointsText = this.svg.selectAll('text.total-points').data([total]); // Bind data to the text

        // Check if the text element exists by checking if the selection is empty
        if (totalPointsText.empty()) {
            // If it doesn't exist, append a new text element and set its properties
            totalPointsText.enter()
                .append('text')
                .classed('total-points', true)
                .attr('x', 10)
                .attr('y', 20)
                .text(`Total number of points: ${total}`);
        } else {
            // If it exists, just update its text content
            totalPointsText.text(`Total Count: ${total}`);
        }
    }

}