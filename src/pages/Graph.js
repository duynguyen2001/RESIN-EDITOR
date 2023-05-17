import React, { useCallback, useEffect, useState, createContext } from "react";
import ReactFlow, {
    addEdge,
    ConnectionLineType,
    MiniMap,
    ReactFlowProvider,
    Controls,
} from "reactflow";
import { EventGraphNode } from "../components/EventGraphNode";
import "reactflow/dist/style.css";
import "./graph.css";
import { InfoPanel } from "./Panel";
import Menu from "../components/Menu";
import Gate from "../components/Gate";
import useStore from "./store";

const nodeTypes = {
    eventNode: EventGraphNode,
    gate: Gate,
};
export const EdgeStyleContext = createContext();
export const NodeRerenderContext = createContext();
export const EdgeRerenderContext = createContext();

export const Graph = ({ eventNodes }) => {

    const {
        nodes,
        edges,
        mapNodes,
        clickedNode,
        key,
        setNodes,
        setEdges,
        setClickedNode,
        onNodesChange,
        onEdgesChange,
        updateGraphByEventNodes,
        onNodeClick
    } = useStore();

    // style related nodes
    const [nodeChanges, setNodeChanges] = useState(0);
    const [edgeChanges, setEdgeChanges] = useState(0);

    useEffect(() => {
        console.log("Change node style");
        setNodes(
            nodes.map((node) => {
                node.renderStrategy = null;
                node.style = {
                    ...node.style,
                };
                return node;
            })
        );
    }, [nodeChanges]);

    const [edgeStyle, setEdgeStyle] = useState();

    // edge style related effects
    useEffect(() => {
        console.log("Change edge style", edges);
        setEdges(
            edges.map((edge) => {
                return { ...edge, ...edgeStyle[edge.edgeType] };
            })
        );
        setNodes(
            nodes.map((node) => {
                if (node.data.isGate) {
                    node.renderStrategy = {
                        color: edgeStyle[node.data.gate].style.stroke,
                    };
                    return node;
                }
                return node;
            })
        );
    }, [edgeChanges]);

   

    const handleClosePanel = () => {
        setClickedNode(null);
    };

    // layout related functions
    useEffect(() => {
        updateGraphByEventNodes(eventNodes);
    }, [eventNodes]);
    useEffect(() => {
        console.log("nodes", nodes);
    }, [nodes]);

    const onConnect = useCallback(
        (params) =>
            setEdges(
                addEdge(
                    {
                        ...params,
                        type: ConnectionLineType.Straight,
                        animated: true,
                    },
                    edges
                )
            ),
        []
    );
    

    // denote the color of the node in the minimap
    // const nodeColor = (node) => node.data.renderStrategy.color;

    return (
        <NodeRerenderContext.Provider value={[nodeChanges, setNodeChanges]}>
            <EdgeRerenderContext.Provider value={[edgeChanges, setEdgeChanges]}>
                <EdgeStyleContext.Provider value={[edgeStyle, setEdgeStyle]}>
                    <div className="layoutflow">
                        <ReactFlowProvider>
                            <ReactFlow

                                key={key}
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onNodeClick={onNodeClick}
                                onConnect={onConnect}
                                nodeTypes={nodeTypes}
                                maxZoom={2}
                                minZoom={0.1}
                                
                                fitView
                            />
                            <MiniMap
                                nodes={nodes}
                                edges={edges}
                                // nodeColor={nodeColor}
                                nodeStrokeWidth={3}
                                zoomable
                                pannable
                            />
                            <Controls />
                        </ReactFlowProvider>
                        {clickedNode && (
                            <InfoPanel
                                data={clickedNode.data.isGate? mapNodes.get(clickedNode.data.referredNode): mapNodes.get(clickedNode.id)}
                                onClose={handleClosePanel}
                            />
                        )}
                        <Menu />
                    </div>
                </EdgeStyleContext.Provider>
            </EdgeRerenderContext.Provider>
        </NodeRerenderContext.Provider>
    );
};
export default Graph;
