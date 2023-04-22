// ImageNode.jsx
import React from 'react';
import { Handle } from 'reactflow';


const ImageNode = ({ data, fileContent }) => {
  return (
    <div className="image-node">
      {/* <Handle type="target" position="left" style={{ borderRadius: '50%' }} /> */}
      <div className="image-node-content">
        <div>
            <img src={fileContent} alt={data.childId} />
        </div>
        <p>{data.title}</p>
      </div>
      {/* <Handle type="source" position="right" style={{ borderRadius: '50%' }} /> */}
    </div>
  );
};

export default ImageNode;