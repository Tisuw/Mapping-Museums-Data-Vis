// Module imports

import Map from "../classes/Map.js";

import Slider from "../classes/Slider.js";

import LineChart from "../classes/LineChart.js";
import LineChartBackground from "../classes/LineChartBackground.js";

// Load UK regions data from a topojson file
let topoRegions = await d3.json('./data/uk_regions.topo.json');
let regions = topojson.feature(topoRegions, topoRegions.objects.areas);

// Load museum data from a CSV file
const museumData = await d3.csv('../data/MappingMuseumsData.csv', (d) => {
    return {
        latitude: +d.latitude,
        longitude: +d.longitude,

        region: d.admin_area_1,

        year_opened_low: +d.year_opened_low,
        year_opened_high: +d.year_opened_high,
        year_closed_low: +d.year_closed_low
    }
});

// Convert museum data to an array of points for use in components. Removes need to have specific names for each attribute, helping the components to be more reusable
let points =
    museumData.map(d => [d.latitude, d.longitude, d.region, d.year_opened_low, d.year_opened_high, d.year_closed_low]);


// Calculate rollup data for the line chart (number of openings and closures per year)
// in the format [[year, number of openings], [year, number of closures]]
function calculateRollup(data) {
    // Find the number of openings for each year (high)
    let openedRoll = d3.rollups(data, (D) => D.length, d => d[4]);

    // Find the number of closures for each year (low), filter out the NaN values for none closed museums
    let closedRoll = d3.rollups(
        data.filter(d => !isNaN(d[5])),
        (D) => D.length,
        d => d[5]
    );

    // Sort the data into ascending order
    openedRoll.sort((a, b) => a[0] - b[0]);
    closedRoll.sort((a, b) => a[0] - b[0]);

    // Combine the two arrays into one to render two lines on the same chart
    let combinedRoll = [openedRoll, closedRoll];
    return combinedRoll;
}

// Filter line chart data to remove the 1945 and 1960 data points for a cleaner chart. These points are outliers due to the way the data was collected and make the chart harder to read.
// See https://museweb.dcs.bbk.ac.uk/faq for more information
function filterLineChartData(data) {
    let newData = data.filter(d => !((d[3] == 1945 || d[3] == 1960) && (d[4] == 2017)));
    return calculateRollup(newData);
}

// Color scales for the map and line chart
const lineChartColorScale = d3.scaleOrdinal()
    .range(['blue', 'red']);

const mapColorScale = d3.scaleOrdinal()
    .domain(['Scotland', 'England', 'Wales', 'Northern Ireland'])
    .range(['#005EB8', '#bd9206', '#cf0404', '#009A49']);


// Calculate the minimum and maximum dates from the data. Needed for slider values
function calculateDates(data) {
    const minDate = d3.min([d3.min(data, (d) => d[3]), d3.min(data, (d) => d[5])]);
    const maxDate = d3.max([d3.max(data, (d) => d[3]), d3.max(data, (d) => d[5])]);
    return { minDate, maxDate };

}

const { minDate, maxDate } = calculateDates(points);

// Initialise instances of Map, LineChart, and Slider
let mapRegions = new Map('#map', 500, 600, mapColorScale, filterOnRegion);

let lineChart = new LineChart('#map-line-chart', 1100, 600, [10, 40, 60, 100], lineChartColorScale, false, false, 20, d3.curveBumpX, 100);

let slider = new Slider('#slider', 1000, 150, [20, 40, 60, 20], minDate, maxDate, sliderCallback)


// Filter function for the map based on selected regions, calls the mapRegionsFilterOnDate function to update the map and line chart
function filterOnRegion(region, selectedRegions) {
    try {
        let newData = this.data.filter(d => selectedRegions.has(d[2]));
        this.filteredData = newData;
        mapRegionsFilterOnDate(slider.currentValue)
    }
    catch (e) {
        console.log(e);
    }
}


// Filter function for a map and line chart based on selected regions, decoupled from a specific map and line chart to allow for reuse should multiple maps or line charts be needed on the same page
function filterOnDate(map, lineChart, date) {
    try {
        let newData = map.filteredData.filter(d => d[3] <= date && (d[5] > date || isNaN(d[5])));
        map.updatePoints(newData);
        lineChart.render(filterLineChartData(map.filteredData));
    }
    catch (e) {
        console.log(e);
    }
}

// Wrapper function to filter the map and line chart based on the slider value
function mapRegionsFilterOnDate(date) {
    filterOnDate(mapRegions, lineChart, date);
}


// Callback function for the slider to update the map and line chart when changed
function sliderCallback() {
    mapRegionsFilterOnDate(slider.currentValue)
    lineChartBackground.updateWidth();
}


// Render the map and points, set the initial filter date to the minimum date
mapRegions.baseMap(regions, d3.geoWinkel3)
    .renderGroupedPoints(points, 20);
mapRegionsFilterOnDate(minDate);


// Render the line chart and set the labels and legend
lineChart
    .render(filterLineChartData(mapRegions.filteredData))
    .setLabels("Year", "Number of Openings and Closures in the Current Year")
    .createLegend(['Openings', 'Closures']);

// Append the play button to the slider for animation
slider.appendPlayButton();

// Attach a background to the line chart to show the current date
let lineChartBackground = new LineChartBackground(lineChart, slider)