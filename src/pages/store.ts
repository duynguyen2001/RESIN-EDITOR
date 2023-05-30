import {
    Connection,
    ConnectionLineType,
    Edge,
    EdgeChange,
    MarkerType,
    Node,
    NodeChange,
    OnConnect,
    OnEdgesChange,
    OnNodesChange,
    Position,
    applyEdgeChanges,
    applyNodeChanges,
} from "reactflow";
import { create } from "zustand";
import {
    DetectedNodeStrategy,
    EventNode,
    EventNodeType,
    NodeRenderingStrategy,
    PredictedNodeStrategy,
    SourceOnlyNodeStrategy,
} from "../components/Library";
import getLayoutedElementsNested from "./layout";

enum GraphEdgeType {
    or = "or",
    xor = "xor",
    and = "and",
    outlink = "outlink",
}

type EdgeStyle = {
    [key in GraphEdgeType]: {
        animated: boolean;
        type: ConnectionLineType;
        zIndex: number;
        style: {
            stroke: string;
            strokeWidth: number;
            strokeDasharray: string;
        };
        markerEnd?: {
            type: MarkerType;
            size: number;
            color: string;
        };
        labelStyle?: {
            fill: string;
            fontWeight: number;
            fontSize: number;
        };
        width?: number;
    };
};
type RFState = {
    nodes: Node[];
    edges: Edge[];
    chosenNodes: string[];
    confidenceInterval: [number, number];
    chosenEntities: string[];
    entityChosenEvents: Set<string>;
    entitiesRelatedEventMap: Map<string, string[]>;
    mapNodes: Map<string, any>;
    showAddPanel: boolean;
    contextMenu: Node | null;
    clickedNode: Node | null;
    firstNode: string | null;
    edgeStyle: EdgeStyle;
    key: number;
    setConfidenceInterval: (confidenceInterval: [number, number]) => void;
    setEdges: (edges: Edge[]) => void;
    setNodes: (nodes: Node[]) => void;
    editMapNode: (nodeId: string, field: string, value: any) => void;
    nodeRerender: (typeNode: string) => void;
    setChosenEntities: (chosenEntities: string[]) => void;
    setChosenNodes: (chosenNodes: string[]) => void;
    setMapNodes: (mapNodes: Map<string, any>) => void;
    setShowAddPanel: (showAddPanel: boolean) => void;
    setContextMenu: (contextMenu: Node | null) => void;
    setClickedNode: (clickedNode: Node | null) => void;
    setFirstNode: (firstNode: string | null) => void;
    setEntityChosenEvents: (entityChosenEvents: []) => void;
    addEventNode: (node: EventNode) => void;
    getNewIdInEventMap: () => string;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onNodesDelete: (nodes: Node[]) => void;
    getEntitiesRelatedEventMap: () => Map<string, string[]>;
    onConnect: OnConnect;
    onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
    onNodeClick: (event: any, node: Node) => void;
    updateNodeAttribute: (
        nodeType: EventNodeType,
        key: string,
        value: string
    ) => void;
    updateEdgeAttribute: (
        edgeType: GraphEdgeType,
        key: string,
        body: any
    ) => void;
    updateTreeNodeAttribute: (key: string, value: string) => void;
    updateEdgeStyle: (edgeType: GraphEdgeType, style: any) => void;
    refreshGate: (gateType: GraphEdgeType) => void;
    updateGraphByEventNodes: (eventNodes: EventNode[]) => void;
    getAllCurrentSubgroupEvents: (node: string) => string[];
    getNodeById: (id: string) => Node | undefined;
    updateLayout: () => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    chosenNodes: [],
    chosenEntities: [],
    mapNodes: new Map(),
    entityChosenEvents: new Set(),
    entitiesRelatedEventMap: new Map(),
    showAddPanel: false,
    contextMenu: null,
    clickedNode: null,
    firstNode: null,
    confidenceInterval: [0.0, 1.0],
    key: 0,
    edgeStyle: {
        or: {
            data: {
                edgeType: "or",
            },
            childrenGate: "or",
            animated: false,
            type: ConnectionLineType.Straight,
            zIndex: 10,
            style: {
                stroke: "#BFBC9D",
                strokeWidth: 2,
                strokeDasharray: "none",
            },
        },
        xor: {
            data: {
                edgeType: "xor",
            },
            childrenGate: "xor",
            animated: false,
            type: ConnectionLineType.Straight,
            labelStyle: { fill: "#798223", fontWeight: 700, fontSize: 32 },
            width: 5,
            zIndex: 10,
            style: {
                stroke: "#798223",
                strokeDasharray: "4 1 2 3",
                strokeWidth: 5,
            },
        },
        and: {
            data: {
                edgeType: "and",
            },
            childrenGate: "and",
            animated: false,
            type: ConnectionLineType.Straight,
            labelStyle: { fill: "#798223", fontWeight: 700, fontSize: 32 },
            width: 5,
            zIndex: 10,
            style: {
                stroke: "#4E6E62",
                strokeWidth: 5,
                strokeDasharray: "none",
            },
        },
        outlink: {
            data: {
                edgeType: "outlink",
            },
            animated: false,
            type: ConnectionLineType.Straight,
            zIndex: 10,
            labelStyle: { fill: "#798223", fontWeight: 700, fontSize: 32 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                size: 20,
                color: "#9DA8AF",
            },
            width: 10,
            style: {
                stroke: "#9DA8AF",
                strokeWidth: 5,
                strokeDasharray: "none",
                zIndex: 10,
            },

            sourcePosition: Position.Right,
            targetPosition: Position.Left,
        },
    },
    setEdges: (edges: Edge[]) => {
        set({ edges });
    },
    setNodes: (nodes: Node[]) => {
        set({ nodes });
    },
    setChosenNodes: (chosenNodes) => {
        set({ chosenNodes });
        get().updateLayout();
    },

    setEntityChosenEvents: (entityChosenEvents) => {
        const entityChosenEventsSet = new Set(entityChosenEvents);
        set({ entityChosenEvents: entityChosenEventsSet });
    },
    editMapNode: (nodeId: string, field: string, value: any) => {
        const { mapNodes, nodeRerender, entityChosenEvents } = get();
        mapNodes.get(nodeId)[field] = value;
        nodeRerender("eventNode");
    },
    setConfidenceInterval: (confidenceInterval) => {
        const { nodes, nodeRerender, entityChosenEvents } = get();
        nodes.forEach((node) => {
            const opacity =
                (entityChosenEvents.size === 0 ||
                    entityChosenEvents.has(node.id)) &&
                node.data.confidence >= confidenceInterval[0] &&
                node.data.confidence <= confidenceInterval[1]
                    ? 1
                    : 0.5;
            node.style = {
                ...node.style,
                opacity: opacity,
            };
        });
        set({ nodes, confidenceInterval });
        nodeRerender("eventNode");
    },

    addEventNode: (node: EventNode) => {
        const { mapNodes, updateLayout } = get();
        mapNodes.set(node.id, node);
        const parentId = node.parent;
        if (parentId === undefined) {
            return;
        }
        const parentNode = mapNodes.get(parentId);
        if (parentNode) {
            parentNode.subgroupEvents = parentNode.subgroupEvents
                ? [...parentNode.subgroupEvents, node.id]
                : [node.id];
            if (!parentNode.childrenGate) {
                parentNode.childrenGate = "or";
            }
        }
        console.log("parentNode", parentNode);
        updateLayout();
    },
    setMapNodes: (mapNodes) => {
        set({ mapNodes });
        get().getEntitiesRelatedEventMap();
    },
    setShowAddPanel: (showAddPanel) => set({ showAddPanel }),
    setClickedNode: (clickedNode) => set({ clickedNode }),
    setContextMenu: (contextMenu) => set({ contextMenu }),
    setFirstNode: (firstNode) => set({ firstNode }),
    setChosenEntities(chosenEntities) {
        const { nodes, confidenceInterval, nodeRerender } = get();
        const chosenEvents = new Set<string>();
        for (const entityName of chosenEntities) {
            const events = get().entitiesRelatedEventMap.get(entityName);
            if (events === undefined) {
                continue;
            }
            for (const event of events) {
                chosenEvents.add(event);
            }
        }
        console.log("chosenEvents", chosenEvents);
        nodes.forEach((node) => {
            const opacity =
                (chosenEvents.size === 0 || chosenEvents.has(node.id)) &&
                node.data.confidence >= confidenceInterval[0] &&
                node.data.confidence <= confidenceInterval[1]
                    ? 1
                    : 0.5;
            node.style = {
                ...node.style,
                opacity: opacity,
            };
        });

        set({ entityChosenEvents: chosenEvents, chosenEntities, nodes });
        nodeRerender("eventNode");
    },
    getNodeById: (id: string) => {
        return get().mapNodes.get(id);
    },

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        changes.forEach((change) => {
            if (change.type === "remove") {
                const { mapNodes } = get();
                const edgeId = change.id;
                const edge = get().edges.find((edge) => edge.id === edgeId);
                if (edge === undefined) {
                    return;
                }
                const sourceNode = mapNodes.get(edge.source);
                if (sourceNode) {
                    sourceNode.outlinks = sourceNode.outlinks.filter(
                        (outlink: string) => outlink !== edge.target
                    );
                }
            }
        });
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    updateNodeAttribute: (
        nodeType: EventNodeType,
        key: string,
        value: string
    ) => {
        if (nodeType === EventNodeType.Detected) {
            DetectedNodeStrategy.options = {
                ...DetectedNodeStrategy.options,
                [key]: value,
            };
        } else if (nodeType === EventNodeType.SourceOnly) {
            SourceOnlyNodeStrategy.options = {
                ...SourceOnlyNodeStrategy.options,
                [key]: value,
            };
        } else if (nodeType === EventNodeType.Predicted) {
            PredictedNodeStrategy.options = {
                ...PredictedNodeStrategy.options,
                [key]: value,
            };
        }
        get().nodeRerender("eventNode");
    },
    updateTreeNodeAttribute: (key: string, value: string) => {
        NodeRenderingStrategy.nodeOptions = {
            ...NodeRenderingStrategy.nodeOptions,
            [key]: value,
        };
        get().nodeRerender("eventNode");
    },

    updateGraphByEventNodes: (eventNodes: EventNode[]) => {
        if (eventNodes.length > 0) {
            const firstNode = eventNodes.find((node) => node.isTopLevel);
            const newMap = new Map();
            eventNodes.forEach((node) => {
                newMap.set(node.id, node);
            });

            set({
                mapNodes: newMap,
                firstNode: firstNode ? firstNode.id : null,
            });

            get().getEntitiesRelatedEventMap();
            get().setChosenNodes(firstNode ? [firstNode.id] : []);
        }
    },

    updateEdgeStyle: (edgeType: GraphEdgeType, style: any) => {
        const { edgeStyle } = get();
        console.log("edgeType", edgeType);
        const newEdgeStyle = {
            ...edgeStyle,
            [edgeType]: {
                ...edgeStyle[edgeType],
                style: {
                    ...edgeStyle[edgeType].style,
                    ...style,
                },
            },
        };

        set({
            edgeStyle: newEdgeStyle,
            edges: get().edges.map((edge) => {
                if (edge.data.edgeType === edgeType) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            key: Date.now(),
                        },
                        ...newEdgeStyle[edgeType],
                    };
                }
                return edge;
            }),
        });
    },
    getEntitiesRelatedEventMap: () => {
        const { mapNodes } = get();
        const entitiesRelatedEventMap = new Map();
        mapNodes.forEach((event, key) => {
            event.relatedEntities().forEach((entity: string) => {
                if (entitiesRelatedEventMap.has(entity)) {
                    entitiesRelatedEventMap.set(entity, [
                        ...entitiesRelatedEventMap.get(entity),
                        key,
                    ]);
                } else {
                    entitiesRelatedEventMap.set(entity, [key]);
                }
            });
        });
        // get rid of entity with only 1 event
        entitiesRelatedEventMap.forEach((value, key) => {
            if (value.length <= 1) {
                entitiesRelatedEventMap.delete(key);
            }
        });

        // sort the array by the number of events
        const sortedEntitiesRelatedEventMap = new Map(
            [...entitiesRelatedEventMap.entries()].sort((a, b) => {
                return b[1].length - a[1].length;
            })
        );
        set({ entitiesRelatedEventMap: sortedEntitiesRelatedEventMap });
        return sortedEntitiesRelatedEventMap;
    },

    updateEdgeAttribute: (edgeType: GraphEdgeType, key: string, body: any) => {
        const { edgeStyle } = get();
        const newEdgeStyle = {
            ...edgeStyle,
            [edgeType]: {
                ...edgeStyle[edgeType],
                [key]: body,
            },
        };
        set({
            edgeStyle: newEdgeStyle,
            edges: get().edges.map((edge) => {
                if (edge.data.edgeType === edgeType) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            key: Date.now(),
                        },
                        ...newEdgeStyle[edgeType],
                    };
                }
                return edge;
            }),
        });
    },
    refreshGate: (gateType: GraphEdgeType) => {
        const { edgeStyle } = get();
        set({
            nodes: get().nodes.map((node) => {
                if (node.data.isGate && node.data.gate === gateType) {
                    const gateColor = `${
                        edgeStyle[node.data.gate as GraphEdgeType].style.stroke
                    }70`;
                    return {
                        ...node,
                        data: {
                            ...node.data,
                        },
                        style: {
                            ...node.style,
                            backgroundColor: gateColor,
                        },
                    };
                }
                return node;
            }),
        });
    },
    getNewIdInEventMap: () => {
        let id = `resin:Events/${randomFiveDigit()}/`;
        while (get().mapNodes.has(id)) {
            id = `resin:Events/${randomFiveDigit()}/`;
        }
        return id;
    },
    onNodeClick: (event, node) => {
        set({ contextMenu: null, showAddPanel: false });
        const mapNodes = get().mapNodes;
        const currentNode = node.data.isGate
            ? mapNodes.get(node.data.referredNode)
            : mapNodes.get(node.id);
        console.log("currentNode", currentNode);
        if (
            !currentNode.subgroupEvents ||
            currentNode.subgroupEvents.length === 0 ||
            node.data.isGate
        ) {
            set({ clickedNode: node });
            return;
        }

        if (get().chosenNodes.includes(node.id)) {
            console.log("node.data.isExpanded", node.data);
            const allSubEvents = get().getAllCurrentSubgroupEvents(node.id);

            const newChosenNodes = get().chosenNodes.filter(
                (n) => !allSubEvents.includes(n)
            );
            set({ chosenNodes: newChosenNodes, clickedNode: node });
            get().updateLayout();
            return;
        }

        const newChosenNodes = [...get().chosenNodes, node.id];

        set({ chosenNodes: newChosenNodes, clickedNode: node });
        get().updateLayout();
    },

    getAllCurrentSubgroupEvents: (node: string) => {
        const tractNodes = [node];
        const { mapNodes, chosenNodes } = get();
        const objectNode = mapNodes.get(node);

        if (objectNode?.subgroupEvents === undefined) {
            return tractNodes;
        }

        if (node && chosenNodes.includes(node)) {
            for (const child of objectNode.subgroupEvents) {
                const childNode = mapNodes.get(child)?.id;
                tractNodes.push(
                    ...get().getAllCurrentSubgroupEvents(childNode)
                );
            }
        }

        return tractNodes;
    },
    nodeRerender: (nodeType: string = "eventNode") => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.type === nodeType) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            key: Date.now(),
                        },
                    };
                }
                return node;
            }),
        });
    },
    onConnect: (connection: Connection) => {
        if (connection.source === null || connection.target === null) {
            return;
        }
        if (connection.source === connection.target) {
            return;
        }
        const sourceID = connection.source.startsWith("gate-")
            ? connection.source.slice(5)
            : connection.source;
        const targetID = connection.target.startsWith("gate-")
            ? connection.target.slice(5)
            : connection.target;
        const sourceNode = get().mapNodes.get(sourceID);
        const targetNode = get().mapNodes.get(targetID);
        if (sourceNode === undefined || targetNode === undefined) {
            console.log("sourceNode cannot be found", sourceNode);
            console.log("targetNode cannot be found", targetNode);
            return;
        }
        if (sourceNode.parent !== targetNode.parent) {
            alert("Cannot connect nodes from different parents");
            return;
        }
        if (sourceNode.outlinks === undefined) {
            sourceNode.outlinks = [];
        }
        if (sourceNode.outlinks.includes(targetID)) {
            return;
        }
        sourceNode.outlinks.push(targetID);
        get().updateLayout();
    },
    onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => {
        console.log("oldEdge", oldEdge);
        console.log("newConnection", newConnection);

        const { mapNodes } = get();
        const oldSourceID = oldEdge.source.startsWith("gate-")
            ? oldEdge.source.slice(5)
            : oldEdge.source;
        const oldTargetID = oldEdge.target.startsWith("gate-")
            ? oldEdge.target.slice(5)
            : oldEdge.target;
        const oldSourceNode = mapNodes.get(oldSourceID);
        if (oldSourceNode === undefined) {
            console.log("oldSourceNode cannot be found", oldSourceNode);
            return;
        }
        oldSourceNode.outlinks = oldSourceNode.outlinks.filter(
            (outlink: string) => outlink !== oldTargetID
        );
        if (newConnection.source === null || newConnection.target === null) {
            return;
        }
        const sourceID = newConnection.source.startsWith("gate-")
            ? newConnection.source.slice(5)
            : newConnection.source;
        const targetID = newConnection.target.startsWith("gate-")
            ? newConnection.target.slice(5)
            : newConnection.target;
        const sourceNode = mapNodes.get(sourceID);
        const targetNode = mapNodes.get(targetID);
        if (sourceNode === undefined || targetNode === undefined) {
            console.log("sourceNode cannot be found", sourceNode);
            console.log("targetNode cannot be found", targetNode);
            return;
        }
        if (sourceNode.parent !== targetNode.parent) {
            alert("Cannot connect nodes from different parents");
            return;
        }
        if (sourceNode.outlinks === undefined) {
            sourceNode.outlinks = [];
        }
        if (sourceNode.outlinks.includes(targetID)) {
            return;
        }
        sourceNode.outlinks.push(targetID);
        get().updateLayout();
    },
    onNodesDelete: (deleteNodes: Node[]) => {
        const { mapNodes, getAllCurrentSubgroupEvents } = get();
        deleteNodes.forEach((node) => {
            const nodeId = node.id.startsWith("gate-")
                ? node.id.slice(5)
                : node.id;
            console.log("nodeId", nodeId);
            const nodeToDelete = mapNodes.get(nodeId);
            if (nodeToDelete === undefined) {
                return;
            }
            const parentNode = mapNodes.get(nodeToDelete.parent);
            if (parentNode) {
                parentNode.subgroupEvents = parentNode.subgroupEvents.filter(
                    (subgroupEvent: string) => subgroupEvent !== nodeId
                );
                parentNode.subgroupEvents.forEach((subgroupEvent: string) => {
                    const subgroupEventNode = mapNodes.get(subgroupEvent);
                    if (subgroupEventNode.outlinks === undefined) {
                        return;
                    }
                    if (subgroupEventNode.outlinks.includes(nodeId)) {
                        subgroupEventNode.outlinks =
                            subgroupEventNode.outlinks.filter(
                                (outlink: string) => outlink !== nodeId
                            );
                        subgroupEventNode.outlinks.push(
                            ...nodeToDelete.outlinks
                        );
                    }
                });
            }

            console.log();
            getAllCurrentSubgroupEvents(nodeId).forEach(
                (subgroupEvent: string) => {
                    mapNodes.delete(subgroupEvent);
                }
            );
            set({
                mapNodes,
                clickedNode: null,
                chosenNodes: get().chosenNodes.filter(
                    (n) => !getAllCurrentSubgroupEvents(nodeId).includes(n)
                ),
            });
        });
        get().updateLayout();
    },

    updateLayout: () => {
        const {
            chosenNodes,
            mapNodes,
            firstNode,
            edgeStyle,
            confidenceInterval,
            entityChosenEvents,
        } = get();
        if (firstNode === null || mapNodes.size === 0) {
            return;
        }

        const newNodes = getLayoutedElementsNested(
            chosenNodes,
            mapNodes,
            firstNode
        );

        const layoutedNodes = newNodes.map((node) => {
            const isGate = node.data.isGate;
            const gateColor = isGate
                ? `${edgeStyle[node.data.gate as GraphEdgeType].style.stroke}70`
                : "white";
            const opacity =
                (entityChosenEvents.size === 0 ||
                    entityChosenEvents.has(node.id)) &&
                node.data.confidence >= confidenceInterval[0] &&
                node.data.confidence <= confidenceInterval[1]
                    ? 1
                    : 0.5;

            return {
                ...node,
                type: isGate ? "gate" : "eventNode",
                key: Date.now(),
                data: isGate
                    ? {
                          ...node.data,
                          color: edgeStyle[node.data.gate as GraphEdgeType]
                              .style.stroke,
                      }
                    : node.data,
                expandParent: isGate || node.data.isTopLevel ? undefined : true,
                parentNode:
                    isGate || node.id === firstNode
                        ? undefined
                        : `gate-${node.data.parent}`,
                style: {
                    ...node.style,
                    backgroundColor: gateColor,
                    opacity: opacity,
                },
            };
        });

        const newEdges: Edge[] = [];
        chosenNodes.forEach((source) => {
            const sourceNode = mapNodes.get(source);
            if (sourceNode.subgroupEvents) {
                const childrenGate = sourceNode.childrenGate;
                newEdges.push({
                    id: `e-${source}-subgroup-to-gate`,
                    source: source,
                    target: `gate-${source}`,
                    ...edgeStyle[childrenGate as GraphEdgeType],
                });
            }
        });

        const uniqueEdges = new Map<string, Edge>();
        newNodes.forEach((node) => {
            if (!node.data.isGate) {
                const currentNode = mapNodes.get(node.id);
                currentNode.outlinks?.forEach((outlink: string) => {
                    const edgeId = `e-${node.id}-${outlink}-outlink`;
                    if (!uniqueEdges.has(edgeId)) {
                        uniqueEdges.set(edgeId, {
                            id: edgeId,
                            source: node.id,
                            target: outlink,
                            sourceHandle: node.id + "_right",
                            targetHandle: outlink + "_left",
                            ...edgeStyle.outlink,
                        });
                    }
                });
            }
        });

        set({
            nodes: layoutedNodes,
            edges: [...newEdges, ...Array.from(uniqueEdges.values())],
        });
        console.log("layoutedNodes", layoutedNodes);
    },
}));
function randomFiveDigit() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export default useStore;
