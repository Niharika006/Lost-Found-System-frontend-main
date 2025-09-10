'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosInstance } from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // You might want a more specific type for your user
  login: (accessToken: string, refreshToken: string) => Promise<void>; // Expect refreshToken here
  logout: () => Promise<void>;
  axiosInstance: AxiosInstance;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // State to store user data
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // Read refreshToken from localStorage synchronously for initial render
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && API_BASE_URL.includes("localhost")) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  });

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for HttpOnly cookies
    timeout: 5000, // Set a 5-second timeout for all requests
  });

  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      // Log current refresh token state before request
      console.log("[Frontend Debug] Request Interceptor: Current refreshToken state:", refreshToken ? "Exists" : "Does Not Exist");
      console.log("[Frontend Debug] Request Interceptor: Request URL:", config.url);

      // For local development, send refresh token in custom header if available if cookie is not working
      // Also, ensure this applies for both /auth/refresh and /auth/logout
      if (refreshToken && API_BASE_URL.includes("localhost") && (config.url && (config.url.endsWith("/auth/refresh") || config.url.endsWith("/auth/logout")))) {
        config.headers['X-Refresh-Token'] = refreshToken;
        console.log("[Frontend Debug] Request Interceptor: Setting X-Refresh-Token header.");
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor for token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // Log response error status
      console.log("[Frontend Debug] Response Interceptor: Error status:", error.response?.status, "_retry:", originalRequest._retry);

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("[Frontend Debug] 401 Unauthorized. Attempting to refresh token...");
        try {
          // Log the refresh token being sent for debugging
          console.log("[Frontend Debug] Attempting to send refresh token:", refreshToken ? refreshToken.substring(0, 10) + "..." : "None");
          
          const refreshConfig = { 
            withCredentials: true,
            headers: {} as Record<string, string>,
          };

          // If on localhost, manually add X-Refresh-Token header to the refresh request itself
          if (API_BASE_URL.includes("localhost") && refreshToken) {
            refreshConfig.headers['X-Refresh-Token'] = refreshToken;
            console.log("[Frontend Debug] Adding X-Refresh-Token header to refresh request for localhost.");
          }
          console.log("[Frontend Debug] Refresh request config headers:", refreshConfig.headers);

          // Attempt to refresh token
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, refreshConfig);
          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token; // Get new refresh token from body
          
          console.log("[Frontend Debug] Token refreshed successfully. New Access Token (partial):", newAccessToken.substring(0, 10));
          console.log("[Frontend Debug] Token refreshed successfully. New Refresh Token (partial):", newRefreshToken.substring(0, 10));

          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken); // Update stored refresh token
          
          if (API_BASE_URL.includes("localhost")) { // Store in localStorage for local dev fallback
            localStorage.setItem('refreshToken', newRefreshToken);
            console.log("[Frontend Debug] Stored new refresh token in localStorage.");
          }

          // Explicitly ask backend to set the HttpOnly cookie for the new refresh token (if not on localhost)
          if (!API_BASE_URL.includes("localhost")) { // Only try to set cookie if not on localhost
            await axios.post(`${API_BASE_URL}/auth/set-refresh-cookie`, `refresh_token=${newRefreshToken}`, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              withCredentials: true,
            });
            console.log("[Frontend Debug] Sent request to set refresh token cookie.");
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // If using header fallback for local dev, update it for the retried request
          if (API_BASE_URL.includes("localhost")) {
            originalRequest.headers['X-Refresh-Token'] = newRefreshToken;
            console.log("[Frontend Debug] Updated X-Refresh-Token header for retried request.");
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          // If refresh fails, log out the user
          await logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const checkAuthStatus = async () => {
      // On initial load, try to get user data if a refresh token exists
      // For local development, check localStorage for refresh token
      let hasToken = false;
      if (API_BASE_URL.includes("localhost")) {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
          hasToken = true;
          console.log("[Frontend Debug] Initial load: Found refresh token in localStorage.");
        } else {
          console.log("[Frontend Debug] Initial load: No refresh token found in localStorage.");
        }
      } else if (accessToken) {
        hasToken = true;
      }

      if (!hasToken) {
        setIsAuthenticated(false);
        setUser(null);
        console.log("[Frontend Debug] No token present. Skipping /auth/me request.");
        return;
      }

      try {
        console.log("[Frontend Debug] Attempting to fetch user data for auth status check.");
        const response = await axiosInstance.get(`${API_BASE_URL}/auth/me`);
        setIsAuthenticated(true);
        setUser(response.data);
        console.log("[Frontend Debug] User data fetched successfully.", response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsAuthenticated(false);
        setUser(null);
        console.log("[Frontend Debug] User not authenticated or failed to fetch user data.");
      }
    };
    checkAuthStatus();
  }, [axiosInstance, isAuthenticated, accessToken]); // Add accessToken as a dependency

  const login = async (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken); // Store refresh token in state
    if (API_BASE_URL.includes("localhost")) { // Store in localStorage for local dev fallback
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log("[Frontend Debug] Login: Stored new refresh token in localStorage.");
    }

    setIsAuthenticated(true);
    try {
      console.log("[Frontend Debug] Login: Attempting to fetch user data after successful login.");
      const response = await axiosInstance.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data);
      console.log("[Frontend Debug] Login: User data fetched successfully after login.", response.data);

      // After successful login, explicitly ask backend to set the HttpOnly cookie (if not on localhost)
      if (!API_BASE_URL.includes("localhost")) {
        await axios.post(`${API_BASE_URL}/auth/set-refresh-cookie`, `refresh_token=${newRefreshToken}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        });
        console.log("[Frontend Debug] Login: Sent request to set refresh token cookie.");
      }

    } catch (error) {
      console.error("Failed to fetch user data after login:", error);
      setUser(null);
      console.log("[Frontend Debug] Login: Failed to fetch user data after login.");
    }
  };

  const logout = async () => {
    try {
      console.log("[Frontend Debug] Logout: Attempting to send logout request.");
      await axiosInstance.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      console.log("[Frontend Debug] Logout: Logout request sent.");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAccessToken(null);
      setRefreshToken(null); // Clear refresh token from state
      if (API_BASE_URL.includes("localhost")) { // Clear from localStorage for local dev fallback
        localStorage.removeItem('refreshToken');
        console.log("[Frontend Debug] Logout: Removed refresh token from localStorage.");
      }
      setIsAuthenticated(false);
    setUser(null);
      window.location.href = '/auth/sign-in';
      console.log("[Frontend Debug] Logout: User logged out and redirected.");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, axiosInstance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
