import { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlusSquare,
    faDownload,
    faList,
    faCog,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../pages/Panel";
import { DataContext, ExtractedTextsContext, ProvenanceContext, EntitiesContext, EventsContext } from "../pages/DataReader";
import ZipReader from "./ZipReader";
import "../assets/css/Menu.css";
import {
    DetectedNodeStrategy,
    PredictedNodeStrategy,
    SourceOnlyNodeStrategy,
    NodeRenderingStrategy,
    TreeRenderOptions,
    EventNode,
    EventNodeType,
} from "./Library";
import { ConnectionLineType, ReactFlowProvider } from "reactflow";
import {
    NodeRerenderContext,
    EdgeStyleContext,
    EdgeRerenderContext,
    
} from "../pages/Graph";
import EventGraphNode from "./EventGraphNode";
import ProvenancePopup from "./ProvenancePopup";
import { JsonConvert } from "json2typescript";
import useStore from "../pages/store";

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
                            icon={faList}
                            className="menu-item"
                            title="See Legend"
                        />
                    </div>
                    <div onClick={() => setOption("Demo Image Change")}>
                        <FontAwesomeIcon
                            icon={faCog}
                            className="menu-item"
                            title="Demo Image Change"
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
            {option === "Demo Image Change" && <OptionChangePanel />}
        </div>
    );
};

function AddJSONPanel() {
    const [jsonData, setJsonData] = useContext(DataContext);
    const [extractedTexts, setExtractedTexts] = useContext(
        ExtractedTextsContext
    );

    const handleJSONUpload = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            const parsedJson = JSON.parse(e.target.result);
            setJsonData(parsedJson);
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


    return (
        <div>
            <h2>Upload JSON Schema</h2>
            <h3>RESIN TA2 File</h3>
            {jsonData.ceID && <h4>Current File: {jsonData.ceID}</h4>}
            <input type="file" accept=".json" onChange={handleJSONUpload} />
            <h3>Provenance Source Text File</h3>
            {extractedTexts && (
                <h4>Number of Extracted Text: {extractedTexts.size}</h4>
            )}
            <input type="file" accept=".json" onChange={handleParsedTextFile} />
            <h3>Image Zip File</h3>
            <ZipReader />
        </div>
    );
}
function DownloadJSONPanel() {
    const [jsonData] = useContext(DataContext);
    const [EventNodes] = useContext(EventsContext);
    const [Provenances] = useContext(ProvenanceContext);
    const [Entities] = useContext(EntitiesContext);
    const jsonConverter = new JsonConvert();
    const newData = {...jsonData};
    newData.instances[0].events = jsonConverter.serializeArray(EventNodes);
    newData.instances[0].entities = jsonConverter.serializeArray(Array.from(Entities.values()));
    newData.provenanceData = jsonConverter.serializeArray(Array.from(Provenances.values()));
    console.log(newData);
    const downloadJSON = () => {
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(newData, null, "\t"));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div>
            <h2>Download JSON File</h2>
            <button onClick={downloadJSON}>Download JSON</button>
        </div>
    );
}

