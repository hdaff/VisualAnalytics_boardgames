// Importing pagerank-js (assuming you have it installed and bundled)
import pagerank from 'pagerank-js';

// Example data (You should replace this with your actual graph data)
const nodes = [
    { id: 'game1', name: 'Catan', feature1: 'Strategy', feature2: '3-4 players', feature3: '2 hours', feature4: 'High replayability', feature5: 'Complex rules' },
    { id: 'game2', name: 'Monopoly', feature1: 'Economic', feature2: '2-8 players', feature3: '1-3 hours', feature4: 'Medium replayability', feature5: 'Simple rules' },
    { id: 'game3', name: 'Risk', feature1: 'Strategy', feature2: '2-6 players', feature3: '1-4 hours', feature4: 'High replayability', feature5: 'Moderate rules' },
    { id: 'game4', name: 'Chess', feature1: 'Strategy', feature2: '2 players', feature3: 'Varies', feature4: 'High replayability', feature5: 'Complex rules' },
    { id: 'game5', name: 'Clue', feature1: 'Deduction', feature2: '3-6 players', feature3: '1-2 hours', feature4: 'Medium replayability', feature5: 'Simple rules' },
    // Add more games as needed
];

const links = [
    { source: 'game1', target: 'game2' },
    { source: 'game2', target: 'game3' },
    { source: 'game3', target: 'game1' },
    { source: 'game1', target: 'game4' },
    { source: 'game4', target: 'game5' },
    // Add more links as needed
];

// Initialize PageRank
const nodeCount = nodes.length;
const linkCount = links.length;
const adjList = Array.from({ length: nodeCount }, () => []);

links.forEach(link => {
    const sourceIndex = nodes.findIndex(node => node.id === link.source);
    const targetIndex = nodes.findIndex(node => node.id === link.target);
    if (sourceIndex !== -1 && targetIndex !== -1) {
        adjList[sourceIndex].push(targetIndex);
    }
});

const dampingFactor = 0.85;
const pagerankScores = new Array(nodeCount).fill(1 / nodeCount);

pagerank(adjList, dampingFactor, (res) => {
    res.forEach((score, i) => {
        nodes[i].pagerank = score;
    });
});

// Sort nodes by PageRank score to determine top 3
nodes.sort((a, b) => b.pagerank - a.pagerank);

// D3 Visualization
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node-group")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("click", displayNodeInfo);

// Append a circle for highlighting
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

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)");

// Tooltip event listeners
node.on("mouseover", function (event, d) {
    tooltip.html(d.name)
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

// Function to display node information and highlight the selected node
function displayNodeInfo(event, d) {
    // Hide all highlights first
    d3.selectAll('.highlight').style("visibility", "hidden");

    // Show highlight for the clicked node
    d3.select(this).select('.highlight').style("visibility", "visible");

    // Update the node info in the tool window
    const nodeInfo = `
        <strong>Name:</strong> ${d.name}<br>
        <strong>Feature 1:</strong> ${d.feature1}<br>
        <strong>Feature 2:</strong> ${d.feature2}<br>
        <strong>Feature 3:</strong> ${d.feature3}<br>
        <strong>Feature 4:</strong> ${d.feature4}<br>
        <strong>Feature 5:</strong> ${d.feature5}<br>
        <strong>PageRank:</strong> ${d.pagerank.toFixed(4)}
    `;
    d3.select("#node-info").html(nodeInfo);
}
