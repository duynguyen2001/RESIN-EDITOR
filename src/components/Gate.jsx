import React from "react";
import { Handle } from "reactflow";
import { AndGate, OrGate, XorGate } from "./Gates.jsx";

function Gate({ data, isConnectable = true, label }) {
    console.log("gate data: ", data);
    return (
        <div
            style={{
                background: "blue",
            }}
        >
            
                {label}
            <div
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    left: "calc(50% - 60px)",
                    top: "-115px",
                    background: "transparent",
                }}
            > 
                
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

                
               
            </div>
           
        </div>
    );
}

export default Gate;
