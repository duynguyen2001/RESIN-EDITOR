import React, { useContext, useState, useRef } from "react";
import { EntitiesContext } from "./DataReader";
import "./panel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExpand,
    faCompress,
    faClose,
    faEdit,
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

export function Modal({ isEnlarged, toggleEnlarged, handleClick, handleEdit }) {
    return (
        <div className="modal">
            {handleEdit && (
                <FontAwesomeIcon
                    icon={faEdit}
                    className="edit-button"
                    onClick={handleEdit}
                />
            )}
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
    const [showEditPanel, setShowEditPanel] = useState(false);

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
                handleEdit={() => {
                    setShowEditPanel(!showEditPanel);
                }}
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
            {showEditPanel && (
                <EditEventPanel
                    onClose={() => {
                        setShowEditPanel(false);
                    }}
                    isEnlarged={isEnlarged}
                    toggleEnlarged={toggleEnlarged}
                    existingData={data}
                />
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

export const EditEventPanel = ({
    onClose,
    isEnlarged,
    toggleEnlarged,
    parentId,
    existingData,
}) => {
    const jsonConvert = new JsonConvert();
    const [getNewIdInEventMap, addEventNode] = useStore((state) => [
        state.getNewIdInEventMap,
        state.addEventNode,
    ]);
    console.log("existingData", existingData);
    const [data, setData] = useState(
        existingData
            ? jsonConvert.serializeObject(existingData)
            : {
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
              }
    );
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
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Id:</label>
                    <input
                        type="text"
                        name="@id"
                        value={data["@id"]}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Ta1ref:</label>
                    <input
                        type="text"
                        name="ta1ref"
                        value={data.ta1ref}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        cdkTextareaAutosize
                        value={data.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Subgroup Events (comma separated):</label>
                    <textarea
                        name="subgroupEvents"
                        cdkTextareaAutosize
                        value={data.subgroupEvents}
                        onChange={handleArrayChange}
                    />
                </div>
                <div className="form-group">
                    <label>Parent:</label>
                    <input
                        type="text"
                        name="parent"
                        value={data.parent}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Outlinks (comma separated):</label>
                    <textarea
                        name="outlinks"
                        cdkTextareaAutosize
                        onChange={handleArrayChange}
                        value={data.outlinks}
                    />
                </div>
                <div className="form-group">
                    <label>Prediction Provenance (comma separated):</label>
                    <textarea
                        name="predictionProvenance"
                        cdkTextareaAutosize
                        onChange={handleArrayChange}
                        value={data.predictionProvenance}
                    />
                </div>
                <div className="form-group">
                    <label>Confidence (comma separated):</label>
                    <textarea
                        name="confidence"
                        cdkTextareaAutosize
                        onChange={handleArrayChange}
                        value={data.confidence}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Node:</label>
                    <input type="text" name="wdNode" onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>WikiData Label:</label>
                    <input
                        type="text"
                        name="wdLabel"
                        value={data.wdLabel}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Description:</label>
                    <input
                        type="text"
                        name="wdDescription"
                        value={data.wdDescription}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Provenance (comma separated):</label>
                    <textarea
                        name="provenance"
                        cdkTextareaAutosize
                        value={data.provenance}
                        onChange={handleArrayChange}
                    />
                </div>
                <div className="form-group">
                    <label>TA2 WD Node:</label>
                    <input
                        type="text"
                        name="ta2wdNode"
                        value={data.ta2wdNode}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>TA2 WD Label:</label>
                    <input
                        type="text"
                        name="ta2wdLabel"
                        value={data.ta2wdLabel}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>TA2 WD Description:</label>
                    <input
                        type="text"
                        name="ta2wdDescription"
                        value={data.ta2wdDescription}
                        onChange={handleChange}
                    />
                </div>
                {/* <div>
                    <label>Optional:</label>
                    <input
                        type="checkbox"
                        name="optional"
                        value={data.optional}
                        onChange={(e) => {
                            setData({ ...data, optional: e.target.checked });
                            console.log(data);
                        }}
                    />
                </div>
                <div>
                    <label>Is Top Level:</label>
                    <input
                        type="checkbox"
                        name="isTopLevel"
                        value={data.isTopLevel}
                        onChange={(e) =>
                            setData({ ...data, isTopLevel: e.target.checked })
                        }
                    />
                </div> */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};
