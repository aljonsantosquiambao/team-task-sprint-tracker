"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { userService, type TeamMember } from "@/services/userService";

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      setError("");

      const data = await userService.getUsers();
      setMembers(data);
    } catch {
      setError("Unable to load team members.");
    } finally {
      setLoadingMembers(false);
    }
  }, []);


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      return;
    }

    let cancelled = false;

    const loadUsers = async () => {
      await Promise.resolve();

      if (!cancelled) {
        await loadMembers();
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.role, loadMembers]);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return null;
  }

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
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
          >
            <ListTodo size={19} />
            Tasks
          </button>

          <button
            type="button"
            onClick={() => router.push("/users")}
            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 font-medium text-blue-700"
          >
            <Users size={19} />
            Team Members
          </button>
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
            <p className="text-sm text-slate-500">Workspace / Team Members</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Team Members
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View active users in your workspace.
            </p>
          </div>

          <button
            onClick={loadMembers}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Active Members
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {members.length} active users
              </p>
            </div>
            <Users className="text-slate-400" size={24} />
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>

              <tbody>
                {loadingMembers ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Loading team members...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No active team members found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                            <UserRound size={18} />
                          </div>
                          <span className="font-medium text-slate-900">
                            {member.full_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {member.email}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {member.role === "ADMIN" && <ShieldCheck size={13} />}
                          {member.role}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
