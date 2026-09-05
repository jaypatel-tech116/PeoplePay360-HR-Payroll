import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search employees, departments, or anything..." 
          />
        </div>
      </div>

      <div className="header-right">
        <button className="btn-notification">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile-wrapper">
          <button 
            className="btn-profile" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.name}</span>
              <span className="profile-role">{user.role}</span>
            </div>
            <ChevronDown size={16} className="profile-chevron" />
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-name">{user.name}</p>
                <p className="dropdown-email">{user.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item">Profile Settings</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
