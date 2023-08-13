import {
    faBars,
    faDownload,
    faInfoCircle,
    faListSquares,
    faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JsonConvert } from "json2typescript";
import { useContext, useEffect, useState } from "react";
import { ConnectionLineType, ReactFlowProvider } from "reactflow";
import "../assets/css/Menu.css";
import {
    DataContext,
    EntitiesContext,
    ExtractedTextsContext,
    SchemaTypeContext,
    ProvenanceContext,
} from "../pages/DataReader";
import { Modal } from "../pages/Panel";
import useStore from "../pages/store";
import EventGraphNode from "./EventGraphNode";
import {
    DetectedNodeStrategy,
    Entity,
    EventNode,
    EventNodeType,
    NodeRenderingStrategy,
    PredictedNodeStrategy,
    ProvenanceEntity,
    SourceOnlyNodeStrategy,
} from "./Library";
import ToggleButton, { ToggleButtonTA1 } from "./ToggleButton";
import { UniqueString } from "./TypeScriptUtils";
import ZipReader from "./ZipReader";
// import {
//     // convertTA1toTA2format,
//     convertTA2toTA1format,
// } from "./TA1andTA2Conversion";
import useStoreTA1 from "../pages/storeTA1";
import { EntityGraphPanelTA1, TableRow, TableRowTA1 } from "./TableRow";

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [option, setOption] = useState(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <>
            <FontAwesomeIcon
                icon={faBars}
                className="menu-icon"
                onClick={toggleMenu}
                title="Menu"
            />
            {isMenuOpen && (
                <div className="menu-container">
                    <div onClick={() => setOption("Add JSON")}>
                        <FontAwesomeIcon
                            icon={faPlusSquare}
                            className="menu-item"
                            title="Add Schema Data"
                        />
                    </div>

                    <div onClick={() => setOption("Download JSON")}>
                        <FontAwesomeIcon
                            icon={faDownload}
                            className="menu-item"
                            title="Download JSON"
                        />
                    </div>
                    <div onClick={() => setOption("See Legend")}>
                        <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="menu-item"
                            title="See Legend"
                        />
                    </div>
                    <div onClick={() => setOption("Global Entity List")}>
                        <FontAwesomeIcon
                            icon={faListSquares}
                            className="menu-item"
                            title="Global Entity List"
                        />
                    </div>
                </div>
            )}
            {option && (
                <MenuOptionPanel option={option} setOption={setOption} />
            )}
        </>
    );
}
const MenuOptionPanel = ({ option, setOption }) => {
    const closePanel = () => {
        setOption(null);
    };
    const [isEnlarged, setIsEnlarged] = useState(false);
    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };

    return (
        <div
            className={
                isEnlarged ? "menu-option-panel-enlarged" : "menu-option-panel"
            }
        >
            <Modal
                isEnlarged={isEnlarged}
                handleClick={closePanel}
                toggleEnlarged={toggleEnlarged}
            />
            {option === "Add JSON" && <AddJSONPanel />}
            {option === "Download JSON" && <DownloadJSONPanel />}
            {option === "See Legend" && <SeeLegendPanel />}
            {option === "Global Entity List" && <GlobalEntityList />}
        </div>
    );
};

