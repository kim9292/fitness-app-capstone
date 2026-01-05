"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProminentHeader from "@/app/components/ProminentHeader";

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  difficulty: string;
  targetMuscles: string[];
  instructions: string[];
}

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchExercises = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (difficulty) params.append("difficulty", difficulty);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ProminentHeader
        title="✨ Exercise Library"
        subtitle="Find exercises, learn proper form, and track your progress"
        stats={
          <>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{exercises.length}</p>
              <p className="text-sm text-purple-100">Exercises Found</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{search ? '🔍' : '📚'}</p>
              <p className="text-sm text-purple-100">Search Mode</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'All'}</p>
              <p className="text-sm text-purple-100">Difficulty</p>
            </div>
          </>
        }
      />

      <main className="max-w-6xl mx-auto p-6 -mt-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔍 Search Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchExercises();
                }
              }}
              placeholder="Search by name or muscle group..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">All Difficulty Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={fetchExercises}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                Search
              </button>
              {hasSearched && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDifficulty("");
                    setExercises([]);
                    setHasSearched(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        {isLoading ? (
          <div className="text-center text-white text-xl">Loading...</div>
        ) : !hasSearched ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">👆 Use the search above to find exercises</p>
            <p className="text-gray-500 text-sm">Search by name, muscle group (chest, back, legs, etc.), or difficulty level</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No exercises found. Try a different search!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24 flex items-center justify-center">
                  <p className="text-4xl">💪</p>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{exercise.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exercise.targetMuscles.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        exercise.difficulty === "beginner"
                          ? "bg-green-100 text-green-800"
                          : exercise.difficulty === "intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {exercise.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exercise Details Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedExercise.name}</h2>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-2xl font-bold hover:opacity-80"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* YouTube Video */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">📹 Video Tutorial</h3>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedExercise.videoUrl}
                      title="Exercise Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">📝 Description</h3>
                  <p className="text-gray-700">{selectedExercise.description}</p>
                </div>

                {/* Target Muscles */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">🎯 Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.targetMuscles.map((muscle, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">📋 Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="text-gray-700">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">📊 Difficulty</h3>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                      selectedExercise.difficulty === "beginner"
                        ? "bg-green-100 text-green-800"
                        : selectedExercise.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedExercise.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
