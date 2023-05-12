import React, { useEffect, useState, useContext } from "react";
import { useDropzone } from "react-dropzone";
import "./AddSource.css";
import {
    EventsContext,
    ProvenanceContext,
    ExtractedTextsContext,
    ExtractedFilesContext,
    EntitiesContext,
} from "../pages/DataReader";
import { CountContext } from "../pages/newdataIndexes";

import { v4 } from "uuid";
const getListIndex = (list, id) => {
    for (let i = 0; i < list.length; i++) {
        let jsonObject = list[i];
        if (jsonObject.id === id) {
            return i;
        }
    }
};
const AddSource = ({ parentId }) => {
    const [provenances, setProvenances] = useContext(ProvenanceContext);
    const [extractedTexts, setExtractedTexts] = useContext(
        ExtractedTextsContext
    );
    const [extractedFiles, setExtractedFiles] = useContext(
        ExtractedFilesContext
    );
    const [entities, setEntities] = useContext(EntitiesContext);
    const [Events, setEvents] = useContext(EventsContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSubDropdown, setShowSubDropdown] = useState(null);
    const [showTextTable, setShowTextTable] = useState(false);
    const [count, setCount] = useContext(CountContext);
    const [files, setFiles] = useState([]);
    const [images, setImages] = useState([]);

    const [showNewSource, setShowNewSource] = useState(false);
    const [parentNode, setParentNode] = useState(null);
    const [eventIndex, setEventIndex] = useState(null);
    const showAddNewSource = () => {
        setShowNewSource(true);
        setShowDropdown(false);
        setShowSubDropdown(null);
    };
    const showTextSources = () => {
        setShowNewSource(false);
        setShowDropdown(false);
        setShowSubDropdown(null);

        setShowTextTable(true);
    };
    useEffect(() => {
        if (parentId instanceof Array) {
            const index = getListIndex(Events, parentId[0]);
            setEventIndex(index);
            setParentNode(Events[index]);
        } else if (parentId.includes("Events")) {
            const index = getListIndex(Events, parentId);
            setEventIndex(index);
            setParentNode(Events[index]);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: "text/plain",
        onDrop: (acceptedFiles) => {
            acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );
        },
    });
    const addTextProvenance = (key, value) => {
        // Here you can add your provenance
        console.log(`Add provenance for ${key}: ${value}`);
    };

    const handleDropdownClick = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    const handleSubDropdownClick = (type) => {
        setShowSubDropdown(type);
    };

    return (
        <div className="add-source">
            <button className="add-source-btn" onClick={handleDropdownClick}>
                Add Source
            </button>
            {showDropdown && (
                <ul className="dropdown-menu">
                    <li>
                        <button
                            className="dropdown-button"
                            onClick={() => handleSubDropdownClick("text")}
                        >
                            Text Provenance
                        </button>
                        {showSubDropdown === "text" && (
                            <ul className="sub-dropdown-menu">
                                <button className="dropdown-button"
                                 onClick={showTextSources}>
                                    Existing Text Provenance
                                </button>
                                <button
                                    className="dropdown-button"
                                    onClick={showAddNewSource}
                                >
                                    New Text Source
                                </button>
                            </ul>
                        )}
                    </li>
                    <li>
                        <button
                            className="dropdown-button"
                            onClick={() => handleSubDropdownClick("image")}
                        >
                            Image Provenance
                        </button>
                        {showSubDropdown === "image" && (
                            <ul className="sub-dropdown-menu">
                                <button className="dropdown-button">
                                    Existing Image Provenance
                                </button>
                                <button
                                    className="dropdown-button"
                                    onClick={showAddNewSource}
                                >
                                    New Image Source
                                </button>
                            </ul>
                        )}
                    </li>
                </ul>
            )}
            {showTextTable && (
                <table>
                    <tbody>
                        {Object.entries(extractedTexts).map(([key, value]) => (
                            <tr
                                key={key}
                                onClick={() => addTextProvenance(key, value)}
                            >
                                <td>{key}</td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {showNewSource && (
                <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>Drag and drop files here, or click to select files</p>
                </div>
            )}
            {}
        </div>
    );
};

export default AddSource;
