import React from 'react';

const InputField = ({ label, type = 'text', ...props }) => {
  return (
    <div>
      {label && <label>{label}</label>}
      <input type={type} {...props} />
    </div>
  );
};

export default InputField;
