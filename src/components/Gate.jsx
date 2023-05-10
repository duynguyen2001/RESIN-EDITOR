import React from "react";
import { Handle } from "reactflow";
import xorGate from "../assets/gates/xor.svg"

function Gate({ data, isConnectable = true }) {
  console.log("Gate data: ", data);
    return (
        <div
            style={{
                background: "lightgray",
                padding: "10px",
                borderRadius: "5px solid black",
            }}
        >
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          
          }}><Handle
                type="target"
                position="top"
                style={{ background: "#555", borderRadius: "50%" }}
                onConnect={(params) => console.log("handle onConnect", params)}
                isConnectable={false}
            />
            <img src={xorGate} alt="xor gate" />
            <Handle
                type="source"
                position="bottom"
                id="a"
                style={{ background: "#555", borderRadius: "50%" }}
                isConnectable={isConnectable}
                onConnect={(params) => console.log("handle onConnect", params)}
            />
            </div>

          <strong>{data.type}</strong>
            
        </div>
    );
}

export default Gate;
