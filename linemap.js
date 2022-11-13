
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
         .range([0.5 * (width - margins.right) + margins.pad, width - margins.right]),
    y: d3.scaleLinear()
         .domain([0, y_max])
         .range([height - margins.bottom, margins.top])
  }
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
      transform: `translate(${0.5 * (width - margins.right) + margins.pad}, 0)`
    })
    .call(y_axis)
}

function visualize(data) {
  let [map_data, line_data] = data;
  let nested = nest(line_data);
  let scales = make_scales(line_data);

  draw_line(nested, scales);
  add_axes(scales);
  draw_map(map_data);
}

function draw_line(nested, scales) {
  let path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.calfresh));
  
  d3.select("#line")
    .selectAll("path")
    .data(nested).enter()
    .append("path")
    .attrs({
      "d": path_generator,
      "stroke-width": 0.5,
      stroke: "#a8a8a8"
    });
}

function draw_map(data){
  let proj = d3.geoIdentity().reflectY(true).fitSize([width/2-30, height], data);
  let path = d3.geoPath()
    .projection(proj);

  d3.select("#text")
    .append("text")
    .attr("transform", "translate(25, 500)")
    .text("California map shaded in by average Calfresh enrollment in 2014-2020")

  d3.select("#map")
  .selectAll("path")
  .data(data.features).enter()
  .append("path")
  .attrs({
    d: path,
    fill: d => scales2.fill(d.properties.logcalfresh),
    "stroke-width": 1
  })

  .on("mouseover", (_, d) => mouseover(d));

  d3.select("#name")
    .append("text")
    .attr("transform", "translate(225, 100)")
    .text("hover a county")

}

function mouseover(d) {
  
  d3.select("#name")
  .select("text")
  .text(d.properties.NAME)
  
  d3.select("#map")
  .selectAll("path")
  .attr("stroke-width", e => e.properties.NAME == d.properties.NAME ? 3 : 1)
 
  d3.select("#line")
  .selectAll("path")
  .transition()
  .duration(100)
  .attrs({stroke: e => e[0].county == d.properties.NAME ? "red" : "#a8a8a8",
          "stroke-width": e => e[0].county == d.properties.NAME ? 2.5 : 0.5
  })
   
}

let width = 900,
  height = 500,
  margins = {top: 50, bottom: 50, left: 50, right: 50, pad: 50},
  scales2 = {
    fill: d3.scaleQuantize()
      .domain([1, 6])
      .range(d3.schemeBlues[6])
  }

Promise.all([d3.json("cal_county.geojson"), 
            d3.csv("calfresh_subset.csv", d3.autoType)])
       .then(visualize);
       
