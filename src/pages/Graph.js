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
        edgesep: isHorizontal? 50:200,
        ranker:  "tight-tree",
        align:  isHorizontal?"UL": undefined,
        nodesep: 50,
        minLen: (edge) => edge.data().weight,
    });

    // nodes = sortArray(nodes);
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
                (node.height ? node.height : nodeHeight) / 2
        };

        return node;
    });
    if (getGraph) {
        console.log("dagreGraph", dagreGraph);
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
        console.log("mapNodes", mapNodes);
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
        console.log("subgraphsNodes", subgraphs);
        console.log("subgraphEdges", subgraphEdges);


        subgraphs.push({
            id: `subgraph-${firstNode.parent}`,
            width: 200,
            height: 200,
            data: {
                nodes: [{id:firstNode.id, 
                    data: firstNode,
                    position: { x: 0, y: 0 },}],
                edges: [],
            },
        });
        const outerGraph = getLayoutedElements(
            subgraphs,
            subgraphEdges,
            "TB",
            true
        );
        console.log("subgraphOuter", outerGraph);
        nodes.push(
            ...outerGraph.nodes.flatMap((parentNode) =>
                parentNode.data.nodes.map((node) => ({
                    ...node,
                    position: {
                        x: parentNode.position.x + node.position.x ,
                        y: parentNode.position.y + node.position.y,
                    },
                }))
            )
        );
    }
    console.log("subgraphnodesAtTheEnd", nodes);
    return nodes;
};

export const Graph = ({ eventNodes }) => {
    const [displayNodes, setdisplayNodes] = useState([]);
    const [chosenNodes, setChosenNodes] = useState([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(displayNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [mapNodes, setMapNodes] = useState({});
    const [clickedNode, setClickedNode] = useState(null);
    const [firstNode, setFirstNode] = useState(null);
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
            console.log("firstNode", firstNode);
            setdisplayNodes([firstNode.id]);
            const newMap = new Map();
            eventNodes.forEach((node) => {
                newMap.set(node.id, node);
            });
            setMapNodes(newMap);
            setFirstNode(firstNode);
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
        if (firstNode === null || mapNodes.size === 0) {
            return;
        }
        console.log("firstNode222", firstNode);
        console.log("mapNodes222", mapNodes);
        
        // const { nodes: layoutedNodes, edges: layoutedEdges } =
        //     getLayoutedElements(newNodes, newEdges);
        const newNodes = getLayoutedElementsNested(chosenNodes, mapNodes, firstNode);
        const outLinksEdges = [];
        const layoutedNodes = newNodes.map((node) => ({
            ...node,
            type: "custom",
        }));;
        
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
        newNodes.forEach((node) => {
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
        console.log("newEdges", newEdges);
        console.log("layoutedNodes222", newNodes);        
        console.log("outLinksEdges", outLinksEdges);

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
    useEffect(() => {
        getLayoutedElementsNested(chosenNodes, mapNodes, firstNode);
    }, [firstNode, chosenNodes]);
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
                <Menu />
            </div>
        </EdgeStyleContext.Provider>
    );
};
export default Graph;
