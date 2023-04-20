import React, { useState } from "react";

export const ExpandableNode = ({ data, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onClick(data.id, !isExpanded);
  };

  return (
    <div onClick={handleClick} style={{ padding: 10, border: "1px solid black" }}>
      {data.label}
      {isExpanded && (
        <div>
          {data.outLinks.map((child) => (
            <div key={child.id} style={{ marginLeft: 20 }}>
              {child.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
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