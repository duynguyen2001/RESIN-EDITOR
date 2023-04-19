// import React, { useEffect, useRef, useMemo } from "react";
// import * as d3 from "d3";
// import { tree } from "d3-hierarchy";
// import {EventNode, EventNodeComponent  } from "../components/Library.tsx";
// const Graph = ({ nodes }) => {
//     const simulationRef = useRef();
//     const containerRef = useRef();
//     const drag = (simulation) => {
//         // const linkData = treeLayout(rootNode).links();

//         function dragstarted(event) {
//             if (!event.active) simulation.alphaTarget(0.3).restart();
//             event.subject.fx = event.subject.x;
//             event.subject.fy = event.subject.y;
//         }

//         function dragged(event) {
//             event.subject.fx = event.x;
//             event.subject.fy = event.y;
//         }

//         function dragended(event) {
//             if (!event.active) simulation.alphaTarget(0);
//             event.subject.fx = event.x;
//             event.subject.fy = event.y;
//         }

//         return d3
//             .drag()
//             .on("start", dragstarted)
//             .on("drag", dragged)
//             .on("end", dragended);
//     };

//     const rootNode = useMemo(() =>
//         nodes && nodes.length > 0
//             ? nodes.filter(() => (node) => node.isTopLevel)[0]
//             : null
//     );
//     useEffect(() => {
//         const width = containerRef.current.clientWidth;
//         const height = containerRef.current.clientHeight;
//         const nodeWidth = 100;

//         // Run the topological sort on the nodes based on the input edges
//         const treeLayout = tree().size([height, width]).nodeSize([30, 30])
//         .separation((a, b) => (a.parent === b.parent ? nodeWidth : 2 * nodeWidth) / a.depth);
//         if (rootNode) {
//             console.log("rootNode", rootNode);
//             const newHierachy = d3.hierarchy(rootNode, (d) => {
//                 return d.subgroup_events
//                     ? d.subgroup_events.map((id) =>
//                           nodes.find((node) => node["@id"] === id)
//                       )
//                     : [];
//             });
//             const newHierachy2 = d3.hierarchy(rootNode, (d) => {
//                 return d.outlinks
//                     ? d.outlinks.map((id) =>
//                           nodes.find((node) => node["@id"] === id)
//                       )
//                     : [];
//             });

//             const treeLayout = d3.tree().size([width, height - 100]);
//             // const treeLayout2 = d3.tree().size([width, height - 100]);
//             // calculate the layout using the tree layout
//             const tree = treeLayout(newHierachy);
//             // const tree2 = treeLayout2(newHierachy2);
//             newHierachy.descendants().forEach(node => {
//                 node.y = node.depth * 200; // set the initial y position
//                 node.fx = node.x; // fix the x position
//                 node.fy = node.y; // fix the y position
//               });
//             const descendants = tree.descendants();
//             console.log("nodes", descendants);
//             console.log("newTree", tree);
//             const horizontalEdges = descendants
//                 .filter((event) => event.data.outlinks)
//                 .flatMap((event) =>
//                     event.data.outlinks.map((target) => ({
//                         source: event,
//                         target: descendants.find(
//                             (event) => event.data["@id"] === target
//                         ),
//                         type: "outlink",
//                     }))
//                 );
//             console.log("horizontalEdges", horizontalEdges);

//             const simulation = d3
//                 .forceSimulation(descendants)
//                 .force(
//                     "x",
//                     d3
//                         .forceX()
//                         .x((d) => d.x)
//                         .strength(0.2)
//                 )
//                 .force(
//                     "y",
//                     d3
//                         .forceY()
//                         .y((d) => 800 * d.depth * 0.2)
//                         .strength(2)
//                 )
//                 .force("charge", d3.forceManyBody().strength(-700))
//                 // .force("center", d3.forceCenter(width / 2, height / 2))
//                 //   .force('collide', d3.forceCollide().radius(10).strength(0.5))
//                 // .force(
//                 //     "link",
//                 //     d3
//                 //         .forceLink()
//                 //         .links([...newHierachy.links(), ...horizontalEdges])
//                 //         .distance((d) => (d.type === "outlink" ? 50 : 200))
//                 //         .strength((d) => {
//                 //             return d.type === "outlink" ? 0 : 0.2; // set a higher strength for horizontal links
//                 //         })
//                 // )
//                 .stop();

//             // for (let i = 0; i <2000; i++) {
//             //     simulation.tick();
//             // }
//             simulation.on("tick", () => {
//                 // Update the nodes and links here
//                 eventNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
//                 horizontalLink.attr("d", (d) => {
//                     return (
//                         "M " +
//                         d.source.x +
//                         " " +
//                         d.source.y +
//                         " L " +
//                         d.target.x +
//                         " " +
//                         d.target.y +
//                         " Z"
//                     );
//                 });
//                 verticalLink.attr("d", (d) => {
//                     return (
//                         "M " +
//                         d.source.x +
//                         " " +
//                         d.source.y +
//                         " L " +
//                         d.target.x +
//                         " " +
//                         d.target.y +
//                         " Z"
//                     );
//                 });
//             });

