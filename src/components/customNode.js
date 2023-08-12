import React, { memo } from "react";
import useStore from "../pages/storeTA1";
import "./EventGraphNode.css";

export const CustomNode = ({ id, data, isConnectable, onHover }) => {
    const node = useStore((state) => state.getNodeById)(id);
    if (!node) {
        return null;
    }

    return (
        <div className="eventnode">
            {node.render(isConnectable)}
        </div>
    );
};

export default memo(CustomNode);
