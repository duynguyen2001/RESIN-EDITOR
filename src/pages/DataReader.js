import React, { useEffect, useRef, createContext, useContext } from "react";
import defaultData from "../data/disease_outbreak_sdf_example.json";
import defaultText from "../data/results.json";
import Graph from "./Graph";
import { JsonConvert } from "json2typescript";
import {
    createProvenanceEntity,
    EventNode,
    Entity,
} from "../components/Library.tsx";

export const EntitiesContext = createContext({});
export const ProvenanceContext = createContext([]);
export const DataContext = createContext({});
export const ExtractedFilesContext = createContext({});
export const ExtractedTextsContext = createContext({});
const defaultExtractedText = () => {
    const mapText = new Map();
    for (const [_, listValue] of Object.entries(defaultText.rsd_data)) {
        for (const [key, value] of Object.entries(listValue)) {
            mapText.set(key, value);
        }
    }
    console.log("mapText", mapText);
    return mapText;
};

const DataReader = () => {
    const [data, setData] = React.useState(defaultData);
    let jsonConvert = new JsonConvert();
    const [Entities, setEntities] = React.useState([]);
    const [Events, setEvents] = React.useState([]);
    const [Provenances, setProvenances] = React.useState({});
    const [extractedFiles, setExtractedFiles] = React.useState([]);
    const [extractedTexts, setExtractedTexts] = React.useState(
        defaultExtractedText()
    );

    useEffect(() => {
        console.log("rawdata", data);
        if (data.instances) {
            if (data.instances[0].entities) {
                const entitiesMap = new Map();
                jsonConvert
                    .deserializeArray(data.instances[0].entities, Entity)
                    .forEach((entity) => {
                        entitiesMap.set(entity.id, entity);
                    });
                setEntities(entitiesMap);
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
            const mapProvenance = new Map();
            data.provenanceData
                .map(createProvenanceEntity)
                .forEach((provenance) => {
                    mapProvenance.set(provenance.id, provenance);
                });
            setProvenances(mapProvenance);
        }
    }, [data]);

    useEffect(() => {
        console.log("entities", Entities);
        console.log("events", Events);
        console.log("provenances", Provenances);
    }, [Entities, Events, Provenances]);

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <DataContext.Provider value={[data, setData]}>
                <ProvenanceContext.Provider
                    value={[Provenances, setProvenances]}
                >
                    <EntitiesContext.Provider value={[Entities, setEntities]}>
                        <ExtractedTextsContext.Provider
                            value={[extractedTexts, setExtractedTexts]}
                        >
                            <ExtractedFilesContext.Provider
                                value={[extractedFiles, setExtractedFiles]}
                            >
                                <Graph eventNodes={Events} />
                            </ExtractedFilesContext.Provider>
                        </ExtractedTextsContext.Provider>
                    </EntitiesContext.Provider>
                </ProvenanceContext.Provider>
            </DataContext.Provider>
        </div>
    );
};
export default DataReader;
