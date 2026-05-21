"use client";

import { useEffect, useMemo, useState } from "react";
import { GetFeedback, UpdateFeedbackStatus } from "@/src/lib/feedback";
import { Feedback } from "@/types";
import { Star } from "lucide-react";

type StatusFilter = Feedback["status"] | "all";
type CategoryFilter = Feedback["category"] | "all";
type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "status";

const categoryLabels: Record<Feedback["category"], string> = {
  academics: "Academic",
  infrastructure: "Infrastructure",
  activities: "Activities",
  other: "Other",
};

const statusLabels: Record<Feedback["status"], string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

const statusOptions: Feedback["status"][] = ["pending", "reviewed", "resolved"];

const statusBadge: Record<Feedback["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function AdminPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    let isMounted = true;
    async function loadFeedback() {
      try {
        setError("");
        setIsLoading(true);
        const data = await GetFeedback();
        if (isMounted) setFeedback(data ?? []);
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load feedback.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: feedback.length,
      pending: feedback.filter((i) => i.status === "pending").length,
      reviewed: feedback.filter((i) => i.status === "reviewed").length,
      resolved: feedback.filter((i) => i.status === "resolved").length,
    }),
    [feedback],
  );

  const visibleFeedback = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const statusOrder: Record<Feedback["status"], number> = {
      pending: 0,
      reviewed: 1,
      resolved: 2,
    };
    return feedback
      .filter((item) => {
        const matchSearch =
          !q ||
          item.subject.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q);
        return (
          matchSearch &&
          (statusFilter === "all" || item.status === statusFilter) &&
          (categoryFilter === "all" || item.category === categoryFilter)
        );
      })
      .toSorted((a, b) => {
        if (sortOption === "oldest")
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        if (sortOption === "rating-high") return b.rating - a.rating;
        if (sortOption === "rating-low") return a.rating - b.rating;
        if (sortOption === "status")
          return statusOrder[a.status] - statusOrder[b.status];
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
  }, [feedback, searchQuery, statusFilter, categoryFilter, sortOption]);

  async function handleStatusChange(
    feedbackItem: Feedback,
    nextStatus: Feedback["status"],
  ) {
    if (feedbackItem.status === nextStatus) return;
    const previousStatus = feedbackItem.status;
    setActionError("");
    setIsUpdatingId(feedbackItem.id);
    setFeedback((c) =>
      c.map((i) =>
        i.id === feedbackItem.id ? { ...i, status: nextStatus } : i,
      ),
    );
    try {
      const updated = await UpdateFeedbackStatus(feedbackItem.id, nextStatus);
      setFeedback((c) => c.map((i) => (i.id === updated.id ? updated : i)));
    } catch (caughtError) {
      setFeedback((c) =>
        c.map((i) =>
          i.id === feedbackItem.id ? { ...i, status: previousStatus } : i,
        ),
      );
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update feedback status.",
      );
    } finally {
      setIsUpdatingId(null);
    }
  }

  const inputCls =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-300 font-[inherit]";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12 text-slate-950">
      <section className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Admin Console
          </p>
          <h1 className="mb-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
            Manage feedback
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-slate-600">
            Review submissions, filter the queue, and update status as items
            progress through the workflow.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-slate-950" },
            { label: "Pending", value: stats.pending, color: "text-amber-700" },
            { label: "Reviewed", value: stats.reviewed, color: "text-sky-700" },
            {
              label: "Resolved",
              value: stats.resolved,
              color: "text-emerald-700",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7 lg:p-8 shadow-sm hover:shadow-md transition"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </p>
              <p
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-none tracking-tight ${color}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-7 lg:p-8 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Filter queue
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Showing {visibleFeedback.length} of {feedback.length} items
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setSortOption("newest");
              }}
              className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white transition hover:bg-slate-50 active:bg-slate-100"
            >
              Reset filters
            </button>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Search
              </label>
              <input
                id="search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or message..."
                className={inputCls}
              />
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className={inputCls}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as CategoryFilter)
                }
                className={inputCls}
              >
                <option value="all">All categories</option>
                {Object.entries(categoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="mb-2 block text-sm font-semibold text-slate-900"
              >
                Sort
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className={inputCls}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="rating-high">Highest rating</option>
                <option value="rating-low">Lowest rating</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {actionError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-base text-slate-600">Loading feedback...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-base text-red-700">
            {error}
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No feedback yet
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Submitted feedback will appear here once it is available.
            </p>
          </div>
        ) : visibleFeedback.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No matching feedback
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Adjust the filters to widen the list.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {visibleFeedback.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
              >
                <div className="p-5 sm:p-6 lg:p-7">
                  {/* Top Section */}
                  <div className="flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <h3 className="text-[1.05rem] font-bold leading-tight text-slate-950 sm:text-[1.2rem]">
                            {item.subject}
                          </h3>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge[item.status]}`}
                          >
                            {statusLabels[item.status]}
                          </span>
                        </div>

                        <p className="text-[15px] leading-relaxed text-slate-700 sm:text-base">
                          {item.message}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="shrink-0">
                        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                          <Star className="h-4 w-4 fill-current" />
                          {item.rating}/5
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100" />

                    {/* Bottom Section */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-[13px] text-slate-500">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                          {categoryLabels[item.category]}
                        </span>

                        <span className="hidden sm:block text-slate-300">
                          •
                        </span>
                      </div>

                      {/* Status Update */}
                      <div className="w-full sm:w-[220px]">
                        <label
                          htmlFor={`status-${item.id}`}
                          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                        >
                          Update Status
                        </label>

                        <select
                          id={`status-${item.id}`}
                          value={item.status}
                          disabled={isUpdatingId === item.id}
                          onChange={(e) =>
                            handleStatusChange(
                              item,
                              e.target.value as Feedback["status"],
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
