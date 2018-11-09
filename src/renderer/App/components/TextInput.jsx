import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';
// import styled from "styled-components";

const TextInput = ({ label, placeholder, name, type }) => (
  <div>
    <div>
      <label>{label}</label>
    </div>
    <div>
      <Field name={name}>
        {({ field }) => (
          <input {...field} placeholder={placeholder} type={type} />
        )}
      </Field>
    </div>
  </div>
);

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string
};
TextInput.defaultProps = {
  type: 'text',
  placeholder: ''
};
export default TextInput;
