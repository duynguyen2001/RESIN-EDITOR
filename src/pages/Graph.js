import React, {
    useCallback,
    useEffect,
    useState,
    createContext,
} from "react";
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
import { CustomNode } from "./CustomNode";
import "reactflow/dist/style.css";
import "./graph.css";
import { InfoPanel } from "./Panel";
import Menu from "../components/Menu";
const nodeTypes = {
    custom: CustomNode,
};
export const EdgeStyleContext = createContext();

const nodeWidth = 200;
const nodeHeight = 200;

const getLayoutedElements = (
    nodes,
    edges,
    direction = "TB",
    getGraph = false
) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({
        rankdir: direction,
        edgesep: isHorizontal ? 20 : 20,
        ranker: "tight-tree",
        align: isHorizontal ? "UL" : undefined,
        nodesep: 50,
        minLen: (edge) => edge.data().weight,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.width ? node.width : nodeWidth,
            height: node.height ? node.height : nodeHeight,
        });
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
            x: nodeWithPosition.x - (node.width ? node.width : nodeWidth) / 2,
            y:
                nodeWithPosition.y -
                (node.height ? node.height : nodeHeight) / 2,
        };

        return node;
    });
    if (getGraph) {
        return {
            nodes: nodes,
            edges: edges,
            width: dagreGraph.graph().width,
            height: dagreGraph.graph().height,
        };
    }

    return { nodes, edges };
};
const getLayoutedElementsNested = (chosenNodes, mapNodes, firstNode) => {
    const nodes = [];
    const edges = [];
    const subgraphs = [];
    if (firstNode) {
        const subgraphs = chosenNodes.map((node) => {
            const subGraphNodes = mapNodes
                .get(node)
                .subgroupEvents?.map((subNode) => {
                    return {
                        id: subNode,
                        data: mapNodes.get(subNode),
                        position: { x: 0, y: 0 },
                    };
                });
            const subGraphEdges =
                mapNodes.get(node).subgroupEvents?.flatMap((subNode) =>
                    mapNodes.get(subNode).outlinks.map((outlinkNode) => ({
                        id: `outlink-${subNode}-${outlinkNode}`,
                        source: subNode,
                        target: outlinkNode,
                    }))
                ) || [];

            const graph = getLayoutedElements(
                subGraphNodes,
                subGraphEdges,
                "LR",
                true
            );
            return {
                id: `subgraph-${node}`,
                width: graph.width,
                height: graph.height,
                position: { x: 0, y: 0 },
                data: {
                    nodes: graph.nodes,
                    edges: graph.edges,
                },
            };
        });
        const subgraphEdges = chosenNodes.flatMap((node) => {
            const parentNode = mapNodes.get(node).parent
                ? mapNodes.get(node).parent
                : "root";
            return {
                id: `subgraph-edge-${parentNode}-${node}`,
                source: `subgraph-${parentNode}`,
                target: `subgraph-${node}`,
            };
        });

        subgraphs.push({
            id: `subgraph-${firstNode.parent}`,
            width: 200,
            height: 200,
            data: {
                nodes: [
                    {
                        id: firstNode.id,
                        data: firstNode,
                        position: { x: 0, y: 0 },
                    },
                ],
                edges: [],
            },
        });
        const outerGraph = getLayoutedElements(
            subgraphs,
            subgraphEdges,
            "TB",
            true
        );
        nodes.push(
            ...outerGraph.nodes.flatMap((parentNode) =>
                parentNode.data.nodes.map((node) => ({
                    ...node,
                    position: {
                        x: parentNode.position.x + node.position.x,
                        y: parentNode.position.y + node.position.y,
                    },
                }))
            )
        );
    }
    return nodes;
};

