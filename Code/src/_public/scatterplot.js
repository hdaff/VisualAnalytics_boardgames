import * as d3 from "d3"


export function draw_scatterplot(data) {

  data = data.map((d, i) => ({
    x: d[0],
    y: d[1],
    class_1 : d[2],
    class_2 : d[3],
    title: d[4]
  }))
 

  /**
   * Margins of the visualization.
   */
  const margin = {
    top: 20,
    bottom: 50,
    left: 80,
    right: 80,
  }

  
    const height = d3.select(".scatterplot_LDA").node().getBoundingClientRect().height;
    const width = 1050;




  /**
   * Selection of svg and groups to be drawn on.
   */
  
  /**
   * Scale function for the x-axis
   */
  const buffer = 0.05; // 5% buffer

// Calculate xExtent and yExtent with buffer
const xExtent = d3.extent(data, d => d.x);
const yExtent = d3.extent(data, d => d.y);

const xBuffer = (xExtent[1] - xExtent[0]) * buffer;
const yBuffer = (yExtent[1] - yExtent[0]) * buffer;

// Adjusted domains with buffer
const xDomain = [xExtent[0] - xBuffer, xExtent[1] + xBuffer];
const yDomain = [yExtent[0] - yBuffer, yExtent[1] + yBuffer];

const xScale = d3.scaleLinear()
  .domain(xDomain).nice()
  .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
  .domain(yDomain).nice()
  .range([height - margin.bottom, margin.top]);

const color = d3.scaleOrdinal(data.map(d => d.class_1), d3.schemeCategory10);

const symbols = [d3.symbolCircle, d3.symbolDiamond];
const shape = d3.scaleOrdinal(data.map(d => d.class_2), symbols.map(s => d3.symbol().type(s)()));

d3.select(".scatterplot_LDA").selectAll("*").remove();
const scatterplot = d3.select(".scatterplot_LDA")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Append the x-axis
const xAxis = scatterplot.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(xScale));

xAxis.append("text")
  .attr("fill", "black")
  .attr("x", width - margin.right)
  .attr("y", -6)
  .attr("text-anchor", "end")
  .text("Dimension 1");

// Add stroke to x-axis line
xAxis.selectAll("path")
  .style("stroke", "black")
  .style("stroke-width", 2);

// Append the y-axis
const yAxis = scatterplot.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(yScale));

yAxis.append("text")
  .attr("fill", "black")
  .attr("x", -margin.left)
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "start") 
  .text("Dimension 2");

// Add stroke to y-axis line
yAxis.selectAll("path")
  .style("stroke", "black")
  .style("stroke-width", 2);

// Plot the data points
scatterplot.append("g")
  .selectAll("path")
  .data(data)
  .enter().append("path")
  .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
  .attr("d", d => shape(d.class_2))
  .attr("fill", d => color(d.class_1));


  const gameNameDiv = d3.select(".scatterplot_LDA").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("background-color", "lightblue")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("position", "absolute")
  .style("pointer-events", "none");

function handleMouseOver(event, d) {
  d3.select(this).attr("fill-opacity", 1).attr("stroke-opacity", 1);
  
  gameNameDiv.transition().duration(200).style("opacity", 1);
  gameNameDiv.html(`
      <strong>Title:</strong> ${d.title}<br>
     
      
  `)
  .style("left", (event.pageX + 10) + "px")
  .style("top", (event.pageY - 28) + "px");
}

function handleMouseOut(d) {
  d3.select(this).attr("fill-opacity", 0.6).attr("stroke-opacity", 0.6);
  gameNameDiv.transition().duration(500).style("opacity", 0);
}


  //append the points
  scatterplot.selectAll("path")
  .data(data)
  .join("path")
  .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`)
  .attr("d", d => shape(d.class_2))
  .attr("fill", d => color(d.class_1))
  .attr("stroke", "black")
  .attr("stroke-width", 1)
  .attr("stroke-opacity", 0.6)
  .attr("fill-opacity", 0.6)
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);

  //Append the gridlines
  scatterplot.append("g")
  .attr("stroke", "black")
  .attr("stroke-opacity", 0.1)
  .selectAll("line")
  .data(xScale.ticks())
  .join("line")
  .attr("x1", d => 0.5 + xScale(d))
  .attr("x2", d => 0.5 + xScale(d))
  .attr("y1", margin.top)
  .attr("y2", height - margin.bottom);

  scatterplot.append("g")
  .attr("stroke", "black")
  .attr("stroke-opacity", 0.1)
  .selectAll("line")
  .data(yScale.ticks())
  .join("line")
  .attr("y1", d => 0.5 + yScale(d))
  .attr("y2", d => 0.5 + yScale(d))
  .attr("x1", margin.left)
  .attr("x2", width - margin.right);



const legend = scatterplot.append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .attr("text-anchor", "end")
  .selectAll("g")
  .data(color.domain())
  .join("g")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

// Append colored rectangles for each item
legend.append("rect")
  .attr("x", width - 19)
  .attr("width", 19)
  .attr("height", 19)
  .attr("fill", color);

// Append labels for each item
legend.append("text")
  .attr("x", width - 24)
  .attr("y", 9.5)
  .attr("dy", "0.32em")
  .text(d => d ? 'in top 10 categories' : 'not in top 10 categories');

const legend2 = scatterplot.append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .attr("text-anchor", "end")
  .selectAll("g")
  .data(shape.domain())
  .join("g")
    .attr("transform", (d, i) => `translate(10,${i * 20 + 80})`);


legend2.append("path")
  .attr("transform", `translate(${width - 19},0)`)
  .attr("d", d => shape(d))
  .attr("fill", "black");

  legend2.append("text")
  .attr("x", width - 24)
  .attr("y", 9.5)
  .attr("dy", "0.32em")
  .text(d => d ? 'in top 10 mechanics' : 'not in top 10 mechanics');


  



}

  