//             const zoom = d3
//                 .zoom()
//                 .scaleExtent([0.1, 16])
//                 .on("zoom", (event) => {
//                     g.attr("transform", event.transform);
//                 });
//             const svg = d3
//                 .select(containerRef.current)
//                 .append("svg")
//                 .attr("width", width)
//                 .attr("height", height)
//                 .call(zoom);

//             const g = svg.append("g");
//             console.log("newHierachy", newHierachy.descendants());
//             const horizontalLink = g
//                 .selectAll(".horizontal-link")
//                 .data(horizontalEdges)
//                 .enter()
//                 .append("path")
//                 .attr("class", "horizontal-link")
//                 .attr("stroke", "#999")
//                 .attr("stroke-width", 1)
//                 // .attr('stroke-linecap', 'round')
//                 .attr("fill", "none")
//                 .attr("marker-end", "url(#arrow)")
//                 //   .attr('d', d3.linkHorizontal().x(d => d.x).y(d => d.y));
//                 .attr("d", (d) => {
//                     return (
//                         "M " +
//                         d.source.x +
//                         " " +
//                         d.source.y +
//                         " L " +
//                         d.target.x +
//                         " " +
//                         d.target.y +
//                         " Z"
//                     );
//                 });

//             const verticalLink = g
//                 .selectAll(".vertical-link")
//                 .data(newHierachy.links())
//                 .enter()
//                 .append("path")
//                 .attr("class", "vertical-link")
//                 .attr("stroke", "steelblue") // set stroke to blue
//                 .attr("stroke-width", 2)
//                 .attr("fill", "none")
//                 .attr("d", (d) => {
//                     return (
//                         "M " +
//                         d.source.x +
//                         " " +
//                         d.source.y +
//                         " L " +
//                         d.target.x +
//                         " " +
//                         d.target.y +
//                         " Z"
//                     );
//                 });

//             const eventNodes = g
//                 .selectAll(".node")
//                 .data(newHierachy.descendants())
//                 .enter()
//                 .append("circle")
//                 .attr("class", "node")
//                 .attr("id", (d) => d["@id"])
//                 .attr("r", 10)
//                 .attr("cx", (d) => d.x)
//                 .attr("cy", (d) => d.y)
//                 .attr("fill", "#333")
//                 .call(drag(simulation))
//                 .on("click", (d) => {
//                     if (d.children) {
//                         d._subgroup_events = d.subgroup_events;
//                         d.subgroup_events = null;
//                     } else {
//                         d.subgroup_events = d._subgroup_events;
//                         d._subgroup_events = null;
//                     }
//                     treeLayout(newHierachy);
//                     update(g, newHierachy);
//                 }); // enable drag behavior;
//             const update = (g, hierarchy) => {
//                 const nodeGroup = g.select(".nodes");
//                 const linkGroup = g.select(".vertical-link");

//                 const nodes = nodeGroup
//                     .selectAll(".node")
//                     .data(hierarchy.descendants(), (d) => d.id);

//                 nodes
//                     .enter()
//                     .append("g")
//                     .attr("class", "node")
//                     .attr("transform", (d) => `translate(${d.y},${d.x})`)
//                     .append("circle")
//                     .attr("r", 5)
//                     .on("click", (d) => {
//                         if (d.children) {
//                             d._children = d.children;
//                             d.children = null;
//                         } else {
//                             d.children = d._children;
//                             d._children = null;
//                         }
//                         update(svg, hierarchy);
//                     });

//                 nodes
//                     .transition()
//                     .duration(500)
//                     .attr("transform", (d) => `translate(${d.y},${d.x})`);

//                 nodes
//                     .select("circle")
//                     .attr("fill", (d) =>
//                         d._children ? "lightsteelblue" : "#fff"
//                     );

//                 nodes.exit().remove();

//                 const links = linkGroup
//                     .selectAll("path")
//                     .data(hierarchy.links(), (d) => d.target.id);

//                 links
//                     .enter()
//                     .append("path")
//                     .attr(
//                         "d",
//                         d3
//                             .linkHorizontal()
//                             .x((d) => d.y)
//                             .y((d) => d.x)
//                     )
//                     .attr("fill", "none")
//                     .attr("stroke", "#ccc")
//                     .attr("stroke-width", 1.5);

//                 links
//                     .transition()
//                     .duration(500)
//                     .attr(
//                         "d",
//                         d3
//                             .linkHorizontal()
//                             .x((d) => d.y)
//                             .y((d) => d.x)
//                     );

//                 links.exit().remove();
//             };
//             g.append("defs")
//                 .append("marker")
//                 .attr("id", "arrow")
//                 .attr("viewBox", "0 -5 10 10")
//                 .attr("refX", 10)
//                 .attr("refY", 10)
//                 .attr("markerWidth", 8)
//                 .attr("markerHeight", 8)
//                 .attr("orient", "auto-start-reverse")
//                 .append("path")
//                 .attr("d", "M0,-5 L10,0 L0,5")
//                 .attr("class", "arrow-head");
//             simulation.alpha(1).restart();
//             console.log("containerRef.current", containerRef.current);
//             return () => {
//                 svg.remove();
//                 simulation.stop();
//             };
//         }
//     }, [nodes]);

