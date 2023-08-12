import React, { memo } from "react";
import useStore from "../pages/storeTA1";
import "./EventGraphNode.css";

export const CustomNode = ({ id, data, isConnectable, onHover }) => {
    const node = useStore((state) => state.getNodeById)(id);
    if (!node) {
        return null;
    }
    console.log("nodedata", data);
    return (
        <div className="eventnode">
            {node.render(isConnectable)}
            {data &&data.isEntity === true && (<h3>{data.roleName}</h3>)}
        </div>
    );
};

export default memo(CustomNode);
