import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { tree } from "d3-hierarchy";

const Graph = ({ nodes }) => {
    const simulationRef = useRef();
    const containerRef = useRef();
    const drag = (simulation) => {
        // const linkData = treeLayout(rootNode).links();

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    useEffect(() => {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Run the topological sort on the nodes based on the input edges
        const treeLayout = tree().nodeSize([600, 400]);
        if (nodes && nodes.length > 0) {
            const rootNode = nodes.filter((node) => node.isTopLevel)[0];

            console.log("rootNode", rootNode);
            const newHierachy = d3.hierarchy(rootNode, (d) => {
                return d.subgroup_events
                    ? d.subgroup_events.map((id) =>
                          nodes.find((node) => node["@id"] === id)
                      ).sort((a,b) => a["outlinks"].includes(b["@id"]))
                    : [];
            });

            const treeLayout = d3.tree().size([width, height - 100]);
            // calculate the layout using the tree layout
            const tree = treeLayout(newHierachy);
            const descendants = tree.descendants();
            console.log("newTree", tree);
            const horizontalEdges = descendants.filter((event) => event.data.outlinks).flatMap(event => event.data.outlinks.map(target => ({source: event, target: descendants.find(event => event.data["@id"] === target), type: "outlink"})))
            console.log("horizontalEdges", horizontalEdges);

        
        const simulation = d3
            .forceSimulation(newHierachy.descendants())
            .force(
                "x",
                d3
                    .forceX()
                    .x((d) => d.x)
                    .strength(0.3)
            )
            .force(
                "y",
                d3
                    .forceY()
                    .y((d) => d.y)
                    .strength(0.3)
            )
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            //   .force('collide', d3.forceCollide().radius(10).strength(0.5))
            .force(
                "link",
                d3
                    .forceLink()
                    .links([...newHierachy.links(), ...horizontalEdges])
                    .distance((d) => (d.type === "outlink" ? 30 : 200))
                    .strength((d) => {
                        return d.type === "outlink" ? 1 : 0.7; // set a higher strength for horizontal links
                    })
            )
            .stop();

        // for (let i = 0; i <2000; i++) {
        //     simulation.tick();
        // }
        simulation.on("tick", () => {
            // Update the nodes and links here
            eventNodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
            horizontalLink.attr("d", (d) => {
                console.log(d)
                const x1 = d.x + 10; // add offset to make room for node radius
                const y1 = d.y;
                const x2 = d.x - 10; // add offset to make room for node radius
                const y2 = d.y;
                return d3.linkHorizontal()({
                    source: [x1, y1],
                    target: [x2, y2],
                });
            });
            verticalLink.attr("d", (d) => {
                const x1 = d.x;
                const y1 = d.y + 10; // add offset to make room for node radius
                const x2 = d.x;
                const y2 = d.y - 10; // add offset to make room for node radius
                return d3.linkVertical()({
                    source: [x1, y1],
                    target: [x2, y2],
                });
            });
        });

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 16])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        const svg = d3
            .select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

        const g = svg.append("g");
        console.log("newHierachy", newHierachy.descendants());
        const horizontalLink = g
            .selectAll(".horizontal-link")
            .data(horizontalEdges)
            .enter()
            .append("path")
            .attr("class", "horizontal-link")
            .attr("stroke", "#999")
            .attr("stroke-width", 1)
            // .attr('stroke-linecap', 'round')
            .attr("fill", "none")
            .attr("marker-end", "url(#arrow)")
            //   .attr('d', d3.linkHorizontal().x(d => d.x).y(d => d.y));
            .attr("d", (d) => {
                const x1 = d.x + 10; // add offset to make room for node radius
                const y1 = d.y;
                const x2 = d.x - 10; // add offset to make room for node radius
                const y2 = d.y;
                return d3.linkHorizontal()({
                    source: [x1, y1],
                    target: [x2, y2],
                });
            });

        const verticalLink = g
            .selectAll(".vertical-link")
            .data(newHierachy.links())
            .enter()
            .append("path")
            .attr("class", "vertical-link")
            .attr("stroke", "steelblue") // set stroke to blue
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("d", (d) => {
                const x1 = d.source.x;
                const y1 = d.source.y + 10; // add offset to make room for node radius
                const x2 = d.target.x;
                const y2 = d.target.y - 10; // add offset to make room for node radius
                return d3.linkVertical()({
                    source: [x1, y1],
                    target: [x2, y2],
                });
            });

        const eventNodes = g
            .selectAll(".node")
            .data(newHierachy.descendants())
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("id", (d) => d["@id"])
            .attr("r", 10)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("fill", "#333")
            .call(drag(simulation)); // enable drag behavior;

        g.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5 L10,0 L0,5")
            .attr("class", "arrow-head");
        simulation.alpha(1).restart();
        console.log("containerRef.current", containerRef.current);
        return () => {
            svg.remove();
            simulation.stop();
        };
    }
    }, [nodes]);

    return (
        <div
            ref={containerRef}
            style={{ width: "100vw", height: "100%", position: "relative" }}
        />
    );
};

export default Graph;
