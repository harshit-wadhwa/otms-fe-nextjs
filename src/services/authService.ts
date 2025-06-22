import { API_CONFIG, LoginRequest, LoginResponse } from '@/config/api';
import { tokenCookies } from '@/utils/cookies';
import { apiClient } from '@/utils/apiClient';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔑 Login attempt for user:', credentials.username);
      
      // Use the API client for login (without auth headers)
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      console.log('✅ Login successful, received response:', {
        hasToken: !!data.token,
        tokenPreview: data.token ? `${data.token.substring(0, 20)}...` : 'None',
        hasUser: !!data.user,
        user: data.user
      });
      
      // Store token and user data in cookies
      if (data.token) {
        tokenCookies.setAccessToken(data.token);
        tokenCookies.setTokenType('Bearer');
        if (data.user) {
          tokenCookies.setUser(data.user);
        }
        
        console.log('💾 Token stored in cookies successfully');
        
        // Verify token was stored correctly
        const storedToken = tokenCookies.getAccessToken();
        const storedType = tokenCookies.getTokenType();
        console.log('🔍 Verification - Stored token:', {
          hasStoredToken: !!storedToken,
          storedType,
          tokenMatches: storedToken === data.token
        });
      } else {
        console.warn('⚠️ No token received in login response');
      }

      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logout initiated');
      
      // Debug cookies before logout
      console.log('🔍 Cookies before logout:');
      tokenCookies.debugCookies();
      
      // Use the API client for logout (with auth headers)
      await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Continue with cookie clearing even if API call fails
    } finally {
      // Clear cookies regardless of API call success
      console.log('🧹 Clearing authentication cookies...');
      this.clearAuth();
      
      // Debug cookies after logout
      console.log('🔍 Cookies after logout:');
      tokenCookies.debugCookies();
      
      // Verify logout was successful
      const isStillAuthenticated = this.isAuthenticated();
      if (isStillAuthenticated) {
        console.warn('⚠️ User still appears to be authenticated after logout');
      } else {
        console.log('✅ Logout completed successfully - user is no longer authenticated');
      }
    }
  }

  async getProfile() {
    try {
      console.log('👤 Fetching user profile...');
      // Use the API client for profile (with auth headers)
      const profile = await apiClient.get(API_CONFIG.ENDPOINTS.PROFILE);
      console.log('✅ Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  getToken(): string | undefined {
    return tokenCookies.getAccessToken();
  }

  getTokenType(): string | undefined {
    return tokenCookies.getTokenType();
  }

  getUser() {
    return tokenCookies.getUser();
  }

  isAuthenticated(): boolean {
    return tokenCookies.isAuthenticated();
  }

  clearAuth(): void {
    console.log('🧹 clearAuth() called - clearing all authentication data');
    tokenCookies.clearAll();
  }

  // Debug method to check current authentication status
  debugAuthStatus(): void {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    const user = this.getUser();
    const isAuth = this.isAuthenticated();
    
    console.log('🔍 Current Authentication Status:', {
      hasToken: !!token,
      tokenType,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      user,
      isAuthenticated: isAuth,
    });
    
    // Also debug cookies
    tokenCookies.debugCookies();
  }
}

export const authService = new AuthService(); 