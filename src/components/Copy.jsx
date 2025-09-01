import React from "react";
import checkIcon from "../assets/icons/check.png";

export default function Copy({ show, message }) {
  return (
    <div className={`custom-copy${show ? " show" : ""}`}>
      <img src={checkIcon} alt="check" />
      <span>{message}</span>
    </div>
  );
}
