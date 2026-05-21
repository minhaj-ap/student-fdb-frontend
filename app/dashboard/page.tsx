"use client";

import { useEffect, useMemo, useState } from "react";
import { CreateFeedback, GetFeedback } from "@/src/lib/feedback";
import { CreateFeedbackPayload, Feedback } from "@/types";

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
    <main className="min-h-screen bg-[#f4f6f8] px-6 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
              Student Feedback
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
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
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-semibold">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-2 text-3xl font-semibold">{stats.resolved}</p>
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
        ) : (
          <div className="space-y-3">
            {feedback.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
