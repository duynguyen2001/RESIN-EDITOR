function _1(md){return(
md`# Project `
)}

function _file(Inputs){return(
Inputs.file({label: "JSON file", accept: ".json"})
)}

function _exampleJSON(file,FileAttachment){return(
file ? file.json() : FileAttachment("disease_outbreak_sdf_example.json").json()
)}

function _createJsonDownloadButton(exampleJSON,DOM){return(
function createJsonDownloadButton(data, filename = 'data.json', buttonTitle = 'Download JSON') {
  const blob = new Blob([JSON.stringify(exampleJSON, null, 2)],  {type: "text/json"});
  return DOM.download(blob, filename, buttonTitle);
}
)}

function _5(createJsonDownloadButton){return(
createJsonDownloadButton()
)}

function _nodes(exampleJSON){return(
exampleJSON.instances[0].events
)}

function _height(){return(
1000
)}

function _nodeById(nodes){return(
new Map(Array.from(nodes, d => [d["@id"], d]))
)}

function _verticesByLevel(nodes){return(
new Map([[0, new Set([nodes[0]["@id"]])]])
)}

function _nodeColor(Inputs){return(
Inputs.color({label: "Favorite color", value: "#69b3a2"})
)}

function _nodeSize(Inputs){return(
Inputs.range([0, 30], {value: 20, step: 0.5, label: "Node Size"})
)}

function _edgeSize(Inputs){return(
Inputs.range([0, 20], {value: 1.5, step: 0.5, label: "Edge Size"})
)}

function _edgeColor(Inputs){return(
Inputs.color({label: "Edge Color", value: "#999999"})
)}

function _fontSize(Inputs){return(
Inputs.range([0, 64], {value: 18, step: 0.5, label: "Font Size"})
)}

function _15(html,edgeColor,edgeSize,nodeColor,nodeSize){return(
html`<style>

    .links {
      stroke: ${edgeColor};
      stroke-opacity: 0.6;
      stroke-width: ${edgeSize}px;
    }

    /* Styles for nodes */
    .nodes circle {
      fill: ${nodeColor};
      stroke: #fff;
      stroke-width: 1.5px;
      r: ${nodeSize};
    }

    .nodes text {
      font-size: 20px;
      font-family: roboto;
      fill: #333;
    }

.popup-content {
  font-size: 12px;
  font-family: sans-serif;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1); /* Change opacity to 0.1 for a more glass-like effect */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Add some transparency to the border */
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-family: sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
  backdrop-filter: blur(10px); /* Add the blur effect to the background */
  -webkit-backdrop-filter: blur(10px); /* For Safari compatibility */
}

input[type="text"] {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
       -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
}

input[type="text"]:focus {
  border-color: #66afe9;
  outline: 0;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
}
.minimap {
    border: 1px solid #ccc;
    overflow: hidden;
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .minimap .viewport {
    stroke: #333;
    stroke-width: 2;
    fill: none;
    pointer-events: none;
  }
.legend {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.1); /* Change opacity to 0.1 for a more glass-like effect */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Add some transparency to the border */
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-family: sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
  backdrop-filter: blur(10px); /* Add the blur effect to the background */
  -webkit-backdrop-filter: blur(10px); /* For Safari compatibility */
}

.legend .node {
  margin-bottom: 10px;
}

.legend .toggle-button {
  margin-right: 10px;
}

.legend.collapsed .child-node {
  display: none;
}

.legend .child-node {
  margin-left: 20px;
}

</style>`
)}

