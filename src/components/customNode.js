import React, { memo } from "react";
import useStore from "../pages/storeTA1";
import "./EventGraphNode.css";

export const CustomNode = ({ id, data, isConnectable, onHover }) => {
    const newId = data && data.isEntity === true? id.substring(0, id.indexOf('-')):id
    console.log("newId", newId)
    const node = useStore((state) => state.getNodeById)(newId);
    if (!node) {
        return null;
    }
    console.log("nodedata", data);
    return (
        <div className="eventnode">
            {node.render(isConnectable)}
            {/* {data &&data.isEntity === true && (<h3>{data.roleName}</h3>)} */}
        </div>
    );
};

export default memo(CustomNode);
