import React, { useEffect } from "react";
import cytoscape from "cytoscape";
import { data } from "./data.js";
import fcose from "cytoscape-fcose";
function generateElementsFromNodesList(nodesList) {
    const elements = {
        nodes: nodesList.map((a) => ({ data: { id: a.id } })),
        edges: [],
    };
    const constraints = {
        alignmentConstraints: { horizontal: [], vertical: [] },
        relativePlacementConstraints: [],
    };
    const horizontalUnpreprocessed = [];


    nodesList.forEach((node) => {
        node.childrenNode?.forEach((childId) => {
            elements.nodes.push({ data: { id: childId, parent: node.id } });
            elements.edges.push({
                data: { source: node.id, target: childId },
            });
            constraints.relativePlacementConstraints.push({
                top: node.id,
                bottom: childId,
                gap: 100,
            });
        });

        // // Add nodes and parent-child relationships

        // Add outlink edges and parent group nodes for outlinks
        if (node.outlinks !== undefined && node.outlinks.length > 0) {
            console.log("node", node);
            const groupId = `group-${node.id}-outlink`;

            constraints.alignmentConstraints.vertical.push(node.outlinks);
            constraints.alignmentConstraints.horizontal.push([node.id, groupId]);

            // Add parent group node for the outlink
            elements.nodes.push({
                data: { id: groupId, isOutlinkGroup: true },
            });
            constraints.relativePlacementConstraints.push({
                left: node.id,
                right: groupId,
                gap: 200,
            });
            constraints.alignmentConstraints.vertical.push(node.outlinks);
            node.outlinks.forEach((targetId) => {
                // Reparent the source and target nodes under the parent group node
                

                const getNode = elements.nodes.find((n) => n.data.id === targetId)
                getNode.data.parent = groupId;

                // Add edge between the source and target nodes
                elements.edges.push({
                    data: { source: node.id, target: targetId },
                });

                // node.childrenNode?.forEach((childId) => {
                //     constraints.relativePlacementConstraints.push({
                //         left: childId,
                //         right: targetId,
                //         gap: 200,
                //     });
                // });


                // Add constraint to keep the outlink group node above the source node
            });
        }
    });
    // const newList = mergeLists(constraints.alignmentConstraints.vertical)
    // constraints.alignmentConstraints.vertical = newList;
    // const newList2 = mergeLists(constraints.alignmentConstraints.horizontal);
    // constraints.alignmentConstraints.horizontal = newList2;
    console.log("elementsNEwNew", elements);
    return [elements, constraints];
}

const Graph = ({ elements = data }) => {
    useEffect(() => {
        cytoscape.use(fcose);

        const [newElements, constraints] = generateElementsFromNodesList(
            data.nodes
        );

        const cy = cytoscape({
            container: document.getElementById("cy"),
            elements: newElements,
            style: [
                {
                    selector: "node",
                    style: {
                        label: "data(id)",
                    },
                },
                {
                    selector: "edge",
                    style: {
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                    },
                },
            ],
        });

        // cy.add(data);

        console.log("newElements", newElements);

        // cy.edges().forEach((edge) => {
        //   const sourceNode = edge.source();
        //   const targetNode = edge.target();

        //   if (sourceNode.data('parent') === targetNode.data('parent')) {
        //     constraints.push({
        //        left: sourceNode.id(), right: targetNode.id(), gap: 200
        //     });
        //   } else if (sourceNode.data('parent') < targetNode.data('parent')) {
        //     constraints.push({

        //        top: sourceNode.id(), bottom: targetNode.id(), gap: 200
        //     });
        //   }
        // });
        console.log("constraints", constraints);
        console.log(cy.nodes());
        cy.layout({
            name: "fcose",
            directed: true,
            randomize: true,
            // Gravity range (constant) for compounds
            gravityRangeCompound: 2,
            // Gravity force (constant) for compounds
            gravityCompound: 1.0,
            padding: 10,
            nodeSpacing: 100,
            edgeLength: 150,
            // Node repulsion (non overlapping) multiplier
            nodeRepulsion: (node) => 100,
            // Ideal edge (non nested) length
            idealEdgeLength: edge => 200,
            // Divisor to compute edge forces
            edgeElasticity: (edge) => 0.45,
            // randomize: false, // use random node positions at beginning of layout
            tilingCompareBy: () => {},
            unconstrainedIterations: 0,
            userConstIter: 10000,
            enablePanning: true,
            relativePlacementConstraint: constraints.relativePlacementConstraints,
            alignmentConstraint: constraints.alignmentConstraints,
        }).run();
    }, []);

    return <div id="cy" style={{ width: "100%", height: "100vh" }}></div>;
};
function mergeLists(lst) {
    let merged = [];
    while (lst.length) {
      let [first, ...rest] = lst;
      let firstSet = new Set(first);
      let lf = [], restList = [];
      for (let l of lst) {
        if (new Set(l).has(firstSet)) {
          firstSet = new Set([...l, ...firstSet]);
          lf.push(l);
        } else {
          restList.push(l);
        }
      }
      lst = restList;
      merged.push(Array.from(new Set(lf.flat())));
    }
    return merged;
  }
  
export default Graph;
