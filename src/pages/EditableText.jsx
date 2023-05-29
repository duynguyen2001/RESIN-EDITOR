// EditableText.js
import React, { useEffect, useState } from "react";
import "./EditableText.css";

const EditableText = ({
    values,
    field,
    onSave,
    variant,
    onClick,
    key,
    onTable = false,
    ...props
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [value, setValue] = useState(values);

    useEffect(() => {
        setValue(values);
    }, [values]);

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleSaveClick = () => {
        setIsEditMode(false);
        onSave(value, field);
    };

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <div className={onTable ? "editable-text-on-table" : "editable-text"}>
            {!isEditMode && (
                <>
                    {variant === "h2" && <h2>{values}</h2>}
                    {variant === "p" && <p>{values}</p>}
                    {variant === "none" && <>{values}</>}
                    {variant === "h3" && <h3>{values}</h3>}
                    {variant === "span" && (
                        <span
                            key={key}
                            className="clickable-text"
                            onClick={() => onClick(key)}
                        >
                            {values}
                        </span>
                    )}
                    <button className="edit-button" onClick={handleEditClick}>
                        <i className="fa fa-pencil" />
                    </button>
                </>
            )}
            {isEditMode && (
                <>
                    <textarea
                        type="text"
                        value={value}
                        onChange={handleChange}
                        className="text-style"
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
