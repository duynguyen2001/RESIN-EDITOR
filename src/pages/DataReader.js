import React, { useEffect, useRef, createContext, useContext } from "react";
import defaultData from "../data/disease_outbreak_sdf_example.json";
import Graph from "./Graph";
import { JsonConvert } from "json2typescript";

import { ZipImageProvider, ZipImageContext } from './ImageDict';
import {
    createProvenanceEntity,
    createEventNodes,
    EventNode,
    Entity
} from "../components/Library.tsx";

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
    const [imagesURLs, setImagesURLs] = React.useState();
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

      <ZipImageProvider>
            <DataContext.Provider value={[data, setData]}>
            <ProvenanceContext.Provider value={[Provenances, setProvenances]}>
                <EntitiesContext.Provider value={[Entities, setEntities]}>
                    {/* <h1>Event Nodes</h1> */}
                    {/* <Graph nodes={Events} horizontalEdges={outlinks} verticalEdges={subgrouplinks} width={800} height={600} /> */}
                    <Graph eventNodes={Events} />
                </EntitiesContext.Provider>
            </ProvenanceContext.Provider>
            </DataContext.Provider>
        </ZipImageProvider>
        </div>
    );

    // const nodeObject = convertJsonToNode(data);
    // console.log(nodeObject);
};
export default DataReader;
