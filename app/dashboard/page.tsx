"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CreateFeedback,
  GetFeedback,
  UpdateFeedback,
} from "@/src/lib/feedback";
import { CreateFeedbackPayload, Feedback } from "@/types";
import { Plus, X, Star, Pencil, Check, RotateCcw } from "lucide-react";

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

const statusBadge: Record<Feedback["status"], string> = {
  pending: "border border-black/10 bg-zinc-100 text-zinc-700",
  reviewed: "border border-black/10 bg-white text-zinc-700",
  resolved: "border border-black/10 bg-black text-white",
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

const inputCls =
  "h-12 w-full rounded-xl border border-black/10 bg-[#fcfcfb] px-4 text-[15px] text-[#111] outline-none transition placeholder:text-[#8a8a8a] focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 sm:text-base";

const textareaCls =
  "min-h-[152px] w-full resize-none rounded-xl border border-black/10 bg-[#fcfcfb] px-4 py-3.5 text-[15px] text-[#111] outline-none transition placeholder:text-[#8a8a8a] focus:border-black/25 focus:bg-white focus:ring-2 focus:ring-black/5 sm:text-base";

const shellCard =
  "rounded-2xl border border-black/10 bg-white shadow-[0_22px_70px_-55px_rgba(0,0,0,0.45)]";

const fieldLabel =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#666]";

const sectionTitle =
  "text-xl font-semibold tracking-[-0.03em] text-[#111] sm:text-2xl";

const emptyForm: CreateFeedbackPayload = {
  subject: "",
  category: "academics",
  rating: 1,
  message: "",
};

export default function DashboardPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [formData, setFormData] = useState<CreateFeedbackPayload>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] =
    useState<CreateFeedbackPayload>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

  async function handleCreateFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsCreating(true);
    try {
      const payload: CreateFeedbackPayload = {
        ...formData,
        rating: Math.min(5, Math.max(1, Math.round(formData.rating ?? 1))),
      };
      const created = await CreateFeedback(payload);
      setFeedback((c) => [created, ...c]);
      setFormData(emptyForm);
      setShowForm(false);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create feedback.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleEditStart(item: Feedback) {
    setEditingId(item.id);
    setEditFormData({
      subject: item.subject,
      category: item.category,
      rating: item.rating,
      message: item.message,
    });
    setEditError("");
  }

  async function handleEditSave(id: number) {
    setEditError("");
    setIsSaving(true);
    try {
      const payload: CreateFeedbackPayload = {
        ...editFormData,
        rating: Math.min(5, Math.max(1, Math.round(editFormData.rating ?? 1))),
      };
      const updated = await UpdateFeedback(id, payload);
      setFeedback((c) => c.map((i) => (i.id === id ? updated : i)));
      setEditingId(null);
    } catch (caughtError) {
      setEditError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update feedback.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditFormData(emptyForm);
    setEditError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f3ef] text-[#111]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-9rem] h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute bottom-[-7rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-black/[0.035] blur-3xl" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="space-y-6 lg:space-y-8">
          <header
            className={`${shellCard} flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-10`}
          >
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#767676] sm:text-[12px]">
                Student Dashboard
              </p>
              <h1 className="mt-4 text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#111] sm:text-[2.75rem] lg:text-[3rem] xl:text-[3.25rem]">
                Your feedback
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#575757] sm:text-base lg:text-[1.05rem]">
                Track submissions, review progress, and see what has been
                resolved.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm((v) => !v);
                setFormError("");
                setFormData(emptyForm);
              }}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#111] px-5 text-sm font-semibold text-white transition hover:bg-[#222] sm:h-[52px] sm:px-6 sm:text-[15px]"
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  New feedback
                </>
              )}
            </button>
          </header>

          {showForm && (
            <form
              onSubmit={handleCreateFeedback}
              className={`${shellCard} p-6 sm:p-7 lg:p-8`}
            >
              <div className="mb-7">
                <h2 className={sectionTitle}>New feedback</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#575757] sm:text-[15px]">
                  Share a note for the team to review. Larger fields and more
                  breathing room make the form easier to scan and complete.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
                <div>
                  <label htmlFor="subject" className={fieldLabel}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((c) => ({ ...c, subject: e.target.value }))
                    }
                    placeholder="Short title"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="category" className={fieldLabel}>
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((c) => ({
                        ...c,
                        category: e.target.value as Feedback["category"],
                      }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(categoryLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="rating" className={fieldLabel}>
                    Rating (1-5)
                  </label>
                  <select
                    id="rating"
                    required
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData((c) => ({
                        ...c,
                        rating: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="message" className={fieldLabel}>
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((c) => ({ ...c, message: e.target.value }))
                  }
                  placeholder="Write your feedback here..."
                  className={textareaCls}
                />
              </div>

              {formError && (
                <p className="mt-5 rounded-xl border border-black/10 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[52px] sm:px-7 sm:text-[15px]"
              >
                <Check className="h-4 w-4" />
                {isCreating ? "Submitting..." : "Submit feedback"}
              </button>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Total",
                value: stats.total,
                note: "All submissions in view",
              },
              {
                label: "Pending",
                value: stats.pending,
                note: "Needs review or follow-up",
              },
              {
                label: "Resolved",
                value: stats.resolved,
                note: "Closed and completed",
              },
            ].map(({ label, value, note }) => (
              <div
                key={label}
                className={`${shellCard} flex min-h-[160px] flex-col justify-between p-6 sm:p-7 lg:p-8`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#747474]">
                    {label}
                  </p>
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                </div>
                <div className="mt-6">
                  <p className="text-[2.5rem] font-semibold leading-none tracking-[-0.06em] text-[#111] sm:text-[3rem] lg:text-[3.5rem]">
                    {value}
                  </p>
                  <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#606060] sm:text-[15px]">
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={`${shellCard} p-6 sm:p-7 lg:p-8`}>
            <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className={sectionTitle}>Feedback library</h2>
                <p className="mt-2 text-sm leading-7 text-[#575757] sm:text-[15px]">
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#222] transition hover:bg-black hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
              <div>
                <label htmlFor="search" className={fieldLabel}>
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
                <label htmlFor="status-filter" className={fieldLabel}>
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
                <label htmlFor="category-filter" className={fieldLabel}>
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
                <label htmlFor="sort" className={fieldLabel}>
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
          </div>

          {isLoading ? (
            <div className={`${shellCard} p-8 text-sm text-[#666]`}>
              Loading feedback...
            </div>
          ) : error ? (
            <div
              className={`${shellCard} border-black/10 bg-white p-6 text-sm text-black`}
            >
              <div className="rounded-xl border border-black/10 bg-zinc-100 px-4 py-3 text-[#333]">
                {error}
              </div>
            </div>
          ) : feedback.length === 0 ? (
            <div
              className={`${shellCard} px-6 py-12 text-center sm:px-8 lg:px-10`}
            >
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111] sm:text-2xl">
                No feedback yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#575757] sm:text-[15px]">
                Use the button above to submit your first feedback.
              </p>
            </div>
          ) : visibleFeedback.length === 0 ? (
            <div
              className={`${shellCard} px-6 py-12 text-center sm:px-8 lg:px-10`}
            >
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111] sm:text-2xl">
                No matching feedback
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#575757] sm:text-[15px]">
                Adjust the filters to widen the list.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleFeedback.map((item) => (
                <article
                  key={item.id}
                  className={`${shellCard} p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-58px_rgba(0,0,0,0.52)] sm:p-7 lg:p-8`}
                >
                  {editingId === item.id ? (
                    <div className="space-y-5">
                      <div>
                        <h3 className={sectionTitle}>Edit feedback</h3>
                        <p className="mt-2 text-sm leading-7 text-[#575757] sm:text-[15px]">
                          Update the subject, category, rating, or message.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
                        <div>
                          <label className={fieldLabel}>Subject</label>
                          <input
                            type="text"
                            value={editFormData.subject}
                            onChange={(e) =>
                              setEditFormData((c) => ({
                                ...c,
                                subject: e.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={fieldLabel}>Category</label>
                          <select
                            value={editFormData.category}
                            onChange={(e) =>
                              setEditFormData((c) => ({
                                ...c,
                                category: e.target
                                  .value as Feedback["category"],
                              }))
                            }
                            className={inputCls}
                          >
                            {Object.entries(categoryLabels).map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={fieldLabel}>Rating (1-5)</label>
                          <select
                            value={editFormData.rating}
                            onChange={(e) =>
                              setEditFormData((c) => ({
                                ...c,
                                rating: Number(e.target.value),
                              }))
                            }
                            className={inputCls}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={fieldLabel}>Message</label>
                        <textarea
                          value={editFormData.message}
                          onChange={(e) =>
                            setEditFormData((c) => ({
                              ...c,
                              message: e.target.value,
                            }))
                          }
                          rows={6}
                          className={textareaCls}
                        />
                      </div>

                      {editError && (
                        <p className="rounded-xl border border-black/10 bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                          {editError}
                        </p>
                      )}

                      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleEditSave(item.id)}
                          disabled={isSaving}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          disabled={isSaving}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-[#222] transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111] sm:text-xl lg:text-[1.35rem]">
                              {item.subject}
                            </h3>
                            <span
                              className={`inline-flex h-8 items-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusBadge[item.status]}`}
                            >
                              {statusLabels[item.status]}
                            </span>
                          </div>

                          <p className="max-w-4xl text-sm leading-7 text-[#575757] sm:text-[15px] lg:text-[1rem]">
                            {item.message}
                          </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-black/10 bg-black px-4 py-2 text-sm font-semibold text-white">
                          <Star className="h-4 w-4 fill-white text-white" />
                          {item.rating}/5
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-black/10 bg-[#f5f5f4] px-3.5 py-1.5 text-xs font-medium text-[#555] sm:text-sm">
                            {categoryLabels[item.category]}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEditStart(item)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#222] transition hover:bg-black hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