function* _graphs(d3,width,height,nodes,nodeById,html,toolbox,nodeSize,popupContent,Legend)
{
  const svg = d3.create("svg").attr("width", width).attr("height", height);
  const g = svg.append("g");
  const edges = new Set();
  const verticesByLevel = new Map();
  verticesByLevel.set(0, new Set([nodes[0]["@id"]]));
  const appearNodes = (map) => {
    var outputArray = [];
    map.forEach((vertices, level) => {
      return vertices.forEach((nodeId) =>
                              {console.log(nodeId)
        outputArray.push({
          id: nodeId,
          level: level,
          opened: false,
          name: nodeById.get(nodeId).name
        })}
      );
    });
    return outputArray;
  };
  var shownNodes = appearNodes(verticesByLevel);

  const addNewNodesToSet = (index, nodeName) => {
    if (nodeById.get(nodeName).hasOwnProperty("children")) {
      const array = nodeById.get(nodeName).children;
      if (verticesByLevel.has(index + 1)) {
        for (const vertex of array) {
          verticesByLevel.get(index + 1).add(vertex);
          edges.add({ source: nodeName, target: vertex });
        }
      } else {
        verticesByLevel.set(index + 1, new Set(array));
        for (const vertex of array) {
          edges.add({ source: nodeName, target: vertex });
        }
      }
      shownNodes = appearNodes(verticesByLevel);
    }
  };

  // addNewNodesToSet(0, "resin:Events/10000");
  g.append("g").attr("class", "nodes");
  g.append("g").attr("class", "links");
  g.append("g").attr("class", "labels");

  const simulation = d3
    .forceSimulation(shownNodes)
    .force(
      "link",
      d3
        .forceLink(edges)
        .id((d) => d.id)
        .distance(10000)
    )
    .force("charge", d3.forceManyBody().strength(-2000))
    .force("x", d3.forceX(width / 2))
    .force(
      "y",
      d3
        .forceY((d) => {
          console.log(
            (0.8 / (verticesByLevel.size - 1)) *
              (d.level - verticesByLevel.size / 2.0) *
              height +
              0.5 * height
          );
          return verticesByLevel.size == 1
            ? 0.5 * height
            : (0.8 / verticesByLevel.size) *
                (d.level - verticesByLevel.size / 2.0) *
                height +
                0.5 * height;
        })
        .strength(1)
    )
    .on("tick", ticked);
  let link = g.select("g.links").selectAll("line");
  let node = g.select("g.nodes").selectAll("circle");
  let text = g.select("g.labels").selectAll("text");
  updateGraph();

  // function update the graph
  function updateGraph() {
    // Update links
    link = link.data(edges, (d) => {
      return d;
    });
    link.exit().remove();
    link = link.enter().append("line").attr("class", "links").merge(link);
    console.log(link);

    // Update nodes
    console.log(shownNodes);
    node = node.data(shownNodes, (d) => d.id);
    node.exit().remove();
    node = node
      .enter()
      .append("circle")
      .attr("class", "node")
      // .attr("r", nodeSize)
      .merge(node)
      .on("click", nodeClicked) // Add the click event listener
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Update text
    text = g
      .select("g.labels")
      .selectAll("text")
      .data(shownNodes, (d) => d.id);
    text.exit().remove();
    text = text
      .enter()
      .append("text")
      .attr("class", "labels")
      .merge(text)
      .text((d) => d.name);
    console.log("text");
    console.log(text);
    // Update simulation
    simulation.nodes(shownNodes);
    simulation.force("link").links(edges);
    simulation.alpha(1).restart();
  }
  // console.log(shownNodes.find((node) => node.id == "resin:Events/10000").x);
  // Add minimap
  const minimapWidth = 200;
  const minimapHeight = 200;
  const minimapScale = 0.2;
  const minimap = d3
    .create("svg")
    .attr("width", minimapWidth)
    .attr("height", minimapHeight)
    .attr("class", "minimap");

  const minimapG = minimap
    .append("g")
    .attr("transform", `scale(${minimapScale})`);

  const viewportRect = minimap
    .append("rect")
    .attr("width", width * minimapScale)
    .attr("height", height * minimapScale)
    .attr("class", "viewport");

  function updateMinimap() {
    // Update the minimap
    minimapG.selectAll(".links").remove();
    minimapG.selectAll(".nodes").remove();
    minimapG.selectAll(".labels").remove();

    minimapG
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("x1", (d) => shownNodes.find((node) => node.id == d.source).x) // Use shownNodes instead of d.source.x
      .attr("y1", (d) => shownNodes.find((node) => node.id == d.source).y) // Use shownNodes instead of d.source.y
      .attr("x2", (d) => shownNodes.find((node) => node.id == d.target).x) // Use shownNodes instead of d.target.x
      .attr("y2", (d) => shownNodes.find((node) => node.id == d.target).y); // Use shownNodes instead of d.target.y

    minimapG
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(shownNodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 5);

    minimapG
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(shownNodes)
      .join("text")
      .attr("dx", (d) => d.x - d.name.length * 3)
      .attr("dy", (d) => d.y + 25)
      .text((d) => d.name);
  }
  function handleViewportDrag(event) {
    const newX = event.x / minimapScale;
    const newY = event.y / minimapScale;

    // Update the main graph view
    svg.call(zoom.translateTo, newX, newY);
  }
  function updateMinimapViewport(transform) {
    const minimapViewport = minimap.select(".viewport");
    minimapViewport.attr("transform", transform.toString());
  }
  function initViewportInteraction() {
    const dragViewport = d3
      .drag()
      .on("start", (event, d) => {
        d3.select(this).raise();
        event.sourceEvent.stopPropagation();
      })
      .on("drag", handleViewportDrag);

    // Set the initial position of the minimap's viewport
    const initialTransform = d3.zoomIdentity;
    updateMinimapViewport(initialTransform);

    // Attach the drag handler to the viewport rectangle
    viewportRect.call(dragViewport);
  }
  initViewportInteraction();
  yield html`<div style="position:relative;">
  <div id="legend-container" style="
  visibility: hidden"></div>
  ${toolbox}
  ${minimap.node()}
  ${svg.node()}
</div>`;

  function ticked() {
    link
      .attr("x1", (d) => shownNodes.find((node) => node.id == d.source).x)
      .attr("y1", (d) => shownNodes.find((node) => node.id == d.source).y)
      .attr("x2", (d) => shownNodes.find((node) => node.id == d.target).x)
      .attr("y2", (d) => shownNodes.find((node) => node.id == d.target).y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    // Update text positions
    text
      .attr("x", (d) => d.x - d.name.length * 3)
      .attr("y", (d) => d.y + nodeSize + 20);

    // Update the minimap
    updateMinimap();

    // Update the viewport rectangle
    const transform = d3.zoomTransform(svg.node());
    viewportRect
      .attr("x", (-transform.x * minimapScale) / transform.k)
      .attr("y", (-transform.y * minimapScale) / transform.k)
      .attr("width", (width * minimapScale) / transform.k)
      .attr("height", (height * minimapScale) / transform.k);
  }
  // if dragged
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

  function nodeClicked(event, d) {
    console.log("clicked");
    // Get the position of the clicked node
    const [x, y] = d3.pointer(event);
    addNewNodesToSet(d.level, d.id);
    updateGraph();

    // Create or update the popup with the node's information
    let popup = svg.select(".popup");
    if (popup.empty()) {
      popup = svg.append("foreignObject").attr("class", "popup");
      popup
        .append("xhtml:div")
        .attr("class", "popup-content")
        .on("click", (e) => e.stopPropagation()); // Prevent click event from propagating to SVG
    }

    popup
      .attr("x", x)
      .attr("y", y > 490 ? y - 500 : y)
      .attr("width", 300)
      .attr("height", 500)
      .select(".popup-content")
      .html(popupContent(d));

    svg.on("click", () => popup.remove()); // Close the popup when clicking outside

    event.stopPropagation(); // Prevent click event from propagating to SVG
  }

  // function to zoom and scroll svg
  function handleZoom(e) {
    g.attr("transform", e.transform);

    // Update the viewport rectangle on the minimap
    const scale = e.transform.k;
    const x = e.transform.x * minimapScale;
    const y = e.transform.y * minimapScale;
    viewportRect
      .attr("x", x)
      .attr("y", y)
      .attr("width", (width / scale) * minimapScale)
      .attr("height", (height / scale) * minimapScale);
  }
  let zoom = d3.zoom().scaleExtent([0.25, 2]).on("zoom", handleZoom);
  svg.call(zoom);

  function zoomIn() {
    svg.transition().call(zoom.scaleBy, 2);
  }

  function zoomOut() {
    svg.transition().call(zoom.scaleBy, 0.5);
  }

  function resetZoom() {
    svg.transition().call(zoom.scaleTo, 1);
  }

  function center() {
    svg.transition().call(zoom.translateTo, 0.5 * width, 0.5 * height);
  }

  function panLeft() {
    svg.transition().call(zoom.translateBy, -50, 0);
  }

  function panRight() {
    svg.transition().call(zoom.translateBy, 50, 0);
  }

  const legend = new Legend("legend-container");
  legend.render();

  function legendShowHide() {
    const legend = document.getElementById("legend-container");
    console.log(legend.style.visibility);

    if (legend.style.visibility === "hidden") {
      legend.style.visibility = "visible";
    } else {
      legend.style.visibility = "hidden";
    }
  }
  // Get references to the HTML buttons
  const zoomInButton = document.getElementById("zoomIn");
  const zoomOutButton = document.getElementById("zoomOut");
  const resetZoomButton = document.getElementById("resetZoom");
  const panLeftButton = document.getElementById("panLeft");
  const panRightButton = document.getElementById("panRight");
  const centerButton = document.getElementById("centerButton");
  const legendButton = document.getElementById("legendButton");

  // Add click event listeners to the buttons
  zoomInButton.addEventListener("click", zoomIn);
  zoomOutButton.addEventListener("click", zoomOut);
  resetZoomButton.addEventListener("click", resetZoom);
  panLeftButton.addEventListener("click", panLeft);
  panRightButton.addEventListener("click", panRight);
  centerButton.addEventListener("click", center);
  legendButton.addEventListener("click", legendShowHide);
}


function _popupContent(nodeById){return(
(d) => `<div>
              <p><strong>Node ID:</strong></p>
              <p>${d.id}\n</p><br>
  
              <label><strong>Name:</strong></label>
              <input type="text" value="${
                nodeById.get(d.id).name ? nodeById.get(d.id).name : d.id
              }" onchange="updateNodeProperty('${d.id}', 'name', this.value)">
              <br>
              
              <label><strong>Description:</strong></label>
              <input type="text" value="${
                nodeById.get(d.id).description
              }" onchange={updateNodeProperty('${
      d.id
    }', 'description', this.value)">
              <br>
              
              <label><strong>wd_node:</strong></label>
              <input type="text" value="${
                nodeById.get(d.id).wd_node
              }" onchange="updateNodeProperty('${
      d.id
    }', 'wd_node', this.value)">
              <br>
              
              <label><strong>wd_label:</strong></label>
              <input type="text" value="${
                nodeById.get(d.id).wd_label
              }" onchange="updateNodeProperty('${
      d.id
    }', 'wd_label', this.value)">
              <br>
              
              <label><strong>wd_description:</strong></label>
              <input type="text" value="${
                nodeById.get(d.id).wd_description
              }" onchange="updateNodeProperty('${
      d.id
    }', 'wd_description', this.value)">
              <br>
          </div>`
)}

function _18(nodeById){return(
window.updateNodeProperty = (nodeId, propertyName, newValue) => {
  const node = nodeById.get(nodeId);
  if (node) {
    node[propertyName] = newValue;
  }
}
)}

function _toolbox(html){return(
html`
<style>
.toolbox {
  position: absolute;
  left: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbox-child {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.1); /* Change opacity to 0.1 for a more glass-like effect */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Add some transparency to the border */
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-family: sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
  backdrop-filter: blur(10px); /* Add the blur effect to the background */
  -webkit-backdrop-filter: blur(10px); /* For Safari compatibility */
}

</style>
<div class="toolbox">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
<div class="toolbox-child">
   <button id="resetZoom" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" alt="Reset Zoom" style="width: 100%; height: 100%;">
      restart_alt
      </span> 
      <text>Reset Zoom</text>
   </button>
</div>
<!-- Pan Left Button -->
<div class="toolbox-child">
   <button id="panLeft" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      arrow_back
      </span>
      <text>Pan Left</text>
   </button>
</div>
<!-- Center Button -->
<div class="toolbox-child">
   <button id="centerButton" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      adjust
      </span>
      <text>Center</text>
   </button>
</div>
<!-- Pan Right Button -->
<div class="toolbox-child">
   <button id="panRight" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      arrow_forward
      </span>
      <text>Pan Right</text>
   </button>
</div>
<!-- Zoom In Button -->
<div class="toolbox-child">
   <button id="zoomIn" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      zoom_in
      </span>
      <text>Zoom In</text>
   </button>
</div>
<!-- Zoom Out Button -->
<div class="toolbox-child">
   <button id="zoomOut" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      zoom_out
      </span>
      <text>Zoom Out</text>
   </button>
</div>
<!-- Show Legend Button -->
<div class="toolbox-child">
   <button id="legendButton" style="background-color: transparent; border: none; padding: 0; width: 100%">
      <span class="material-symbols-outlined" style="width: 100%; height: 100%;">
      legend_toggle
      </span>
      <text>Show Legend</text>
   </button>
</div>
</div>`
)}

function _20(md){return(
md`
In this implementation, the \`Node\` class has the following properties:

- \`type\`: a string that specifies the type of the node, which can be one of "primitive", "event", "optional", "entity", or "xor-gate"
- \`id\`: a unique string identifier for the node
- \`x\`: the x-coordinate of the node's position
- \`y\`: the y-coordinate of the node's position
- \`label\`: a string label for the node (only used for sub-events)
- \`isOptional\`: a boolean flag that indicates whether the node is optional (only used for optional events)
- \`isXORGate\`: a boolean flag that indicates whether the node is an XOR gate (only used for XOR gates)
- \`isSelected\`: a boolean flag that indicates whether the node is currently selected (highlighted with light blue)

The \`Node\` class also has the following methods:

- \`render(svg)\`: a method that renders the node as an SVG element within the given \`svg\` selection. The method uses D3 to create the appropriate shapes and styles based on the node's properties.
- \`getShape()\`: a method that returns the SVG path for the shape of the node, based on its type.
- \`getColor()\`: a method that returns the fill color for the node, based on its type, whether it is optional, and whether it is currently selected.
- \`getStrokeWidth()\`: a method that returns the stroke width for the node, based on whether it is an XOR gate.
`
)}

function _Node(){return(
class Node {
  constructor(type, id, x, y, label, shapeConfig, isOptional = false, isSelected = false) {
    this.type = type; // "chapter", "event", "entity", "xor-gate"
    this.id = id;
    this.x = x;
    this.y = y;
    this.isOptional = isOptional;
    this.isSelected = isSelected;
    this.label = label;
    this.shapeConfig = shapeConfig || {};
  }

  render(svg) {
    const group = svg
      .append("g")
      .attr("id", this.id)
      .attr("class", `node ${this.type}`)
      .attr("transform", `translate(${this.x}, ${this.y})`);

    switch (this.type) {
      case "chapter":
        this.drawChapter(group);
        break;
      case "event":
        this.drawEvent(group);
        break;
      case "entity":
        this.drawEntity(group);
        break;
      case "xor-gate":
        this.drawXORGate(group);
        break;
    }
  }

  render(svg) {
    const group = svg
      .append("g")
      .attr("id", this.id)
      .attr("class", `node ${this.type}`)
      .attr("transform", `translate(${this.x}, ${this.y})`);

    switch (this.type) {
      case "chapter":
        this.drawChapter(group);
        break;
      case "event":
        this.drawEvent(group);
        break;
      case "entity":
        this.drawEntity(group);
        break;
      case "xor-gate":
        this.drawXORGate(group);
        break;
    }
  }
  getColor() {
    if (this.type === "chapter") {
      return "#6495ED"; // blue
    } else if (this.type === "event") {
      return "#FFFF00"; // yellow
    } else if (this.type === "optional") {
      return "#FFFF00"; // yellow
    } else if (this.type === "selected") {
      return "#ADD8E6"; // light blue
    } else if (this.type === "entity") {
      return "#808080"; // gray
    } else if (this.type === "xor-gate") {
      return "#008000"; // green
    } else {
      return "#FFFFFF"; // white
    }
  }
  getStrokeWidth() {
    if (this.type === "chapter") {
      return 1;
    } else if (this.type === "event") {
      return 1;
    } else if (this.type === "optional") {
      return 1;
    } else if (this.type === "selected") {
      return 1;
    } else if (this.type === "entity") {
      return 1;
    } else if (this.type === "xor-gate") {
      return 3;
    } else {
      return 1;
    }
  }
    applyOptional(group) {
    if (this.isOptional) {
      const currentShape = group.select("*");
      currentShape.attr("stroke-dasharray", "2 2");
    }
  }

  applySelected(group) {
    if (this.isSelected) {
      const currentShape = group.select("*");
      const color = "#ADD8E6"; // light blue
      currentShape.attr("fill", color);
    }
  }
  drawChapter(group) {
    const color = this.getColor();
    const strokeWidth = this.getStrokeWidth();
    const width = this.shapeConfig.width || 30;
    const height = this.shapeConfig.height || 30;

    const pathData = `
      M 0 ${-height / 2}
      L ${width / 2} 0
      L 0 ${height / 2}
      L ${-width / 2} 0
      Z
    `;

    group
      .append("path")
      .attr("d", pathData)
      .attr("fill", color)
      .attr("stroke", "black")
      .attr("stroke-width", strokeWidth);

    this.applyOptional(group);
    this.applySelected(group);
    this.addTextLabel(group, 12, height / 2 + 10);
  }

  drawEvent(group) {
    const color = this.getColor(); 
    const strokeWidth = this.getStrokeWidth();
    const radius = this.shapeConfig.radius || 10;

    group
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", color)
      .attr("stroke", "black")
      .attr("stroke-width", strokeWidth);
    
    this.applyOptional(group);
    this.applySelected(group);
    this.addTextLabel(group, 12, radius + 10);
  }

  drawEntity(group) {
    const color = this.getColor(); // gray
    const strokeWidth = this.getStrokeWidth();
    const width = this.shapeConfig.width || 30;
    const height = this.shapeConfig.height || 20;

    group
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("fill", color)
      .attr("stroke", "black")
      .attr("stroke-width", strokeWidth);

    
    this.applyOptional(group);
    this.applySelected(group);
    this.addTextLabel(group, 12, height / 2 + 10);
  }

  drawXORGate(group) {
    const color = this.getColor(); // green
    const strokeWidth = this.getStrokeWidth();
    const width = this.shapeConfig.width || 30;
    const height = this.shapeConfig.height || 20;

    group
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", -width / 2)
      .attr("y", -height / 2)
      .attr("fill", color)
      .attr("stroke", "black")
      .attr("stroke-width", strokeWidth);
    this.applyOptional(group);
    this.applySelected(group);
    this.addTextLabel(group, 12, height / 2 + 10);
  }

  addTextLabel(group, fontSize, dist = 10) {
    const text = group
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", `${fontSize}px`)
      .attr("dy", dist)
      .text(this.label);
  }
}
)}

function _Legend(d3,Node){return(
class Legend {
  constructor(parentId) {
    this.parentId = parentId;
  }

  render() {
    const legend = d3.create("div").attr("class", "legend");

    const nodes = [
        new Node("chapter", "chapter1", 50, 30, "Chapter Node", { width: 50, height: 30 }),
        new Node("event", "event1", 50, 30, "Event Node", { radius: 20 }),
        new Node("event", "optional1", 50, 30, "Optional Node", { radius: 20 }, true),
        new Node("event", "selected1", 50, 30, "Selected Node",  { radius: 20 }, false, true),
        new Node("entity", "entity1", 50, 30, "Entity Node",  { width: 40, height: 30 }),
        new Node("xor-gate", "xor1", 50, 30, "XOR Gate", { width: 40, height: 30 }),
      ];


    const nodeDivs = nodes.map((node) => this.createNodeDiv(node));
    nodeDivs.forEach((nodeDiv) => legend.append(() => nodeDiv.node()));

    const parent = d3.select(`#${this.parentId}`);
    parent.append(() => legend.node());

    legend.on("click", (event) => {
      if (event.target.tagName === "BUTTON") {
        const nodeId = event.target.getAttribute("data-node-id");
        const node = d3.select(`#${nodeId}`);
        if (node.classed("collapsed")) {
          node.classed("collapsed", false);
        } else {
          node.classed("collapsed", true);
        }
      }
    });
  }

  createNodeDiv(node) {
    const nodeDiv = d3
      .create("div")
      .attr("class", "node")
      .attr("data-node-type", node.type);

    const svgImage = d3.create("svg").attr("width", 100).attr("height", 80);
    node.render(svgImage);
    nodeDiv.append(() => svgImage.node());

    const button = nodeDiv
      .append("button")
      .attr("class", "toggle-button")
      .attr("data-node-id", node.id)
      .text("Change");

    return nodeDiv;
  }
}
)}

function _square(d3){return(
d3.symbol().type(d3.symbolSquare).size(200)()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["disease_outbreak_sdf_example.json", {url: new URL("./files/af69189e8f9b627d0c6759aa5f6d75e8a2d9129fb0811bbe873956db4ad7635a0eda58c902cc50e16d867f179d46454c7f81b73273ad2c83cf6bec3fe9616cc0.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof file")).define("viewof file", ["Inputs"], _file);
  main.variable(observer("file")).define("file", ["Generators", "viewof file"], (G, _) => G.input(_));
  main.variable(observer("exampleJSON")).define("exampleJSON", ["file","FileAttachment"], _exampleJSON);
  main.variable(observer("createJsonDownloadButton")).define("createJsonDownloadButton", ["exampleJSON","DOM"], _createJsonDownloadButton);
  main.variable(observer()).define(["createJsonDownloadButton"], _5);
  main.variable(observer("nodes")).define("nodes", ["exampleJSON"], _nodes);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("nodeById")).define("nodeById", ["nodes"], _nodeById);
  main.variable(observer("verticesByLevel")).define("verticesByLevel", ["nodes"], _verticesByLevel);
  main.variable(observer("viewof nodeColor")).define("viewof nodeColor", ["Inputs"], _nodeColor);
  main.variable(observer("nodeColor")).define("nodeColor", ["Generators", "viewof nodeColor"], (G, _) => G.input(_));
  main.variable(observer("viewof nodeSize")).define("viewof nodeSize", ["Inputs"], _nodeSize);
  main.variable(observer("nodeSize")).define("nodeSize", ["Generators", "viewof nodeSize"], (G, _) => G.input(_));
  main.variable(observer("viewof edgeSize")).define("viewof edgeSize", ["Inputs"], _edgeSize);
  main.variable(observer("edgeSize")).define("edgeSize", ["Generators", "viewof edgeSize"], (G, _) => G.input(_));
  main.variable(observer("viewof edgeColor")).define("viewof edgeColor", ["Inputs"], _edgeColor);
  main.variable(observer("edgeColor")).define("edgeColor", ["Generators", "viewof edgeColor"], (G, _) => G.input(_));
  main.variable(observer("viewof fontSize")).define("viewof fontSize", ["Inputs"], _fontSize);
  main.variable(observer("fontSize")).define("fontSize", ["Generators", "viewof fontSize"], (G, _) => G.input(_));
  main.variable(observer()).define(["html","edgeColor","edgeSize","nodeColor","nodeSize"], _15);
  main.variable(observer("graphs")).define("graphs", ["d3","width","height","nodes","nodeById","html","toolbox","nodeSize","popupContent","Legend"], _graphs);
  main.variable(observer("popupContent")).define("popupContent", ["nodeById"], _popupContent);
  main.variable(observer()).define(["nodeById"], _18);
  main.variable(observer("toolbox")).define("toolbox", ["html"], _toolbox);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer("Node")).define("Node", _Node);
  main.variable(observer("Legend")).define("Legend", ["d3","Node"], _Legend);
  main.variable(observer("square")).define("square", ["d3"], _square);
  return main;
}
