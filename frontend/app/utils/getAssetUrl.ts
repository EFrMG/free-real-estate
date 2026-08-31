import { API_URL } from "~/utils/apiUrl";

/**
 * Resolves a path to a full URL.
 *
 * Handles:
 *   - Placeholder for no path; it's an image with a question mark
 *   - Local Vite assets (^/app)
 *   - Backend-uploaded files (^/public)
 *   - External URLs (^http)
 *   - Base64 data (^data:)
 */
export default function getAssetUrl(path: string | null | undefined) {
  if (!path) return "/app/assets/images/profile-pictures/placeholder.png";

  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("/")
  ) {
    // If it's a backend upload path (starting with /public), point to the backend server
    if (path.startsWith("/public")) {
      return `${API_URL}${path}`;
    }
    return path;
  }

  return path;
}
