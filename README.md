# F20DV Group Project - Group 6
https://gitlab-student.macs.hw.ac.uk/gwc2000/f-20-dv-group-project-group-6

As a part of the F20DV module, we were tasked with creating a data visualisation project. Our group decided to focus on the topic of museum types and how the area in which a museum is located affects the type of museum that is present, as well as the closure rate of museums in the UK. We have created a website that displays this information in an interactive and informative way.

## Group Members
- [Kieran Gordon](mailto:kjg2000@hw.ac.uk)
- [Gregor Campbell](mailto:gwc2000@hw.ac.uk)
- [James McLean](mailto:jm2022@hw.ac.uk)
- [Jiankun Cong](mailto:jc197@hw.ac.uk)


## Project Structure

- `data/` - Contains the `.csv` file containing the entire dataset, as well as two `.json` files that are used to build a topographical map of the UK.
- `scripts/` - Contains the JavaScript files used to create the visualisations on the website.
- `scripts/classes/` - Contains the JavaScript classes used to create the different, reusable chart types.
- `scripts/data/` - Contains the data files used to tie a chosen set of data to a specific chart type.
- `styles/` - Contains the CSS files used to style the website.
- `index.html` - The main HTML file that is loaded when the website is accessed.

## Dependencies

- [D3.js](https://d3js.org/) - A JavaScript library for producing dynamic, interactive data visualisations in web browsers.
- [TopoJSON](https://github.com/topojson/topojson) - An extension of GeoJSON that encodes topology. It is used to create a topographical map of the UK.

## How to Run

1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser, or use the Live Server extension in Visual Studio Code.