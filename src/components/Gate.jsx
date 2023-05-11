import React from "react";
import { Handle } from "reactflow";
import { AndGate, OrGate, XorGate } from "./Gates.jsx";

function Gate({ data, isConnectable = true }) {
    console.log("Gate data: ", data);
    return (
        <div
            style={{
                background: "transparent",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "fit-content",
                    height: "fit-content",
                    background: "transparent",
                }}
            >
                <Handle
                    type="target"
                    position="top"
                    style={{
                        background: "#555",
                        borderRadius: "50%",
                        top: "50px",
                        left: "55%",
                    }}
                    onConnect={(params) =>
                        console.log("handle onConnect", params)
                    }
                    isConnectable={false}
                />
                {data.gate === "xor" ? (
                    <XorGate
                        color={data.renderStrategy.color}
                        strokeColor="black"
                    />
                ) : data.gate === "and" ? (
                    <AndGate
                        color={data.renderStrategy.color}
                        strokeColor="black"
                    />
                ) : (
                    <OrGate
                        color={data.renderStrategy.color}
                        strokeColor="black"
                    />
                )}

                <Handle
                    type="source"
                    position="bottom"
                    style={{
                        background: "#555",
                        borderRadius: "50%",
                        bottom: "30px",
                        left: "55%",
                    }}
                    isConnectable={isConnectable}
                    onConnect={(params) =>
                        console.log("handle onConnect", params)
                    }
                />
            </div>
        </div>
    );
}

export default Gate;
