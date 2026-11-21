
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardSummary } from "@/services/dashboardService";
import { taskService } from "@/services/taskService";
import type { Task } from "@/services/taskService";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState("");

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoadingRecentTasks, setIsLoadingRecentTasks] = useState(true);

  // Redirect unauthenticated users.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load dashboard statistics.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function fetchSummary() {
      try {
        const data = await dashboardService.getSummary();

        if (!cancelled) {
          setSummary(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load dashboard statistics.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSummary(false);
        }
      }
    }

    void fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Load recent tasks.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function fetchRecentTasks() {
      try {
        const result = await taskService.getTasks({
          page: 1,
          limit: 5,
        });

        if (!cancelled) {
          setRecentTasks(result.tasks);
        }
      } catch (error) {
        console.error("Recent Tasks API error:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingRecentTasks(false);
        }
      }
    }

    void fetchRecentTasks();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Retry loading dashboard statistics.
  async function handleRetrySummary() {
    setIsLoadingSummary(true);
    setError("");

    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch {
      setError("Unable to load dashboard statistics.");
    } finally {
      setIsLoadingSummary(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Tasks",
      value: summary?.total_tasks,
      icon: ListTodo,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Completed",
      value: summary?.completed_tasks,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Pending",
      value: summary?.pending_tasks,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Overdue",
      value: summary?.overdue_tasks,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  const statusChartData = [
    {
      name: "To Do",
      value: summary?.status_counts.TODO ?? 0,
      color: "#64748b",
    },
    {
      name: "In Progress",
      value: summary?.status_counts.IN_PROGRESS ?? 0,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: summary?.status_counts.COMPLETED ?? 0,
      color: "#22c55e",
    },
  ];

  const priorityChartData = [
    {
      name: "Low",
      value: summary?.priority_counts.LOW ?? 0,
      color: "#22c55e",
    },
    {
      name: "Medium",
      value: summary?.priority_counts.MEDIUM ?? 0,
      color: "#f59e0b",
    },
    {
      name: "High",
      value: summary?.priority_counts.HIGH ?? 0,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
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
            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-medium text-blue-700"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
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

      {/* Main Content */}
      <main className="p-6 lg:ml-64 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Workspace / Overview</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user.full_name}.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Account role</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {user.role}
            </p>
          </div>
        </header>

        {/* Dashboard Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={handleRetrySummary}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {isLoadingSummary ? "..." : (stat.value ?? "—")}
                </p>
              </div>
            );
          })}
        </section>

        {/* Charts */}
        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* Task Status Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Tasks by Status
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Overview of task progress
            </p>

            <div className="mt-6 h-72">
              {isLoadingSummary ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Task Priority Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Tasks by Priority
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Distribution of task priorities
            </p>

            <div className="mt-6 h-72">
              {isLoadingSummary ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {priorityChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Recent Tasks */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Tasks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your five latest tasks
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/tasks")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all tasks
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingRecentTasks ? (
              <p className="p-6 text-sm text-slate-500">
                Loading recent tasks...
              </p>
            ) : recentTasks.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No tasks available yet.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Task</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {task.title}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {task.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {task.priority}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
