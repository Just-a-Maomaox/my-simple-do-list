import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My To-Do List — A little space for your day" },
      { name: "description", content: "A simple, calm To-Do List with a task input and a clear space for your daily tasks." },
      { property: "og:title", content: "My To-Do List" },
      { property: "og:description", content: "A little space for your day. A simple and calm task list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Step one: layout only. Task actions will be added in a later step.
function Index() {
  return (
    <main className="todo-page">
      <div className="todo-layout">
        <header className="todo-header">
          <span>my to-do list</span>
          <span className="status-dot" aria-hidden="true" />
        </header>

        <h1 className="todo-title">My To-Do List</h1>

        <div className="task-entry glass-surface">
          <label htmlFor="task" className="sr-only">Enter a task</label>
          <input id="task" type="text" autoComplete="off" placeholder="Add a task for today" className="task-input" />
          <Button type="button" variant="task" size="task">Add Task</Button>
        </div>

        <section aria-label="Task list" className="task-list glass-surface">
          <ul className="empty-task-list" aria-label="Tasks" />
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="6" y="4" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="1.25" />
                <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </span>
            <p>Your list is clear</p>
            <p className="empty-caption">Nothing added yet.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