function SeeLegendPanel() {
    const [edgeRerender, setEdgeRerender] = useContext(EdgeRerenderContext);
    const [edgeStyle, setEdgeStyle] = useContext(EdgeStyleContext);
    const [updateNodeAttribute, updateTreeNodeAttribute] = useStore((state) => [state.updateNodeAttribute, state.updateTreeNodeAttribute]);

    const handleEdgeStyleChange = (value, childrenGate, key) => {
        const newEdgeStyle = {
            ...edgeStyle,
            [childrenGate]: {
                ...edgeStyle[childrenGate],
                style: {
                    ...edgeStyle[childrenGate].style,
                    [key]: value,
                },
            },
        };
        console.log("newEdgeStyle", newEdgeStyle);
        setEdgeStyle(newEdgeStyle);
        setEdgeRerender((edgeRerender + 1) % 2);
    };
    const handleEdgeLabelChange = (value, childrenGate, key) => {
        console.log("change Value", value);
        const newEdgeStyle = {
            ...edgeStyle,
            [childrenGate]: { ...edgeStyle[childrenGate], [key]: value },
        };
        console.log("newEdgeType", edgeStyle[childrenGate].style.stroke);
        setEdgeStyle(newEdgeStyle);
        setEdgeRerender((edgeRerender + 1) % 2);
    };
    const parentNode = new EventNode("newId", null, "Chapter Event");
    parentNode.subgroupEvents = ["AAA"];
    console.log("parentNode", parentNode);

    return (
        <div className="legend">
            <h2>Legend</h2>
            <ReactFlowProvider>
                <h3>Colors</h3>
                {[[EventNodeType.Detected, DetectedNodeStrategy.options.color], [EventNodeType.Predicted, PredictedNodeStrategy.options.color], [EventNodeType.SourceOnly, SourceOnlyNodeStrategy.options.color]].map(([key, value]) => (
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
                                updateNodeAttribute(key, "color", e.target.value)
                            }
                            key={key}
                            style={{ marginRight: "10px" }}
                        />
                        <h4>
                            {key === "detected" ? "Matched Event" : key === "sourceOnly" ? "Source-only Event" : "Predicted Event"}
                        </h4>
                    </div>
                ))}

                <h3>Shapes</h3>
                {[["parentNode", NodeRenderingStrategy.nodeOptions.parentNode], ["leafNode", NodeRenderingStrategy.nodeOptions.leafNode]].map(([key, value]) => (
                    <div key={key}>
                        <h4>
                            {key === "parentNode"
                                ? "Chapter Event"
                                : "Primitive Event"}
                        </h4>
                        {/* {key === "parentNode" ? (
                            <EventGraphNode data={parentNode} />
                        ) : (
                            <EventGraphNode data={new EventNode("aa", null, "Primitive Event")} />
                        )} */}
                        <select
                            value={value}
                            // onChange={(e) => handleShapeChange(e, key)}
                            onChange={(e) => updateTreeNodeAttribute(key, e.target.value)}
                        >
                            <option value="circle">Circle</option>
                            <option value="diamond">Diamond</option>
                            <option value="square">Square</option>
                        </select>
                    </div>
                ))}

                <h3>Edges</h3>
                {/* {["or", "and", "xor", "outlink"].map((childrenGate, index) => (
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
                                                onChange={(e) =>
                                                    handleEdgeStyleChange(
                                                        e.target.value,
                                                        childrenGate,
                                                        "stroke"
                                                    )
                                                }
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
                                                    handleEdgeStyleChange(
                                                        e.target.value,
                                                        childrenGate,
                                                        "strokeWidth"
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
                                                    handleEdgeLabelChange(
                                                        e.target.value,
                                                        childrenGate,
                                                        "label"
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
                                                    handleEdgeLabelChange(
                                                        e.target.value,
                                                        childrenGate,
                                                        "type"
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
                                                    edgeStyle[childrenGate].style.strokeDasharray
                                                }
                                                onChange={(e) =>
                                                    handleEdgeStyleChange(
                                                        e.target.value,
                                                        childrenGate,
                                                        "strokeDasharray"
                                                    )
                                                }
                                            >
                                                <option
                                                    value={
                                                        "none"
                                                    }
                                                >
                                                    Solid
                                                </option>
                                                <option
                                                    value={
                                                        "5,5"
                                                    }
                                                >
                                                    Dashed
                                                </option>
                                                <option
                                                    value={
                                                        "4 1 2 3"
                                                    }
                                                >
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
                                                    handleEdgeLabelChange(
                                                        e.target.checked,
                                                        childrenGate,
                                                        "animated"
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))} */}
            </ReactFlowProvider>
        </div>
    );
}

function OptionChangePanel() {
    const [opened, setOpen] = useState(false);
    const parentId = "resin:Events/10478/";

    return (
        <div>
            <h2>Demo Image Change</h2>
            <ReactFlowProvider>
                <button onClick={() => setOpen(true)}>Open Demo</button>
                {opened && (
                    <ProvenancePopup
                        ids={[
                            "resin:Provenance/10478/",
                            "resin:Provenance/10469/",
                            "resin:Provenance/10477/",
                        ]}
                        onClose={() => setOpen(false)}
                        parentId={parentId}
                    />
                )}
            </ReactFlowProvider>
        </div>
    );
}

export default Menu;
