import React, { useEffect } from "react";
import defaultData from "../data/disease_outbreak_sdf_example.json";
import * as jsonld from "jsonld";
import { json } from "d3";
import { trackPromise } from "react-promise-tracker";
import Node from "../components/Node";
import Graph from "./Graph";

const DataReader = ({ data = defaultData, setEventsNode }) => {
    const [jsonData, setJsonData] = React.useState([]);
    const [Entities, setEntities] = React.useState([]);
    const [Events, setEvents] = React.useState([]);
    const [Participants, setParticipants] = React.useState([]);
    const [Provenances, setProvenances] = React.useState([]);
    const [Values, setValues] = React.useState([]);
    const [EventNodes, setEventNodes] = React.useState([]);
    const [ParticipantNodes, setParticipantNodes] = React.useState([]);
    const [EntityNodes, setEntityNodes] = React.useState([]);
    const [outlinks, setOutlinks] = React.useState([]);
    const [subgrouplinks, setSubgrouplinks] = React.useState([]);

    useEffect(() => {
        trackPromise(
            jsonld
                .expand(data)
                .then((expanded) => {
                    console.log("expanded", expanded);
                    jsonld
                        .flatten(expanded)
                        .then((flattened) => {
                            console.log("flattened", flattened);
                            setJsonData(flattened);
                            jsonld
                                .compact(flattened, [
                                    "https://kairos-sdf.s3.amazonaws.com/context/kairos-v2.3.jsonld",
                                    {
                                        resin: "https://cs.illinois.edu/",
                                    },
                                ])
                                .then((compacted) => {
                                    console.log(
                                        "compacted",
                                        compacted["@graph"]
                                    );
                                    setEntities(
                                        compacted["@graph"].filter((node) =>
                                            node["@id"].includes("Entities")
                                        )
                                    );
                                    setEvents(
                                        compacted["@graph"].filter((node) =>
                                            node["@id"].includes("Events")
                                        )
                                    );
                                    setParticipants(
                                        compacted["@graph"].filter((node) =>
                                            node["@id"].includes("Participants")
                                        )
                                    );
                                    setProvenances(
                                        compacted["@graph"].filter((node) =>
                                            node["@id"].includes("b")
                                        )
                                    );
                                    setValues(
                                        compacted["@graph"].filter((node) =>
                                            node["@id"].includes("Values")
                                        )
                                    );
                                })
                                .catch((err) => {
                                    console.log("err", err);
                                });
                        })
                        .catch((err) => {
                            console.log("err", err);
                        });
                })
                .catch((err) => {
                    console.log("err", err);
                })
        );
    }, [data]);

    useEffect(() => {
        console.log("rawData", data);
        console.log("Participants", Participants);
        console.log("Events", Events);
        console.log("flattened", jsonData);
        console.log("entityNode", Entities);
        console.log("Provenances", Provenances);
        console.log("Values", Values);
        console.log("EventNodes", EventNodes);
        console.log("ParticipantNodes", ParticipantNodes);
        console.log("outlinks", outlinks);
        console.log("subgrouplinks", subgrouplinks);
    }, [subgrouplinks]);

    useEffect(() => {
        // setEventNodes(
        //     Events.map((event) => {
        //         return <Node type = "event" {...event} />;
        //     })
        // );
        // setOutlinks(Events));
        // console.log("outlinks1", Events.filter((event) => event.outlinks).flatMap(event => event.outlinks.map(target => ({source: event["@id"], target: target, type: "outlink"}))));
         }, [Events]);

    // useEffect(() => {
    //     setParticipantNodes(
    //         Participants.map((participant) => {
    //             return <Node type = "chapter" {...participant} />;
    //         })
    //     );
    // }, [Participants]);

    // useEffect(() => {
    //     setEntityNodes(
    //         Entities.map((entity) => {
    //             return <Node type = "entity" {...entity} />;
    //         })
    //     );
    // }, [Entities]);

    return (
        <div style={{width: "100vw", height: "100vh"}}>
            <h1>Event Nodes</h1>
            <Graph nodes={Events} horizontalEdges={outlinks} verticalEdges={subgrouplinks} width={800} height={600} />
</div>);

    // const nodeObject = convertJsonToNode(data);
    // console.log(nodeObject);
};
export default DataReader;
