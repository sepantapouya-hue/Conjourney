import { memo, useEffect, useRef, useState } from "react";
import { getIdentity, initials } from "../lib/presence";

function fmtRelTime(at) {
  if (!at) return "";
  const diff = Date.now() - at;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const d = new Date(at);
  return d.toLocaleDateString();
}

function CommentNode({ id, data, selected }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const replyRef = useRef(null);

  const thread = data.thread || [];
  const resolved = !!data.resolved;
  const author = thread[0]?.author || data.creator || {
    name: "Anon",
    color: "#94a3b8",
  };

  // Auto-open the popover the instant the comment is created and is empty.
  useEffect(() => {
    if (thread.length === 0) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && replyRef.current) replyRef.current.focus();
  }, [open]);

  function submitReply() {
    const text = reply.trim();
    if (!text) return;
    const me = getIdentity();
    const next = [...thread, { author: me, text, at: Date.now() }];
    data.onChange?.(id, { thread: next });
    setReply("");
  }

  function toggleResolved() {
    data.onChange?.(id, { resolved: !resolved });
  }

  function deleteThread() {
    if (window.confirm("Delete this entire comment thread?")) {
      data.onDelete?.(id);
    }
  }

  return (
    <div
      className={`comment-node ${resolved ? "resolved" : ""} ${open ? "open" : ""} ${
        selected ? "selected" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="comment-pin"
        style={{ background: author.color || "#7d71fe" }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title={
          resolved
            ? "Resolved — click to view thread"
            : `${thread.length} message${thread.length === 1 ? "" : "s"}`
        }
      >
        <span className="comment-pin-initials">{initials(author.name)}</span>
        {thread.length > 1 && (
          <span className="comment-pin-badge">{thread.length}</span>
        )}
        {resolved && <span className="comment-pin-check">✓</span>}
      </button>

      {open && (
        <div className="comment-panel">
          <div className="comment-head">
            <span className="comment-head-label">
              {resolved ? "Resolved thread" : "Comment thread"}
            </span>
            <div className="comment-head-actions">
              <button
                type="button"
                className="comment-icon-btn"
                onClick={toggleResolved}
                title={resolved ? "Reopen" : "Resolve"}
              >
                {resolved ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 4-7" /><path d="M3 5v7h7" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                )}
              </button>
              <button
                type="button"
                className="comment-icon-btn"
                onClick={deleteThread}
                title="Delete thread"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
              </button>
              <button
                type="button"
                className="comment-icon-btn"
                onClick={() => setOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="comment-thread">
            {thread.length === 0 && (
              <div className="comment-empty">Start the conversation…</div>
            )}
            {thread.map((msg, i) => (
              <div key={i} className="comment-msg">
                <div className="comment-msg-head">
                  <span
                    className="comment-avatar"
                    style={{ background: msg.author?.color || "#94a3b8" }}
                  >
                    {initials(msg.author?.name || "?")}
                  </span>
                  <span className="comment-name">
                    {msg.author?.name || "Anon"}
                  </span>
                  <span className="comment-time">{fmtRelTime(msg.at)}</span>
                </div>
                <div className="comment-text">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="comment-reply">
            <textarea
              ref={replyRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  submitReply();
                }
              }}
              placeholder={
                thread.length === 0 ? "Write a comment…" : "Reply…"
              }
              rows={2}
            />
            <button
              type="button"
              className="comment-send"
              onClick={submitReply}
              disabled={!reply.trim()}
            >
              {thread.length === 0 ? "Post" : "Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CommentNode);
