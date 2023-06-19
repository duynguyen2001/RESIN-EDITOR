import React, { useEffect } from "react";
import ReactFlow, {
    Controls,
    MiniMap,
    NodeToolbar,
    Position,
    ReactFlowProvider,
    useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { EventGraphNode } from "../components/EventGraphNode";
import Gate from "../components/Gate";
import Menu from "../components/Menu";
import { RangeSlider } from "../components/RangeSlider";
import { EditEventPanel, InfoPanel } from "./Panel";
import "./graph.css";
import useStore from "./store";
import { useReactFlow } from "reactflow";

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
        deltaX,
        deltaY,
        selectionNodes,
        selectionContextMenu,
        setShowAddPanel,
        setClickedNode,
        setContextMenu,
        onNodesChange,
        onEdgesChange,
        updateGraphByEventNodes,
        onNodeClick,
        onConnect,
        onEdgeUpdate,
        onPaneContextMenu,
        onSelectionContextMenu,
        onNodesDelete,
        onSelectionChange,
        setConfidenceInterval,
    } = useStore();

    const handleClosePanel = () => {
        setClickedNode(null);
    };

    // layout related functions
    useEffect(() => {
        updateGraphByEventNodes(eventNodes);
    }, [eventNodes]);

    // useEffect(() => {
    //     console.log("deltaX, deltaY", deltaX, deltaY);
    //     setCenter(getViewPort().x + deltaX, getViewPort().y + deltaY);
    // }, [deltaX, deltaY]);

    // denote the color of the node in the minimap
    const nodeColor = (node) => node.data.color;

    return (
        <div className="layoutflow">
            <ReactFlowProvider>
                <NewPanel deltaX={deltaX} deltaY={deltaY} />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    multiSelectionKeyCode={"Ctrl"}
                    onSelectionChange={onSelectionChange}
                    onNodeContextMenu={(event, node) => {
                        event.preventDefault();
                        setContextMenu(node);
                    }}
                    onPaneClick={() => {
                        setClickedNode(null);
                        setContextMenu(null);
                        setShowAddPanel(null);
                    }}
                    onSelectionContextMenu={onSelectionContextMenu}
                    onSelectionDragStop={(event) => {
                        console.log("selection drag stop");
                        console.log(event);

                    }}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    onNodesDelete={onNodesDelete}
                    onPaneContextMenu={(event) => {
                        console.log("pane context menu");
                        console.log(event);
                        event.preventDefault();
                        setContextMenu("null");
                    }}
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
                                setShowAddPanel(null);
                            }}
                        >
                            <span className="fa fa-trash-o" />
                        </button>
                        <button
                            className="selection-button"
                            onClick={() => {
                                setClickedNode(contextMenu);
                                setShowAddPanel(
                                    contextMenu.data.isGate
                                        ? contextMenu.data.referredNode
                                        : contextMenu.id
                                );
                            }}
                        >
                            <span className="fa fa-plus" />
                        </button>
                    </NodeToolbar>
                )}
                {selectionContextMenu && selectionNodes.length > 0 && (
                    <NodeToolbar
                        nodeId={selectionNodes[0].id}
                        position={Position.Bottom}
                        isVisible={true}
                    >
                        <button
                            className="selection-button"
                            onClick={() => {
                                onNodesDelete(selectionNodes);
                                setContextMenu(null);
                                setClickedNode(null);
                                setShowAddPanel(null);
                            }}
                            >
                            <span className="fa fa-trash-o" />
                            </button>
                        <button
                            className="selection-button"
                            onClick={() => {
                                setClickedNode(selectionNodes[0]);
                                setShowAddPanel(
                                    selectionNodes[0].data.isGate
                                        ? selectionNodes[0].data.referredNode
                                        : selectionNodes[0].id
                                );
                            }}
                            >
                            <span className="fa fa-plus" />

                            </button>
                    </NodeToolbar>
                )
                }
                {showAddPanel && (
                    <EditEventPanel
                        parentId={showAddPanel}
                        onClose={() => {
                            setShowAddPanel(null);
                            setClickedNode(null);
                        }}
                    />
                )}
            </ReactFlowProvider>

            <Menu />
        </div>
    );
};
const NewPanel = ({ deltaX, deltaY }) => {
    const { setViewport, getViewport } = useReactFlow((instance) => instance);
    useEffect(() => {
        const { x, y, zoom } = getViewport();

        setViewport(
            { x: x + deltaX * zoom, y: y + deltaY * zoom, zoom: zoom },
            { duration: 0 }
        );
    }, [deltaX]);
    return null;
};

export default Graph;
