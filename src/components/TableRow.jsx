import React, { useContext, useEffect, useState } from "react";
import { ReactFlowProvider, ReactFlow } from "reactflow";
import useStore from "../pages/store";
import useStoreTA1 from "../pages/storeTA1";
import "./ToggleButton.css"; // Import the CSS file with the provided styles
import { RelationsContext } from "../pages/DataReader";
import { getLayoutedElements } from "../pages/layoutTA1";
import { set } from "idb-keyval";
import { nodeTypes } from "../pages/DataReader";

export const TableRow = ({ name, wd_label, id, relatedEvents, chosen = false }) => {
    const [isChecked, setIsChecked] = useState(chosen);
    const [chosenEntities, setChosenEntities, mapNodes] = useStore((state) => [
        state.chosenEntities,
        state.setChosenEntities,
        state.mapNodes,
    ]);

    const handleToggle = () => {
        setIsChecked(!isChecked);
        const updatedList = chosenEntities.includes(id)
            ? chosenEntities.filter((item) => item !== id)
            : [...chosenEntities, id];
        setChosenEntities(updatedList);
    };
    const relatedEventsList = relatedEvents
        .map((event) => mapNodes.get(event).name)
        .join(", ");

    return (
        <tr
            // htmlFor={id}
            // className={`toggle-button ${isChecked ? "checked" : ""}`}
        >
            <td>
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={handleToggle}
                />
            </td>
            <td>{name}</td>
            <td>{wd_label}</td>
            <td>{id}</td>
            <td>{relatedEventsList}</td>
        </tr>
    );
};

export const TableRowTA1 = ({ name, wd_label, id, relatedEvents, chosen = false }) => {
    const [isChecked, setIsChecked] = useState(chosen);
    const [chosenEntities, setChosenEntities, mapNodes] = useStoreTA1(
        (state) => [
            state.chosenEntities,
            state.setChosenEntities,
            state.mapNodes,
        ]
    );

    const handleToggle = () => {
        setIsChecked(!isChecked);
        const updatedList = chosenEntities.includes(id)
            ? chosenEntities.filter((item) => item !== id)
            : [...chosenEntities, id];
        setChosenEntities(updatedList);
    };
    const relatedEventsList = relatedEvents
        .map((event) => mapNodes.get(event).name)
        .join(", ");

    return (
        <tr
            // htmlFor={id}
            // className={`toggle-button ${isChecked ? "checked" : ""}`}
        >
            <td>
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    checked={isChecked}
                    onChange={handleToggle}
                />
            </td>
            <td>{name}</td>
            <td>{wd_label}</td>
            <td>{id}</td>
            <td>{relatedEventsList}</td>
        </tr>
    );
};

export const EntityGraphPanelTA1 = () => {
    const [mapEntities, getNodeById, edgeStyle] = useStoreTA1((state) => [state.mapEntities, state.getNodeById, state.edgeStyle]);
    const [relationList, _] = useContext(RelationsContext);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        console.log("relationList", relationList);
        const newNodes = [];
        const newEdges = [];
        relationList.forEach((relation) => {
            const source = getNodeById(relation.relationSubject);
            const target = getNodeById(relation.relationObject);
            newNodes.push({
                id: source.id,
                data: source,
                type: "customNode",
                position: { x: 0, y: 0 },
            });
            newNodes.push({
                id: target.id,
                data: target,
                type: "customNode",
                position: { x: 0, y: 0 },
            });
            if (source && target) {
                newEdges.push(
                    {
                        id: relation.id,
                        source: source.id,
                        target: target.id,
                        label: relation.name,
                        ...edgeStyle.relation,
                        sourcePosition: "right",
                        targetPosition: "left",
                    }
                );
            }
            const obj = getLayoutedElements(newNodes, newEdges, "LR");
            setNodes(obj.nodes);
            setEdges(obj.edges);
        });
    }, [relationList]);
    useEffect(() => {
        console.log("nodesathere", nodes);
        console.log("edgesathere", edges);
    }, [nodes, edges]);

    return (
        <div>
            <h2>Entity Relation Graph</h2>
            <div style={{ width: "100%", height: "70vh", border: "1px solid black" }}> 
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    // onNodesChange={(nodes) => setNodes(nodes)}
                    // onEdgesChange={(edges) => setEdges(edges)}
                    nodeTypes={nodeTypes}
                    draggable={true}
                    fitView
                    />
            </ReactFlowProvider>
            </div>
        </div>
    );
}
