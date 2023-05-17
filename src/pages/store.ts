import { create } from "zustand";
import {
    ConnectionLineType,
    Connection,
    MarkerType,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    Position,
    applyEdgeChanges,
    NodeResetChange,
    NodeAddChange,
} from "reactflow";
import {
    EventNode,
    DetectedNodeStrategy,
    PredictedNodeStrategy,
    SourceOnlyNodeStrategy,
    EventNodeType,
    NodeRenderingStrategy
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
    mapNodes: Map<string, any>;
    clickedNode: Node | null;
    firstNode: string | null;
    edgeStyle: EdgeStyle;
    key: number;
    setEdges: (edges: Edge[]) => void;
    setNodes: (nodes: Node[]) => void;
    nodeRerender: (typeNode: string) => void;
    setChosenNodes: (chosenNodes: string[]) => void;
    setMapNodes: (mapNodes: Map<string, any>) => void;
    setClickedNode: (clickedNode: Node | null) => void;
    setFirstNode: (firstNode: string | null) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onNodeClick: (event: any, node: Node) => void;
    updateNodeAttribute: (
        nodeType: EventNodeType,
        key: string,
        value: string
    ) => void;
    updateTreeNodeAttribute: (
      key: string,
      value: string
  ) => void;
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
    mapNodes: new Map(),
    clickedNode: null,
    firstNode: null,
    key: 0,
    edgeStyle: {
        or: {
            edgeType: "or",
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
            edgeType: "xor",
            childrenGate: "xor",
            animated: false,
            type: ConnectionLineType.SmoothStep,
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
            edgeType: "and",
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
            edgeType: "outlink",
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
    setMapNodes: (mapNodes) => set({ mapNodes }),
    setClickedNode: (clickedNode) => set({ clickedNode }),
    setFirstNode: (firstNode) => set({ firstNode }),
    getNodeById: (id: string) => {
        return get().mapNodes.get(id);
    },

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
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
    updateTreeNodeAttribute: (
        key: string,
        value: string
    ) => {
      NodeRenderingStrategy.nodeOptions = {
        ...NodeRenderingStrategy.nodeOptions,
        [key]: value,
      }
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
            get().setChosenNodes(firstNode ? [firstNode.id] : []);
        }
    },
    onNodeClick: (event, node) => {
        const mapNodes = get().mapNodes;
        const currentNode = node.data.isGate
            ? mapNodes.get(node.data.referredNode)
            : mapNodes.get(node.id);
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
        set({nodes: get().nodes.map((node) => {
          if (node.type === nodeType ) {
              return {...node, data: {
                  ...node.data,
                  key: Date.now()
              }};
          }
          return node;
      })});
    },
    updateLayout: () => {
        const { chosenNodes, mapNodes, firstNode, edgeStyle } = get();
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
            console.log(node);
            return {
                ...node,
                type: isGate ? "gate" : "eventNode",
                key: Date.now(),
                data: isGate
                    ? {
                          ...node.data,
                          renderStrategy: {
                              color: edgeStyle[node.data.gate as GraphEdgeType]
                                  .style.stroke,
                          },
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
    },
}));

export default useStore;
