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
import { DataContext, ExtractedTextsContext } from "../pages/DataReader";
import ZipReader from "./ZipReader";
import "../assets/css/Menu.css";
import { DetectedNodeStrategy, PredictedNodeStrategy, SourceOnlyNodeStrategy, NodeRenderingStrategy, EventNode } from "./Library";
import { ReactFlowProvider } from "reactflow";
import { NodeRerenderContext, EdgeStyleContext } from "../pages/Graph";
import CustomNode from "./CustomNode";
import ProvenancePopup from "./ProvenancePopup";

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
                            title="Add JSON"
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
                console.log("parsedJson", parsedJson.rsd_data);
                for (const [_, listValue] of Object.entries(
                    parsedJson.rsd_data
                )) {
                    for (const [key, value] of Object.entries(listValue)) {
                        extractedTexts.set(key, value);
                    }
                }
                setExtractedTexts(extractedTexts);
            }
        };
    };

    useEffect(() => {
        console.log("extractedTexts", extractedTexts);
    }, [extractedTexts]);

    return (
        <div>
            <h2>Upload</h2>
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
    const [jsonData, setJsonData] = useContext(DataContext);

    const downloadJSON = () => {
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(jsonData));
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
    const [nodeRerender, setNodeRerender] = useContext(NodeRerenderContext);
    const [edgeStyle, setEdgeStyle] = useContext(EdgeStyleContext);
    const [colors, setColors] = useState({
        detected: DetectedNodeStrategy.options.color? DetectedNodeStrategy.options.color: "#ff0000",
        sourceOnly: SourceOnlyNodeStrategy.options.color? SourceOnlyNodeStrategy.options.color: "#0000ff",
        predicted: PredictedNodeStrategy.options.color? PredictedNodeStrategy.options.color :"#ffff00",
    });

    const [shapes, setShapes] = useState({
        parentNode: NodeRenderingStrategy.nodeOptions.parentNode? NodeRenderingStrategy.nodeOptions.parentNode : "diamond",
        leafNode: NodeRenderingStrategy.nodeOptions.leafNode? NodeRenderingStrategy.nodeOptions.leafNode : "circle",
    });

    const handleColorChange = (color, key) => {
        setColors({ ...colors, [key]: color });   
        console.log("colorchanged", colors)
        if (key === "detected") {
            DetectedNodeStrategy.options = {
                ...DetectedNodeStrategy.options,
                color: color
            }
            console.log(new DetectedNodeStrategy())
        } else if (key === "sourceOnly") {
            SourceOnlyNodeStrategy.options = {
                ...SourceOnlyNodeStrategy.options,
                color: color
            }
            console.log(new SourceOnlyNodeStrategy())
        } else if (key === "predicted") {
            PredictedNodeStrategy.options = {
                ...PredictedNodeStrategy.options,
                color: color
            }
            console.log(new PredictedNodeStrategy())
        }
        setNodeRerender((nodeRerender + 1)%2); 
    };

    const handleShapeChange = (e, key) => {
        setShapes({ ...shapes, [key]: e.target.value });
        NodeRenderingStrategy.nodeOptions = {
            ...NodeRenderingStrategy.nodeOptions,
            [key]: e.target.value,
        }
        setNodeRerender((nodeRerender + 1)% 2); 
    };

    const handleEdgeStyleChange = (e, childrenGate, key) => {
        const newEdgeStyle = {...edgeStyle,
            [childrenGate]: {
                ...edgeStyle[childrenGate],
                style: {
            ...edgeStyle[childrenGate].style,
            [key]: e.target.value
            }
        }
            };
            console.log("newEdgeStyle", newEdgeStyle)
        setEdgeStyle(newEdgeStyle);
    };
    const handleEdgeLabelChange = (e, childrenGate, index) => {
        const newEdgeStyle = {...edgeStyle, [childrenGate]:{...edgeStyle[childrenGate],label: e.target.value}};
        console.log("nnedgeStyle", edgeStyle[childrenGate].style.stroke)
        setEdgeStyle(newEdgeStyle);

    };
    const parentNode = new EventNode(0)
    parentNode.subgroupEvents = ["AAA"]
    console.log("parentNode", parentNode);

    return (
        <div className="legend">
            <h2>Legend</h2>
            <ReactFlowProvider>

            <h3>Colors</h3>
            {Object.entries(colors).map(([key, value]) => (
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
                        onChange={(e) => handleColorChange(e.target.value, key)}
                        key={key} 
                        style={{ marginRight: "10px" }}
                    />
                    <h4>
                        {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                    </h4>
                </div>
            ))}

            <h3>Shapes</h3>
            {Object.entries(shapes).map(([key, value]) => (
                <div key={key}>
                    
                    <h4>{key === "parentNode"? "Chapter Event": "Primitive Event"}</h4>
                    {key === "parentNode"? <CustomNode data={parentNode}/> : <CustomNode data={new EventNode(1)}/>}
                    <select
                        value={value}
                        onChange={(e) => handleShapeChange(e, key)}
                    >
                        <option value="circle">Circle</option>
                        <option value="diamond">Diamond</option>
                        <option value="square">Square</option>
                    </select>
                </div>
            ))}

            <h3>Children Gate</h3>
            {["or", "and", "xor"].map((childrenGate, index) => (
                <div key={index}>
                    <h4>{childrenGate}:</h4>
                    <input
                        type="color"
                        value={edgeStyle[childrenGate].style.stroke}
                        onChange={(e) => handleEdgeStyleChange(e, childrenGate, "stroke")}
                    />
                    <input
                        type="number"
                        value={edgeStyle[childrenGate].style.strokeWidth}
                        onChange={(e) => handleEdgeStyleChange(e, childrenGate, "strokeWidth")}
                    />
                    <input
                        type="text"
                        value={edgeStyle[childrenGate].label}
                        onChange={(e) => handleEdgeLabelChange(e, childrenGate, "label")}
                    />
                </div>
            ))}
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
            {opened && <ProvenancePopup ids={["resin:Provenance/10478/", "resin:Provenance/10469/","resin:Provenance/10477/", ]} onClose={() => setOpen(false)} parentId={parentId}/>}
            </ReactFlowProvider>
        </div>
    );
}

export default Menu;
