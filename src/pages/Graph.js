import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
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
import { CustomNode } from "./ExpandableNode";
import "reactflow/dist/style.css";
import "./graph.css";
import { InfoPanel } from "./Panel";
import Menu from "../components/Menu";
const nodeTypes = {
    custom: CustomNode,
};
export const EdgeStyleContext = createContext();

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
        if (obj.data.outlinks) {
            for (let j = 0; j < obj.data.outlinks.length; j++) {
                const linkedId = obj.data.outlinks[j];
                if (indices[linkedId] > i) {
                    console.log("swapping", array[i], array[indices[linkedId]]);
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
    dagreGraph.setGraph({
        rankdir: "TB",
        ranker: "tight-tree",
        minLen: (edge) => edge.data().weight,
    });

    nodes = sortArray(nodes);
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

    return { nodes, edges };
};

export const Graph = ({ eventNodes }) => {
    const [displayNodes, setdisplayNodes] = useState([]);
    const [chosenNodes, setChosenNodes] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(displayNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [mapNodes, setMapNodes] = useState({});
    const [clickedNode, setClickedNode] = useState(null);
    const [edgeStyle, setEdgeStyle] = useState({
        animated: false,
        type: ConnectionLineType.Straight,
        markerEnd: { type: MarkerType.ArrowClosed, size: 20, color: "blue" },
        style: {
            stroke: "blue",
            strokeWidth: 3,
        },
    });
    const [outlinkEdgeStyle, setOutlinkEdgeStyle] = useState({
        animated: false,
        type: ConnectionLineType.Straight,
        width: 5,
        markerEnd: { type: MarkerType.ArrowClosed, size: 20, color: "red" },
        style: {
            stroke: "red",
            strokeWidth: 5,
        },
    });
    const options = {
        minZoom: 0.005,
        maxZoom: 2,
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
            const firstNode = eventNodes.filter((node) => node.isTopLevel)[0]
                .id;
            console.log("firstNode", firstNode);
            setdisplayNodes([firstNode]);
            const newMap = new Map();
            eventNodes.forEach((node) => {
                newMap.set(node.id, node);
            });
            setMapNodes(newMap);
        }
    }, [eventNodes]);

    const getAllsubgroupEvents = useCallback(
        (node) => {
            const nodes = [node];
            const objectNode = mapNodes.get(node);
            console.log("mapNode", objectNode);
            if (mapNodes.get(node).subgroupEvents === undefined) {
                return nodes;
            }
            for (const child of objectNode.subgroupEvents) {
                const childNode = mapNodes.get(child).id;
                if (childNode && !chosenNodes.includes(childNode)) {
                    nodes.push(...getAllsubgroupEvents(childNode));
                }
            }
            return nodes;
        },
        [mapNodes]
    );

    useEffect(() => {
        const newNodes = displayNodes.map((node) => ({
            data: mapNodes.get(node),
            id: node,
            type: "custom",
        }));

        console.log("newNodes", newNodes);
        console.log("current displayNodes", displayNodes);
        const newEdges = [];
        chosenNodes.forEach((source) => {
            mapNodes.get(source).subgroupEvents?.forEach((target) => {
                console.log("target2222", target);
                newEdges.push({
                    id: `e-${source}-${target}`,
                    source: source,
                    target: target,
                    ...edgeStyle,
                });
            });
        });
        console.log("newEdges", newEdges);
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(newNodes, newEdges);
        const outLinksEdges = [];

        layoutedNodes.forEach((node) => {
            console.log("node", node.data);
            node.data.outlinks?.forEach((outlink) => {
                console.log("outlink", outlink);
                outLinksEdges.push({
                    id: `e-${node.id}-${outlink}-outlink`,
                    source: node.id,
                    target: outlink,
                    animated: false,
                    sourceHandle: node.id + "_right",
                    targetHandle: outlink + "_left",
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    ...outlinkEdgeStyle,
                });
            });
        });
        console.log("outLinksEdges", outLinksEdges);

        setNodes([...layoutedNodes]);
        setEdges(
            [...layoutedEdges, ...outLinksEdges].filter(
                (edge, index, self) =>
                    index ===
                    self.findIndex(
                        (e) =>
                            e.source === edge.source && e.target === edge.target
                    )
            )
        );
        console.log("layoutedNodes", layoutedNodes);
        console.log("layoutedEdges", edges);
    }, [displayNodes]);

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
                setChosenNodes(chosenNodes.filter((n) => n !== node.id));
                node.data.isExpanded = false;
                const allSubEvents = getAllsubgroupEvents(node.id).filter(
                    (n) => n !== node.id
                );
                console.log("allSubEvents", allSubEvents);
                setdisplayNodes(
                    displayNodes.filter((n) => !allSubEvents.includes(n))
                );
                return;
            }
            setChosenNodes([...chosenNodes, node.id]);
            setdisplayNodes([...displayNodes, ...node.data.subgroupEvents]);
            node.data.isExpanded = true;
            console.log("node", node);
        },
        [displayNodes]
    );
    useEffect(() => {
        console.log("chosenNodes", chosenNodes);
    }, [chosenNodes]);

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
                <Menu/>
            </div>
        </EdgeStyleContext.Provider>
    );
};
export default Graph;
