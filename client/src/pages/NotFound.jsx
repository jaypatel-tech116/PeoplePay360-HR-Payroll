import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

/**
 * 404 Not Found Page Component
 */
const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-desc">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <Link to="/" className="not-found-btn">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
