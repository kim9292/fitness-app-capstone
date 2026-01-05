"use client";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      {/* Main Content */}
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">FitTrack Pro</h2>
        <p className="text-xl text-gray-300 max-w-2xl mb-12">
          Your personal fitness companion designed to help you achieve your health and wellness goals with precision and ease.
        </p>

        {/* CTA */}
        <Link
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
        >
          Start Your Fitness Journey Today
        </Link>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}
