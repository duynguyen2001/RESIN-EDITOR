import React, { useEffect } from "react";
import defaultData from "../data/disease_outbreak_sdf_example.json";
import * as jsonld from "jsonld";
import { json } from "d3";
import { trackPromise } from "react-promise-tracker";
import Node from "../components/Node";
import Graph from "./Graph";
import { JsonConvert } from "json2typescript";
import {createProvenanceEntity, createEventNodes, EventNode} from "../components/Library.tsx";

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

const DataReader = ({ data = defaultData }) => {
    let jsonConvert = new JsonConvert();
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
        console.log("rawdata", data);
        if(data.instances) {
        if (data.instances[0].entities) {
            console.log("entities11", data.instances[0].entities);
            setEntities(data.instances[0].entities);
        }
        if (data.instances[0].events) {
            // let node = jsonConvert.deserializeObject(Events[0] !== undefined? Events[0]: {"@id":"", }, EventNode);
            setEvents(jsonConvert.deserializeArray(data.instances[0].events, EventNode));
        }
        if (data.instances[0].events) {
            setParticipants(data.instances[0].events.flatMap((event) => event.participants).filter((participant) => participant !== undefined));
        }
        if  (Participants) {
            setValues(Participants.flatMap((participant) => participant.hasOwnProperty('values')? participant.values : []));
        }
    }

    if (data.provenanceData) {
        setProvenances(data.provenanceData.map(createProvenanceEntity));
    }

    }, [data]);

    useEffect(() => {
        console.log("rawData", data);
        console.log("Unique Participants", extractUniqueAttributesObjects(Participants) );
        console.log("Participants", Participants);
        console.log("Unique Events", extractUniqueAttributesObjects(Events) );
        console.log("Unique Events Attributes", Array.from(new Set(extractUniqueAttributesObjects(Events).flatMap(obj => Object.keys(obj)))) );
        console.log("Events", Events);
        // console.log("node2222", node);
        console.log("flattened", jsonData);
        console.log("Unique Entities", extractUniqueAttributesObjects(Entities) );
        console.log("Unique Entities Attributes", Array.from(new Set(extractUniqueAttributesObjects(Entities).flatMap(obj => Object.keys(obj)))) );
        console.log("entityNode", Entities);
        console.log("Unique Provenances", extractUniqueAttributesObjects(Provenances) );
        console.log("Unique Provenances Attributes",Array.from( new Set(extractUniqueAttributesObjects(Provenances).flatMap(obj => Object.keys(obj)))) );
        console.log("Provenances", Provenances);
        console.log("Unique Values", extractUniqueAttributesObjects(Values) );
        console.log("Unique Values Attributes", Array.from(new Set(extractUniqueAttributesObjects(Values).flatMap(obj => Object.keys(obj)))) );
        console.log("Values", Values);
        console.log("EventNodes", EventNodes);
        console.log("Events toplevel",Events.filter((event) => event.isTopLevel));
        console.log("ParticipantNodes", ParticipantNodes);
        console.log("outlinks", outlinks);
        console.log("subgrouplinks", subgrouplinks);
    }, [Provenances]);

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
            {/* <h1>Event Nodes</h1> */}
            {/* <Graph nodes={Events} horizontalEdges={outlinks} verticalEdges={subgrouplinks} width={800} height={600} /> */}
            <Graph eventNodes={Events}  />
</div>);

    // const nodeObject = convertJsonToNode(data);
    // console.log(nodeObject);
};
export default DataReader;
