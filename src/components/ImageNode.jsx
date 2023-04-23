// ImageNode.jsx
import React from 'react';
import { Handle, NodeResizer} from 'reactflow';
import { useMeasure } from 'react-use';
import { useState, useEffect, useRef, memo } from 'react';


function ImageWithBox({ url, boundingBox, containerWidth = 300 }) {
  
  // Calculate the bounding box dimensions and position
  const [x, y, w, h ] = boundingBox;

  const [width, setWidth] = useState(0);
  const [scale, setScale] = useState(1);
  console.log("boundingBox: ", boundingBox);
  
  const style = {
    left: `${scale * x}px`,
    top: `${scale * y}px`,
    width: `${scale * w}px`,
    height: `${scale * h}px`,
    border: "1px solid red",
    position: "absolute",
  };

  const handleImageLoad = (event) => {
    const width = event.target.naturalWidth;
    setWidth(width);
    setScale(containerWidth/width);
  }

  useEffect(() => {
    console.log("url: ", url);
    console.log("boundingBox: ", boundingBox);
    console.log("width: ", width);
  }, [width]);
  useEffect(() => {
    console.log("scale", scale);
  }, [scale]);
    return (
      <div style={{ 
        width: containerWidth,
        height: "fit-content",
        background: "blue",

       }}>
          <img src={url} alt="img" onLoad={handleImageLoad} style={{display: 'block', width: 'auto', height: 'auto', maxWidth: '100%'}}/>
          <div className="bounding-box" style={style}></div>
    </div>
    );
  }

const ImageNode = ({ data, fileContent, scale =0.5 }) => {


  return (
    <div className="image-node" style={{
        padding:10, background: "white",
        width: "fit-content",
        height: "fit-content",
        }}>

      <NodeResizer minWidth={100} minHeight={30} />
      <Handle type="target" position="top" style={{ borderRadius: '50%' }} />
      <div className="image-node-content">
        <div style={{
            width: "fit-content",
            height: "fit-content",
        }}>
            <ImageWithBox url={fileContent} boundingBox={data.boundingBox} />
        </div>
        <p>{data.title}</p>
      </div>
      <Handle type="source" position="right" style={{ borderRadius: '50%' }} />
    </div>
  );
};

export default memo(ImageNode);