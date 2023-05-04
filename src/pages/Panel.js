import React, { useContext, useState } from "react";
import { EventNode, Participant } from "../components/Library.tsx";
import { EntitiesContext, EventsContext, ProvenanceContext } from "./DataReader";
import "./panel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExpand,
    faCompress,
    faClose,
} from "@fortawesome/free-solid-svg-icons";
import ProvenancePopup from "../components/ProvenancePopup.jsx";
import EditableText from "./EditableText.jsx";

function TableInfoPanel({ data }) {
    const [entitiesMap] = useContext(EntitiesContext);
    const [provenance, _] = useContext(ProvenanceContext);
    if (data === undefined) {
        return <></>;
    }

    if (
        data instanceof Array &&
        data.length > 0 &&
        data[0] instanceof Participant
    ) {
        const displayParticipantArray = data.map((participant) => {
            const entityObject = entitiesMap.get(
                participant.entity ? participant.entity : participant.ta2entity
            );
            const values = [];
            if (entityObject.name) {
                values.push(entityObject.name);
            }
            if (participant.values && participant.values instanceof String) {
                values.push(participant.values);
            } else if (
                participant.values &&
                participant.values instanceof Array
            ) {
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
                            <th>Role</th>
                            <th>Filler</th>
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

export function Modal({ isEnlarged, toggleEnlarged, handleClick }) {
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
    const [showProvenance, setShowProvenance] = useState(false);
    const [EventNodes, setEventNodes] = useContext(EventsContext);
    if (data === undefined) {
        return <></>;
    }

    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };
    const toggleProvenance = () => {
        setShowProvenance(!showProvenance);
    };
    console.log("event data: ", data);
    const provenanceExisted = data.provenance && data.provenance.length > 0;
    const handleOnSave = (value, field) => {
        console.log("value: ", value);
        console.log("field: ", field);

        setEventNodes((nds) =>
            nds.map((nd) => {
                if (nd.id === data.id) {
                    nd[field] = value;
                }
                return nd;
            })
        );
    };
    if (data instanceof EventNode) {
        return (
            <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
                <Modal
                    isEnlarged={isEnlarged}
                    toggleEnlarged={toggleEnlarged}
                    handleClick={onClose}
                />
                

                {data.name && (
                    <EditableText
                        values={data.name}
                        variant="h2"
                        onSave={handleOnSave}
                        field="name"
                    />
                )}
                {data.description && (
                    <EditableText
                        values={data.description}
                        variant="p"
                        onSave={handleOnSave}
                        field="description"
                    />
                )}
                {provenanceExisted && (
                    <a onClick={toggleProvenance}>
                        <u>
                            <h3>Show Source</h3>
                        </u>
                    </a>
                )}
                {showProvenance && provenanceExisted && (
                    <ProvenancePopup
                        ids={data.provenance}
                        onClose={toggleProvenance}
                    />
                )}
                {data.wdLabel &&
                    data.wdLabel !== null &&
                    data.wdLabel !== "null" && (
                        <details open>
                            <summary
                                style={{
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                Event Type
                            </summary>
                            <EditableText
                                values={data.wdLabel}
                                variant="h3"
                                onSave={handleOnSave}
                                field="wdLabel"
                            />
                            <EditableText
                                values={data.wdDescription}
                                variant="p"
                                onSave={handleOnSave}
                                field="wdDescription"
                            />
                        </details>
                    )}
                
                {data.participants && data.participants.length > 0 && (
                    <details open>
                        <summary
                            style={{
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                        >
                            Participants
                        </summary>
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
