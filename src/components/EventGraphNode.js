import React, { memo } from "react";
import useStore from "../pages/store";

export const EventGraphNode = ({ id, data, isConnectable, onHover}) => {
    const getNodeById = useStore((state) => state.getNodeById);
    if (data === undefined) {
        return <div>undefined</div>;
    }

    return (
        <div
            style={{
                padding: 10,
                border: "1px solid black",
                minWidth: "fit-content",
                minHeight: "fit-content",
            }}
        >
            {getNodeById(id).render({}, isConnectable, onHover)}
        </div>
    );
};

export default memo(EventGraphNode);
