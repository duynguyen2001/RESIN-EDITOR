import {
    faClose,
    faCompress,
    faEdit,
    faExpand,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JsonConvert } from "json2typescript";
import React, { useContext, useEffect, useState } from "react";
import { Entity, EventNode, Participant } from "../components/Library";
import ProvenancePopup from "../components/ProvenancePopup.jsx";
import { UniqueString } from "../components/TypeScriptUtils";
import { EntitiesContext, SchemaTypeContext } from "./DataReader";
import Select from "react-select";
import EditableText from "./EditableText.jsx";
import "./panel.css";
import useStore from "./store";
import { Slider } from "@mui/material";
import useStoreTA1 from "./storeTA1";
function TA1TableInfoPanel({ data, parentId, editMode = false, schemaType = "ta1" }) {
    const [showProvenance, setShowProvenance] = useState(false);
    const [tableChange, setTableChange] = useState(false);
    const [showAllEntities, setShowAllEntities] = useState(schemaType === "ta1");
    const [editMapNode, mapNodes, entitiesRelatedEventMap, mapEntities] = useStoreTA1(
        (state) => [
            state.editMapNode,
            state.mapNodes,
            state.entitiesRelatedEventMap,
            state.mapEntities
        ]
    )
    const [editNode, setEditNode] = useState(null);
    const getDisplayParticipantArray = (data, parentId, showAllEntities) => {
        console.log("dataoverhere", data);
        console.log("parentId", parentId);
        return data.map((participant) => {
            // console.log("entitiesMap", mapEntities);
            const entityObject = mapEntities.get(participant.entity);
            return {
                id: participant.id,
                entities:
                <EditableText
                        values={entityObject.name}
                        onSave={(value, field) => {
                            entityObject.name = value;
                            mapEntities.set(entityObject.id, entityObject);
                            setTableChange(!tableChange);
                        }}
                        variant="none"
                        onTable={true}
                    />,
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
        setDisplayParticipantArray(
            getDisplayParticipantArray(data, parentId, showAllEntities)
        );
    }, [showAllEntities, tableChange, data, parentId, editNode]);
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>
                            Filler{" "}
                            {showAllEntities ? (
                                <span
                                    className="fa fa-chevron-down"
                                    onClick={() => {
                                        setShowAllEntities(false);
                                    }}
                                ></span>
                            ) : (
                                <span
                                    className="fa fa-chevron-up"
                                    onClick={() => {
                                        setShowAllEntities(true);
                                    }}
                                ></span>
                            )}
                        </th>
                        {editMode && (
                            <th
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-evenly",
                                }}
                            >
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {displayParticipantArray.map((participant) => (
                        <tr key={participant.id}>
                            <td>{participant.roleName}</td>
                            <td>{participant.entities}</td>
                            {editMode && (
                                <td
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-evenly",
                                    }}
                                >
                                    <span
                                        className="fa fa-arrow-up new-style-button"
                                        onClick={() => {
                                            // move the entity up
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index > 0) {
                                                const temp = data[index - 1];
                                                data[index - 1] = data[index];
                                                data[index] = temp;
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-arrow-down new-style-button"
                                        onClick={() => {
                                            // move the entity down
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index < data.length - 1) {
                                                const temp = data[index + 1];
                                                data[index + 1] = data[index];
                                                data[index] = temp;
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-edit new-style-button"
                                        onClick={() => {
                                            // edit the entity
                                            // console.log(
                                            //     "participant",
                                            //     participant
                                            // );
                                            if (
                                                editNode !== null &&
                                                editNode.id === participant.id
                                            ) {
                                                setEditNode(null);
                                            } else {
                                                setEditNode(participant);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-trash trash-button"
                                        onClick={() => {
                                            // delete the entity
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index > -1) {
                                                data.splice(index, 1);
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
            }
function TA2TableInfoPanel({ data, parentId, editMode = false, schemaType = "ta2" }) {
    const [entitiesMap] = useContext(EntitiesContext);
    const [showProvenance, setShowProvenance] = useState(false);
    const [keyProvenance, setKeyProvenance] = useState(null);
    const [currentProvenance, setCurrentProvenance] = useState(null);
    const [tableChange, setTableChange] = useState(false);
    const [showAllEntities, setShowAllEntities] = useState(schemaType === "ta1");
    const [editMapNode, mapNodes, entitiesRelatedEventMap] = useStore(
        (state) => [
            state.editMapNode,
            state.mapNodes,
            state.entitiesRelatedEventMap,
        ]
    )
    const [editNode, setEditNode] = useState(null);
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

    const getDisplayParticipantArray = (data, parentId, showAllEntities) => {
        return data.map((participant) => {
            const entityObject = entitiesMap.get(
                participant.entity ? participant.entity : participant.ta2entity
            );
            const values = [];
            if (editNode !== null && participant.id === editNode.id) {
                if (participant.values && participant.values instanceof Array) {
                    values.push(
                        ...participant.values.map((value) => {
                            const valueEntity = entitiesMap.get(
                                value.ta2entity
                            );
                            return {
                                value: valueEntity.id,
                                label: valueEntity.name,
                            };
                        })
                    );
                }
                const options = [];
                entitiesRelatedEventMap.forEach((value, key) => {
                    options.push({
                        value: key,
                        label: entitiesMap.get(key).name,
                    });
                });
                return {
                    id: participant.id,
                    entities: (
                        <Select
                            options={options}
                            value={values}
                            isMulti
                            onChange={(valueList) => {
                                const values = [];
                                // console.log("value", valueList);
                                valueList.forEach((value) => {
                                    let foundInOldArray = false;
                                    participant.values?.forEach((partValue) => {
                                        if (
                                            partValue.ta2entity === value.value
                                        ) {
                                            values.push(partValue);
                                            foundInOldArray = true;
                                        }
                                    });
                                    if (foundInOldArray === false) {
                                        const newEntity = entitiesMap.get(
                                            value.value
                                        );
                                        const newValue = {
                                            "@id": UniqueString.getUniqueStringWithForm(
                                                "resin:Value/",
                                                "/"
                                            ),
                                            ta2entity: newEntity.id,
                                        };
                                        values.push(newValue);
                                    }
                                    // console.log("newvalues", values);
                                });
                                participant.values = values;
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
                        />
                    ),
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
                                                if (
                                                    part.id === participant.id
                                                ) {
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
            }

            if (showAllEntities && entityObject.name) {
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
                    if (valueEntity === undefined) {
                        return;
                    }
                    if (value.provenance) {
                        // Add a clickable text to open the provenance map
                        // console.log("valueEntity", valueEntity);

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
        setDisplayParticipantArray(
            getDisplayParticipantArray(data, parentId, showAllEntities)
        );
    }, [showAllEntities, tableChange, data, parentId, editNode]);
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>
                            Filler{" "}
                            {showAllEntities ? (
                                <span
                                    className="fa fa-chevron-down"
                                    onClick={() => {
                                        setShowAllEntities(false);
                                    }}
                                ></span>
                            ) : (
                                <span
                                    className="fa fa-chevron-up"
                                    onClick={() => {
                                        setShowAllEntities(true);
                                    }}
                                ></span>
                            )}
                        </th>
                        {editMode && (
                            <th
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-evenly",
                                }}
                            >
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {displayParticipantArray.map((participant) => (
                        <tr key={participant.id}>
                            <td>{participant.roleName}</td>
                            <td>{participant.entities}</td>
                            {editMode && (
                                <td
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-evenly",
                                    }}
                                >
                                    <span
                                        className="fa fa-arrow-up new-style-button"
                                        onClick={() => {
                                            // move the entity up
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index > 0) {
                                                const temp = data[index - 1];
                                                data[index - 1] = data[index];
                                                data[index] = temp;
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-arrow-down new-style-button"
                                        onClick={() => {
                                            // move the entity down
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index < data.length - 1) {
                                                const temp = data[index + 1];
                                                data[index + 1] = data[index];
                                                data[index] = temp;
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-edit new-style-button"
                                        onClick={() => {
                                            if (
                                                editNode !== null &&
                                                editNode.id === participant.id
                                            ) {
                                                setEditNode(null);
                                            } else {
                                                setEditNode(participant);
                                            }
                                        }}
                                    ></span>
                                    <span
                                        className="fa fa-trash trash-button"
                                        onClick={() => {
                                            // delete the entity
                                            const index = data.findIndex(
                                                (part) =>
                                                    part.id === participant.id
                                            );
                                            if (index > -1) {
                                                data.splice(index, 1);
                                                editMapNode(
                                                    parentId,
                                                    "participants",
                                                    data
                                                );
                                                setTableChange(!tableChange);
                                            }
                                        }}
                                    ></span>
                                </td>
                            )}
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
function TA1EventNodeInfoPanel({ data, onClose }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [showProvenance, setShowProvenance] = useState(false);
    const editMapNode = useStoreTA1((state) => state.editMapNode);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [timeFrame, setTimeFrame] = useState(Date.now());
    const [Entities] = useContext(EntitiesContext);
    const [editMode, setEditMode] = useState(false);

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
    const handleOnSave = (value, field, index = -1) => {
        editMapNode(data.id, field, value, index);
    };
    return (
        <div
            className={isEnlarged ? "info-panel-enlarge" : "info-panel"}
            key={timeFrame}
        >
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
            {data.wdNode &&
                data.wdNode !== null &&
                data.wdNode !== "null" && (
                    <details open>
                        <summary
                            style={{
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                        >
                            Event Type
                        </summary>
                        {data.wdNode.map((node, index) => (
                            <div key={node}>
                        <EditableText
                            values={data.wdLabel[index]}
                            variant="h3"
                            index={index}
                            onSave={handleOnSave}
                            field="wdLabel"
                        />
                        <EditableText
                            values={data.wdDescription[index]}
                            variant="p"
                            index={index}
                            onSave={handleOnSave}
                            field="wdDescription"
                        />
                            </div>))}
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
                    <TA1TableInfoPanel
                        data={data.participants}
                        parentId={data.id}
                        editMode={editMode}
                    />
                </details>
            )}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "left",
                    gap: "10px",
                }}
            >
                {
                    <button
                        className="anchor-button"
                        onClick={() => {
                            const jsonConvert = new JsonConvert();
                            const newParticipantId =
                                UniqueString.getUniqueStringWithForm(
                                    "resin:Participant/",
                                    "/"
                                );
                            const newEntityId =
                                UniqueString.getUniqueStringWithForm(
                                    "resin:Entity/",
                                    "/"
                                );
                            const newEntity = jsonConvert.deserializeObject(
                                {
                                    "@id": newEntityId,
                                    name: "NewEntity",
                                    description: "",
                                    provenance: [],
                                    ta2wdNode: [],
                                    ta2wdLabel: "",
                                    ta2wdDescription: "",
                                    optional: false,
                                },
                                Entity
                            );
                            Entities.set(newEntityId, newEntity);

                            // console.log("newParticipantId", newParticipantId);
                            const newParticipant =
                                jsonConvert.deserializeObject(
                                    {
                                        "@id": newParticipantId,
                                        roleName: "new Role",
                                        entity: newEntityId,
                                    },
                                    Participant
                                );

                            data.participants.push(newParticipant);
                            editMapNode(
                                data.id,
                                "participants",
                                data.participants
                            );
                            setTimeFrame(Date.now());
                        }}
                    >
                        <h4>
                            <span className="fa fa-plus" />
                            {" Add Participant"}
                        </h4>
                    </button>
                }
                {data.participants && data.participants.length > 0 && (
                    <button
                        className="anchor-button"
                        onClick={() => {
                            setEditMode(!editMode);
                        }}
                    >
                        <h4>
                            <span className="fa fa-edit" />
                            {editMode ? " Close Edit Table" : " Edit Table"}
                        </h4>
                    </button>
                )}
            </div>
            {showEditPanel && (
                <TA1EditEventPanel
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
function TA2EventNodeInfoPanel({ data, onClose }) {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [showProvenance, setShowProvenance] = useState(false);
    const editMapNode = useStore((state) => state.editMapNode);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [timeFrame, setTimeFrame] = useState(Date.now());
    const [Entities] = useContext(EntitiesContext);
    const [editMode, setEditMode] = useState(false);

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
    const handleOnSave = (value, field, index = -1) => {
        editMapNode(data.id, field, value, index);
    };
    return (
        <div
            className={isEnlarged ? "info-panel-enlarge" : "info-panel"}
            key={timeFrame}
        >
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
            {data.wdNode &&
                data.wdNode !== null &&
                data.wdNode !== "null" && (
                    <details open>
                        <summary
                            style={{
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                        >
                            Event Type
                        </summary>
                        {data.wdNode.map((node, index) => (
                            <div key={node}>
                        <EditableText
                            values={data.wdLabel[index]}
                            variant="h3"
                            index={index}
                            onSave={handleOnSave}
                            field="wdLabel"
                        />
                        <EditableText
                            values={data.wdDescription[index]}
                            variant="p"
                            index={index}
                            onSave={handleOnSave}
                            field="wdDescription"
                        />
                            </div>))}
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
                    <TA2TableInfoPanel
                        data={data.participants}
                        parentId={data.id}
                        editMode={editMode}
                    />
                </details>
            )}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "left",
                    gap: "10px",
                }}
            >
                {
                    <button
                        className="anchor-button"
                        onClick={() => {
                            const jsonConvert = new JsonConvert();
                            const newParticipantId =
                                UniqueString.getUniqueStringWithForm(
                                    "resin:Participant/",
                                    "/"
                                );
                            const newEntityId =
                                UniqueString.getUniqueStringWithForm(
                                    "resin:Entity/",
                                    "/"
                                );
                            const newEntity = jsonConvert.deserializeObject(
                                {
                                    "@id": newEntityId,
                                    name: "NewEntity",
                                    description: "",
                                    provenance: [],
                                    ta2wdNode: [],
                                    ta2wdLabel: "",
                                    ta2wdDescription: "",
                                    optional: false,
                                },
                                Entity
                            );
                            Entities.set(newEntityId, newEntity);

                            // console.log("newParticipantId", newParticipantId);
                            const newParticipant =
                                jsonConvert.deserializeObject(
                                    {
                                        "@id": newParticipantId,
                                        roleName: "new Role",
                                        entity: newEntityId,
                                    },
                                    Participant
                                );

                            data.participants.push(newParticipant);
                            editMapNode(
                                data.id,
                                "participants",
                                data.participants
                            );
                            setTimeFrame(Date.now());
                        }}
                    >
                        <h4>
                            <span className="fa fa-plus" />
                            {" Add Participant"}
                        </h4>
                    </button>
                }
                {data.participants && data.participants.length > 0 && (
                    <button
                        className="anchor-button"
                        onClick={() => {
                            setEditMode(!editMode);
                        }}
                    >
                        <h4>
                            <span className="fa fa-edit" />
                            {editMode ? " Close Edit Table" : " Edit Table"}
                        </h4>
                    </button>
                )}
            </div>
            {showEditPanel && (
                <TA2EditEventPanel
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
    const [schemaType] = useContext(SchemaTypeContext);
    if (data === undefined) {
        return <></>;
    }
    return (schemaType === 'ta2'? <TA2EventNodeInfoPanel data={data} onClose={onClose} />: <TA1EventNodeInfoPanel data={data} onClose={onClose} />);
    
}

export const TA2EditEventPanel = ({
    onClose,
    isEnlarged,
    toggleEnlarged,
    parentId,
    existingData,
    subgroupEvents = [],
    grouping = false,
}) => {
    const jsonConvert = new JsonConvert();
    const [getNewIdInEventMap, addEventNode, addNodeOnPanel] = useStore((state) => [
        state.getNewIdInEventMap,
        state.addEventNode,
        state.addNodeOnPanel
    ]);

    const [data, setData] = useState(
        existingData
            ? jsonConvert.serializeObject(existingData)
            : {
                  "@id": getNewIdInEventMap(),
                  ta1ref: "",
                  name: "",
                  description: "",
                  parent: parentId,
                  children_gate: "or",
                  isTopLevel: parentId === "null" ? true : false,
                  subgroup_events: subgroupEvents,
                  outlinks: [],
                  predictionProvenance: [],
                  confidence: 1.0,
                  wd_Node: "",
                  wd_label: "",
                  wd_description: "",
                  provenance: [],
                  participants: [],
                  ta2wd_node: "",
                  ta2wd_label: "",
                  ta2wd_description: "",
                  optional: false,
              }
    );

    useEffect(() => {
        console.log("data", data);
    }, [data]);
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
        if (parentId === "null" && !grouping) {
            addNodeOnPanel(jsonConvert.deserializeObject(data, EventNode));
            onClose();
            return;
        } 
        addEventNode(jsonConvert.deserializeObject(data, EventNode), grouping);
        onClose();
    };
    return (
        <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
            <Modal
                isEnlarged={isEnlarged}
                toggleEnlarged={toggleEnlarged}
                handleClick={onClose}
            />
            {grouping? <h2>New Grouping Node</h2> :existingData ? <h2>Edit Event</h2> : <h2>Add A New Event</h2>}
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
                    <label>Children Gate:</label>
                    <select
                        name="childrenGate"
                        value={data.childrenGate}
                        onChange={handleChange}

                    >
                        <option value="or">OR</option>
                        <option value="and">AND</option>
                        <option value="xor">XOR</option>
                        <option value={null}>NONE</option>
                    </select>
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
                    <label>Confidence</label>
                    <br />
                    <Slider
                        name="confidence"
                        value={data.confidence}
                        min={0}
                        max={1}
                        step={0.01}
                        style={{
                            width: "98%",
                            marginLeft: "1%",
                            color: "black",
                        }}
                        valueLabelDisplay="on"
                        onChange={(event, value) => {
                            // console.log("value", value);
                            setData({
                                ...data,
                                confidence: value,
                            });
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Node:</label>
                    <input type="text" name="wdNode" onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>WikiData Label:</label>
                    <input
                        type="text"
                        name="wdLabel"
                        value={data.wdLabel}
                        onChange={handleArrayChange}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Description:</label>
                    <input
                        type="text"
                        name="wdDescription"
                        value={data.wdDescription}
                        onChange={handleArrayChange}
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
                <div
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "3px solid red",
                        borderRadius: "5px",
                        padding: "5px",
                    }}
                >
                    <button type="submit">
                        {existingData ? "Save Changes" : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export const TA1EditEventPanel = ({
    onClose,
    isEnlarged,
    toggleEnlarged,
    parentId,
    existingData,
    subgroupEvents = [],
    grouping = false,
}) => {
    const jsonConvert = new JsonConvert();
    const [getNewIdInEventMap, addEventNode, addNodeOnPanel] = useStoreTA1((state) => [
        state.getNewIdInEventMap,
        state.addEventNode,
        state.addNodeOnPanel
    ]);

    const [data, setData] = useState(
        existingData
            ? jsonConvert.serializeObject(existingData)
            : {
                  "@id": getNewIdInEventMap(),
                  name: "",
                  description: "",
                  children_gate: "or",
                  subgroup_events: subgroupEvents,
                  outlinks: [],
                  wd_Node: "",
                  wd_label: "",
                  wd_description: "",
                  participants: [],
                  relations: [],
                  importance: 1,
                  likelihood: 1,
                  optional: false,
              }
    );

    useEffect(() => {
        console.log("data", data);
    }, [data]);
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
        // console.log(data);
        if (parentId === "null" && !grouping) {
            addNodeOnPanel(jsonConvert.deserializeObject(data, EventNode));
            onClose();
            return;
        } 
        addEventNode(jsonConvert.deserializeObject(data, EventNode), grouping);
        onClose();
    };
    return (
        <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
            <Modal
                isEnlarged={isEnlarged}
                toggleEnlarged={toggleEnlarged}
                handleClick={onClose}
            />
            {grouping? <h2>New Grouping Node</h2> :existingData ? <h2>Edit Event</h2> : <h2>Add A New Event</h2>}
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
                    <label>Description:</label>
                    <textarea
                        name="description"
                        cdkTextareaAutosize
                        value={data.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Children Gate:</label>
                    <select
                        name="childrenGate"
                        value={data.childrenGate}
                        onChange={handleChange}

                    >
                        <option value="or">OR</option>
                        <option value="and">AND</option>
                        <option value="xor">XOR</option>
                        <option value={null}>NONE</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Children (comma separated):</label>
                    <textarea
                        name="children"
                        cdkTextareaAutosize
                        value={data.children}
                        onChange={handleArrayChange}
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
                    <label>Importance</label>
                    <br />
                    <Slider
                        name="importance"
                        value={data.importance}
                        min={0}
                        max={1}
                        step={0.01}
                        style={{
                            width: "98%",
                            marginLeft: "1%",
                            color: "black",
                        }}
                        valueLabelDisplay="on"
                        onChange={(event, value) => {
                            // console.log("value", value);
                            setData({
                                ...data,
                                confidence: value,
                            });
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>Likelihood</label>
                    <br />
                    <Slider
                        name="likelihood"
                        value={data.importance}
                        min={0}
                        max={1}
                        step={0.01}
                        style={{
                            width: "98%",
                            marginLeft: "1%",
                            color: "black",
                        }}
                        valueLabelDisplay="on"
                        onChange={(event, value) => {
                            // console.log("value", value);
                            setData({
                                ...data,
                                confidence: value,
                            });
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Node:</label>
                    <input type="text" name="wdNode" onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>WikiData Label:</label>
                    <input
                        type="text"
                        name="wdLabel"
                        value={data.wdLabel}
                        onChange={handleArrayChange}
                    />
                </div>
                <div className="form-group">
                    <label>WikiData Description:</label>
                    <input
                        type="text"
                        name="wdDescription"
                        value={data.wdDescription}
                        onChange={handleArrayChange}
                    />
                </div>
                <div
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "3px solid red",
                        borderRadius: "5px",
                        padding: "5px",
                    }}
                >
                    <button type="submit">
                        {existingData ? "Save Changes" : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};
