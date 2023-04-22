// ProvenanceNode.jsx
import React, { useContext } from "react";
import { Handle } from "reactflow";
import { ExtractedFilesContext } from "../pages/DataReader";
import ImageNode from "./ImageNode";

const ProvenanceNode = ({ data }) => {
    const [extractedFiles, setExtractedFiles] = useContext(
        ExtractedFilesContext
    );
    if (!data) return <></>;
    console.log('extractedFiles: ', extractedFiles);
if(extractedFiles && extractedFiles.size > 0){
    const fileContent = extractedFiles.get(data.childId);
    if (fileContent) {
        if (data.mediaType.startsWith('image/')) {
            return <ImageNode data={data} fileContent={fileContent} />;
        }
    }
}

    return (
        <div className="provenance-node" style={{background:"red", width:"70px", height: "70px"}}>
            <Handle
                type="target"
                position="left"
                style={{ borderRadius: "50%" }}
            />
            <div className="provenance-node-content">
                <h3>{data.childId}</h3>
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

export default ProvenanceNode;
