import React, { useContext } from "react";
import { SchemaTypeContext } from "./DataReader";
import "./panel.css";
import { TA1EventNodeInfoPanel } from "./TA1EventNodeInfoPanel";
import { TA2EventNodeInfoPanel } from "./TA2EventNodeInfoPanel";
export function InfoPanel({ data, onClose }) {
    const [schemaType] = useContext(SchemaTypeContext);
    if (data === undefined) {
        return <></>;
    }
    return schemaType === "ta2" ? (
        <TA2EventNodeInfoPanel data={data} onClose={onClose} />
    ) : (
        <TA1EventNodeInfoPanel data={data} onClose={onClose} />
    );
}
