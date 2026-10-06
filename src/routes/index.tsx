import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My To-Do List — A little space for your day" },
      { name: "description", content: "A simple, calm To-Do List: add, edit, complete and delete your daily tasks." },
      { property: "og:title", content: "My To-Do List" },
      { property: "og:description", content: "A little space for your day. A simple and calm task list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// One task is just an id, its text, and whether it is done.
type Task = {
  id: string;
  text: string;
  done: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todo-list.tasks";

// Read the saved tasks (if any) from the browser's localStorage.
function loadTasks(): Task[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Task[]) : [];
  } catch {
    return [];
  }
}

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const [loaded, setLoaded] = useState(false);

  // On first render, load the tasks saved in localStorage.
  useEffect(() => {
    setTasks(loadTasks());
    setLoaded(true);
  }, []);

  // Save the tasks to localStorage whenever they change
  // (only after loading, so we never overwrite saved tasks with an empty list).
  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    setTasks((current) => [...current, { id: crypto.randomUUID(), text, done: false }]);
    setNewTask("");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditingText(task.text);
  }

  function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    const text = editingText.trim();
    // An empty edit simply cancels, keeping the old text.
    if (text) {
      setTasks((current) =>
        current.map((task) => (task.id === editingId ? { ...task, text } : task))
      );
    }
    setEditingId(null);
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.done));
  }

  // Show only the tasks the current filter asks for.
  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "completed") return task.done;
    return true;
  });

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="todo-page">
      <div className="todo-layout">
        <header className="todo-header">
          <span>my to-do list</span>
          <span className="status-dot" aria-hidden="true" />
        </header>

        <h1 className="todo-title">My To-Do List</h1>

        <form className="task-entry glass-surface" onSubmit={addTask}>
          <label htmlFor="task" className="sr-only">Enter a task</label>
          <input
            id="task"
            type="text"
            autoComplete="off"
            maxLength={120}
            placeholder="Add a task for today"
            className="task-input"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <Button type="submit" variant="task" size="task">Add Task</Button>
        </form>

        <section aria-label="Task list" className="task-list glass-surface">
          <div className="task-toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
              {(["all", "active", "completed"] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={filter === name}
                  className={"filter-tab" + (filter === name ? " is-active" : "")}
                  onClick={() => setFilter(name)}
                >
                  {name[0].toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-symbol" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="6" y="4" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </span>
              <p>{tasks.length === 0 ? "Your list is clear" : "Nothing here in this view"}</p>
              <p className="empty-caption">
                {tasks.length === 0 ? "Nothing added yet." : "Try another filter."}
              </p>
            </div>
          ) : (
            <ul className="task-list-items">
              {visibleTasks.map((task) => (
                <li key={task.id} className={"task-row" + (task.done ? " is-done" : "")}>
                  {editingId === task.id ? (
                    <form className="task-edit" onSubmit={saveEdit}>
                      <input
                        className="task-input"
                        type="text"
                        maxLength={120}
                        value={editingText}
                        autoFocus
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        aria-label="Edit task"
                      />
                      <Button type="submit" variant="task" size="task">Save</Button>
                    </form>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        className="task-check"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        aria-label={"Mark \"" + task.text + "\" as done"}
                      />
                      <span className="task-text">{task.text}</span>
                      <div className="task-actions">
                        <button
                          type="button"
                          className="task-action"
                          onClick={() => startEditing(task)}
                          aria-label={"Edit \"" + task.text + "\""}
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M11.3 2.1a1.4 1.4 0 0 1 2 2L5.6 11.8l-2.7.7.7-2.7 7.7-7.7Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="task-action is-danger"
                          onClick={() => deleteTask(task.id)}
                          aria-label={"Delete \"" + task.text + "\""}
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <footer className="task-footer">
            <span className="task-count">
              {remaining === 1 ? "1 task left" : remaining + " tasks left"}
            </span>
            <button
              type="button"
              className="clear-completed"
              onClick={clearCompleted}
              disabled={tasks.every((task) => !task.done)}
            >
              Clear completed
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
