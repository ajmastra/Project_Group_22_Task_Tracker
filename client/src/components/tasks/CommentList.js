import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";

export default function CommentList({ comments, onCommentDeleted, onCommentUpdated }) {
  const { user } = useContext(AuthContext);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const handleEdit = (comment) => {
    setEditingId(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      const response = await axiosInstance.put(`/comments/${commentId}`, {
        content: editContent.trim(),
      });

      if (response.data.success && onCommentUpdated) {
        onCommentUpdated(response.data.data.comment);
        setEditingId(null);
        setEditContent("");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      alert(err?.response?.data?.error || "Failed to update comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setDeletingId(commentId);
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err?.response?.data?.error || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserName = (comment) => {
    const name = `${comment.first_name || ""} ${comment.last_name || ""}`.trim();
    return name || comment.email || "Unknown User";
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="comment-list-empty">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => {
        const isOwner = user?.user_id === comment.user_id;
        const isEditing = editingId === comment.comment_id;

        return (
          <div key={comment.comment_id} className="comment-item">
            <div className="comment-header">
              <div className="comment-author">
                <span className="comment-author-name">{getUserName(comment)}</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              {isOwner && !isEditing && (
                <div className="comment-actions">
                  <button
                    onClick={() => handleEdit(comment)}
                    className="comment-action-button comment-edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.comment_id)}
                    disabled={deletingId === comment.comment_id}
                    className="comment-action-button comment-delete-button"
                  >
                    {deletingId === comment.comment_id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="comment-edit-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="comment-edit-textarea"
                  rows={3}
                  maxLength={2000}
                />
                <div className="comment-edit-actions">
                  <button
                    onClick={() => handleSaveEdit(comment.comment_id)}
                    className="comment-save-button"
                    disabled={!editContent.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="comment-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="comment-content">{comment.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

