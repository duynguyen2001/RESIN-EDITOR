import React, { useState } from "react";
import useStore from "../pages/store";
import "./ToggleButton.css"; // Import the CSS file with the provided styles

const ToggleButton = ({ name, id, relatedEventsLength, chosen = false }) => {
    const [isChecked, setIsChecked] = useState(chosen);
    const [chosenEntities, setChosenEntities] = useStore((state) => [
        state.chosenEntities,
        state.setChosenEntities,
    ]);

    const handleToggle = () => {
        setIsChecked(!isChecked);
        const updatedList = chosenEntities.includes(id)
            ? chosenEntities.filter((item) => item !== id)
            : [...chosenEntities, id];
        setChosenEntities(updatedList);
    };

    return (
        <label
            htmlFor={id}
            className={`toggle-button ${isChecked ? "checked" : ""}`}
        >
            {name.length > 40
                ? `${name.slice(0, 40)}... (${relatedEventsLength})`
                : `${name} (${relatedEventsLength})`}
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={isChecked}
                onChange={handleToggle}
            />
            <span />
        </label>
    );
};

export default ToggleButton;
