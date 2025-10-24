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
        return { success: false, error: "User not authenticated" };
      }

      try {
        // Get auth token from localStorage
        const authToken = localStorage.getItem("auth_token");
        
        const response = await fetch(`/api/user/${user.id}/tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
          body: JSON.stringify(result),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save test result");
        }

        const data = await response.json();
        return { success: true, data };
      } catch (error) {
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
