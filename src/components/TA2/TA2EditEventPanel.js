import { Slider } from "@mui/material";
import { JsonConvert } from "json2typescript";
import React, { useEffect, useState } from "react";
import { EventNode } from "./Library";
import useStore from "./store";
import { Modal } from "../CustomizedComponents/Modal/Modal";


export const TA2EditEventPanel = ({
    onClose, isEnlarged, toggleEnlarged, parentId, existingData, subgroupEvents = [], grouping = false,
}) => {
    const jsonConvert = new JsonConvert();
    const [getNewIdInEventMap, addEventNode, addNodeOnPanel] = useStore(
        (state) => [
            state.getNewIdInEventMap,
            state.addEventNode,
            state.addNodeOnPanel,
        ]
    );

    const [data, setData] = useState(
        existingData
            ? jsonConvert.serializeObject(existingData)
            : {
                "@id": getNewIdInEventMap(),
                ta1ref: "",
                name: "",
                description: "",
                parent: parentId,
                children_gate: grouping ? "or" : undefined,
                isTopLevel: parentId === "null",
                subgroup_events: grouping ? subgroupEvents : [],
                outlinks: [],
                predictionProvenance: [],
                confidence: 1,
                wd_Node: "",
                wd_label: "",
                wd_description: "",
                provenance: [],
                participants: [],
                ta2wd_node: "",
                ta2wd_label: "",
                ta2wd_description: "",
                optional: false,
            }
    );

    useEffect(() => {
        console.log("data", data);
    }, [data]);
    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleArrayChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
                .split(",")
                .map((item) => item.trim()),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (parentId === "null" && !grouping) {
            addNodeOnPanel(jsonConvert.deserializeObject(data, EventNode));
            onClose();
            return;
        }
        addEventNode(jsonConvert.deserializeObject(data, EventNode), grouping);
        onClose();
    };
    return (
        <div className={isEnlarged ? "info-panel-enlarge" : "info-panel"}>
            <Modal
                isEnlarged={isEnlarged}
                toggleEnlarged={toggleEnlarged}
                handleClick={onClose} />
            {grouping ? (
                <h2>New Grouping Node</h2>
            ) : existingData ? (
                <h2>Edit Event</h2>
            ) : (
                <h2>Add A New Event</h2>
            )}
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Id:</label>
                    <input
                        type="text"
                        name="@id"
                        value={data["@id"]}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Ta1ref:</label>
                    <input
                        type="text"
                        name="ta1ref"
                        value={data.ta1ref}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        cdkTextareaAutosize
                        value={data.description}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Children Gate:</label>
                    <select
                        name="childrenGate"
                        value={data.childrenGate}
                        onChange={handleChange}
                    >
                        <option value="or">OR</option>
                        <option value="and">AND</option>
                        <option value="xor">XOR</option>
                        <option value={null}>NONE</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Subgroup Events (comma separated):</label>
                    <textarea
                        name="subgroupEvents"
                        cdkTextareaAutosize
                        value={data.subgroupEvents}
                        onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>Parent:</label>
                    <input
                        type="text"
                        name="parent"
                        value={data.parent}
                        onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Outlinks (comma separated):</label>
                    <textarea
                        name="outlinks"
                        cdkTextareaAutosize
                        onChange={handleArrayChange}
                        value={data.outlinks} />
                </div>
                <div className="form-group">
                    <label>Prediction Provenance (comma separated):</label>
                    <textarea
                        name="predictionProvenance"
                        cdkTextareaAutosize
                        onChange={handleArrayChange}
                        value={data.predictionProvenance} />
                </div>
                <div className="form-group">
                    <label>Confidence</label>
                    <br />
                    <Slider
                        name="confidence"
                        value={data.confidence}
                        min={0}
                        max={1}
                        step={0.01}
                        style={{
                            width: "98%",
                            marginLeft: "1%",
                            color: "black",
                        }}
                        valueLabelDisplay="on"
                        onChange={(event, value) => {
                            // console.log("value", value);
                            setData({
                                ...data,
                                confidence: value,
                            });
                        }} />
                </div>
                <div className="form-group">
                    <label>WikiData Node:</label>
                    <input
                        type="text"
                        name="wdNode"
                        onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>WikiData Label:</label>
                    <input
                        type="text"
                        name="wdLabel"
                        value={data.wdLabel}
                        onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>WikiData Description:</label>
                    <input
                        type="text"
                        name="wdDescription"
                        value={data.wdDescription}
                        onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>Provenance (comma separated):</label>
                    <textarea
                        name="provenance"
                        cdkTextareaAutosize
                        value={data.provenance}
                        onChange={handleArrayChange} />
                </div>
                <div className="form-group">
                    <label>TA2 WD Node:</label>
                    <input
                        type="text"
                        name="ta2wdNode"
                        value={data.ta2wdNode}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>TA2 WD Label:</label>
                    <input
                        type="text"
                        name="ta2wdLabel"
                        value={data.ta2wdLabel}
                        onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>TA2 WD Description:</label>
                    <input
                        type="text"
                        name="ta2wdDescription"
                        value={data.ta2wdDescription}
                        onChange={handleChange} />
                </div>
                <div
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "3px solid red",
                        borderRadius: "5px",
                        padding: "5px",
                    }}
                >
                    <button type="submit">
                        {existingData ? "Save Changes" : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};
