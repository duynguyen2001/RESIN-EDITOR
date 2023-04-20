import React, { useContext } from "react";
import "./info-panel.css";
import { EventNode, Participant } from "../components/Library.tsx";
import { EntitiesContext } from "./DataReader";
import './panel.css'

function TableInfoPanel({ data }) {
    const [entitiesList, setEntitiesList] = useContext(EntitiesContext);
    if (data === undefined) {
        return <></>;
    }
    if (
        data instanceof Array &&
        data.length > 0 &&
        data[0] instanceof Participant
    ) {
        const displayParticipantArray = data.map((participant) => {
            const entityObject = entitiesList.find(
                (e) => e.id === participant.entity
            );
            const values = [];
            console.log("entityObject", entityObject);
            if (entityObject.name) {
                values.push(entityObject.name);
            }
            participant.values?.forEach((value) => {
                const valueEntity = entitiesList.find(
                    (e) => e.id === value.ta2entity
                );
                values.push(valueEntity.name);
            });
            return {
                id: participant.id,
                entities: values && values.length > 0 ? values.join(", ") : "-",
                roleName: participant.roleName,
            };
        });
        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayParticipantArray.map((participant) => (
                            <tr key={participant.id}>
                                <td>{participant.roleName}</td>
                                <td>{participant.entities}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    const columns = Object.keys(data[0]);
    console.log("data", data);
    console.log("columns", columns);
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column}>{item[column]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>

                {/* add any other table elements here */}
            </table>
        </div>
    );
}
function EventNodeInfoPanel({ data, onClose }) {
    function handleClick() {
        onClose();
    }
    if (data === undefined) {
        return <></>;
    }
    if (data instanceof EventNode) {
        console.log("data", data);
        return (
            <div className="info-panel">

                <button className="close-button" onClick={handleClick}>&times;</button>
                <h2>{data.name}</h2>
                <p>{data.description}</p>
                {data.participants && data.participants.length > 0 && (
                    <div>
                        <h3>Participants</h3>
                        <TableInfoPanel data={data.participants} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="info-panel">
        <button className="close-button" onClick={handleClick}>&times;</button>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
        </div>
    );
}
export function InfoPanel({ data, onClose }) {
    function handleClick() {
        onClose();
    }
    if (data === undefined) {
        return <></>;
    }
    if (data instanceof EventNode) {
        return <EventNodeInfoPanel data={data} onClose={onClose} />;
    }

    return (
        <div className="info-panel" >
            <h2>{data.title}</h2>
            <button className="close-button" onClick={handleClick}>&times;</button>
            <p>{data.description}</p>
        </div>
    );
}
