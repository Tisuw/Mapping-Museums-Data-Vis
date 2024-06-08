import DoughnutChart from "../classes/DoughnutChart.js";
import Map from "../classes/Map.js";

let countries = ["Scotland", "England", "Wales", "Northern Ireland"];


//
//  function passed to the map as its country toggle event handler
//  toggleCountry(event: event info, selected: array of selected countries as strings)
//  sets countries to the value of selected with IRE, IOM & CHI filtered out
//
let toggleCountry = function (event, selected) {
    let toExclude = new Set(["Ireland", "Isle of Man", "Channel Islands"]);
    countries = Array.from(new Set([...selected].filter(x => !toExclude.has(x))));
    getDoughnut();
}

let topoRegions = await d3.json('./data/uk_regions.topo.json');
let regions = topojson.feature(topoRegions, topoRegions.objects.areas);

// create colourscale for the map (Scotland: Blue, England: Mustard, Wales: Red, Ireland: Green)
let colorScale = d3.scaleOrdinal().domain(countries).range(['#005EB8', '#bd9206', '#cf0404', '#009A49']);

// create map and set its regions
let doughnutMap = new Map("#doughnut-map", 500, 400, colorScale, toggleCountry, false);
doughnutMap.baseMap(regions, d3.geoWinkel3);

let doughnut = new DoughnutChart("div#sub-type-doughnut", 400);

getDoughnut(countries);

//
//  render the geoDoughnut
//  - sort geodemographic group data for the selected countries
//  - render doughnut chart with this data
//
async function getDoughnut() {
    // get data from csv
    let data = await d3.csv("./data/MappingMuseumsData.csv", (d) => {
        if (countries.includes(d.admin_area_1)) {
            return {
                country: d.admin_area_1,
                geoGroup: d.area_geodemographic_group
            }
        }
    });

    // group the geodemographic group data and count instances
    let groupedData = d3.group(data, d => d.geoGroup);
    let returnData = [];
    groupedData.forEach(element => {
        returnData.push([element[0].geoGroup, element.length]);
    });

    // render the doughnut for the data and set the title
    doughnut.render(returnData);
    doughnut.setTitle(countries.join(", "));
}
