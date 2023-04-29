// EditableText.js
import React, { useState } from "react";
import "./EditableText.css";

const EditableText = (props) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [value, setValue] = useState(props.value);
  const textStyle = props.variant === "h2" ? "text-style-h2" : "text-style-h3";

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    setIsEditMode(false);
    props.onSave(value, props.field);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="editable-text">
      {!isEditMode && (
        <>
        {props.variant === "h2" && <h2>{value}</h2>}
        {props.variant === "p" && <p>{value}</p>}
          <button
            className="edit-button"
            onClick={handleEditClick}
            style={{ float: "right" }}
          >
            <i className="fa fa-pencil" />
          </button>
        </>
      )}
      {isEditMode && (
        <>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            className={textStyle}
          />
          <button className="save-button" onClick={handleSaveClick}>
            <i className="fa fa-check" />
          </button>
        </>
      )}
    </div>
  );
};

export default EditableText;
