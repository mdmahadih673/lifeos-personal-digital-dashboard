"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo } from "@/lib/types";
import { TODO_CATEGORIES, TODO_PRIORITIES, getPriorityColor } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const EMPTY: Partial<Todo> = {
  title: "", description: "", priority: "medium", category: "general",
  dueDate: "", reminder: "", isCompleted: false,
};

export default function TodoManager({ onToast }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Todo>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    fetch("/api/todos")
      .then((r) => r.json())
      .then((data) => { setTodos(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.title?.trim()) { onToast("Title required", "error"); return; }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/todos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const data = await res.json();
    if (isEdit) {
      setTodos((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      onToast("Task updated!", "success");
    } else {
      setTodos((prev) => [data, ...prev]);
      onToast("Task added!", "success");
    }
    setShowModal(false);
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("Delete task?")) return;
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
    onToast("Task deleted", "info");
  };

  const toggleComplete = async (todo: Todo) => {
    const updated = { ...todo, isCompleted: !todo.isCompleted };
    await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    if (updated.isCompleted) onToast("Task completed! 🎉", "success");
  };

  const filtered = todos.filter((t) => {
    const mf = filter === "all" ? true : filter === "completed" ? t.isCompleted : filter === "active" ? !t.isCompleted : t.category === filter;
    const pf = priorityFilter === "all" ? true : t.priority === priorityFilter;
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return mf && pf && ms;
  });

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Todo Manager</div>
          <div className="section-subtitle">{completedCount}/{totalCount} completed</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
          + Add Task
        </button>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="skeu-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--silver-600)" }}>Overall Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue-mid)" }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--silver-400)", marginTop: 6 }}>
            {completedCount} of {totalCount} tasks done
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["all", "active", "completed", ...TODO_CATEGORIES].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "active" ? "🔵 Active" : f === "completed" ? "✅ Done" : f}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "high", "medium", "low"].map((p) => (
          <button key={p} className={`tag ${priorityFilter === p ? "active" : ""}`}
            onClick={() => setPriorityFilter(p)}
            style={priorityFilter === p && p !== "all" ? { color: getPriorityColor(p), borderColor: getPriorityColor(p), background: `${getPriorityColor(p)}15` } : {}}>
            {p === "all" ? "All Priority" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input className="skeu-input" style={{ paddingLeft: 38 }} placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">No tasks found</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
            + Add Task
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleComplete(todo)}
              onEdit={() => { setEditing(todo); setIsEdit(true); setShowModal(true); }}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Task" : "Add Task"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="skeu-input" placeholder="Task title..." value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="skeu-input skeu-textarea" placeholder="Task details..." value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="skeu-input skeu-select" value={editing.priority || "medium"} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}>
                    {TODO_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="skeu-input skeu-select" value={editing.category || "general"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {TODO_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="skeu-input" value={editing.dueDate || ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reminder</label>
                  <input type="datetime-local" className="skeu-input" value={editing.reminder || ""} onChange={(e) => setEditing({ ...editing, reminder: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }: {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pColor = getPriorityColor(todo.priority);
  return (
    <div className={`todo-item ${todo.isCompleted ? "completed" : ""}`}>
      {/* Checkbox */}
      <div className={`todo-check ${todo.isCompleted ? "checked" : ""}`} onClick={onToggle}>
        {todo.isCompleted && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14, color: todo.isCompleted ? "var(--silver-400)" : "var(--silver-800)",
          textDecoration: todo.isCompleted ? "line-through" : "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {todo.title}
        </div>
        {todo.description && (
          <div style={{ fontSize: 12, color: "var(--silver-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
            {todo.description}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: pColor, fontWeight: 600 }}>
            ● {todo.priority}
          </span>
          {todo.dueDate && (
            <span style={{ fontSize: 11, color: "var(--silver-400)" }}>
              📅 {new Date(todo.dueDate).toLocaleDateString()}
            </span>
          )}
          {todo.category && todo.category !== "general" && (
            <span className="badge badge-gray" style={{ fontSize: 10 }}>{todo.category}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button className="skeu-btn skeu-btn-sm" onClick={onEdit}>✏️</button>
        <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}
