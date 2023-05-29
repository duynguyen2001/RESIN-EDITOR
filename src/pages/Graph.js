import React, { useEffect } from "react";
import ReactFlow, {
    Controls,
    MiniMap,
    NodeToolbar,
    Position,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { EventGraphNode } from "../components/EventGraphNode";
import Gate from "../components/Gate";
import Menu from "../components/Menu";
import { RangeSlider } from "../components/RangeSlider";
import { EditEventPanel, InfoPanel } from "./Panel";
import "./graph.css";
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
        contextMenu,
        confidenceInterval,
        showAddPanel,
        setShowAddPanel,
        setClickedNode,
        setContextMenu,
        onNodesChange,
        onEdgesChange,
        updateGraphByEventNodes,
        onNodeClick,
        onConnect,
        onEdgeUpdate,
        onNodesDelete,
        setConfidenceInterval,
    } = useStore();

    const handleClosePanel = () => {
        setClickedNode(null);
    };

    // layout related functions
    useEffect(() => {
        updateGraphByEventNodes(eventNodes);
    }, [eventNodes]);

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
                    onNodeContextMenu={(event, node) => {
                        event.preventDefault();
                        setContextMenu(node);
                    }}
                    onPaneClick={() => {
                        setClickedNode(null);
                        setContextMenu(null);
                        setShowAddPanel(false);
                    }}
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
                <div
                    style={{
                        position: "absolute",
                        bottom: 10,
                        left: 70,
                        width: 300,
                    }}
                >
                    <RangeSlider
                        initialValue={confidenceInterval}
                        onValueChange={setConfidenceInterval}
                    />
                </div>
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
                    </>
                )}
                {contextMenu && (
                    <NodeToolbar
                        nodeId={contextMenu.id}
                        position={Position.Bottom}
                        isVisible={true}
                    >
                        <button
                            className="selection-button"
                            onClick={() => {
                                onNodesDelete([mapNodes.get(contextMenu.id)]);
                                setContextMenu(null);
                                setClickedNode(null);
                                setShowAddPanel(false);
                            }}
                        >
                            <span className="fa fa-trash-o" />
                        </button>
                        <button
                            className="selection-button"
                            onClick={() => {
                                setShowAddPanel(true);
                            }}
                        >
                            <span className="fa fa-plus" />
                        </button>
                    </NodeToolbar>
                )}
                {clickedNode && showAddPanel && (
                    <EditEventPanel
                        parentId={
                            clickedNode.data.isGate
                                ? clickedNode.data.referredNode
                                : clickedNode.id
                        }
                        onClose={() => {
                            setShowAddPanel(false);
                            setClickedNode(null);
                            setShowAddPanel(false);
                        }}
                    />
                )}
            </ReactFlowProvider>

            <Menu />
        </div>
    );
};
export default Graph;
