import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings } from "lucide-react";
import "./user.css"

const UserSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="user-selection-container">
      <h1 className="title-head">Choose Account Type</h1>
      <div className="button-wrapper">
        <button onClick={() => navigate("/login")} className="select-button user-button">
          <User className="icon" />
          <span className="label">User</span>
        </button>

        <button onClick={() => navigate("/adminlog")} className="select-button admin-button">
          <Settings className="icon" />
          <span className="label">Admin</span>
        </button>
      </div>
    </div>
  );
};

export default UserSelection;
