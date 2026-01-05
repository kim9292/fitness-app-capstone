"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/app/components/Header";

interface CalendarEvent {
  date: string;
  type: "workout" | "meal" | "rest" | "habit";
  title?: string;
  count?: number;
  details?: any; // Full workout/meal data
}

export default function CalendarPage() {
  const { isAuthenticated, token } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, currentMonth]);

  const loadEvents = async () => {
    try {
      const allEvents: CalendarEvent[] = [];

      // Helper function to convert date to local date string (YYYY-MM-DD)
      const toLocalDateString = (date: Date | string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Fetch workouts
      const workoutsRes = await fetch("/api/workouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (workoutsRes.ok) {
        const data = await workoutsRes.json();
        const workouts = Array.isArray(data) ? data : data.workouts || [];
        const workoutEvents: CalendarEvent[] = workouts.map((w: any) => ({
          date: toLocalDateString(w.date),
          type: "workout",
          title: w.title,
          count: w.exercise?.length || 0,
          details: w,
        }));
        allEvents.push(...workoutEvents);
      }

      // Fetch meal plans
      const mealsRes = await fetch("/api/meals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (mealsRes.ok) {
        const data = await mealsRes.json();
        const meals = data.mealPlans || [];
        const mealEvents: CalendarEvent[] = meals.map((m: any) => ({
          date: toLocalDateString(m.date),
          type: "meal",
          title: m.title,
          details: m,
        }));
        allEvents.push(...mealEvents);
      }

      // Fetch habits to determine which days all habits were completed
      const habitsRes = await fetch("/api/user/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (habitsRes.ok) {
        const data = await habitsRes.json();
        const habitLogs = data.logs || [];
        
        // Group habit logs by date
        const habitsByDate: { [date: string]: any[] } = {};
        habitLogs.forEach((log: any) => {
          const dateStr = toLocalDateString(log.date);
          if (!habitsByDate[dateStr]) {
            habitsByDate[dateStr] = [];
          }
          habitsByDate[dateStr].push(log);
        });

        // Find dates where all habits were completed
        Object.entries(habitsByDate).forEach(([dateStr, logs]) => {
          const allCompleted = logs.every((log: any) => log.completed);
          if (allCompleted && logs.length > 0) {
            allEvents.push({
              date: dateStr,
              type: "habit",
              title: `${logs.length} habits completed`,
              count: logs.length,
              details: { logs },
            });
          }
        });
      }

      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const getEventsForDate = (day: number): CalendarEvent[] => {
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayEvents = events.filter((e) => e.date === dateStr);
    if (dayEvents.length > 0) {
      setSelectedDate(dateStr);
      setModalEvents(dayEvents);
    }
  };

  const closeModal = () => {
    setSelectedDate(null);
    setModalEvents([]);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto p-6">
        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-700 py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100 rounded-lg p-2 min-h-24" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDate(day);
              const isToday =
                new Date().toDateString() ===
                new Date(year, month, day).toDateString();

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`bg-white border rounded-lg p-2 min-h-24 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isToday ? "border-indigo-500 border-2" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isToday ? "text-indigo-600" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          event.type === "workout"
                            ? "bg-blue-100 text-blue-800"
                            : event.type === "meal"
                            ? "bg-green-100 text-green-800"
                            : event.type === "habit"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.type === "workout" && "💪"}
                        {event.type === "meal" && "🍽️"}
                        {event.type === "habit" && "✅"}
                        {event.type === "rest" && "😴"}
                        {" "}
                        {event.title?.substring(0, 10) || event.type}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border border-blue-200 rounded" />
              <span className="text-sm text-gray-700">Workout</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-200 rounded" />
              <span className="text-sm text-gray-700">Meal Prep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded" />
              <span className="text-sm text-gray-700">All Habits Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded" />
              <span className="text-sm text-gray-700">Rest Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 rounded" />
              <span className="text-sm text-gray-700">Today</span>
            </div>
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Events for {new Date(selectedDate).toLocaleDateString()}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {modalEvents.map((event, idx) => (
                <div key={idx} className="border-b pb-4 last:border-b-0">
                  {event.type === "workout" && (
                    <div>
                      <h3 className="text-xl font-bold text-blue-700 mb-2">
                        💪 {event.details?.title || "Workout"}
                      </h3>
                      {event.details?.exercise && event.details.exercise.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-700">Exercises:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {event.details.exercise.map((ex: any, i: number) => (
                              <li key={i}>
                                {ex.name} - {ex.sets} sets × {ex.reps} reps
                                {ex.weight && ` @ ${ex.weight} lbs`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {event.details?.notes && (
                        <p className="text-gray-600 mt-2">
                          <span className="font-semibold">Notes:</span> {event.details.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {event.type === "meal" && (
                    <div>
                      <h3 className="text-xl font-bold text-green-700 mb-2">
                        🍽️ {event.details?.title || "Meal Plan"}
                      </h3>
                      {event.details?.calories && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Calories:</span> {event.details.calories}
                        </p>
                      )}
                      {event.details?.mealsPerDay && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Meals per day:</span> {event.details.mealsPerDay}
                        </p>
                      )}
                      {event.details?.plan && (
                        <div className="mt-2">
                          <p className="font-semibold text-gray-700">Plan:</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{event.details.plan}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {event.type === "habit" && (
                    <div>
                      <h3 className="text-xl font-bold text-yellow-700 mb-2">
                        ✅ All Habits Completed!
                      </h3>
                      <p className="text-gray-600 mb-2">
                        You completed {event.count} habits on this day. Great job! 🎉
                      </p>
                      {event.details?.logs && (
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">Habits:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {event.details.logs.map((log: any, i: number) => (
                              <li key={i}>
                                {log.habitId}
                                {log.value && ` - ${log.value}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}