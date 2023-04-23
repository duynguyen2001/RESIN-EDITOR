
import React, {useContext, useEffect, memo} from 'react';
import ReactFlow, { Background, MiniMap, useNodesState } from 'reactflow';
import ProvenanceMapNode from '../components/ProvenanceNode';
import { ProvenanceContext } from '../pages/DataReader';
import 'reactflow/dist/style.css';

const ProvenanceMap = ({ ids = ["resin:Provenance/10477/","resin:Provenance/10478/", "resin:Provenance/10479/",
"resin:Provenance/10480/","resin:Provenance/10481/"]}) => {

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [provenance, setProvenance] = useContext(ProvenanceContext);
    useEffect(() => {
        console.log("ProvenanceMap useEffect");
        console.log("provenance: ", provenance);
        const elements = ids.map((id) => {
            const node = provenance.get(id);
            return ({
            id: node.childID,
            data: node,
            type: 'provenanceMapNode',
            position: { x: 0, y: 0 },
            draggable: true,
            selectable: true,
        })});
        setNodes(elements);
    }, [provenance]);
    
    
    
    return (
        <div style={{
            height: "100vh",
            width: "100%",
        }}>
        <ReactFlow nodes={nodes} nodeTypes={{ provenanceMapNode: ProvenanceMapNode }} >
            <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
        </div>
    );
    };

export default memo(ProvenanceMap);