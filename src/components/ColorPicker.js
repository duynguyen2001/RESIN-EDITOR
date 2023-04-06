import React from 'react';

function ColorPicker({ value, onChange }) {
  return (
    <label>
      Circle Color:
      <input type="color" value={value} onChange={onChange} />
    </label>
  );
}

export default ColorPicker;