export const Graph = ({ eventNodes }) => {
    const [chosenNodes, setChosenNodes] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [mapNodes, setMapNodes] = useState({});
    const [clickedNode, setClickedNode] = useState(null);
    const [firstNode, setFirstNode] = useState(null);
    const [edgeStyle, setEdgeStyle] = useState({
        or: {
            animated: false,
            type: ConnectionLineType.Straight,
            style: {
                stroke: "blue",
                strokeWidth: 1,
                strokeDasharray: "5,5",
            },
        },
        xor: {
            animated: false,
            type: ConnectionLineType.Straight,
            width: 5,
            style: {
                stroke: "green",
                strokeDasharray: "4 1 2 3",
                strokeWidth: 5,
            },
        },
        and: {
            animated: false,
            type: ConnectionLineType.Straight,
            width: 5,
            style: {
                stroke: "black",
                strokeWidth: 5,
            },
        },
    });
    const [outlinkEdgeStyle, setOutlinkEdgeStyle] = useState({
        animated: false,
        type: ConnectionLineType.Straight,
        markerEnd: { type: MarkerType.ArrowClosed, size: 20, color: "red" },
        width: 10,
        style: {
            stroke: "red",
            strokeWidth: 5,
        },
    });
    useEffect(() => {
        setEdges(
            ...edges.map((edge) =>
                edge.type === "subgroup-edge"
                    ? {
                          ...edge,
                          ...edgeStyle[edge.childrenGate],
                      }
                    : edge
            )
        );
    }, [edgeStyle]);

    useEffect(() => {
        setEdges(
            ...edges.map((edge) =>
                edge.type === "outlink-edge"
                    ? {
                          ...edge,
                          ...outlinkEdgeStyle,
                      }
                    : edge
            )
        );
    }, [outlinkEdgeStyle]);

    const options = {
        minZoom: 0.00001,
        maxZoom: 1000,
        zoomOnScroll: true,
        panOnScroll: true,
        snapToGrid: true,
        snapGrid: [16, 16],
    };

    const handleClosePanel = () => {
        setClickedNode(null);
    };

    useEffect(() => {
        if (eventNodes.length > 0) {
            const firstNode = eventNodes.filter((node) => node.isTopLevel)[0];
            const newMap = new Map();
            eventNodes.forEach((node) => {
                newMap.set(node.id, node);
            });
            setMapNodes(newMap);
            setFirstNode(firstNode);
            setChosenNodes([firstNode.id]);
        }
    }, [eventNodes]);

    const getAllSubgroupEvents = (node) => {
        const tractNodes = [node];
        const objectNode = mapNodes.get(node);
        if (mapNodes.get(node).subgroupEvents === undefined) {
            return tractNodes;
        }
        if (node && chosenNodes.includes(node)) {
            for (const child of objectNode.subgroupEvents) {
                const childNode = mapNodes.get(child).id;
                tractNodes.push(...getAllSubgroupEvents(childNode));
            }
        }

        return tractNodes;
    };

    useEffect(() => {
        if (firstNode === null || mapNodes.size === 0) {
            return;
        }

        const newNodes = getLayoutedElementsNested(
            chosenNodes,
            mapNodes,
            firstNode
        );
        const outLinksEdges = [];
        const layoutedNodes = newNodes.map((node) => ({
            ...node,
            type: "custom",
        }));

        const newEdges = [];
        chosenNodes.forEach((source) => {
            mapNodes.get(source).subgroupEvents?.forEach((target) => {
                const childrenGate = mapNodes.get(source).childrenGate;
                newEdges.push({
                    id: `e-${source}-${target}`,
                    source: source,
                    target: target,
                    type: "subgroup-edge",
                    childrenGate: childrenGate,
                    ...edgeStyle[childrenGate],
                });
            });
        });
        newNodes.forEach((node) => {
            node.data.outlinks?.forEach((outlink) => {
                outLinksEdges.push({
                    id: `e-${node.id}-${outlink}-outlink`,
                    source: node.id,
                    target: outlink,
                    animated: false,
                    sourceHandle: node.id + "_right",
                    targetHandle: outlink + "_left",
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    type: "outlink-edge",
                    ...outlinkEdgeStyle,
                });
            });
        });

        setNodes([...layoutedNodes]);
        setEdges(
            [...newEdges, ...outLinksEdges].filter(
                (edge, index, self) =>
                    index ===
                    self.findIndex(
                        (e) =>
                            e.source === edge.source && e.target === edge.target
                    )
            )
        );

    }, [chosenNodes]);

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
    const onNodeClick = useCallback(
        (event, node) => {
            setClickedNode(node);
            if (
                !node.data.subgroupEvents ||
                node.data.subgroupEvents.length === 0
            ) {
                return;
            }
            if (node.data.isExpanded) {
                node.data.isExpanded = false;
                const allSubEvents = getAllSubgroupEvents(node.id);

                const newChosenNodes = chosenNodes.filter(
                    (n) => !allSubEvents.includes(n)
                );
                setChosenNodes(newChosenNodes);

                return;
            }
            setChosenNodes([...chosenNodes, node.id]);
            node.data.isExpanded = true;
        },
        [chosenNodes]
    );

    // denote the color of the node in the minimap
    const nodeColor = (node) => node.data.renderStrategy.color;

    return (
        <EdgeStyleContext.Provider value={[edgeStyle, setEdgeStyle]}>
            <div className="layoutflow">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        options={options}
                        fitView
                    />
                    <MiniMap
                        nodes={nodes}
                        nodeColor={nodeColor}
                        nodeStrokeWidth={3}
                        zoomable
                        pannable
                    />
                    <Controls />
                </ReactFlowProvider>
                {clickedNode && (
                    <InfoPanel
                        data={clickedNode.data}
                        onClose={handleClosePanel}
                    />
                )}
                <Menu />
            </div>
        </EdgeStyleContext.Provider>
    );
};
export default Graph;
