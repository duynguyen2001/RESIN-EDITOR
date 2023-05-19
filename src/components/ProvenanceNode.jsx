// ProvenanceNode.jsx
import React, { useContext,memo } from "react";
import { ExtractedFilesContext, ExtractedTextsContext } from "../pages/DataReader";
import ImageNode from "./ImageNode";
import EditableTextNode from "./TextNode";

const ProvenanceNode = ({ data }) => {
    const [extractedFiles, _] = useContext(
        ExtractedFilesContext
    );

    const [extractedTexts, setExtractedTexts] = useContext(
        ExtractedTextsContext
    );

    if (!data) return <></>;
    console.log("extractedFiles: ", extractedFiles);

    if (extractedFiles.size > 0) {
        const fileContent = extractedFiles.get(data.childID);
        console.log("fileContent: ", fileContent);
        if (fileContent) {
            if (data.mediaType.startsWith("image/")) {
                return (
                    <ImageNode data={data} fileContent={fileContent} />
                );
            } 
        } 
    }

    if (extractedTexts.size > 0) {
        const textContent = extractedTexts.get(data.childID);
        console.log("textContent: ", textContent);
        if (textContent) {
            if (data.mediaType.startsWith("text/")) {
                return (
                    <EditableTextNode data={data} fileContent={textContent} />
                    );
            }
        }
    }

    return (
        <div
            className="provenance-node"
        >
            <div className="provenance-node-content">
                <h3>{data.childID}</h3>
                <p>{data.parentID}</p>
                <p>{data.mediaType}</p>
            </div>
        </div>
    );
};

export default memo(ProvenanceNode);