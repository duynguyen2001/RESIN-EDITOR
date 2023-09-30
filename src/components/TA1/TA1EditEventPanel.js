import { Slider } from "@mui/material";
import { JsonConvert } from "json2typescript";
import React, { useEffect, useState } from "react";
import { EventNode } from "../TA2/Library";
import useStoreTA1 from "./storeTA1";
import { Modal } from "../CustomizedComponents/Modal/Modal";


export const TA1EditEventPanel = ({
    onClose, isEnlarged, toggleEnlarged, parentId, existingData, subgroupEvents = [], grouping = false,
}) => {
    const jsonConvert = new JsonConvert();
    const [getNewIdInEventMap, addEventNode, addNodeOnPanel] = useStoreTA1(
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
                name: "",
                description: "",
                children_gate: "or",
                subgroup_events: subgroupEvents,
                outlinks: [],
                wd_Node: "",
                wd_label: "",
                wd_description: "",
                participants: [],
                relations: [],
                importance: 1,
                likelihood: 1,
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
        // console.log(data);
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
                    <label>Children (comma separated):</label>
                    <textarea
                        name="children"
                        cdkTextareaAutosize
                        value={data.children}
                        onChange={handleArrayChange} />
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
                    <label>Importance</label>
                    <br />
                    <Slider
                        name="importance"
                        value={data.importance}
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
                    <label>Likelihood</label>
                    <br />
                    <Slider
                        name="likelihood"
                        value={data.importance}
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
