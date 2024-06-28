import pagerank from 'pagerank-js';
import * as d3 from 'd3';


export function drawGraphNetwork(data) {
    const nodes = data.nodes;
    const links = data.links;


// Initialize PageRank
    const nodeCount = nodes.length;
    const linkCount = links.length;

    const adjList = Array.from({ length: nodeCount }, () => []);

    links.forEach(link => {
        let sourceIndex = nodes.findIndex(node => node.ID === link.source);
        let targetIndex = nodes.findIndex(node => node.ID === link.target);
        if (sourceIndex !== -1 && targetIndex !== -1) {
            adjList[sourceIndex].push(targetIndex);
        }
    });

    console.log("Matrix", adjList);
    const linkProb = 0.85 //high numbers are more stable
    const tolerance = 0.0001 //sensitivity for accuracy of convergence.
    const pagerankScores = new Array(nodeCount).fill(1 / nodeCount);

    pagerank(adjList, linkProb, tolerance, (err, res) => {
        if (err) throw new Error(err)
        res.forEach((score, i) => {
            nodes[i].pagerank = score;
        });
    });

    nodes.sort((a, b) => b.pagerank - a.pagerank);


// D3 Visualization
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.ID).distance(100))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force('centerX', d3.forceX(width / 2))
        .force('centerY', d3.forceY(height / 2))
        .force("collision", d3.forceCollide().radius(d => 15 + d.pagerank * 50).strength(0.7));

    const highlightGroup = svg.append("g").attr("class", "highlight-group");
    const highlightCircle = highlightGroup.append("circle")
        .attr("class", "highlight")
        .attr("r", 0);

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", d => 10 + d.pagerank * 100)  // Scale radius based on PageRank
        .attr("fill", (d, i) => {
            if (i === 0) return "rgb(212,175,55)";  // Highest ranked
            if (i === 1) return "rgb(192,192,192)";  // Second highest
            if (i === 2) return "rgb(205,127,50)";  // Third highest
            return "steelblue";  // Other nodes
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", displayNodeInfo)
        .on('contextmenu', function(event, d) {
            // Prevent the default context menu from appearing
            event.preventDefault();
            displayNodeInfo2(event,d);
        });

    node.append("circle")
        .attr("class", "highlight")
        .attr("r", d => 15 + d.pagerank * 50) // Adjust size based on PageRank or any other criteria
        .style("visibility", "hidden");

// Append the actual node circles
    node.append("circle")
        .attr("class", "node")
        .attr("r", d => 10 + d.pagerank * 50)  // Scale radius based on PageRank
        .attr("fill", (d, i) => {
            if (i === 0) return "gold";  // Highest ranked
            if (i === 1) return "silver";  // Second highest
            if (i === 2) return "bronze";  // Third highest
            return "steelblue";  // Other nodes
        });

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)");

    node.on("mouseover", function (event, d) {
        tooltip.html(d.Name)
            .style("visibility", "visible");
    })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    node.append("title")
        .text(d => d.name);

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Update position of highlight circle
        node.select(".highlight")
            .attr("cx", d => d.cx = Math.max(10, Math.min(width - 10, d.x)))
            .attr("cy", d => d.cy = Math.max(10, Math.min(height - 10, d.y)));
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function displayNodeInfo(event, d) {

        const nodeInfo = `
        <strong>Name:</strong> ${d.Name}<br>
        <strong>Rank:</strong> ${d.Rank}<br>
        <strong>Category</strong> ${d.category}<br>
        <strong>Min Players / Max Players</strong> ${d.min_players} / ${d.max_players}<br>
        <strong>Year</strong> ${d.Year}<br>
        <strong>Average Rating</strong> ${d.Average}<br>
        <strong>Num Votes</strong> ${d.num_votes}<br>
        <strong> Min / Max Time</strong> ${d.min_time} / ${d.max_time}<br>
        <strong>PageRank:</strong> ${d.pagerank.toFixed(4)}
    `;
        d3.select("#node-info").html(nodeInfo);
    }

    function displayNodeInfo2(event, d) {

        const nodeInfo = `
        <strong>Name:</strong> ${d.Name}<br>
        <strong>Rank:</strong> ${d.Rank}<br>
        <strong>Category</strong> ${d.category}<br>
        <strong>Min Players / Max Players</strong> ${d.min_players} / ${d.max_players}<br>
        <strong>Year</strong> ${d.Year}<br>
        <strong>Average Rating</strong> ${d.Average}<br>
        <strong>Num Votes</strong> ${d.num_votes}<br>
        <strong> Min / Max Time</strong> ${d.min_time} / ${d.max_time}<br>
        <strong>PageRank:</strong> ${d.pagerank.toFixed(4)}
    `;
        d3.select("#node-info2").html(nodeInfo);
    }
}