function AddJSONPanel() {
    const [activeTab, setActiveTab] = useState("ta2");
    const [SchemaType, setSchemaType] = useContext(SchemaTypeContext);
    const [jsonData, setJsonData] = useContext(DataContext);
    const [extractedTexts, setExtractedTexts] = useContext(
        ExtractedTextsContext
    );

    const [setChosenNodes, setChosenEntities, setClickedNode] = useStore(
        (state) => [
            state.setChosenNodes,
            state.setChosenEntities,
            state.setClickedNode,
        ]
    );

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleJSONUpload = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        setChosenNodes([]);
        setChosenEntities([]);
        setClickedNode(null);
        UniqueString.reset();
        fileReader.onload = (e) => {
            let parsedJson = JSON.parse(e.target.result);
            if (activeTab === "ta1") {
                // parsedJson = convertTA1toTA2format(parsedJson);
                setSchemaType("ta1");
                setJsonData(parsedJson);
            } else {
                setSchemaType("ta2");
                setJsonData(parsedJson);
            }
        };
    };

    const handleParsedTextFile = (event) => {
        const fileReader = new FileReader();
        const extractedTexts = new Map();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            const parsedJson = JSON.parse(e.target.result);
            if (parsedJson !== undefined && parsedJson.rsd_data !== undefined) {
                for (const [key, value] of Object.entries(
                    parsedJson.rsd_data.en
                )) {
                    extractedTexts.set(key, value);
                }
                setExtractedTexts(extractedTexts);
            }
        };
    };
    useEffect(() => {
        console.log("schemaType", SchemaType);
    }, [SchemaType]);

    return (
        <div>
            <div className="tab-bar">
                <button
                    className={` button-tabbar ${
                        activeTab === "ta1" ? "button-tabbar-active" : ""
                    }`}
                    onClick={() => handleTabClick("ta1")}
                >
                    TA1
                </button>
                <button
                    className={`button-tabbar ${
                        activeTab === "ta2" ? "button-tabbar-active" : ""
                    } `}
                    onClick={() => handleTabClick("ta2")}
                >
                    TA2
                </button>
            </div>
            {activeTab === "ta1" && (
                <>
                    <h2>Upload TA1 Schema</h2>
                    <h3>Upload TA1 Schema File</h3>
                    {jsonData.ceID && <h4>Current File: {jsonData.ceID}</h4>}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleJSONUpload}
                    />
                </>
            )}
            {activeTab === "ta2" && (
                <>
                    <h2>Upload TA2 Schema Matching Results</h2>
                    <h3>TA2 Schema Matching Results</h3>
                    {jsonData.ceID && <h4>Current File: {jsonData.ceID}</h4>}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleJSONUpload}
                    />
                    <h3>Provenance Source Text File</h3>
                    {extractedTexts && (
                        <h4>Number of Extracted Text: {extractedTexts.size}</h4>
                    )}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleParsedTextFile}
                    />
                    <h3>Image Zip File</h3>
                    <ZipReader />
                </>
            )}
        </div>
    );
}
function DownloadJSONPanel() {
    const [jsonData] = useContext(DataContext);
    // const [EventNodes] = useContext(EventsContext);
    const [mapNodes] = useStore((state) => [state.mapNodes]);
    const [Provenances] = useContext(ProvenanceContext);
    const [Entities] = useContext(EntitiesContext);
    const jsonConverter = new JsonConvert();
    const newData = { ...jsonData };
    newData.instances[0].events = jsonConverter.serializeArray(
        Array.from(mapNodes.values()),
        EventNode
    );
    newData.instances[0].entities = jsonConverter.serializeArray(
        Array.from(Entities.values()),
        Entity
    );
    newData.provenanceData = jsonConverter.serializeArray(
        Array.from(Provenances.values())
    );
    console.log("newData", newData);
    const downloadJSON = (mode = "ta2") => {
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(
                JSON.stringify(
                    // mode === "ta1" ? convertTA2toTA1format(newData) : newData,
                    newData,
                    null,
                    "\t"
                )
            );
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div>
            <h2>Download JSON Files</h2>
            <h3>TA2 schema</h3>
            <button onClick={downloadJSON}>Download</button>
            <h3>TA1 schema</h3>
            <button onClick={() => downloadJSON("ta1")}>Download</button>
        </div>
    );
}
const TA1Legend = () => {
    return (
        <div className="legend">
            <h2>Legend</h2>
            <h3>Colors</h3>
            <div className="legend-colors">
                <div className="legend-colors-item">
                    <div className="legend-colors-item-color legend-colors-item-color-event"></div>
                    <div className="legend-colors-item-text">Event</div>
                </div>
                <div className="legend-colors-item">
                    <div className="legend-colors-item-color legend-colors-item-color-entity"></div>
                    <div className="legend-colors-item-text">Entity</div>
                </div>
            </div>
            <h3>Shapes</h3>
            <div className="legend-shapes">
                <div className="legend-shapes-item">
                    <div className="legend-shapes-item-shape legend-shapes-item-shape-rectangle"></div>
                    <div className="legend-shapes-item-text">Rectangle</div>
                </div>
                <div className="legend-shapes-item">
                    <div className="legend-shapes-item-shape legend-shapes-item-shape-circle"></div>
                    <div className="legend-shapes-item-text">Circle</div>
                </div>
            </div>
        </div>
    );
};
const TA2Legend = () => {
    const [
        updateNodeAttribute,
        updateTreeNodeAttribute,
        edgeStyle,
        updateEdgeStyle,
        updateEdgeAttribute,
        refreshGate,
    ] = useStore((state) => [
        state.updateNodeAttribute,
        state.updateTreeNodeAttribute,
        state.edgeStyle,
        state.updateEdgeStyle,
        state.updateEdgeAttribute,
        state.nodeRerender,
        state.refreshGate,
    ]);

    const parentNode = new EventNode("newId", null, "Chapter Event");
    parentNode.subgroupEvents = ["AAA"];

    return (
        <div className="legend">
            <h2>Legend</h2>
            <ReactFlowProvider>
                <h3>Colors</h3>
                {[
                    [
                        EventNodeType.Detected,
                        DetectedNodeStrategy.options.color,
                    ],
                    [
                        EventNodeType.Predicted,
                        PredictedNodeStrategy.options.color,
                    ],
                    [
                        EventNodeType.SourceOnly,
                        SourceOnlyNodeStrategy.options.color,
                    ],
                ].map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="color"
                            value={value}
                            onChange={(e) =>
                                updateNodeAttribute(
                                    key,
                                    "color",
                                    e.target.value
                                )
                            }
                            key={key}
                            style={{ marginRight: "10px" }}
                        />
                        <h4>
                            {key === "detected"
                                ? "Matched Event"
                                : key === "sourceOnly"
                                ? "Source-only Event"
                                : "Predicted Event"}
                        </h4>
                    </div>
                ))}

                <h3>Shapes</h3>
                {[
                    [
                        "parentNode",
                        NodeRenderingStrategy.nodeOptions.parentNode,
                    ],
                    ["leafNode", NodeRenderingStrategy.nodeOptions.leafNode],
                ].map(([key, value]) => (
                    <div key={key}>
                        <h4>
                            {key === "parentNode"
                                ? "Chapter Event"
                                : "Primitive Event"}
                        </h4>
                        {key === "parentNode" ? (
                            <EventGraphNode data={parentNode} id="AA" />
                        ) : (
                            <EventGraphNode
                                data={
                                    new EventNode("aa", null, "Primitive Event")
                                }
                                id="BB"
                            />
                        )}
                        <select
                            value={value}
                            // onChange={(e) => handleShapeChange(e, key)}
                            onChange={(e) =>
                                updateTreeNodeAttribute(key, e.target.value)
                            }
                        >
                            <option value="circle">Circle</option>
                            <option value="diamond">Diamond</option>
                            <option value="square">Square</option>
                        </select>
                    </div>
                ))}

                <h3>Edges</h3>
                {["or", "and", "xor", "outlink"].map((childrenGate, index) => (
                    <div key={index}>
                        <h4>{childrenGate}</h4>
                        <div>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Color</td>
                                        <td>
                                            <input
                                                type="color"
                                                value={
                                                    edgeStyle[childrenGate]
                                                        .style.stroke
                                                }
                                                onChange={(e) => {
                                                    updateEdgeStyle(
                                                        childrenGate,
                                                        {
                                                            stroke: e.target
                                                                .value,
                                                        }
                                                    );
                                                    if (
                                                        edgeStyle[childrenGate]
                                                            .markerEnd
                                                    ) {
                                                        updateEdgeAttribute(
                                                            childrenGate,
                                                            "markerEnd",
                                                            {
                                                                ...edgeStyle[
                                                                    childrenGate
                                                                ].markerEnd,
                                                                color: e.target
                                                                    .value,
                                                            }
                                                        );
                                                    }
                                                    if (
                                                        childrenGate !==
                                                        "outlink"
                                                    ) {
                                                        refreshGate(
                                                            childrenGate
                                                        );
                                                    }
                                                }}
                                                label="color"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stroke Width</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={
                                                    edgeStyle[childrenGate]
                                                        .style.strokeWidth
                                                }
                                                onChange={(e) =>
                                                    updateEdgeStyle(
                                                        childrenGate,
                                                        {
                                                            strokeWidth:
                                                                e.target.value,
                                                        }
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Label</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={
                                                    edgeStyle[childrenGate]
                                                        .label
                                                }
                                                onChange={(e) =>
                                                    updateEdgeAttribute(
                                                        childrenGate,
                                                        "label",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Edge Type</td>
                                        <td>
                                            <select
                                                value={
                                                    edgeStyle[childrenGate].type
                                                }
                                                onChange={(e) =>
                                                    updateEdgeAttribute(
                                                        childrenGate,
                                                        "type",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option
                                                    value={
                                                        ConnectionLineType.Straight
                                                    }
                                                >
                                                    Straight
                                                </option>
                                                <option
                                                    value={
                                                        ConnectionLineType.Bezier
                                                    }
                                                >
                                                    Bezier
                                                </option>
                                                <option
                                                    value={
                                                        ConnectionLineType.SimpleBezier
                                                    }
                                                >
                                                    Simple Bezier
                                                </option>
                                                <option
                                                    value={
                                                        ConnectionLineType.SmoothStep
                                                    }
                                                >
                                                    Smooth Step
                                                </option>
                                                <option
                                                    value={
                                                        ConnectionLineType.Step
                                                    }
                                                >
                                                    Step
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Edge Pattern</td>
                                        <td>
                                            <select
                                                value={
                                                    edgeStyle[childrenGate]
                                                        .style.strokeDasharray
                                                }
                                                onChange={(e) =>
                                                    updateEdgeStyle(
                                                        childrenGate,
                                                        {
                                                            strokeDasharray:
                                                                e.target.value,
                                                        }
                                                    )
                                                }
                                            >
                                                <option value={"none"}>
                                                    Solid
                                                </option>
                                                <option value={"5,5"}>
                                                    Dashed
                                                </option>
                                                <option value={"4 1 2 3"}>
                                                    Uneven Dashed
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Animation</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                value={
                                                    edgeStyle[childrenGate]
                                                        .animated
                                                }
                                                onChange={(e) =>
                                                    updateEdgeAttribute(
                                                        childrenGate,
                                                        "animated",
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </ReactFlowProvider>
        </div>
    );
};
function SeeLegendPanel() {
    const [schemaType] = useContext(SchemaTypeContext);
    if (schemaType === "ta1") {
        return <TA1Legend />;
    }
    if (schemaType === "ta2") {
        return <TA2Legend />;
    }
    return null;
}
const TA1GlobalEntityList = () => {
    const [Entities] = useContext(EntitiesContext);
    const [relatedEntities, chosenEntities] = useStoreTA1((state) => [
        state.entitiesRelatedEventMap,
        state.chosenEntities,
    ]);
    const [EntitiesList, setEntitiesList] = useState([]);
    console.log("relatedEntities", relatedEntities);
    console.log("entities", Entities);
    useEffect(() => {
        const newEntitiesList = [];
        for (const [entityName, events] of relatedEntities) {
            const key = `${entityName}`;
            const entity = Entities.get(entityName);
            if (entity === undefined) {
                continue;
            }
            newEntitiesList.push(
                <ToggleButtonTA1
                    key={key}
                    id={key}
                    name={entity.name}
                    relatedEventsLength={events.length}
                    chosen={chosenEntities.includes(key)}
                />
            );
        }
        setEntitiesList(
            newEntitiesList.length > 0 ? (
                newEntitiesList
            ) : (
                <div>No Entities</div>
            )
        );
    }, [Entities]);

    return (
        <div>
            <div>{EntitiesList}</div>
        </div>
    );
};
const TA2GlobalEntityList = () => {
    const [Entities] = useContext(EntitiesContext);
    const [relatedEntities, chosenEntities] = useStore((state) => [
        state.entitiesRelatedEventMap,
        state.chosenEntities,
    ]);
    const [EntitiesList, setEntitiesList] = useState([]);
    useEffect(() => {
        const newEntitiesList = [];
        for (const [entityName, events] of relatedEntities) {
            const key = `${entityName}`;
            const entity = Entities.get(entityName);
            if (entity === undefined) {
                continue;
            }
            newEntitiesList.push(
                <ToggleButton
                    key={key}
                    id={key}
                    name={entity.name}
                    relatedEventsLength={events.length}
                    chosen={chosenEntities.includes(key)}
                />
            );
        }
        setEntitiesList(
            newEntitiesList.length > 0 ? (
                newEntitiesList
            ) : (
                <div>No Entities</div>
            )
        );
    }, [Entities]);

    return (
        <div>
            <div>{EntitiesList}</div>
        </div>
    );
};

const TA1GlobalEntityTable = () => {
    const [Entities] = useContext(EntitiesContext);
    const [relatedEntities, chosenEntities] = useStoreTA1((state) => [
        state.entitiesRelatedEventMap,
        state.chosenEntities,
    ]);
    const [EntitiesTable, setEntitiesTable] = useState([]);
    useEffect(() => {
        const newEntitiesTable = [];
        for (const [entityName, events] of relatedEntities) {
            const key = `${entityName}`;
            const entity = Entities.get(entityName);
            if (entity === undefined) {
                continue;
            }
            newEntitiesTable.push(
                <TableRowTA1
                    key={key}
                    id={key}
                    name={entity.name}
                    wd_label={entity.wd_label}
                    relatedEvents={events}
                    chosen={chosenEntities.includes(key)}
                />
            );
        }
        setEntitiesTable(
            newEntitiesTable.length > 0 ? (
                newEntitiesTable
            ) : (
                <div>No Entities</div>
            )
        );
    }, [Entities]);

    return (
        <table>
            <tr>
                <th scope="col">Filter</th>
                <th scope="col">Entity Name</th>
                <th scope="col">WikiData Label</th>
                <th scope="col">Entity Id</th>
                <th scope="col">Participate In</th>
            </tr>
            {EntitiesTable}
        </table>
    );
};
const TA2GlobalEntityTable = () => {
    const [Entities] = useContext(EntitiesContext);
    const [relatedEntities, chosenEntities] = useStore((state) => [
        state.entitiesRelatedEventMap,
        state.chosenEntities,
    ]);
    const [EntitiesTable, setEntitiesTable] = useState([]);
    useEffect(() => {
        const newEntitiesTable = [];
        for (const [entityName, events] of relatedEntities) {
            const key = `${entityName}`;
            const entity = Entities.get(entityName);
            if (entity === undefined) {
                continue;
            }
            newEntitiesTable.push(
                <TableRow
                    key={key}
                    id={key}
                    wd_label={entity.wd_label}
                    name={entity.name}
                    relatedEvents={events}
                    chosen={chosenEntities.includes(key)}
                />
            );
        }
        setEntitiesTable(
            newEntitiesTable.length > 0 ? (
                newEntitiesTable
            ) : (
                <div>No Entities</div>
            )
        );
    }, [Entities]);

    return (
        <table>
            <tr>
                <th>Filter</th>
                <th>Entity Name</th>
                <th>WikiData Label</th>
                <th>Entity Id</th>
                <th>Participate In</th>
            </tr>
            {EntitiesTable}
        </table>
    );
};
function GlobalEntityList() {
    const [schemaType] = useContext(SchemaTypeContext);
    console.log("schemaType over here", schemaType);
    const [mode, setMode] = useState("list");
    return (
        <>
            <div className="tab-bar">
                <button
                    className={` button-tabbar ${
                        mode === "list" ? "button-tabbar-active" : ""
                    }`}
                    onClick={() => setMode("list")}
                >
                    List
                </button>
                <button
                    className={`button-tabbar ${
                        mode === "table" ? "button-tabbar-active" : ""
                    } `}
                    onClick={() => setMode("table")}
                >
                    Table
                </button>
                {schemaType === "ta1" && <button
                    className={`button-tabbar ${
                        mode === "graph" ? "button-tabbar-active" : ""
                    } `}
                    onClick={() => setMode("graph")}
                >
                    Graph
                </button>}
            </div>
            {mode === "list" ? (
                <div>
                    <h2>Global Entity List</h2>
                    {schemaType === "ta1" ? (
                        <TA1GlobalEntityList />
                    ) : (
                        <TA2GlobalEntityList />
                    )}
                </div>
            ) : mode === "table" ? (
                <div>
                    <h2>Global Entity Table</h2>
                    {schemaType === "ta1" ? (
                        <TA1GlobalEntityTable />
                    ) : (
                        <TA2GlobalEntityTable />
                    )}
                </div>
            ) : <EntityGraphPanelTA1/>}
        </>
    );
}

export default Menu;
