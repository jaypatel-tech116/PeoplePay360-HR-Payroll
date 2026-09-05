import React from "react";
import "./Loader.css";

/**
 * Centered animated loading spinner
 * @param {{ message?: string }} props
 */
const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader-spinner" />
      {message && <p className="loader-text">{message}</p>}
    </div>
  );
};

export default Loader;
