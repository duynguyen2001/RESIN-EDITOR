// ProvenanceNode.jsx
import React, { useContext,memo } from "react";
import { Handle, NodeResizer } from "reactflow";
import { ExtractedFilesContext, ProvenanceContext } from "../pages/DataReader";
import ImageNode from "./ImageNode";

const ProvenanceNode = ({ data }) => {
    const [extractedFiles, setExtractedFiles] = useContext(
        ExtractedFilesContext
    );
    if (!data) return <></>;
    console.log("extractedFiles: ", extractedFiles);

    if (extractedFiles.size > 0) {
        const fileContent = extractedFiles.get(data.childID);
        console.log("fileContent: ", fileContent);
        if (fileContent) {
            if (data.mediaType.startsWith("image/")) {
                return (
                    <ImageNode data={data} fileContent={fileContent.content} />
                );
            }
        }
    }

    return (
        <div
            className="provenance-node"
            style={{ background: "red", width: "70px", height: "70px" }}
        >
            <NodeResizer minWidth={100} minHeight={30} />
            <Handle
                type="target"
                position="left"
                style={{ borderRadius: "50%" }}
            />
            <div className="provenance-node-content">
                <h3>{data.childID}</h3>
                <p>{data.parentID}</p>
                <p>{data.mediaType}</p>
            </div>
            <Handle
                type="source"
                position="right"
                style={{ borderRadius: "50%" }}
            />
        </div>
    );
};

export default memo(ProvenanceNode);
