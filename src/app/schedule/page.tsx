"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Pencil,
  X,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
}

interface EventForm {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
}

const emptyForm: EventForm = {
  title: "",
  startTime: "",
  endTime: "",
  location: "",
};

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const monthStr = format(currentMonth, "yyyy-MM");

  const fetchMonthEvents = useCallback(async () => {
    setLoadingMonth(true);
    try {
      const res = await fetch(`/api/events?month=${monthStr}`);
      if (res.ok) setMonthEvents(await res.json());
    } catch {
      /* ignore */
    }
    setLoadingMonth(false);
  }, [monthStr]);

  const fetchDayEvents = useCallback(async () => {
    setLoadingDay(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`/api/events?date=${dateStr}`);
      if (res.ok) setDayEvents(await res.json());
    } catch {
      /* ignore */
    }
    setLoadingDay(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthEvents();
  }, [fetchMonthEvents]);

  useEffect(() => {
    fetchDayEvents();
  }, [fetchDayEvents]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Count events per day for dots
  const eventsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ev of monthEvents) {
      const key = format(new Date(ev.startTime), "yyyy-MM-dd");
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [monthEvents]);

  const openNewForm = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setForm({
      title: "",
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T10:00`,
      location: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
      location: event.location || "",
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setSaving(true);

    try {
      if (editingId) {
        await fetch("/api/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            title: form.title,
            startTime: form.startTime,
            endTime: form.endTime,
            location: form.location || null,
          }),
        });
      } else {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            startTime: form.startTime,
            endTime: form.endTime,
            location: form.location || null,
          }),
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await Promise.all([fetchMonthEvents(), fetchDayEvents()]);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      await Promise.all([fetchMonthEvents(), fetchDayEvents()]);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-label">Calendar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Schedule
        </h1>
        <p className="text-body mt-2">
          Your in-app calendar — add and edit events anytime.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Calendar Grid */}
        <div className="lg:col-span-7">
          <div className="surface-panel overflow-hidden rounded-2xl">
            {/* Month navigation */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800/80">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                {loadingMonth && (
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-400 inline-block ml-2" />
                )}
              </div>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800/80">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const evCount = eventsByDate[dateKey] || 0;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`relative h-16 border-b border-r border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center gap-1 transition-colors ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/50"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    } ${!isCurrentMonth ? "opacity-30" : ""}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        today
                          ? "w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center"
                          : isSelected
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {evCount > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(evCount, 3) }).map(
                          (_, j) => (
                            <div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                            />
                          )
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Today button */}
            <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                Go to Today
              </button>
            </div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-panel overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800/80">
              <div>
                <p className="text-label">
                  {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
                </p>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
              </div>
              <button
                onClick={openNewForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
            </div>

            {/* Event form */}
            {showForm && (
              <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {editingId ? "Edit Event" : "New Event"}
                  </h4>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Event title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="input-field py-2"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                        Start
                      </label>
                      <input
                        type="datetime-local"
                        value={form.startTime}
                        onChange={(e) =>
                          setForm({ ...form, startTime: e.target.value })
                        }
                        className="input-field px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                        End
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endTime}
                        onChange={(e) =>
                          setForm({ ...form, endTime: e.target.value })
                        }
                        className="input-field px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="input-field py-2"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingId ? (
                      "Update Event"
                    ) : (
                      "Add Event"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Events list */}
            <div className="px-5 py-4">
              {loadingDay ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : dayEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarDays className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No events this day</p>
                  <button
                    onClick={openNewForm}
                    className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                  >
                    + Add one
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 group"
                    >
                      <div className="flex-shrink-0 w-1 rounded-full bg-indigo-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.startTime), "h:mm a")} –{" "}
                            {format(new Date(event.endTime), "h:mm a")}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(event)}
                          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
