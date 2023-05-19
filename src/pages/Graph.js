import React, { useCallback, useEffect, useState, createContext } from "react";
import ReactFlow, {
    MiniMap,
    ReactFlowProvider,
    Controls,
    NodeToolbar,
    Position,
} from "reactflow";
import { EventGraphNode } from "../components/EventGraphNode";
import "reactflow/dist/style.css";
import "./graph.css";
import { InfoPanel, AddEventPanel } from "./Panel";
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
        setClickedNode,
        onNodesChange,
        onEdgesChange,
        updateGraphByEventNodes,
        onNodeClick,
        onConnect,
        onEdgeUpdate,
        onNodesDelete
    } = useStore();

    const handleClosePanel = () => {
        setClickedNode(null);
    };
    const [showAddPanel, setShowAddPanel] = useState(false);

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
    const nodeColor = (node) => node.data.color;

    return (
        <div className="layoutflow">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onPaneClick={() => setClickedNode(null)}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    onNodesDelete={onNodesDelete}
                    maxZoom={2}
                    minZoom={0.1}
                    fitView
                />
                <MiniMap
                    nodes={nodes}
                    edges={edges}
                    nodeColor={nodeColor}
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
                <Controls />
                {clickedNode && (
                    <>
                        <InfoPanel
                            data={
                                clickedNode.data.isGate
                                    ? mapNodes.get(
                                          clickedNode.data.referredNode
                                      )
                                    : mapNodes.get(clickedNode.id)
                            }
                            onClose={handleClosePanel}
                        />
                        <NodeToolbar
                            nodeId={clickedNode.id}
                            position={Position.Bottom}
                            isVisible={true}
                        >
                            <button
                                className="selection-button"
                                onClick={() => {
                                    onNodesDelete([mapNodes.get(clickedNode.id)]);
                                    setClickedNode(null);
                                }}
                            >
                                <span className="fa fa-trash-o" />
                            </button>
                            <button
                                className="selection-button"
                                onClick={() => {
                                    setShowAddPanel(true)
                                }}
                            >
                                <span className="fa fa-plus" />
                            </button>
                        </NodeToolbar>
                    </>
                )}
                {clickedNode && showAddPanel && (
                    <AddEventPanel
                        parentId={
                            clickedNode.data.isGate
                                ? clickedNode.data.referredNode
                                : clickedNode.id
                        }
                        onClose={() => {
                            setShowAddPanel(false);
                            setClickedNode(null);
                        }}
                    />
                )}
            </ReactFlowProvider>

            <Menu />
        </div>
    );
};
export default Graph;
