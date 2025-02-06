// src/offlineSync.ts
import { getOfflineProgress, clearOfflineProgress, getOfflineQuizResults, clearOfflineQuizResults } from "./db";

export const syncOfflineData = async () => {
  if (navigator.onLine) {
    // Sync offline progress data
    const progressData = await getOfflineProgress();
    for (const progress of progressData) {
      try {
        await fetch("http://localhost:5000/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(progress),
        });
      } catch (error) {
        console.error("Error syncing progress:", error);
      }
    }
    await clearOfflineProgress();

    // Sync offline quiz results data
    const quizResults = await getOfflineQuizResults();
    for (const result of quizResults) {
      try {
        await fetch("http://localhost:5000/api/quiz-results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
      } catch (error) {
        console.error("Error syncing quiz results:", error);
      }
    }
    await clearOfflineQuizResults();
  }
};

window.addEventListener("online", syncOfflineData);
