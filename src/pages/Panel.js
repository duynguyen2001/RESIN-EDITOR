import React, { useContext, useState, useRef } from "react";
import { EntitiesContext } from "./DataReader";
import "./panel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExpand,
    faCompress,
    faClose,
} from "@fortawesome/free-solid-svg-icons";
import ProvenancePopup from "../components/ProvenancePopup.jsx";
import EditableText from "./EditableText.jsx";
import { useEffect } from "react";
import useStore from "./store";
import { JsonConvert } from "json2typescript";
import { EventNode } from "../components/Library";

function TableInfoPanel({ data, parentId }) {
    const [entitiesMap] = useContext(EntitiesContext);
    const [showProvenance, setShowProvenance] = useState(false);
    const [keyProvenance, setKeyProvenance] = useState(null);
    const [currentProvenance, setCurrentProvenance] = useState(null);
    const [tableChange, setTableChange] = useState(false);
    const [editMapNode, mapNodes] = useStore((state) => [
        state.editMapNode,
        state.mapNodes,
    ]);

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

            if (participant.values && participant.values instanceof Array) {
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
                roleName: (
                    <React.Fragment>
                        <EditableText
                            values={participant.roleName}
                            onSave={(value, field) => {
                                participant.roleName = value;
                                editMapNode(
                                    parentId,
                                    "participants",
                                    mapNodes
                                        .get(parentId)
                                        .participants.map((part) => {
                                            if (part.id === participant.id) {
                                                return participant;
                                            } else {
                                                return part;
                                            }
                                        })
                                );
                                setTableChange(!tableChange);
                            }}
                            variant="none"
                            onTable={true}
                        />
                    </React.Fragment>
                ),
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
    const editMapNode = useStore((state) => state.editMapNode);

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
        editMapNode(data.id, field, value);
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

export const AddEventPanel = ({
    onClose,
    isEnlarged,
    toggleEnlarged,
    parentId,
}) => {
    const [getNewIdInEventMap, addEventNode] = useStore((state) => [state.getNewIdInEventMap, state.addEventNode]);
    const [data, setData] = useState({
        "@id": getNewIdInEventMap(),
        ta1ref: "",
        name: "",
        description: "",
        parent: parentId,
        isTopLevel: false,
        subgroupEvents: [],
        outlinks: [],
        predictionProvenance: [],
        confidence: [],
        wdNode: "",
        wdLabel: "",
        wdDescription: "",
        provenance: [],
        participants: [],
        ta2wdNode: "",
        ta2wdLabel: "",
        ta2wdDescription: "",
        optional: false,
    });
    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleArrayChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
                .split(",")
                .map((item) => item.trim()),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data);
        const jsonConvert = new JsonConvert();
        addEventNode(jsonConvert.deserializeObject(data, EventNode));
        onClose();
    };
    return (
        <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
            <Modal
                isEnlarged={isEnlarged}
                toggleEnlarged={toggleEnlarged}
                handleClick={onClose}
            />
            <form onSubmit={handleSubmit}>
                <label>
                    Id:
                    <input
                        type="text"
                        name="@id"
                        value={data["@id"]}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Ta1ref:
                    <input
                        type="text"
                        name="ta1ref"
                        value={data.ta1ref}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Description:
                    <input
                        type="textarea"
                        name="description"
                        value={data.description}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Subgroup Events (comma separated):
                    <textarea
                        name="subgroupEvents"
                        value={data.subgroupEvents}
                        onChange={handleArrayChange}
                    />
                </label>
                <br/>
                <label>
                    Parent:
                    <input type="text" name="parent"
                    value={data.parent}
                     onChange={handleChange} />
                </label>
                <br/>
                <label>
                    Is Top Level:
                    <input
                        type="checkbox"
                        name="isTopLevel"
                        value={data.isTopLevel}
                        onChange={(e) =>
                            setData({ ...data, isTopLevel: e.target.checked })
                        }
                    />
                </label>
                <br/>
                <label>
                    Outlinks (comma separated):
                    <textarea
                        name="outlinks"
                        onChange={handleArrayChange}
                        value={data.outlinks}
                    />
                </label>
                <br/>
                <label>
                    Prediction Provenance (comma separated):
                    <textarea
                        name="predictionProvenance"
                        onChange={handleArrayChange}
                    />
                </label>
                <br/>
                <label>
                    Confidence (comma separated):
                    <textarea name="confidence" onChange={handleArrayChange} />
                </label>
                <br/>
                <label>
                    WikiData Node:
                    <input type="text" name="wdNode" onChange={handleChange} />
                </label>
                <br/>
                <label>
                    WikiData Label:
                    <input
                        type="text"
                        name="wdLabel"
                        value={data.wdLabel}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    WikiData Description:
                    <input
                        type="text"
                        name="wdDescription"
                        value={data.wdDescription}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Provenance (comma separated):
                    <textarea
                        name="provenance"
                        value={data.provenance}
                        onChange={handleArrayChange}
                    />
                </label>
                <br/>
                <label>
                    TA2 WD Node:
                    <input
                        type="text"
                        name="ta2wdNode"
                        value={data.ta2wdNode}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    TA2 WD Label:
                    <input
                        type="text"
                        name="ta2wdLabel"
                        value={data.ta2wdLabel}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    TA2 WD Description:
                    <input
                        type="text"
                        name="ta2wdDescription"
                        value={data.ta2wdDescription}
                        onChange={handleChange}
                    />
                </label>
                <br/>
                <label>
                    Optional:
                    <input
                        type="checkbox"
                        name="optional"
                        value={data.optional}
                        onChange={(e) =>
                            setData({ ...data, optional: e.target.checked })
                        }
                    />
                </label>
                <br/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};
