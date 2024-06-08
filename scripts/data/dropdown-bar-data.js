import BarChart from "../classes/BarChart.js";
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

// Area geographic supergroup vs. area deprivation (index)
let areaSupergroups = [...new Set(data.map(d => d.area_geodemographic_supergroup))];
let areaSupergroupDeprivation = areaSupergroups.map(supergroup => {
    let areaDeprivation = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index);
    return [supergroup, d3.mean(areaDeprivation)];
});

// Area geographic supergroup vs. area deprivation (crime)
let areaSupergroupCrime = areaSupergroups.map(supergroup => {
    let areaCrime = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_crime);
    return [supergroup, d3.mean(areaCrime)];
});

// Area geographic supergroup vs. area deprivation (education)
let areaSupergroupEducation = areaSupergroups.map(supergroup => {
    let areaEducation = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_education);
    return [supergroup, d3.mean(areaEducation)];
});

// Area geographic supergroup vs. area deprivation (employment)
let areaSupergroupEmployment = areaSupergroups.map(supergroup => {
    let areaEmployment = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_employment);
    return [supergroup, d3.mean(areaEmployment)];
});

// Area geographic supergroup vs. area deprivation (health)
let areaSupergroupHealth = areaSupergroups.map(supergroup => {
    let areaHealth = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_health);
    return [supergroup, d3.mean(areaHealth)];
});

// Area geographic supergroup vs. area deprivation (housing)
let areaSupergroupHousing = areaSupergroups.map(supergroup => {
    let areaHousing = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_housing);
    return [supergroup, d3.mean(areaHousing)];
});

// Area geographic supergroup vs. area deprivation (income)
let areaSupergroupIncome = areaSupergroups.map(supergroup => {
    let areaIncome = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_income);
    return [supergroup, d3.mean(areaIncome)];
});

// Area geographic supergroup vs. area deprivation (services)
let areaSupergroupServices = areaSupergroups.map(supergroup => {
    let areaServices = data.filter(d => d.area_geodemographic_supergroup === supergroup).map(d => d.area_deprivation_index_services);
    return [supergroup, d3.mean(areaServices)];
});

let labelOptions = {
    "Geodemographic Group (Index)": "Mean Area Deprivation Index",
    "Geodemographic Group (Crime)": "Mean Area Deprivation Index (Crime)",
    "Geodemographic Group (Education)": "Mean Area Deprivation Index (Education)",
    "Geodemographic Group (Employment)": "Mean Area Deprivation Index (Employment)",
    "Geodemographic Group (Health)": "Mean Area Deprivation Index (Health)",
    "Geodemographic Group (Housing)": "Mean Area Deprivation Index (Housing)",
    "Geodemographic Group (Income)": "Mean Area Deprivation Index (Income)",
    "Geodemographic Group (Services)": "Mean Area Deprivation Index (Services)"
};

let dataOptions = {
    "Geodemographic Group (Index)": areaSupergroupDeprivation,
    "Geodemographic Group (Crime)": areaSupergroupCrime,
    "Geodemographic Group (Education)": areaSupergroupEducation,
    "Geodemographic Group (Employment)": areaSupergroupEmployment,
    "Geodemographic Group (Health)": areaSupergroupHealth,
    "Geodemographic Group (Housing)": areaSupergroupHousing,
    "Geodemographic Group (Income)": areaSupergroupIncome,
    "Geodemographic Group (Services)": areaSupergroupServices
};

let barChart = new BarChart('div#bar-chart', window.innerWidth - 100, 500, [10, 40, 60, 20]);
let barChartWithDD = new DropDownMenu('div#bar-chart', barChart, labelOptions, dataOptions);
barChartWithDD.createDropdown(labelOptions, dataOptions);
barChartWithDD.render(dataOptions[barChartWithDD.xLabel]);