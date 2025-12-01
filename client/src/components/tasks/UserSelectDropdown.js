import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function UserSelectDropdown({
  label,
  value,
  onChange,
  placeholder = "Select user...",
  excludeCurrentUser = false,
  currentUserId = null,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users");
        let usersList = response.data.data?.users || response.data.users || [];
        
        // Exclude current user if needed
        if (excludeCurrentUser && currentUserId) {
          usersList = usersList.filter(
            (user) => user.user_id !== currentUserId
          );
        }
        
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [excludeCurrentUser, currentUserId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const selectedUser = users.find((u) => u.user_id === value);

  const handleSelect = (user) => {
    onChange(user ? user.user_id : null);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getDisplayText = () => {
    if (!value || !selectedUser) {
      return placeholder;
    }
    const name = `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim();
    return name || selectedUser.email || "Selected user";
  };

  return (
    <div className="user-select-dropdown" ref={dropdownRef}>
      <label className="form-label">{label}</label>
      <div
        className={`user-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="user-select-text">
          {loading ? "Loading users..." : getDisplayText()}
        </span>
        <span className="user-select-arrow">▼</span>
      </div>
      {isOpen && !loading && (
        <div className="user-select-menu">
          <div className="user-select-search">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-select-search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="user-select-options">
            <div
              className="user-select-option"
              onClick={() => handleSelect(null)}
            >
              <span className="user-select-option-text">Unassigned</span>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="user-select-option user-select-no-results">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className={`user-select-option ${
                    value === user.user_id ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(user)}
                >
                  <div className="user-select-option-content">
                    <div className="user-select-option-name">
                      {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                        "No name"}
                    </div>
                    <div className="user-select-option-email">{user.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

