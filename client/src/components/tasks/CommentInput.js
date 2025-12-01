import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function CommentInput({ taskId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/comments/task/${taskId}`, {
        content: content.trim(),
      });

      if (response.data.success) {
        setContent("");
        if (onCommentAdded) {
          onCommentAdded(response.data.data.comment);
        }
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(
        err?.response?.data?.error || "Failed to add comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-input-container">
      <form onSubmit={handleSubmit} className="comment-input-form">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="Add a comment..."
          className="comment-input-textarea"
          rows={3}
          maxLength={2000}
        />
        {error && <div className="comment-error">{error}</div>}
        <div className="comment-input-actions">
          <div className="comment-input-counter">
            {content.length}/2000
          </div>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="comment-submit-button"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}

