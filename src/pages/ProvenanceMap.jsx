import React, { useContext, memo } from "react";
import ProvenanceNode from "../components/ProvenanceNode";
import { ProvenanceContext } from "../pages/DataReader";
import "reactflow/dist/style.css";

const ProvenanceMap = ({ ids = [] }) => {
    const [provenance, _] = useContext(ProvenanceContext);

    return (
        <div
            style={{
                height: "80vh",
                width: "100%",
            }}
        >
            {ids.map((id) => (
                <div key={id}>
                    <ProvenanceNode data={provenance.get(id)} />
                </div>
            ))}
        </div>
    );
};

export default memo(ProvenanceMap);
