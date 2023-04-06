import React, { useRef, useEffect } from "react";
import { select, drag } from "d3";

const Node = ({
    type,
    id,
    name,
    shapeConfig = {},
    isOptional = false,
    isSelected = false,
    position,
    setNodePositions,
    simulationRef,
    vx,
    vy,
    fx,
    fy,
    ...props
}) => {
    const nodeRef = React.useRef();
    // Get the shape
    const getShape = () => {
        switch (type) {
            case "chapter":
                return drawChapter();
            case "event":
                return drawEvent();
            case "entity":
                return drawEntity();
            case "xor-gate":
                return drawXORGate();
            default:
                return null;
        }
    };

    const transform = position ? `translate(${position.x}, ${position.y})` : "";

    // Add other methods here

    const optionalAttrs = isOptional ? { strokeDasharray: "2 2" } : {};
    const selectedAttrs = isSelected ? { fill: "#ADD8E6" } : {};

    // get the color
    const getColor = () => {
        if (type === "chapter") {
            return "#6495ED"; // blue
        } else if (type === "event") {
            return "#FFFF00"; // yellow
        } else if (type === "optional") {
            return "#FFFF00"; // yellow
        } else if (type === "selected") {
            return "#ADD8E6"; // light blue
        } else if (type === "entity") {
            return "#808080"; // gray
        } else if (type === "xor-gate") {
            return "#008000"; // green
        } else {
            return "#FFFFFF"; // white
        }
    };

    // get the stroke width
    const getStrokeWidth = () => {
        if (type === "chapter") {
            return 1;
        } else if (type === "event") {
            return 1;
        } else if (type === "optional") {
            return 1;
        } else if (type === "selected") {
            return 1;
        } else if (type === "entity") {
            return 1;
        } else if (type === "xor-gate") {
            return 3;
        } else {
            return 1;
        }
    };

    // draw the entity
    const drawEvent = () => {
        const color = getColor();
        const strokeWidth = getStrokeWidth();
        return (
            <circle
                cx={0}
                cy={0}
                r={shapeConfig.radius || 10}
                fill={color}
                stroke="black"
                strokeWidth={strokeWidth}
                {...optionalAttrs}
                {...selectedAttrs}
                {...shapeConfig}
            />
        );
    };

    // draw the chapter
    const drawChapter = () => {
        const color = getColor();
        const strokeWidth = getStrokeWidth();
        const width = shapeConfig.width || 30;
        const height = shapeConfig.height || 30;

        const pathData = `
    M 0 ${-height / 2}
    L ${width / 2} 0
    L 0 ${height / 2}
    L ${-width / 2} 0
    Z
  `;

        return (
            <path
                d={pathData}
                fill={color}
                stroke="black"
                strokeWidth={strokeWidth}
                {...optionalAttrs}
                {...selectedAttrs}
                {...shapeConfig}
            />
        );
    };

    // draw the entity
    const drawEntity = () => {
        const color = getColor();
        const strokeWidth = getStrokeWidth();

        return (
            <rect
                x={-shapeConfig.width / 2 || -15}
                y={-shapeConfig.height / 2 || -10}
                fill={color}
                stroke="black"
                strokeWidth={strokeWidth}
                {...optionalAttrs}
                {...selectedAttrs}
                {...{
                    ...shapeConfig,
                    width: shapeConfig.width || 30,
                    height: shapeConfig.height || 20,
                }}
            />
        );
    };

    // draw the XOR gate
    const drawXORGate = () => {
        const color = getColor();
        const strokeWidth = getStrokeWidth();
        const width = shapeConfig.width || 30;
        const height = shapeConfig.height || 20;

        return (
            <rect
                x={-shapeConfig.width / 2 || -15}
                y={-shapeConfig.height / 2 || -10}
                fill={color}
                stroke="black"
                strokeWidth={strokeWidth}
                {...optionalAttrs}
                {...selectedAttrs}
                {...{
                    ...shapeConfig,
                    width: shapeConfig.width || 30,
                    height: shapeConfig.height || 20,
                }}
            />
        );
    };

    // get the dy value for the text element
    const getTextDy = () => {
        let height = 30;
        switch (type) {
            case "chapter":
                height = shapeConfig.height || 30;
                return height / 2 + 10;
            case "event":
                const radius = shapeConfig.radius || 10;
                return radius + 10;
            case "entity":
                height = shapeConfig.height || 20;
                return height / 2 + 10;
            case "xor-gate":
                height = shapeConfig.height || 20;
                return height / 2 + 10;
            default:
                return 10;
        }
    };

    const handleClick = () => {
        console.log("Clicked on node", id);
    };
    const handleDragStart = (event, d) => {
        // Handle drag start
        simulationRef.current.alphaTarget(0.3).restart();
    };

    const handleDrag = (event, d) => {
        // Handle drag
        d.fx = event.x;
        d.fy = event.y;
    };

    const handleDragEnd = (event, d) => {
        // Handle drag end
        d.fx = null;
        d.fy = null;
        simulationRef.current.alphaTarget(0).restart();
    };
    useEffect(() => {
        const node = select(nodeRef.current);

        const dragBehavior = drag()
            .on("start", (event, d) => handleDragStart(event, d))
            .on("drag", (event, d) => handleDrag(event, d))
            .on("end", (event, d) => handleDragEnd(event, d));

        node.call(dragBehavior);
    }, [simulationRef]);

    return (
        <g
            id={id}
            className={`node ${type}`}
            transform={transform}
            {...props}
            ref={nodeRef}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            vx={vx}
            vy={vy}
            fx={fx}
            fy={fy}
            // draggable="true"
        >
            {getShape()}
            <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                dy={getTextDy()}
            >
                {name}
            </text>
        </g>
    );
};
export default Node;
