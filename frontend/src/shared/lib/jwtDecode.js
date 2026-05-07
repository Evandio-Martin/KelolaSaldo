/**
 * Decode JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload object or null
 */
const decodeBase64Segment = (segment) => {
  const normalizedSegment = segment.replace(/-/g, "+").replace(/_/g, "/");
  const paddedSegment = normalizedSegment.padEnd(
    normalizedSegment.length + ((4 - (normalizedSegment.length % 4)) % 4),
    "=",
  );
  const binary = atob(paddedSegment);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(decodeBase64Segment(payload));
    
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

/**
 * Extract user data from JWT token
 * @param token - JWT token (access_token or refresh_token)
 * @returns User object with id, username, name, nickname, role
 */
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  
  if (!decoded) return null;

  return {
    id: decoded.user_id,
    username: decoded.username,
    name: decoded.name,
    nickname: decoded.nickname,
    role: decoded.role || "USER",
  };
};

/**
 * Check if token is expired
 * @param token - JWT token
 * @returns True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};
