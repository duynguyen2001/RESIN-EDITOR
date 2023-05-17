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

export const Graph = ({ eventNodes }) => {

    const {
        nodes,
        edges,
        mapNodes,
        clickedNode,
        key,
        setEdges,
        setClickedNode,
        onNodesChange,
        onEdgesChange,
        updateGraphByEventNodes,
        onNodeClick
    } = useStore();

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
    useEffect(() => {
        console.log("edges", edges);
    }, [edges]);

    

    // denote the color of the node in the minimap
    // const nodeColor = (node) => node.data.renderStrategy.color;

    return (
                    <div className="layoutflow">
                        <ReactFlowProvider>
                            <ReactFlow

                                key={key}
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onNodeClick={onNodeClick}
                                // onConnect={onConnect}
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
    );
};
export default Graph;