//     return (
//         <div
//             ref={containerRef}
//             style={{ width: "100vw", height: "100%", position: "relative" }}>

//         </div>
//     );
// };

// import React, { useEffect, useState } from "react";
// import * as d3 from "d3";
// import * as cola from "webcola";
// import ReactFlow, {
//   Controls,
//   Background,
//   MiniMap,
//   ReactFlowProvider,
//   useStoreState,
//   useEdgesState,
//   useNodesState
// } from "reactflow";
// import 'reactflow/dist/style.css';

import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
    addEdge,
    ConnectionLineType,
    useNodesState,
    useEdgesState,
    MiniMap,
    ReactFlowProvider,
    Controls,
    MarkerType,
    Position,
} from "reactflow";
import dagre from "dagre";
import { CustomNode } from "./ExpandableNode";
import "reactflow/dist/style.css";

import { initialNodes, initialEdges } from "./nodes-edges.js";

import "./graph.css";
const nodeTypes = {
    custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 200;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? "left" : "top";
        node.sourcePosition = isHorizontal ? "right" : "bottom";

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export const Graph = ({ eventNodes }) => {
    const [chosenNodes, setChosenNodes] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(chosenNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [mapNodes, setMapNodes] = useState({});
    useEffect(() => {
        if (eventNodes.length > 0) {
            const firstNode = eventNodes.filter((node) => node.isTopLevel)[0]
                .id;
            console.log("firstNode", firstNode);
            setChosenNodes([firstNode]);t
            const newMap = new Map();
            eventNodes.forEach((node) => {
                newMap.set(node.id, node);
            });
            setMapNodes(newMap);
        }
    }, [eventNodes]);

    useEffect(() => {
        const newNodes = chosenNodes.map((node) => ({
            data: mapNodes.get(node),
            id: node,
            type: "custom",
        }));

        console.log("newNodes", newNodes);
        console.log("current chosenNods", chosenNodes);
        const newEdges = [];
        newNodes.forEach((source) => {

            source.data.subgroupEvents?.forEach((target) => {
                newEdges.push({
                    id: `e-${source.id}-${target}`,
                    source: source.id,
                    target: target,
                    animated: false,
                    type: ConnectionLineType.SmoothStep,
                    markerEnd: MarkerType.ArrowClosed
                });
            });
        });
        console.log("newEdges", newEdges);
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(newNodes, newEdges);
            const outLinksEdges = [];
            const entities = [];

            layoutedNodes.forEach((node) => {
              console.log("node", node.data);
              node.data.outlinks?.forEach((outlink) => {
                console.log("outlink", outlink);
                outLinksEdges.push({
                  id: `e-${node.id}-${outlink}-outlink`,
                  source: node.id,
                  target: outlink,
                  animated: true,
                  sourceHandle: node.id+"_right",
                  targetHandle: outlink+"_left",
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  type: ConnectionLineType.Straight,
                  markerEnd: MarkerType.ArrowClosed,
                });
                // layoutedNodes.forEach((source) => {
                //   source.data.participants.
                // }
              
  });
});
console.log("outLinksEdges", outLinksEdges);
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges, ...outLinksEdges]);
        console.log("layoutedNodes", layoutedNodes);
        console.log("layoutedEdges", edges);
    }, [chosenNodes]);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: ConnectionLineType.SmoothStep,
                        animated: true,
                    },
                    eds
                )
            ),
        []
    );
    const onLayout = useCallback(
        (direction) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } =
                getLayoutedElements(nodes, edges, direction);
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges]
    );
    const onNodeClick = useCallback(
        (event, node) => {
            console.log("node", node);
            if (!node.data.subgroupEvents || node.data.subgroupEvents.length === 0) {
                return;
            }
            if (node.isExpanded) {
                // collapse
                // const newNodes = chosenNodes.filter(
                //     (n) => new.data.subgroupEvents? !node.data.subgroupEvents?.includes(n) : true
                // );
                // setChosenNodes(newNodes);
                node.isExpanded = false;
                return;
            }
            // const newNodes = new Array(new Set());
            setChosenNodes([...chosenNodes, ...node.data.subgroupEvents]);
            node.isExpanded = true;
            
        },
        [chosenNodes]
    );

    return (
        <div className="layoutflow">
          
      <ReactFlowProvider>
      <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onConnect={onConnect}
                connectionLineType={ConnectionLineType.SmoothStep}
                nodeTypes={nodeTypes}
                fitView
            />
            <MiniMap nodes={nodes} nodeStrokeWidth={3} zoomable pannable />
            <Controls/>
      </ReactFlowProvider>
        </div>
    );
};
export default Graph;
