import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface TestResult {
  wpm: number;
  accuracy: number;
  time: number;
  characters: number;
  mistakes: number;
  testType?: string;
  difficulty?: string;
}

export const useSaveTestResult = () => {
  const { user } = useAuth();

  const saveTestResult = useCallback(
    async (result: TestResult) => {
      console.log("SaveTestResult: Attempting to save result:", result);
      console.log("SaveTestResult: User ID:", user?.id);

      if (!user?.id) {
        console.warn(
          "SaveTestResult: No user ID available, cannot save test result",
        );
        return { success: false, error: "User not authenticated" };
      }

      try {
        console.log(
          "SaveTestResult: Calling API:",
          `/api/user/${user.id}/tests`,
        );
        const response = await fetch(`/api/user/${user.id}/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result),
        });

        console.log("SaveTestResult: API response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("SaveTestResult: API error:", errorData);
          throw new Error(errorData.error || "Failed to save test result");
        }

        const data = await response.json();
        console.log("SaveTestResult: Successfully saved:", data);
        return { success: true, data };
      } catch (error) {
        console.error("SaveTestResult: Error saving test result:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [user?.id],
  );

  return { saveTestResult };
};
