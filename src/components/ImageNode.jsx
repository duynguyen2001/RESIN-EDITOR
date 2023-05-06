// ImageNode.jsx
import React from "react";
import { useState, useEffect, useContext, memo, useRef } from "react";
import { ProvenanceContext } from "../pages/DataReader";
import { Rnd } from "react-rnd";

function ImageWithBox({ data, url, containerWidth = 500 }) {
    
    // Calculate the bounding box dimensions and position
    const [x, y, x_end, y_end] = data.boundingBox;
    const [provenances, setProvenances] = useContext(ProvenanceContext);
    const [scale, setScale] = useState(1);
    const [boundingBoxWidth, setBoundingBoxWidth] = useState(x_end - x);
    const [boundingBoxHeight, setBoundingBoxHeight] = useState(y_end - y);
    const [boundingBoxX, setBoundingBoxX] = useState(x);
    const [boundingBoxY, setBoundingBoxY] = useState(y);
    const [style, setStyle] = useState({
        left: `${boundingBoxX}px`,
        top: `${boundingBoxY}px`,
        width: `${boundingBoxWidth}px`,
        height: `${boundingBoxHeight}px`,
        border: "1px solid red",
        position: "absolute",
    });
    const [editing, setEditing] = useState(false);
    console.log("boundingBox: ", data.boundingBox);
    const onProvenanceUpdate = (newProvenance) => {
        console.log("data: ", newProvenance);
        provenances.set(newProvenance.id, newProvenance);
        setProvenances(provenances);
        console.log("provenances: ", provenances.get(newProvenance.id));
    };

    const handleImageLoad = (event) => {
        const originalWidth = event.target.naturalWidth;
        const originalHeight = event.target.naturalHeight;
        console.log("originalWidth: ", originalWidth);
        console.log("originalHeight: ", originalHeight);
        setScale(containerWidth / originalWidth);
    };

    useEffect(() => {
        console.log("width: ", boundingBoxWidth);
        console.log("height: ", boundingBoxHeight);
        console.log("x: ", boundingBoxX);
        console.log("y: ", boundingBoxY);
    }, [boundingBoxWidth, boundingBoxHeight, boundingBoxX, boundingBoxY]);
    useEffect(() => {
        console.log("scale", scale);
        setBoundingBoxWidth((x_end - x) * scale);
        setBoundingBoxHeight((y_end - y) * scale);
        setBoundingBoxX(x * scale);
        setBoundingBoxY(y * scale);
        setStyle({
            left: `${x * scale}px`,
            top: `${y * scale}px`,
            width: `${(x_end - x) * scale}px`,
            height: `${(y_end - y) * scale}px`,
            border: "1px solid red",
            position: "absolute",
        });
    }, [scale]);
    const handleDrag = (event, { x, y }) => {
        setBoundingBoxX(x);
        setBoundingBoxY(y);
        setStyle({
            ...style,
            left: `${x}px`,
            top: `${y}px`,
        });
        onProvenanceUpdate({
            ...data,
            boundingBox: [x /scale ,y/ scale,(x + boundingBoxWidth) /scale, (y + boundingBoxHeight)  / scale],
        });
    };
    const handleResize = (event, direction, ref, delta, position ) => {
        console.log("handle resize");
        setBoundingBoxHeight(ref.offsetHeight);
        setBoundingBoxWidth(ref.offsetWidth);
        setStyle({
            ...style,
            width: `${ref.offsetWidth}px`,
            height: `${ref.offsetHeight}px`,
        });
        onProvenanceUpdate({
          ...data,
          boundingBox: [x/scale,y/scale,(x + ref.offsetWidth) / scale, (y + ref.offsetHeight)  / scale],
      });
    };
    return (
        <div>
            <div
                style={{
                    position: "relative",
                    width: containerWidth,
                    height: "auto",
                }}
            >
                <img
                    src={url}
                    alt="img"
                    onLoad={handleImageLoad}
                    style={{
                        display: "block",
                        width: containerWidth,
                        background: "blue",
                    }}
                />
                {editing ? (
                    <Rnd
                        style={{
                            border: "1px solid red",
                            background: "#f8f8f8",
                            opacity: 0.3,
                        }}
                        size={{width: boundingBoxWidth, height: boundingBoxHeight}}
                        position={{x: boundingBoxX, y: boundingBoxY}}
                        onDragStop={handleDrag}
                        onResizeStop={handleResize}
                    >
                       
                    </Rnd>
                ) : (
                    <div className="bounding-box" style={style}></div>
                )}
            </div>
            <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
                <button
                    onClick={() => setEditing(!editing)}
                    style={{
                        marginRight: "5px",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        outline: "none",
                        fontSize: "16px",
                        color: editing ? "green" : "blue",
                    }}
                >
                    {editing ? (
                        <i className="fa fa-check" />
                    ) : (
                        <i className="fa fa-pencil" />
                    )}
                </button>
            </div>
        </div>
    );
}

const ImageNode = ({ data, fileContent }) => {
  const divRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (divRef.current) {
        setDivWidth(divRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
    return (
        <div
            className="image-node"
            style={{
                padding: 10,
                background: "white",
                width: "500px",
            }}
            ref={divRef}
        >
            <ImageWithBox data={data} url={fileContent}  containerWidth ={divWidth}/>
            <p>{data.title}</p>
        </div>
    );
};

export default memo(ImageNode);
