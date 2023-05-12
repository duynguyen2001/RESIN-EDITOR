import React, { useContext, useState, useRef } from "react";
import {
    EntitiesContext,
    EventsContext,
} from "./DataReader";
import "./panel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExpand,
    faCompress,
    faClose,
} from "@fortawesome/free-solid-svg-icons";
import ProvenancePopup from "../components/ProvenancePopup.jsx";
import EditableText from "./EditableText.jsx";
import { NodeRerenderContext } from "./Graph.js";
import { useEffect } from "react";

function TableInfoPanel({ data, parentId, eventNodeRef }) {
    const [entitiesMap] = useContext(EntitiesContext);
    const [showProvenance, setShowProvenance] = useState(false);
    const [keyProvenance, setKeyProvenance] = useState(null);
    const [currentProvenance, setCurrentProvenance] = useState(null);
    const [tableChange, setTableChange] = useState(false);

    const closeProvenance = () => {
        setShowProvenance(false);
    };
    const openProvenanceMap = (provenanceIds, key) => {
        // Add logic here to open the provenance map with the specified provenanceId
        // console.log(`Opening provenance map for id: ${provenanceId}`);
        if (provenanceIds instanceof Array && provenanceIds.length > 0) {
            setCurrentProvenance(provenanceIds);
            setKeyProvenance(key);
            setShowProvenance(true);
        } else if (provenanceIds instanceof String) {
            setCurrentProvenance([provenanceIds]);
            setKeyProvenance(key);
            setShowProvenance(true);
        }
    };

    const getDisplayParticipantArray = (data, parentId) => {
        return data.map((participant) => {
            const entityObject = entitiesMap.get(
                participant.entity ? participant.entity : participant.ta2entity
            );
            const values = [];

            if (entityObject.name) {
                values.push(
                    <EditableText
                        values={entityObject.name}
                        onSave={(value, field) => {
                            entityObject.name = value;
                            entitiesMap.set(entityObject.id, entityObject);
                            setTableChange(!tableChange);
                        }}
                        variant="none"
                        onTable={true}
                    />
                );
            }

            if (
                participant.values &&
                participant.values instanceof Array
            ) {
                participant.values?.forEach((value) => {
                    const valueEntity = entitiesMap.get(value.ta2entity);
                    if (value.provenance) {
                        // Add a clickable text to open the provenance map
                        console.log("valueEntity", value);
                        values.push(
                            <EditableText
                                values={valueEntity.name}
                                onSave={(value, field) => {
                                    valueEntity.name = value;
                                    entitiesMap.set(
                                        valueEntity.id,
                                        valueEntity
                                    );
                                    setTableChange(!tableChange);
                                }}
                                variant="span"
                                key={value.ta2entity}
                                className="clickable-text"
                                onClick={() =>
                                    openProvenanceMap(value.provenance, [
                                        parentId,
                                        participant.id,
                                        value.id,
                                    ])
                                }
                                onTable={true}
                            />
                        );
                    } else {
                        values.push(
                            <EditableText
                                values={valueEntity.name}
                                onSave={(value, field) => {
                                    valueEntity.name = value;
                                    entitiesMap.set(
                                        valueEntity.id,
                                        valueEntity
                                    );
                                    setTableChange(!tableChange);
                                }}
                                variant="none"
                                onTable={true}
                            />
                        );
                    }
                });
            }

            return {
                id: participant.id,
                entities:
                    values && values.length > 0
                        ? values.map((value, index) => (
                              <React.Fragment key={index}>
                                  {index > 0 && ", "}
                                  {value}
                              </React.Fragment>
                          ))
                        : "-",
                roleName: <React.Fragment>
                    <EditableText
                        values={participant.roleName}
                        onSave={(value, field) => {
                            participant.roleName = value;
                            eventNodeRef.current = eventNodeRef.current.map(
                                (event) => {
                                        event.participants = event.participants.map(
                                            (part) => {
                                                if (
                                                    part.id ===
                                                    participant.id
                                                ) {
                                                    return participant;
                                                } else {
                                                    return part;
                                                }
                                            }
                                        );
                                        return event;
                                    
                                }
                            )
                            setTableChange(!tableChange);
                        }}
                        variant="none"
                        onTable={true}
                    />
                </React.Fragment>,
            };
        });
    };

    const [displayParticipantArray, setDisplayParticipantArray] = useState(
        getDisplayParticipantArray(data, parentId)
    );

    useEffect(() => {
        setDisplayParticipantArray(getDisplayParticipantArray(data, parentId));
    }, [tableChange, data, parentId]);
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
            {showProvenance && (
                <ProvenancePopup
                    ids={currentProvenance}
                    onClose={closeProvenance}
                    parentId={keyProvenance}
                />
            )}
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
    const [EventNodes, _] = useContext(EventsContext);
    const eventNodeRef = useRef(EventNodes);
    const [nodeRerender, setNodeRerender] = useContext(NodeRerenderContext);

    if (data === undefined) {
        return <></>;
    }

    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };
    const toggleProvenance = () => {
        setShowProvenance(!showProvenance);
    };

    const provenanceExisted = data.provenance && data.provenance.length > 0;
    const handleOnSave = (value, field) => {
        eventNodeRef.current = eventNodeRef.current.map((nd) => {
            if (nd.id === data.id) {
                nd[field] = value;
            }
            return nd;
        });

        setNodeRerender((nodeRerender + 1) % 2);
    };

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
                    parentId={data.id}
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
                    <TableInfoPanel
                        data={data.participants}
                        parentId={data.id}
                        eventNodeRef={eventNodeRef}
                    />
                </details>
            )}
        </div>
    );
}
export function InfoPanel({ data, onClose }) {
    if (data === undefined) {
        return <></>;
    }
    return <EventNodeInfoPanel data={data} onClose={onClose} />;
}
