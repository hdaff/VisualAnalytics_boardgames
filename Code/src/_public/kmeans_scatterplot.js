import * as d3 from 'd3';

export function drawKmeansScatterplot(data) {
    const processedData = data.map((d, i) => ({
        x: d.variableValues[0],
        y: d.variableValues[1],

        centroids: d.centroidIndex,
        name: d.name,
    }));

    const margin = {
        top: 50,
        bottom: 50,
        left: 80,
        right: 80,
    };
    const height = d3.select(".kmeans_scatterplot").node().getBoundingClientRect().height;
    const width = 1050;

    const xScale = d3.scaleLinear()
        .domain([0,1]) // Corrected method
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0,1]) // Corrected method
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.centroids))
        .range(d3.schemeCategory10);

        const regularData = processedData.filter(d => !d.name.startsWith('Cluster '));
        const centroidData = processedData.filter(d => d.name.startsWith('Cluster '));
        console.log("Centroid Data:", centroidData);

    d3.select('.kmeans_scatterplot').selectAll('*').remove();

    const svg = d3.select('.kmeans_scatterplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

        svg.selectAll('circle')
        .data(regularData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill-opacity', 0.5)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', d => color(d.centroids))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    // Render centroids as "x" markers
    svg.selectAll('.centroid')
        .data(centroidData)
        .enter()
        .append('circle')
        .attr('class', 'centroid')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 7)  // Larger radius for centroids
        .attr('fill', d => color(d.centroids))
        .attr('stroke', 'black')  // Add stroke for visibility
        .attr('stroke-width', 2)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);


      // Create a mapping of centroids for easy access
      const centroidMap = {};
      centroidData.forEach(d => {
          centroidMap[d.centroids] = { x: d.x, y: d.y };
      });
  
      // Render lines connecting data points to their centroids
      svg.selectAll('line')
        .data(regularData)
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.x))
        .attr('y1', d => yScale(d.y))
        .attr('x2', d => {
            const centroid = centroidMap[d.centroids];
            return centroid ? xScale(centroid.x) : xScale(d.x);
        })
        .attr('y2', d => {
            const centroid = centroidMap[d.centroids];
            return centroid ? yScale(centroid.y) : yScale(d.y);
        })
        .attr('stroke', d => color(d.centroids))
        .attr('stroke-width', 1);


    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom / 2 + 20) // Adjusted y position to avoid overlap
        .attr('text-anchor', 'middle')
        .text('X-Axis');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left / 2 - 20) // Adjusted y position to avoid overlap
        .attr('text-anchor', 'middle')
        .text('Y-Axis');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .text('K-means Clustering');

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    legend.append('text')
        .attr('x', width - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(d => `Cluster ${d}`);

        const gameNameDiv = d3.select(".kmeans_scatterplot").append("div")
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
            <strong>Title:</strong> ${d.name}<br>
           
            
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      }
      
      function handleMouseOut(d) {
        d3.select(this).attr("fill-opacity", 0.5).attr("stroke-opacity", 0.6);
        gameNameDiv.transition().duration(500).style("opacity", 0);
      }
}


