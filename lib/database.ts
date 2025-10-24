// Client-side database operations that call API routes

export async function createRetypeUser(userData: {
  authId: string;
  email: string;
  name?: string;
  avatar?: string;
}) {
  // Get auth token from localStorage
  const authToken = localStorage.getItem("auth_token");

  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }

  return response.json();
}

export async function getRetypeUserByNvixioId(nvixioUserId: string) {
  // Get auth token from localStorage
  const authToken = localStorage.getItem("auth_token");

  const response = await fetch(
    `/api/user?authId=${encodeURIComponent(nvixioUserId)}`,
    {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user");
  }

  return response.json();
}

export async function updateRetypeUser(
  authId: string,
  userData: {
    email?: string;
    name?: string;
    avatar?: string;
  },
) {
  // Get auth token from localStorage
  const authToken = localStorage.getItem("auth_token");

  const response = await fetch("/api/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    body: JSON.stringify({ authId, ...userData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

// Note: Other database operations (typing tests, stats, etc.) would need similar API routes
// For now, we'll focus on the user operations needed for authentication
