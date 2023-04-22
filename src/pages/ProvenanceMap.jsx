
import React from 'react';
import ReactFlow, { Background, MiniMap } from 'reactflow';
import ProvenanceMapNode from '../components/ProvenanceNode';

const ProvenanceMap = ({ data = [{"provenanceID": "resin:Provenance/10478/",
"childID": "L0C04GJ67",
"parentIDs": "ce2103",
"mediaType": "image/jpg",
x: 0,
y: 0,
"boundingBox": [
  195,
  132,
  697,
  545
]}] }) => {
    const elements = data.map((node) => ({
        id: node.childID,
        data: node,
        type: 'provenanceMapNode',
        position: { x: node.x, y: node.y },
    }));
    
    return (
        <div style={{
            height: "500px",
            width: "100%",
        }}>
        <ReactFlow nodes={elements} nodeTypes={{ provenanceMapNode: ProvenanceMapNode }}>
            <Background variant="dots" gap={12} size={1} />
            <MiniMap />
        </ReactFlow>
        </div>
    );
    };

export default ProvenanceMap;