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
      if (!user?.id) {
        console.error("SaveTestResult: User not authenticated", { user });
        return { success: false, error: "User not authenticated" };
      }

      try {
        console.log("SaveTestResult: Attempting to save test for user:", user.id, result);
        const response = await fetch(`/api/user/${user.id}/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("SaveTestResult: API error:", errorData);
          throw new Error(errorData.error || "Failed to save test result");
        }

        const data = await response.json();
        console.log("SaveTestResult: Test saved successfully:", data);
        return { success: true, data };
      } catch (error) {
        console.error("SaveTestResult: Error saving test:", error);
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
