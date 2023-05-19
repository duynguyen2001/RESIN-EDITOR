import React, { memo, useState } from "react";
import useStore from "../pages/store";
import { EventNode } from "../components/Library";
import { NodeToolbar, Position } from "reactflow";
import "./EventGraphNode.css";

export const EventGraphNode = ({ id, data, isConnectable, onHover }) => {
    const node = useStore((state) => state.getNodeById)(id);
    // const [permanentVisible, setPermanentVisible] = useState(false);
    if (!node) {
        if (data instanceof EventNode) {
            return <div>{data.render({}, isConnectable, onHover)}</div>;
        }
    }

    return (
        <div className="eventnode">
            {node.render({}, isConnectable, onHover)}
        </div>
    );
};

export default memo(EventGraphNode);
