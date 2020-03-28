// boiler plate
const svgWidth = 960
const svgHeight = 500

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

  let currentSelection = "poverty"

  /**
   * Returns a updated scale based on the current selection.
   **/
  function xScale(data, currentSelection) {
    let xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(data.map(d => parseInt(d[currentSelection]))) * 0.8,
        d3.max(data.map(d => parseInt(d[currentSelection]))) * 1.2
      ])
      .range([0, width])
  
    return xLinearScale
  }
  
  /**
   * Returns and appends an updated x-axis based on a scale.
   **/
  function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale)
  
    xAxis
      .transition()
      .duration(1000)
      .call(bottomAxis)
  
    return xAxis
  }
  
  /**
   * Returns and appends an updated circles group based on a new scale and the currect selection.
   **/
  function renderCircles(circlesGroup, newXScale, currentSelection) {
    circlesGroup
      .transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[currentSelection]))
  
    return circlesGroup
  }
  
  (function() {
    d3.csv("assets/data/data.csv").then(data => {
      let xLinearScale = xScale(data, currentSelection)
      let yLinearScale = d3
        .scaleLinear()
        .domain([0, d3.max(data.map(d => parseInt(d.healthcare)))])
        .range([height, 0])
  
      let bottomAxis = d3.axisBottom(xLinearScale)
      let leftAxis = d3.axisLeft(yLinearScale)
  
      let xAxis = chartGroup
        .append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
  
      chartGroup.append("g").call(leftAxis)
  
      let circlesGroup = chartGroup
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[currentSelection]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5")
  
      let labelsGroup = chartGroup
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
  
      labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty Rate (%)")
  
      labelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Average Age")
  
      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Healthcare (%)")
  
      // Crate an event listener to call the update functions when a label is clicked
      labelsGroup.selectAll("text").on("click", function() {
        let value = d3.select(this).attr("value")
        if (value !== currentSelection) {
          currentSelection = value
          xLinearScale = xScale(data, currentSelection)
          xAxis = renderAxes(xLinearScale, xAxis)
          circlesGroup = renderCircles(
            circlesGroup,
            xLinearScale,
            currentSelection
          )
        }
      })
    })
  })()
  