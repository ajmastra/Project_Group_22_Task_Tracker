import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import LoadingSkeleton from "../common/LoadingSkeleton";

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/comments/task/${taskId}`);
      if (response.data.success) {
        setComments(response.data.data.comments || []);
      }
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter((c) => c.comment_id !== commentId));
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(
      comments.map((c) =>
        c.comment_id === updatedComment.comment_id ? updatedComment : c
      )
    );
  };

  if (loading) {
    return (
      <div className="comment-section">
        <h4 className="comment-section-title">Comments</h4>
        <LoadingSkeleton type="comment" count={3} />
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h4 className="comment-section-title">Comments</h4>
      {error && <div className="comment-section-error">{error}</div>}
      <CommentInput taskId={taskId} onCommentAdded={handleCommentAdded} />
      <CommentList
        comments={comments}
        onCommentDeleted={handleCommentDeleted}
        onCommentUpdated={handleCommentUpdated}
      />
    </div>
  );
}

