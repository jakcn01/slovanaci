import React from 'react';
import PropTypes from 'prop-types';

const DropdownFilter = ({ label, options, selectedValue, onChange }) => {
    return (
        <div className="dropdown-filter">
            <label htmlFor="dropdown" className="dropdown-label">{label}</label>
            <select
                id="dropdown"
                className="dropdown-select"
                value={selectedValue}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

// PropTypes for type checking
DropdownFilter.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    selectedValue: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default DropdownFilter;
