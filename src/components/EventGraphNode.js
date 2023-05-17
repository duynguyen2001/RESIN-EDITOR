import React, { memo } from "react";
import useStore from "../pages/store";
import { EventNode } from "../components/Library";

export const EventGraphNode = ({ id, data, isConnectable, onHover}) => {
    const node = useStore((state) => state.getNodeById)(id);
    if (!node) {
      if (data instanceof EventNode){
        return <div>
            {data.render({}, isConnectable, onHover)}
        </div>;

      }
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
            {node.render({}, isConnectable, onHover)}
        </div>
    );
};

export default memo(EventGraphNode);
