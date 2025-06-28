import { API_CONFIG, ApiError } from '@/config/api';
import { tokenCookies } from './cookies';

// API Client class for making authenticated requests
class ApiClient {
  private baseURL = API_CONFIG.BASE_URL;

  // Get default headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = tokenCookies.getAccessToken();
    const tokenType = tokenCookies.getTokenType();
    
    if (token && tokenType) {
      // Ensure proper Bearer token format
      const authHeader = tokenType.toLowerCase() === 'bearer' 
        ? `Bearer ${token}`
        : `${tokenType} ${token}`;
      
      headers.Authorization = authHeader;
      
      // Debug logging (remove in production)
      console.log('🔐 Auth Header Set:', {
        tokenType,
        token: token.substring(0, 20) + '...',
        fullHeader: authHeader
      });
    } else {
      console.log('⚠️ No token found for request');
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const finalHeaders = {
      ...this.getHeaders(),
      ...options.headers,
    };
    
    const config: RequestInit = {
      ...options,
      headers: finalHeaders,
    };

    // Debug logging (remove in production)
    console.log('🌐 API Request:', {
      url,
      method: config.method || 'GET',
      headers: finalHeaders,
    });

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - clear cookies and redirect to login
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized - clearing tokens and redirecting to login');
        tokenCookies.clearAll();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || 'Request failed');
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text() as T;
    } catch (error: unknown) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Debug method to check current token status
  debugTokenStatus() {
    const token = tokenCookies.getAccessToken();
    const tokenType = tokenCookies.getTokenType();
    const user = tokenCookies.getUser();
    
    console.log('🔍 Token Debug Info:', {
      hasToken: !!token,
      tokenType,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      user,
      isAuthenticated: tokenCookies.isAuthenticated(),
    });
    
    return { token, tokenType, user, isAuthenticated: tokenCookies.isAuthenticated() };
  }
}

// Export singleton instance
export const apiClient = new ApiClient(); 