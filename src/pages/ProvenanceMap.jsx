import React, { useContext, useEffect, memo, useRef, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
} from "reactflow";
import ProvenanceMapNode from "../components/ProvenanceNode";
import { ProvenanceContext } from "../pages/DataReader";
import {useResizeDetector} from "react-resize-detector";
import "reactflow/dist/style.css";

const nodeTypes = { provenanceMapNode: ProvenanceMapNode }

const ProvenanceMap = ({
    ids = [],
}) => {
    const { ref, width } = useResizeDetector();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [provenance, setProvenance] = useContext(ProvenanceContext);

    const nodeSpacing = 20;

    function layoutNodesByGrid(nodes, containerWidth) {
      const gridSize = containerWidth / Math.ceil(Math.sqrt(nodes.length));
      return nodes.map((node, index) => {
        const row = Math.floor(index * gridSize / containerWidth);
        const col = index % Math.floor(containerWidth / gridSize);
        const x = col * (gridSize + nodeSpacing);
        const y = row * (gridSize + nodeSpacing);
        return { ...node, position: { x, y } };
      });
    }
    useEffect(() => {
        console.log("ProvenanceMap useEffect");
        console.log("provenance: ", provenance);
        const elements = ids.map((id) => {
            const node = provenance.get(id);
            return {
                id: node.childID,
                data: node,
                type: "provenanceMapNode",
                position: { x: 0, y: 0 },
                width:400,
                draggable: true,
                selectable: true,
            };
        });
        setNodes(elements);
    }, [provenance]);
    useEffect(() => {
        if (width) {
          const newNodes = layoutNodesByGrid(nodes, width);
          setNodes([...newNodes]);
        }
      }, [width, nodes]);

    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                backgroundColor: "#222",
                zIndex:3000,
            }}
            ref={ref}
        >
            <ReactFlow
                nodes={nodes}
                snapToGrid={true}
                snapGrid={[30, 30]}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                
            >
                <Background variant="dots" gap={12} size={1} />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default memo(ProvenanceMap);
