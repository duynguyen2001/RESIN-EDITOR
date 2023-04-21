import React, { useEffect, useRef, createContext } from "react";
import defaultData from "../data/disease_outbreak_sdf_example.json";
import * as jsonld from "jsonld";
import { json } from "d3";
import { trackPromise } from "react-promise-tracker";
import Node from "../components/Node";
import Graph from "./Graph";
import { JsonConvert } from "json2typescript";
import {
    createProvenanceEntity,
    createEventNodes,
    EventNode,
    Entity
} from "../components/Library.tsx";

function extractUniqueAttributesObjects(objectsList) {
    let uniqueObjects = [];
    let attributeSet = new Set();

    for (const obj of objectsList) {
        let attributes = Object.keys(obj);

        let hasNewAttribute = false;
        for (const attribute of attributes) {
            if (!attributeSet.has(attribute)) {
                hasNewAttribute = true;
                attributeSet.add(attribute);
            }
        }

        if (hasNewAttribute) {
            uniqueObjects.push(obj);
        }
    }

    return uniqueObjects;
}
export const EntitiesContext = createContext([]);
export const ProvenanceContext = createContext([]);
export const EventsContext = createContext([]);
export const DataContext = createContext({});

const DataReader = () => {
    const [data, setData] = React.useState(defaultData);
    let jsonConvert = new JsonConvert();
    const [Entities, setEntities] = React.useState([]);
    const [Events, setEvents] = React.useState([]);
    const [Provenances, setProvenances] = React.useState([]);

    useEffect(() => {
        console.log("rawdata", data);
        if (data.instances) {
            if (data.instances[0].entities) {
                console.log("entities11", data.instances[0].entities);
                setEntities(jsonConvert.deserializeArray(data.instances[0].entities, Entity));
            }
            if (data.instances[0].events) {
                setEvents(
                    jsonConvert.deserializeArray(
                        data.instances[0].events,
                        EventNode
                    )
                );
            }
        }

        if (data.provenanceData) {
            setProvenances(data.provenanceData.map(createProvenanceEntity));
        }
    }, [data]);


    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <DataContext.Provider value={[data, setData]}>
            <ProvenanceContext.Provider value={[Provenances, setProvenances]}>
                <EntitiesContext.Provider value={[Entities, setEntities]}>
                    {/* <h1>Event Nodes</h1> */}
                    {/* <Graph nodes={Events} horizontalEdges={outlinks} verticalEdges={subgrouplinks} width={800} height={600} /> */}
                    <Graph eventNodes={Events} />
                </EntitiesContext.Provider>
            </ProvenanceContext.Provider>
            </DataContext.Provider>
        </div>
    );

    // const nodeObject = convertJsonToNode(data);
    // console.log(nodeObject);
};
export default DataReader;
