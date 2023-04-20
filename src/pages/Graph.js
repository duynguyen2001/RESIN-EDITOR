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
import { InfoPanel } from "./Panel";
const nodeTypes = {
    custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 200;
function sortArray(array) {
    const indices = {};

    // Create a hash table of indices for each object
    for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        indices[obj.id] = i;
    }

    // Update the position of each object with an outlinks property
    for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        if (obj.outlinks) {
            for (let j = 0; j < obj.data.outlinks.length; j++) {
                const linkedId = obj.data.outlinks[j];
                if (indices[linkedId] > i) {
                    console.log("linkedId", linkedId);
                    array.splice(i, 0, array.splice(indices[linkedId], 1)[0]);
                    indices[linkedId] = i;
                    i--;
                    break;
                }
            }
        }
    }

    return array;
}

const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    // nodes = sortArray(nodes);
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
    console.log("layoutes nodes", nodes);
    return { nodes, edges };
};

export const Graph = ({ eventNodes }) => {
    const initialNodes = eventNodes.filter((node) => node.isTopLevel).map((node) => ({
        id: node.id,
        type: "custom",
        data: node,
    }));
    console.log("initialNodes", initialNodes);
    const initialEdges = [];
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );
    
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [mapNodes, setMapNodes] = useState({});
    const [selectedNode, setSelectedNode] = useState(null);

    // populate the map
    // useEffect(() => {
    //     if (eventNodes.length > 0) {
    //         const firstNode = eventNodes.filter((node) => node.isTopLevel)[0].id;
    //         console.log("firstNode", firstNode);
    //         const newMap = new Map();
    //         eventNodes.forEach((node) => {
    //             newMap.set(node.id, node);
    //         });
    //         setMapNodes(newMap);
    //     }
    // }, [eventNodes]);

    function handleNodeClick(node) {
      setSelectedNode(node);
    }
  
    function handleCloseInfoPanel() {
      setSelectedNode(null);
    }
    

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: ConnectionLineType.Straight,
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

            setSelectedNode(node);
            console.log("clicked node", node);
            if (
                !node.data.subgroupEvents ||
                node.data.subgroupEvents.length === 0
            ) {
                return;
            }
            if(node.isChosen) {
                return;
            }
            const newEdges = [];
            const newSubgroupEdges = [];
            node.data.subgroupEvents.forEach((target) => {
                newSubgroupEdges.push({
                    id: `e-${node.id}-${target}`,
                    source: node.id,
                    target: target,
                    animated: false,
                    type: ConnectionLineType.SmoothStep,
                    markerEnd: MarkerType.ArrowClosed,
                });
                const targetNode = mapNodes.get(target);
                
            });
            node.isChosen = true;
        },
        []
    );

    return (
        <>
        <div className="layoutflow">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onConnect={onConnect}
                    connectionLineType={ConnectionLineType.Straight}
                    nodeTypes={nodeTypes}
                    onLayout={onLayout}
                    fitView
                />
                <MiniMap nodes={nodes} nodeStrokeWidth={3} zoomable pannable />
                <Controls />
            </ReactFlowProvider>
        </div>
        {selectedNode && <InfoPanel data={selectedNode.data} onClose={handleCloseInfoPanel} />}
        </>
    );
};
export default Graph;
