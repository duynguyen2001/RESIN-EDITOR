import { JsonConvert } from "json2typescript";
import React, { createContext, useEffect } from "react";
import {
    Entity,
    EventNode,
    createProvenanceEntity,
} from "../components/Library.tsx";
import defaultData from "../data/resin-resin-task1-ce2013.json";
import defaultText from "../data/triggers.json";
import Graph from "./Graph";
import CountProvider from "./newdataIndexes";

export const EntitiesContext = createContext({});
export const ProvenanceContext = createContext([]);
export const DataContext = createContext({});
export const ExtractedFilesContext = createContext(new Map());
export const ExtractedTextsContext = createContext({});
export const EventsContext = createContext([]);

const defaultExtractedText = () => {
    const mapText = new Map();
    for (const [key, value] of Object.entries(defaultText.rsd_data.en)) {
        mapText.set(key, value);
    }
    return mapText;
};

const DataReader = () => {
    const [data, setData] = React.useState(defaultData);
    let jsonConvert = new JsonConvert();
    const [Entities, setEntities] = React.useState([]);
    const [Events, setEvents] = React.useState([]);
    const [Provenances, setProvenances] = React.useState({});
    const [extractedFiles, setExtractedFiles] = React.useState(new Map());
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
            <CountProvider>
                <DataContext.Provider value={[data, setData]}>
                    <ProvenanceContext.Provider
                        value={[Provenances, setProvenances]}
                    >
                        <EventsContext.Provider value={[Events, setEvents]}>
                            <EntitiesContext.Provider
                                value={[Entities, setEntities]}
                            >
                                <ExtractedTextsContext.Provider
                                    value={[extractedTexts, setExtractedTexts]}
                                >
                                    <ExtractedFilesContext.Provider
                                        value={[
                                            extractedFiles,
                                            setExtractedFiles,
                                        ]}
                                    >
                                        <Graph eventNodes={Events} />
                                    </ExtractedFilesContext.Provider>
                                </ExtractedTextsContext.Provider>
                            </EntitiesContext.Provider>
                        </EventsContext.Provider>
                    </ProvenanceContext.Provider>
                </DataContext.Provider>
            </CountProvider>
        </div>
    );
};
export default DataReader;