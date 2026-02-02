import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Bell,
  User,
  LogOut,
  Calendar,
  Clock,
  Filter,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import api from "../api/axios";

export default function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
  });

  // Read user info from localStorage (set during login / register)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.name || storedUser.email?.split("@")[0] || "User";
  const userEmail = storedUser.email || "";

  // ── Fetch all tasks (token-scoped, no userId needed) ──
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Stats (derived, no extra state needed) ──
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "DONE").length,
    pending: tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length,
  };

  // ── Filtered tasks (derived) ──
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.status === "DONE") ||
      (filterStatus === "pending" && (task.status === "TODO" || task.status === "IN_PROGRESS"));

    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // ── Create task ──
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // dueDate is "" when empty — send null so backend doesn't choke
      const payload = {
        ...newTask,
        dueDate: newTask.dueDate || null,
      };
      await api.post("/api/tasks", payload);
      setNewTask({ title: "", description: "", priority: "MEDIUM", status: "TODO", dueDate: "" });
      setShowNewTaskModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to create task", err);
      alert(err.response?.data || "Failed to create task");
    }
  };

  // ── Toggle task status (uses PUT /api/tasks/{id}) ──
  const handleToggleTask = async (task) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await api.put(`/api/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate || null,
      });
      // Optimistic update — flip locally, no need to re-fetch
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task", err);
      fetchTasks(); // revert on error
    }
  };

  // ── Delete task ──
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId)); // optimistic remove
    } catch (err) {
      console.error("Failed to delete task", err);
      fetchTasks();
    }
  };

  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout(); // tells App.jsx to flip isAuthenticated → false
  };

  // ── Helpers ──
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ══ HEADER ══ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Search */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold text-slate-800 hidden sm:block">TaskFlow</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-80">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                {showMobileMenu ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>

              <button
                onClick={() => setShowNewTaskModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> New Task
              </button>

              <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>

              {/* User dropdown */}
              <div className="relative">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{userEmail}</p>
                    </div>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="md:hidden pb-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 mb-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={() => setShowNewTaskModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {userName}! 👋</h1>
          <p className="text-slate-500">Here's what's happening with your tasks today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {[
            { label: "Total", value: stats.total, sub: "All tasks", icon: <CheckSquare className="w-5 h-5 text-blue-600" />, bg: "bg-blue-100" },
            { label: "Done", value: stats.completed, sub: "Completed", icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: "bg-green-100" },
            { label: "Pending", value: stats.pending, sub: "In progress", icon: <Clock className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-100" },
            { label: "Overdue", value: stats.overdue, sub: "Need attention", icon: <AlertCircle className="w-5 h-5 text-red-600" />, bg: "bg-red-100" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 mr-1">Filter:</span>
            {["all", "pending", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Your Tasks <span className="text-slate-400 font-normal">({filteredTasks.length})</span></h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No tasks found</h3>
              <p className="text-sm text-slate-500 mb-4">{searchQuery ? "Try adjusting your search" : "Create your first task to get started"}</p>
              <button onClick={() => setShowNewTaskModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <div key={task.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group flex items-start gap-3.5">
                  {/* Toggle checkbox */}
                  <button onClick={() => handleToggleTask(task)} className="mt-0.5 flex-shrink-0">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500 transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${task.status === "DONE" ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>}

                    <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                      {/* Priority badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {/* Status badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === "DONE" ? "bg-green-100 text-green-700" :
                        task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {task.status.replace("_", " ")}
                      </span>
                      {/* Due date */}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-red-500 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ══ NEW TASK MODAL ══ */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
              <button onClick={() => setShowNewTaskModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Add details (optional)"
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewTaskModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}