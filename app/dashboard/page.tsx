"use client";

import { useEffect, useMemo, useState } from "react";
import { CreateFeedback, GetFeedback } from "@/src/lib/feedback";
import { CreateFeedbackPayload, Feedback } from "@/types";

type StatusFilter = Feedback["status"] | "all";
type CategoryFilter = Feedback["category"] | "all";
type SortOption = "newest" | "oldest" | "rating-high" | "rating-low" | "status";

const statusStyles: Record<Feedback["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  reviewed: "bg-sky-50 text-sky-700 ring-sky-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const categoryLabels: Record<Feedback["category"], string> = {
  academics: "Academic",
  infrastructure: "Infrastructure",
  activities: "Activities",
  other: "Other",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function DashboardPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState<CreateFeedbackPayload>({
    subject: "",
    category: "academics",
    rating: 5,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
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

        if (isMounted) {
          setFeedback(data ?? []);
        }
      } catch (caughtError) {
        if (isMounted) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load feedback.";
          setError(message);
          console.error("Feedback fetch failed:", caughtError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
      pending: feedback.filter((item) => item.status === "pending").length,
      resolved: feedback.filter((item) => item.status === "resolved").length,
    }),
    [feedback],
  );

  const visibleFeedback = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const statusOrder: Record<Feedback["status"], number> = {
      pending: 0,
      reviewed: 1,
      resolved: 2,
    };

    return feedback
      .filter((item) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          item.subject.toLowerCase().includes(normalizedSearch) ||
          item.message.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .toSorted((first, second) => {
        if (sortOption === "oldest") {
          return (
            new Date(first.timestamp).getTime() -
            new Date(second.timestamp).getTime()
          );
        }

        if (sortOption === "rating-high") {
          return second.rating - first.rating;
        }

        if (sortOption === "rating-low") {
          return first.rating - second.rating;
        }

        if (sortOption === "status") {
          return statusOrder[first.status] - statusOrder[second.status];
        }

        return (
          new Date(second.timestamp).getTime() -
          new Date(first.timestamp).getTime()
        );
      });
  }, [categoryFilter, feedback, searchQuery, sortOption, statusFilter]);

  async function handleCreateFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsCreating(true);

    try {
      const createdFeedback = await CreateFeedback(formData);
      setFeedback((current) => [createdFeedback, ...current]);
      setFormData({
        subject: "",
        category: "academics",
        rating: 5,
        message: "",
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create feedback.";
      setFormError(message);
      console.error("Feedback creation failed:", caughtError);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3f4] px-6 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8 rounded-lg border border-teal-900/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
              Student Feedback
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Your feedback
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Track submitted feedback, review progress, and see what has been
              resolved.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-700">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">
              {stats.resolved}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateFeedback}
          className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Add feedback
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Share a new note for the team to review.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-800"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                placeholder="Short title"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-800"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    category: event.target.value as Feedback["category"],
                  }))
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-slate-800"
              >
                Rating
              </label>
              <input
                id="rating"
                name="rating"
                type="number"
                min="1"
                max="5"
                required
                value={formData.rating}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    rating: Number(event.target.value),
                  }))
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              />
            </div>
          </div>

          <label
            htmlFor="message"
            className="mt-4 block text-sm font-medium text-slate-800"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            placeholder="Write your feedback"
          />

          {formError ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isCreating}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
          >
            {isCreating ? "Submitting..." : "Submit feedback"}
          </button>
        </form>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Browse feedback
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Showing {visibleFeedback.length} of {feedback.length} items.
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
              className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-slate-800"
              >
                Search
              </label>
              <input
                id="search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                placeholder="Search subject or message"
              />
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-slate-800"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
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
                className="block text-sm font-medium text-slate-800"
              >
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as CategoryFilter)
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              >
                <option value="all">All categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium text-slate-800"
              >
                Sort
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="rating-high">Highest rating</option>
                <option value="rating-low">Lowest rating</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading feedback...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              No feedback yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Submitted feedback will appear here once it is available.
            </p>
          </div>
        ) : visibleFeedback.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              No matching feedback
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Adjust the search, filters, or sort settings to widen the list.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFeedback.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {item.subject}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${statusStyles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-sm font-medium text-slate-700">
                    {item.rating}/5
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {categoryLabels[item.category]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
