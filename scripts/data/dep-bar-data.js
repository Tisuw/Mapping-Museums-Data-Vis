'use strict'; // to prevent us from overwriting important variables
import BarChart from "../classes/BarChart.js";
import DoughnutChart from "../classes/DoughnutChart.js";

// create the bar chart object and render it with a default subject
let selectedSubject = "Mining and quarrying";
let barchart = new BarChart("div#dep-bar-chart", 800, 500, [10, 40, 45, 20]);
let doughnut = new DoughnutChart("div#dep-doughnut", 400);
let closeButton = document.getElementById("doughnut-close");


// load in data
const fullData = await d3.csv("./data/MappingMuseumsData.csv", (d) => {
    return {
        subject: d.subject_matter_subtype_1,
        deprivation: parseInt(d.area_deprivation_index),
        country: d.admin_area_1
    }
});

//
//  click function for bar chart bars - sent as argument of render method
//  clickFunc(dep: the deprivation index value sent from bar)
// 
let clickFunc = function testFunc(dep) {
    let data = fullData.filter(d => d.subject == selectedSubject && d.deprivation == dep);

    // sort by country alphabetically
    data.sort(function (x, y) {
        return d3.ascending(x.country, y.country);
    })

    // group data and create new array with the sizes of the groups
    let groupedData = d3.group(data, d => d.country);
    let doughnutData = [];
    groupedData.forEach(element => {
        doughnutData.push([element[0].country, element.length]);
    });

    // create a colourscale for the countries
    let colours = [];
    doughnutData.forEach(element => {
        switch (element[0]) {
            case "England": colours.push("#FFFFFF"); break;
            case "Northern Ireland": colours.push("#009A49"); break;
            case "Scotland": colours.push("#005EB8"); break;
            case "Wales": colours.push("#C8102E"); break;
        }
    });

    // render the doughnut
    doughnut.render(doughnutData, colours);
    doughnut.setTitle("Breakdown by country");

    // show the doughnut div and close button
    document.getElementById("dep-doughnut-container").classList.remove("hidden");
}

//
//  set up the prerequisites
//  - populate listbox with subject types
//  - set button functionality for opening and closing the doughnut visualisation
//
function setupVis() {

    let data = fullData.filter(d => d.subject != "");

    // group by subject
    let groupedData = d3.groups(data, (d) => d.subject)

    // get the select element and add the subjects as options
    let listBox = document.getElementById("dep-bar-select");
    groupedData.forEach(element => {
        let option = document.createElement("option")
        option.text = element[0];
        listBox.add(option);
    });

    // event listener for updating the chart when an option is clicked
    document.addEventListener("change", () => {
        getBar(listBox.value);
    });

    // set the click function of the doughnut-close button
    // clear the doughut chart and hide the div and the button itself
    closeButton.addEventListener("click", () => { document.getElementById("dep-doughnut-container").classList.toggle("hidden") });
}


//
//  Creates array of deprivation index spread for a given subject
//  getBar(subject: string containing a subject_matter_subtype_1 value)
//
function getBar(subject) {
    selectedSubject = subject;
    let data = fullData.filter(d => d.subject == subject)

    // sort by deprivation index ascending
    data.sort(function (x, y) {
        return d3.ascending(x.deprivation, y.deprivation);
    })

    // group data and create new array with the sizes of the groups
    let groupedData = d3.group(data, d => d.deprivation);
    let returnData = [];

    for (let i = 1; i <= 10; i++) {
        let added = false;
        groupedData.forEach(element => {
            if (element[0].deprivation == i && added == false) {
                returnData.push([element[0].deprivation, element.length]);
                added = true;
            }
        });
        if (added == false) { returnData.push([i, 0]); }
    }

    // render the data to the chart and set the labels
    barchart.render(returnData, clickFunc);
    barchart.setLabels("Deprivation Index", subject + " Museums");
    return;
}

setupVis(); // populate the subject selection box with subjects
getBar(selectedSubject); // render a barchart for the selected subject