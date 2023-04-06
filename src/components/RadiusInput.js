import React from "react";

function RadiusInput({ value, onChange }) {
    return (
        <label>
            Circle Radius:
            <input type="number" value={value} onChange={onChange} />
        </label>
    );
}

export default RadiusInput;
