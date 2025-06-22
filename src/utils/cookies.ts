import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  sameSite: 'strict' as const,
  path: '/',
};

// Cookie keys
export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'otms_access_token',
  TOKEN_TYPE: 'otms_token_type',
  USER: 'otms_user',
} as const;

// Token management
export const tokenCookies = {
  // Set access token
  setAccessToken: (token: string) => {
    Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, token, COOKIE_CONFIG);
  },

  // Get access token
  getAccessToken: (): string | undefined => {
    return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
  },

  // Set token type
  setTokenType: (type: string) => {
    Cookies.set(COOKIE_KEYS.TOKEN_TYPE, type, COOKIE_CONFIG);
  },

  // Get token type
  getTokenType: (): string | undefined => {
    return Cookies.get(COOKIE_KEYS.TOKEN_TYPE);
  },

  // Set user data
  setUser: (user: any) => {
    Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), COOKIE_CONFIG);
  },

  // Get user data
  getUser: () => {
    const userStr = Cookies.get(COOKIE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear all auth cookies with multiple options to ensure complete removal
  clearAll: () => {
    console.log('🧹 Starting cookie cleanup...');
    
    // Get all cookies before clearing
    const beforeClear = {
      accessToken: Cookies.get(COOKIE_KEYS.ACCESS_TOKEN),
      tokenType: Cookies.get(COOKIE_KEYS.TOKEN_TYPE),
      user: Cookies.get(COOKIE_KEYS.USER),
    };
    
    console.log('📋 Cookies before clearing:', beforeClear);
    
    // Clear cookies with different path and domain options to ensure complete removal
    Object.values(COOKIE_KEYS).forEach(key => {
      // Remove with default path
      Cookies.remove(key);
      
      // Remove with explicit path
      Cookies.remove(key, { path: '/' });
      
      // Remove with root path
      Cookies.remove(key, { path: '' });
      
      // Remove with domain (if applicable)
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        Cookies.remove(key, { domain: window.location.hostname });
        Cookies.remove(key, { domain: `.${window.location.hostname}` });
      }
    });
    
    // Verify cookies are cleared
    const afterClear = {
      accessToken: Cookies.get(COOKIE_KEYS.ACCESS_TOKEN),
      tokenType: Cookies.get(COOKIE_KEYS.TOKEN_TYPE),
      user: Cookies.get(COOKIE_KEYS.USER),
    };
    
    console.log('📋 Cookies after clearing:', afterClear);
    
    // Check if any cookies remain
    const remainingCookies = Object.values(afterClear).filter(cookie => cookie !== undefined);
    if (remainingCookies.length > 0) {
      console.warn('⚠️ Some cookies may still exist:', remainingCookies);
    } else {
      console.log('✅ All cookies cleared successfully');
    }
  },

  // Force clear all cookies (nuclear option)
  forceClearAll: () => {
    console.log('💥 Force clearing ALL cookies...');
    
    // Get all cookies
    const allCookies = Cookies.get();
    console.log('🍪 All cookies before force clear:', allCookies);
    
    // Remove all cookies
    if (allCookies) {
      Object.keys(allCookies).forEach(cookieName => {
        Cookies.remove(cookieName);
        Cookies.remove(cookieName, { path: '/' });
        Cookies.remove(cookieName, { path: '' });
        
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          Cookies.remove(cookieName, { domain: window.location.hostname });
          Cookies.remove(cookieName, { domain: `.${window.location.hostname}` });
        }
      });
    }
    
    // Also clear our specific auth cookies
    tokenCookies.clearAll();
    
    console.log('💥 Force clear completed');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
  },

  // Debug method to show all current cookies
  debugCookies: () => {
    const allCookies = Cookies.get();
    const authCookies = {
      accessToken: Cookies.get(COOKIE_KEYS.ACCESS_TOKEN),
      tokenType: Cookies.get(COOKIE_KEYS.TOKEN_TYPE),
      user: Cookies.get(COOKIE_KEYS.USER),
    };
    
    console.log('🍪 All cookies:', allCookies);
    console.log('🔐 Auth cookies:', authCookies);
    
    return { allCookies, authCookies };
  },
}; 