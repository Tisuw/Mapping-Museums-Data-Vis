import BarChart from "../classes/BarChart.js";

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

// Museum type vs. percentage of closed museums
let museumTypesClosed = data.reduce((result, d) => {
    if (d.year_closed_low > 0) {
        result[d.subject_matter] = (result[d.subject_matter] || 0) + 1;
    }
    return result;
}, {});

let museumTypes = Object.keys(museumTypesClosed);
museumTypesClosed = museumTypes.map(type => [type, museumTypesClosed[type] / data.filter(d => d.subject_matter === type).length]);

let labelOptions = {
    "Museum Type": "Percentage of Closed Museums"
}

let dataOptions = {
    "Museum Type": museumTypesClosed
};

let barChart = new BarChart('div#museum-type-bar-chart', window.innerWidth - 100, 500, [10, 40, 60, 20], -11);
barChart.setLabels("Museum Type", "Percentage of Closed Museums");
barChart.render(dataOptions["Museum Type"], (type) => {
    filterOnSubject(type, new Set(museumTypes));
});