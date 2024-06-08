'use strict'; // to prevent us from overwriting important variables
import LineChart from "../classes/LineChart.js";
import DropDownMenu from "../classes/DropDownMenu.js";

// Load the data
let data = await d3.csv('data/MappingMuseumsData.csv', (d) => {
    return {
        latitude: +d.latitude,
        longitude: +d.longitude,
        subject_matter: d.subject_matter,
        subject_matter_subtype: d.subject_matter_subtype_1,
        subject_matter_subtype_2: d.subject_matter_subtype_2,
        year_opened_low: +d.year_opened_low,
        year_opened_high: +d.year_opened_high,
        year_closed_low: +d.year_closed_low,
        year_closed_high: +d.year_closed_high,
        area_deprivation_index: +d.area_deprivation_index,
        area_geodemographic_supergroup: d.area_geodemographic_supergroup,
        area_deprivation_index_crime: d.area_deprivation_index_crime,
        area_deprivation_index_education: d.area_deprivation_index_education,
        area_deprivation_index_employment: d.area_deprivation_index_employment,
        area_deprivation_index_health: d.area_deprivation_index_health,
        area_deprivation_index_housing: d.area_deprivation_index_housing,
        area_deprivation_index_income: d.area_deprivation_index_income,
        area_deprivation_index_services: d.area_deprivation_index_services,
    }
});


// Area Deprivation vs. percentage of closed museums
let areaDeprivation = [...new Set(data.map(d => d.area_deprivation_index))];
areaDeprivation.sort((a, b) => b - a);
let areaDeprivationClosed = areaDeprivation.map(type => {
    let areaDeprivations = data.filter(d => d.area_deprivation_index === type);
    let closedAreaDeprivations = areaDeprivations.filter(d => d.year_closed_low > 0);
    return [type, closedAreaDeprivations.length / areaDeprivations.length * 100];
});

// Area Deprivation crime vs. percentage of closed museums
let areaDeprivation_crime = [...new Set(data.map(d => d.area_deprivation_index_crime))];
areaDeprivation_crime.sort((a, b) => b - a);
let areaDeprivation_crimeClosed = areaDeprivation_crime.map(type => {
    let areaDeprivations_crime = data.filter(d => d.area_deprivation_index_crime === type);
    let closedAreaDeprivations_crime = areaDeprivations_crime.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_crime.length / areaDeprivations_crime.length * 100];
});

//Area Deprivation education vs. percentage of closed museums
let areaDeprivation_education = [...new Set(data.map(d => d.area_deprivation_index_education))];
areaDeprivation_education.sort((a, b) => b - a);
let areaDeprivation_educationClosed = areaDeprivation_education.map(type => {
    let areaDeprivations_education = data.filter(d => d.area_deprivation_index_education === type);
    let closedAreaDeprivations_education = areaDeprivations_education.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_education.length / areaDeprivations_education.length * 100];
});

//Area Deprivation employment vs. percentage of closed museums
let areaDeprivation_employment = [...new Set(data.map(d => d.area_deprivation_index_employment))];
areaDeprivation_employment.sort((a, b) => b - a);
let areaDeprivation_employmentClosed = areaDeprivation_employment.map(type => {
    let areaDeprivations_employment = data.filter(d => d.area_deprivation_index_employment === type);
    let closedAreaDeprivations_employment = areaDeprivations_employment.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_employment.length / areaDeprivations_employment.length * 100];
});

//Area Deprivation health vs. percentage of closed museums
let areaDeprivation_health = [...new Set(data.map(d => d.area_deprivation_index_health))];
areaDeprivation_health.sort((a, b) => b - a);
let areaDeprivation_healthClosed = areaDeprivation_health.map(type => {
    let areaDeprivations_health = data.filter(d => d.area_deprivation_index_health === type);
    let closedAreaDeprivations_health = areaDeprivations_health.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_health.length / areaDeprivations_health.length * 100];
});

//Area Deprivation housing vs. percentage of closed museums
let areaDeprivation_housing = [...new Set(data.map(d => d.area_deprivation_index_housing))];
areaDeprivation_housing.sort((a, b) => b - a);
let areaDeprivation_housingClosed = areaDeprivation_housing.map(type => {
    let areaDeprivations_housing = data.filter(d => d.area_deprivation_index_housing === type);
    let closedAreaDeprivations_housing = areaDeprivations_housing.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_housing.length / areaDeprivations_housing.length * 100];
});

//Area Deprivation income vs. percentage of closed museums
let areaDeprivation_income = [...new Set(data.map(d => d.area_deprivation_index_income))];
areaDeprivation_income.sort((a, b) => b - a);
let areaDeprivation_incomeClosed = areaDeprivation_income.map(type => {
    let areaDeprivations_income = data.filter(d => d.area_deprivation_index_income === type);
    let closedAreaDeprivations_income = areaDeprivations_income.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_income.length / areaDeprivations_income.length * 100];
});

//Area Deprivation services vs. percentage of closed museums
let areaDeprivation_services = [...new Set(data.map(d => d.area_deprivation_index_services))];
areaDeprivation_services.sort((a, b) => b - a);
let areaDeprivation_servicesClosed = areaDeprivation_services.map(type => {
    let areaDeprivations_services = data.filter(d => d.area_deprivation_index_services === type);
    let closedAreaDeprivations_services = areaDeprivations_services.filter(d => d.year_closed_low > 0);
    return [Number(type), closedAreaDeprivations_services.length / areaDeprivations_services.length * 100];
});

let labelOptions = {
    "Area Deprivation Index": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Crime)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Education)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Employment)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Health)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Housing)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Income)": "Percentage Of Museums Being Closed",
    "Area Deprivation Index (Services)": "Percentage Of Museums Being Closed"
};

let dataOptions = {
    "Area Deprivation Index": [areaDeprivationClosed],
    "Area Deprivation Index (Crime)": [areaDeprivation_crimeClosed],
    "Area Deprivation Index (Education)": [areaDeprivation_educationClosed],
    "Area Deprivation Index (Employment)": [areaDeprivation_employmentClosed],
    "Area Deprivation Index (Health)": [areaDeprivation_healthClosed],
    "Area Deprivation Index (Housing)": [areaDeprivation_housingClosed],
    "Area Deprivation Index (Income)": [areaDeprivation_incomeClosed],
    "Area Deprivation Index (Services)": [areaDeprivation_servicesClosed]
};


let lineChart = new LineChart('div#line-chart', 1100, 500, [10, 40, 60, 20], undefined, true, true);
let lineChartWithDD = new DropDownMenu('div#line-chart-dropbar', lineChart, labelOptions, dataOptions);
lineChartWithDD.createDropdown(labelOptions, dataOptions);

lineChartWithDD.render(dataOptions[lineChartWithDD.xLabel]);
