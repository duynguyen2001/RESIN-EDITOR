// ImageNode.jsx
import React from 'react';
import { Handle, NodeResizer} from 'reactflow';

import { useState, useEffect, useRef, memo } from 'react';

function ImageWithBox({ url, boundingBox, containerWidth }) {
    const [image, setImage] = useState(null);
    const canvasRef = useRef(null);
  
    const scale = containerWidth / image?.width;
    useEffect(() => {
      const img = new Image();
      img.src = url;
      img.onload = () => setImage(img);
    }, []);
  
    useEffect(() => {
      if (image && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(image, 0, 0);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(...boundingBox);
      }
    }, [image]);
  
  
    return (
      <div style={{ 
       }}>
        <canvas ref={canvasRef} 
        width={image?.width } height={image?.height}
        />
      </div>
    );
  }

const ImageNode = ({ data, fileContent, scale =0.5 }) => {


  return (
    <div className="image-node" style={{
        padding:10, background: "white",

        }}>

      <NodeResizer minWidth={100} minHeight={30} />
      <Handle type="target" position="top" style={{ borderRadius: '50%' }} />
      <div className="image-node-content">
        <div style={{
        }}>
            <ImageWithBox url={fileContent} boundingBox={data.boundingBox} containerWidth={300}/>
        </div>
        <p>{data.title}</p>
      </div>
      <Handle type="source" position="right" style={{ borderRadius: '50%' }} />
    </div>
  );
};

export default memo(ImageNode);