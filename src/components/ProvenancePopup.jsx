import React from "react";
import ProvenanceMap from "../pages/ProvenanceMap";
import { Modal } from "../pages/Panel";

const ProvenancePopup = ({ ids, onClose }) => {
    const [isEnlarged, setIsEnlarged] = React.useState(false);
    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };
    console.log("ids: ", ids);
    return (
        <div
            style={{
                position: "fixed",
                top: "10%",
                left: "10%",
                right: "10%",
                bottom: "10%",
                background: "white",
                opacity:1,
                zIndex: 9000,
                padding: 30,
                border: "2px solid #000",
                shadow: "0 0 10px #000",
            }}
        >
            <div 
            style={{
                background: "#fff",
            }}>
                
           <Modal
                    isEnlarged={isEnlarged}
                    toggleEnlarged={toggleEnlarged}
                    handleClick={onClose}
                />
                <h1>All Sources</h1>
                <ProvenanceMap ids={ids} />
            </div>
        </div>
    );
}

export default ProvenancePopup;