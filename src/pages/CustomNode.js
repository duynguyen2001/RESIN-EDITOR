import React, {  memo } from "react";

export const CustomNode = ({ data , isConnectable, onHover}) => {
  if (data === undefined) {
    return <div>undefined</div>;
  }
    return (
      <div style={{ padding: 10, border: "1px solid black" , minWidth: "fit-content", minHeight: "fit-content"}}>
        {data.render({}, isConnectable, onHover)}
      </div>
    );
  };

  export default memo(CustomNode);