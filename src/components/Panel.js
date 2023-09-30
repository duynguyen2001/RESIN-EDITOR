import React, { useContext } from "react";
import { SchemaTypeContext } from "../pages/DataReader";
import "./Panel.css";
import { TA1EventNodeInfoPanel } from "../pages/TA1EventNodeInfoPanel";
import { TA2EventNodeInfoPanel } from "../pages/TA2EventNodeInfoPanel";
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
