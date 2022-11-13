
function nest(data) {
  let result = {}

  // Create object of (empty) arrays for each county
  let county = [... new Set(data.map(d => d.county))]
  for (let i = 0; i < county.length; i++) {
    result[county[i]] = []
  }

  // append to the array for each county
  for (let i = 0; i < data.length; i++) {
    result[data[i].county].push(data[i])
  }
  return Object.values(result)
}


function make_scales(data) {
  let y_max = d3.max(data.map(d => d.calfresh)),
      x_max = d3.max(data.map(d => d.date)),
      x_min = d3.min(data.map(d => d.date));

  return {
    x: d3.scaleLinear()
         .domain([x_min, x_max])
         .range([margins.left, width - margins.right]),
    y: d3.scaleLinear()
         .domain([0, y_max])
         .range([height - margins.bottom, margins.top])
  }
}


function draw_line(nested, scales) {
  let path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.calfresh));
  
  d3.select("#line")
    .selectAll("path")
    .data(nested).enter()
    .append("path")
    .attr("d", path_generator);
}


function add_axes(scales) {
  let x_axis = d3.axisBottom()
        .scale(scales.x)
      y_axis = d3.axisLeft()
        .scale(scales.y);

  d3.select("#axes")
    .append("g")
    .attrs({
      id: "x_axis",
      transform: `translate(0,${height - margins.bottom})`
    })
    .call(x_axis);

  d3.select("#axes")
    .append("g")
    .attrs({
      id: "y_axis",
      transform: `translate(${margins.left}, 0)`
    })
    .call(y_axis)
}

function visualize(data) {
  let nested = nest(data);
  let scales = make_scales(data);
  draw_line(nested, scales);
  add_axes(scales);
}

let width = 500,
    height = 500,
    margins = {top: 50, bottom: 50, left: 50, right: 50}
    
d3.csv("calfresh_subset.csv", d3.autoType)
  .then(visualize);