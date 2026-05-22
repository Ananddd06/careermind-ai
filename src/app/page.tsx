"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [initialUploadTriggered, setInitialUploadTriggered] = useState(false);

  // Initialize and synchronize theme
  useEffect(() => {
    // Check local storage or defaults
    const savedTheme = localStorage.getItem("socrates_theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.body.classList.add("light-mode");
    } else {
      setIsDarkMode(true);
      document.body.classList.remove("light-mode");
    }
  }, []);

  // Sync auth state with view
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        setView("dashboard");
      } else {
        setView("landing");
      }
    }
  }, [isLoaded, isSignedIn]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("socrates_theme", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("socrates_theme", "light");
      }
      return newVal;
    });
  };

  const handleStartDemo = () => {
    setInitialUploadTriggered(false);
    setView("dashboard");
  };

  const handleUploadClick = () => {
    setInitialUploadTriggered(true);
    setView("dashboard");
  };

  return (
    <div className="flex-1 w-full overflow-hidden flex flex-col bg-zinc-950">
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full overflow-y-auto"
          >
            <LandingPage
              onStartDemo={handleStartDemo}
              onUploadClick={handleUploadClick}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full flex flex-col overflow-hidden"
          >
            <Dashboard
              onBackToLanding={() => setView("landing")}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              initialUploadTriggered={initialUploadTriggered}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
