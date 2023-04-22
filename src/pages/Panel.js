import React, { useContext, useState } from "react";
import { EventNode, Participant } from "../components/Library.tsx";
import { EntitiesContext } from "./DataReader";
import "./panel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExpand,
    faCompress,
    faClose,
} from "@fortawesome/free-solid-svg-icons";

function TableInfoPanel({ data }) {
    const [entitiesMap] = useContext(EntitiesContext);
    if (data === undefined) {
        return <></>;
    }

    if (
        data instanceof Array &&
        data.length > 0 &&
        data[0] instanceof Participant
    ) {
        const displayParticipantArray = data.map((participant) => {
            const entityObject = entitiesMap.get(participant.entity? participant.entity: participant.ta2entity)
            const values = [];
            if (entityObject.name) {
                values.push(entityObject.name);
            }
            if (participant.values && participant.values instanceof String) {
                values.push(participant.values);
            } else if (participant.values&& participant.values instanceof Array) {
                participant.values?.forEach((value) => {
                    const valueEntity = entitiesMap.get(value.ta2entity);
                    values.push(valueEntity.name);
            });
        }
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
            </table>
        </div>
    );
}

export function Modal({isEnlarged, toggleEnlarged, handleClick}) {
    return (
        <div className="modal">
            <FontAwesomeIcon
                icon={isEnlarged ? faCompress : faExpand}
                className="enlarge-button"
                onClick={toggleEnlarged}
            />
            <FontAwesomeIcon
                icon={faClose}
                className="exit-button"
                onClick={handleClick}
            />
        </div>
    );
}

function EventNodeInfoPanel({ data, onClose }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    if (data === undefined) {
        return <></>;
    }

    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };
    if (data instanceof EventNode) {
        return (
            <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
                <Modal
                    isEnlarged={isEnlarged}
                    toggleEnlarged={toggleEnlarged}
                    handleClick={onClose}
                />

                <h2>{data.name}</h2>
                <p>{data.description}</p>
                {data.participants && data.participants.length > 0 && (
                    <details>
                        <summary className="flex items-center font-bold text-2xl">Participants</summary>
                        <TableInfoPanel data={data.participants} />
                    </details>
                )}
            </div>
        );
    }

    return (
        <div className="info-panel">
            <Modal
                    isEnlarged={isEnlarged}
                    toggleEnlarged={toggleEnlarged}
                    handleClick={onClose}
                />
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
        <div className="info-panel">
            <h2>{data.title}</h2>
            <button className="close-button" onClick={handleClick}>
                &times;
            </button>
            <p>{data.description}</p>
        </div>
    );
}
