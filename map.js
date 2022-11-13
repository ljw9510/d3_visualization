
function visualize(data) {
  
  //let proj = d3.geoMercator().fitSize([width, height], data)
  let proj = d3.geoIdentity().reflectY(true).fitSize([width, height*9/10], data);
    
  let path = d3.geoPath()
    .projection(proj);
    
  d3.select("#text")
    .append("text")
    .attr("transform", "translate(25, 580)")
    .text("California map shaded in by average Calfresh enrollment in 2014-2020")

  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => scales.fill(d.properties.logcalfresh),
      "stroke-width": 1
    })
}

let width = 600,
  height = 600,
  scales = {
    fill: d3.scaleQuantize()
      .domain([1, 6])
      .range(d3.schemeBlues[6])
  }

d3.json("cal_county.geojson")
  .then(visualize)