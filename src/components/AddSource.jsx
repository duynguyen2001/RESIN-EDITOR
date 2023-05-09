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

import { v4 } from 'uuid';
const getListIndex = (list, id) => {
    for (let i = 0; i < list.length; i++) {
        let jsonObject = list[i];
        if (jsonObject.id === id) {
            return i;        
        }
      }
    };
const AddSource = ({parentId}) => {
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
    useEffect(() => {
        console.log("parentId: ", parentId);
        if (parentId instanceof Array) {

            const index = getListIndex(Events, parentId[0]);
            setEventIndex(index);
            setParentNode(Events[index]);

        }else if(parentId.includes("Events")) {
            const index = getListIndex(Events, parentId);
            setEventIndex(index);
            setParentNode(Events[index]);
        } 
    }, []);
    useEffect(() => {
        console.log(files);
    }, [files]);
    useEffect(() => {
        console.log(images);
    }, [images]);
    useEffect(
        () => () => {
            // Make sure to revoke the data uris to avoid memory leaks
            files.forEach((file) => URL.revokeObjectURL(file.preview));
        },
        [files]
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept: "text/plain, image/*",
        onDrop: (acceptedFiles) => {
            setFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );

                acceptedFiles
                    .filter((file) => file.type.startsWith("image/"))
                    .map((file) =>{
                        const newId = v4();
                        const newImages = extractedFiles;
                        newImages.set(newId, file);
                        setExtractedFiles(newImages);

    });
}
});
    useEffect(() => {
        console.log("parentNode: ", parentNode);
    }, [parentNode]);
    

    const handleDropdownClick = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
        console.log("showDropdown: ", showDropdown);
        console.log("Provence: ", provenances);
        console.log("Extracted Texts: ", extractedTexts);
        console.log("Extracted Files: ", extractedFiles);
        console.log("Entities: ", entities);
        console.log("parentID: ", parentId);
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
                                <button className="dropdown-button">
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

            {files.length > 0 && (
                <div>
                    <h4>Text Sources</h4>
                    <ul>
                        {files
                            .filter((file) => file.type === "text/plain")
                            .map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                    </ul>
                </div>
            )}

            {images.length > 0 && (
                <div>
                    <h4>Image Sources</h4>
                    <div className="image-gallery">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image.preview}
                                alt="preview"
                                className="thumbnail"
                            />
                        ))}
                    </div>
                </div>
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
