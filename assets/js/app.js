// boiler plate
const svgWidth = 1000
const svgHeight = 600

let margin = {
  top: 35,
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

// set x and y params  
let chosenXAxis = "poverty"
let chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  };
  
// function used for updating x-scale upon click on axis label
function yScale(data, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  };

  // update xAxis when xlabel is clicked
  function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  };
  
  // update yAxis when ylabel is clicked
  function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
  // update circlesGroup with transitions
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }  
  // update circlesGroup with tables
  function renderLabels(cLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    cLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return cLabels;
  }
  
  // update circlesGroup with ToolTip
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    if (chosenXAxis === "poverty") {
      xlabel = "In Poverty (%): ";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age (Median): ";
    }
    else {
      xlabel = "Household Income (Median): $";
    };  

    if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare (%): ";
    }
    else if (chosenXAxis === "obesity") {
      ylabel = "Obese (%): ";
    }
    else {
      ylabel = "Smokers (%): ";
    }
  
    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(d => {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);

    // create mouseover event   
    circlesGroup
      .on("mouseover", function(data) {
      toolTip.show(data);
      })
      .on("mouseout", function(data, index) {
      toolTip.hide(data);
      });
  
    return circlesGroup;
  };


// load in CSV 
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
  
    // parse data
    censusData.forEach(data => {
      data.poverty = parseFloat(data.poverty);
      data.age = parseFloat(data.age);
      data.income = parseFloat(data.income);
      data.healthcare = parseFloat(data.healthcare);
      data.smokes = parseFloat(data.smokes);
      data.obesity = parseFloat(data.obesity);
    });
  
    // xLinearScale function above csv import
    xLinearScale = xScale(censusData, chosenXAxis);    
    // yLinearScale function above csv import
    yLinearScale = yScale(censusData, chosenYAxis);
  
  
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);
  
    // append xAxis
    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append yAxis
    let yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    let gGroup = chartGroup.selectAll("g")
        .data(censusData)
        .enter()
        .append("g")
        .classed("circles", true);
    
    let circlesGroup = gGroup.append("circle")
      .data(censusData)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "purple")
      .attr("opacity", ".5");
  
    // label within circle
    let cLabels = chartGroup.selectAll(".circles")
     .append("text")
     .text( d => d.abbr)
     .attr("text-anchor", "middle")
     .attr("alignment-baseline", "middle")
     .attr("font-size",".8em")
     .attr("style","stroke:white;")
     .attr("x", d => xLinearScale(d[chosenXAxis]))  
     .attr("y", d => yLinearScale(d[chosenYAxis]));

    // Create group for x-axis labels
    let xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    let povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    let ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Median Age");
      
    let incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 55)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Median Household Income");

    // Create group for y-axis labels
    let yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    let healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", 0 - (margin.left/3))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lack Healthcare (%)");    
      
    let obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -20 - (margin.left/3))
      .attr("value", "obesity") 
      .classed("inactive", true)
      .text("Obese (%)");   

    let smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height/2))
      .attr("y", -40 - (margin.left/3))
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text("Smokers (%)");
  
    circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
  
    // xAxis click event
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          chosenXAxis = value;
          xLinearScale = xScale(censusData, chosenXAxis);
          xAxis = renderXAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // xAxis selector
          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // yAxis click event 
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        let value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          chosenYAxis = value;
          yLinearScale = yScale(censusData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,  yLinearScale, chosenYAxis);
          circlesGroup = updateToolTip(circlesGroup, chosenYAxis);
          cLabels = renderLabels(cLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // yAxis selector
          if (chosenYAxis === "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

  }).catch(function(error) {
    console.log(error);
  });