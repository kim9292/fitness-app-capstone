"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "Do I need an account to use the app?",
    answer:
      "You can browse our exercise library, view food nutrition information, and explore templates without an account. However, to track workouts, save meal plans, and monitor progress, you'll need to create a free account.",
  },
  {
    category: "Getting Started",
    question: "How do I create an account?",
    answer:
      "Click the 'Sign Up' button in the top navigation. Enter your email and password, and you're done! You can also use Google, LinkedIn, or Apple to sign up quickly.",
  },
  {
    category: "Getting Started",
    question: "Is the app free?",
    answer:
      "Yes! The app is completely free to use. Create an account, log workouts, track meals, and monitor your progress without paying anything.",
  },
  {
    category: "Getting Started",
    question: "Can I use the app on my phone?",
    answer:
      "Yes! The app is fully responsive and works great on mobile, tablet, and desktop. Just open it in your browser.",
  },

  // Workouts
  {
    category: "Workouts",
    question: "How do I create a workout?",
    answer:
      "Log in to your account, go to Workouts, and click 'Create Workout'. Add exercises, set your target sets and reps, and optionally log the weight used. You can save it as a template for future use.",
  },
  {
    category: "Workouts",
    question: "Can I use workout templates?",
    answer:
      "Yes! Browse our pre-made templates for different goals (strength, hypertrophy, cardio, etc.). You can use them as-is or customize them to fit your needs.",
  },
  {
    category: "Workouts",
    question: "How many exercises are available?",
    answer:
      "We have 60+ exercises in our library, each with step-by-step instructions and video tutorials. You can search by name or muscle group.",
  },
  {
    category: "Workouts",
    question: "What information does the app track?",
    answer:
      "The app tracks exercise name, sets, reps, weight lifted, workout date, and personal notes. This helps you monitor your progress and spot strength gains over time.",
  },

  // Nutrition
  {
    category: "Nutrition",
    question: "Can I track meals?",
    answer:
      "Yes! Log in and go to Meals to create and save meal plans. You can also look up the nutrition information for 70+ common foods including calories, protein, carbs, fat, and fiber.",
  },
  {
    category: "Nutrition",
    question: "How accurate is the food nutrition data?",
    answer:
      "Our nutrition database is based on USDA data and common serving sizes. For the most accurate tracking, always check the serving size and adjust portions as needed for your specific food.",
  },
  {
    category: "Nutrition",
    question: "Can I create custom meals?",
    answer:
      "Yes! Combine foods to create your own meal plans. Add them with portions, and the app calculates total calories and macros for each meal.",
  },
  {
    category: "Nutrition",
    question: "What foods are in the database?",
    answer:
      "We include common foods like chicken, beef, fish, rice, pasta, fruits, vegetables, dairy, nuts, and more. You can search for any food to see its nutrition info.",
  },

  // Progress & Tracking
  {
    category: "Progress & Tracking",
    question: "How do I track my progress?",
    answer:
      "Log in and visit your Profile (Me) to see your workout streak, total volume this month, and recent activity. Update your weight and body fat measurements to monitor body composition changes.",
  },
  {
    category: "Progress & Tracking",
    question: "What's a workout streak?",
    answer:
      "A streak tracks consecutive days you've completed at least one workout. It helps you build consistency. Even rest days don't break it as long as you've worked out recently!",
  },
  {
    category: "Progress & Tracking",
    question: "Can I see historical data?",
    answer:
      "Yes! All your workouts are saved with dates, so you can look back and see your training history. This helps you plan future workouts and track long-term progress.",
  },
  {
    category: "Progress & Tracking",
    question: "How do I measure progress?",
    answer:
      "Track progress by: logging heavier weights over time, increasing reps/sets, reducing rest periods, updating body measurements, and reviewing your workout history.",
  },

  // AI Assistant
  {
    category: "AI Assistant",
    question: "What can the AI assistant help with?",
    answer:
      "The AI assistant answers questions about workout routines, exercise form, training plans, goal setting, nutrition, and recovery. It's like having a personal trainer available 24/7.",
  },
  {
    category: "AI Assistant",
    question: "Can the AI create workout plans?",
    answer:
      "Yes! Tell the AI your goals, experience level, and available equipment, and it can generate personalized workout plans tailored to your needs.",
  },
  {
    category: "AI Assistant",
    question: "Is the AI advice reliable?",
    answer:
      "The AI provides general fitness guidance based on common principles. For serious medical or health concerns, always consult a doctor. Use the AI for training tips, form corrections, and motivation.",
  },

  // Account & Security
  {
    category: "Account & Security",
    question: "Is my data safe?",
    answer:
      "Yes! Your data is encrypted and stored securely. We use industry-standard security practices to protect your personal information and workout history.",
  },
  {
    category: "Account & Security",
    question: "Can I delete my account?",
    answer:
      "Yes, you can delete your account anytime. Contact support, and we'll securely remove all your data within 30 days.",
  },
  {
    category: "Account & Security",
    question: "What if I forget my password?",
    answer:
      "Click 'Forgot Password' on the login page. We'll send you a reset link via email. Follow the instructions to set a new password.",
  },
  {
    category: "Account & Security",
    question: "Can I change my email?",
    answer:
      "Yes! Go to your account settings and update your email. You'll need to verify the new email address before the change takes effect.",
  },

  // Features & Tools
  {
    category: "Features & Tools",
    question: "What features require a login?",
    answer:
      "Logging workouts, saving meal plans, tracking measurements, viewing your dashboard, and AI assistance all require an account. Public features include browsing exercises, food nutrition lookup, and templates.",
  },
  {
    category: "Features & Tools",
    question: "Can I export my data?",
    answer:
      "You can view all your workout history and measurements in your dashboard. For detailed data export, contact support and we can provide a CSV file of your information.",
  },
];

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find answers to common questions about using the fitness app, tracking workouts, nutrition logging, and more.
          </p>
        </div>

        {/* FAQ by Category */}
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="mb-12">
            {/* Category Title */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="h-1 w-8 bg-blue-500 rounded"></div>
              {category}
            </h2>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqItems
                .filter((item) => item.category === category)
                .map((item, index) => {
                  const globalIndex = faqItems.indexOf(item);
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <div
                      key={globalIndex}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
                    >
                      {/* Question */}
                      <button
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : globalIndex)
                        }
                        className="w-full p-6 text-left hover:bg-slate-700/30 transition-colors flex items-center justify-between group"
                      >
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {item.question}
                        </h3>
                        <span
                          className={`text-blue-400 text-xl transition-transform duration-300 flex-shrink-0 ml-4 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>

                      {/* Answer */}
                      {isExpanded && (
                        <div className="px-6 pb-6 bg-slate-900/50 border-t border-slate-700">
                          <p className="text-gray-300 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Can't find the answer you're looking for? Check out our other resources or reach out to our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Ask the AI Assistant
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Navigation to other pages */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/exercises"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white px-6 py-4 rounded-lg text-center font-medium transition-colors"
          >
            Browse Exercises
          </Link>
          <Link
            href="/meals"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white px-6 py-4 rounded-lg text-center font-medium transition-colors"
          >
            Food Nutrition Lookup
          </Link>
          <Link
            href="/me"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white px-6 py-4 rounded-lg text-center font-medium transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
