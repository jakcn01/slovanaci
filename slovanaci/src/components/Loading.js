import React from 'react';
import { ClipLoader } from 'react-spinners';
import "../App.css"
const Loading = ({ text = "Načítání dat..." }) => {
  return (
    <div className="loading-container">
      <ClipLoader size={50} color={"#123abc"} loading={true} />
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;
