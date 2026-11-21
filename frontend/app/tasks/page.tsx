"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Pencil,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  taskService,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type PaginationMeta,
  type TaskCreate,
} from "@/services/taskService";

import { userService, type TeamMember } from "@/services/userService";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      setError("");

      const result = await taskService.getTasks({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: (statusFilter || undefined) as TaskStatus | undefined,
        priority: (priorityFilter || undefined) as TaskPriority | undefined,
        assignee_id: (assigneeFilter || undefined) as string | undefined,
      });

      setTasks(result.tasks);
      setMeta(result.meta);
    } catch {
      setError("Unable to retrieve tasks. Please try again.");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [page, search, statusFilter, priorityFilter, assigneeFilter]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const [editFormData, setEditFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    due_date: null,
    assignee_id: null,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [formData, setFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    due_date: null,
    assignee_id: null,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      userService
        .getUsers()
        .then(setTeamMembers)
        .catch(() => {
          setError("Unable to load team members.");
        });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, loadTasks]);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setCreateError("");

      await taskService.createTask(formData);

      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        due_date: null,
        assignee_id: null,
      });

      setIsCreateOpen(false);
      setPage(1);
      await loadTasks();
    } catch {
      setCreateError("Unable to create task. Please check your input.");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditDialog(task: Task) {
    setEditingTaskId(task.id);
    setEditError("");

    setEditFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      assignee_id: task.assignee_id,
    });

    setIsEditOpen(true);
  }

  async function handleUpdateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTaskId) return;

    try {
      setIsSaving(true);
      setEditError("");

      await taskService.updateTask(editingTaskId, editFormData);

      setIsEditOpen(false);
      setEditingTaskId(null);

      await loadTasks();
    } catch {
      setEditError(
        "Unable to update task. Please check your permissions and input.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      await taskService.deleteTask(id);
      await loadTasks();
    } catch {
      setError("Unable to delete task. Please try again.");
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading tasks...</p>
      </div>
    );
  }

  const totalPages = meta?.total_pages ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <ListTodo size={22} />
          </div>
          <span className="text-xl font-bold text-slate-900">TaskFlow</span>
        </div>

        <nav className="mt-12 space-y-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-medium text-blue-700"
          >
            <ListTodo size={19} />
            Tasks
          </button>

          {user.role === "ADMIN" && (
            <button
              type="button"
              onClick={() => router.push("/users")}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
            >
              <Users size={19} />
              Team Members
            </button>
          )}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="absolute bottom-6 left-6 flex items-center gap-3 text-sm font-medium text-slate-500 transition hover:text-red-600"
        >
          <LogOut size={19} />
          Sign out
        </button>
      </aside>

      <main className="p-6 lg:ml-64 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Workspace / Tasks</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Tasks</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage and track your team's work.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Task
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {user.role === "ADMIN" && (
              <select
                value={assigneeFilter}
                onChange={(event) => {
                  setAssigneeFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Assignees</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={loadTasks}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-semibold">Task</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingTasks ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {task.title}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {task.description || "No description"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {task.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </td>

                      <td className="px-4 py-4">
                        {(user.role === "ADMIN" ||
                          task.created_by === user.id ||
                          task.assignee_id === user.id) && (
                          <button
                            onClick={() => openEditDialog(task)}
                            title="Edit task"
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={17} />
                          </button>
                        )}
                        {user.role === "ADMIN" ? (
                          <button
                            onClick={() => handleDelete(task.id)}
                            title="Delete task"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500">
              Total tasks: {meta?.total ?? 0}
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={page <= 1 || isLoadingTasks}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={
                  page >= totalPages || isLoadingTasks || totalPages === 0
                }
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Create New Task
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a task to your team's workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-2xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Task Title *
                  </label>
                  <input
                    required
                    minLength={3}
                    maxLength={200}
                    value={formData.title}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        title: event.target.value,
                      })
                    }
                    placeholder="Enter task title"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description ?? ""}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the task..."
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          status: event.target.value as TaskStatus,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          priority: event.target.value as TaskPriority,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      formData.due_date ? formData.due_date.slice(0, 16) : ""
                    }
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        due_date: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>

                {user.role === "ADMIN" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Assign To
                    </label>
                    <select
                      value={formData.assignee_id ?? ""}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          assignee_id: event.target.value || null,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {createError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {createError}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || formData.title.trim().length < 3}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Edit Task
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update the task details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-2xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Task Title *
                  </label>
                  <input
                    required
                    minLength={3}
                    maxLength={200}
                    value={editFormData.title}
                    onChange={(event) =>
                      setEditFormData({
                        ...editFormData,
                        title: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.description ?? ""}
                    onChange={(event) =>
                      setEditFormData({
                        ...editFormData,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(event) =>
                        setEditFormData({
                          ...editFormData,
                          status: event.target.value as TaskStatus,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Priority
                    </label>
                    <select
                      value={editFormData.priority}
                      onChange={(event) =>
                        setEditFormData({
                          ...editFormData,
                          priority: event.target.value as TaskPriority,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editFormData.due_date
                        ? new Date(editFormData.due_date)
                            .toLocaleString("sv-SE", {
                              timeZone:
                                Intl.DateTimeFormat().resolvedOptions()
                                  .timeZone,
                            })
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(event) =>
                      setEditFormData({
                        ...editFormData,
                        due_date: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>

                {user.role === "ADMIN" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Assign To
                    </label>
                    <select
                      value={editFormData.assignee_id ?? ""}
                      onChange={(event) =>
                        setEditFormData({
                          ...editFormData,
                          assignee_id: event.target.value || null,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {editError}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || editFormData.title.trim().length < 3}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
