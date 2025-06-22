# FastAPI Integration Guide

This document explains how to integrate the OTMS frontend with a FastAPI backend for authentication using secure cookie-based token management with automatic Bearer token inclusion.

## 🔐 Authentication Features

- **Secure Cookie Storage**: Tokens stored in HTTP cookies for better security
- **Automatic Bearer Token Headers**: All API requests automatically include `Authorization: Bearer <token>` headers
- **Token Management**: Automatic token refresh and cleanup
- **401 Handling**: Automatic logout on authentication failures
- **Debug Tools**: Built-in debugging to verify token format and headers

## Backend Requirements

Your FastAPI backend should implement the following endpoints:

### 1. Login Endpoint
```
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "string",
    "email": "string"
  }
}
```

### 2. Logout Endpoint
```
POST /auth/logout
Authorization: Bearer <token>
```

### 3. Profile Endpoint
```
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string"
}
```

## Environment Configuration

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## FastAPI Backend Example

Here's a basic FastAPI implementation with CORS support:

```python
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import jwt
from datetime import datetime, timedelta

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: User

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "password": "password123"
    }
}

SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    user = users_db.get(login_data.username)
    if not user or user["password"] != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",  # This will be used to format the Authorization header
        expires_in=3600,
        user=User(id=user["id"], username=user["username"], email=user["email"])
    )

@app.post("/auth/logout")
async def logout(username: str = Depends(verify_token)):
    # In a real application, you might want to blacklist the token
    return {"message": "Successfully logged out"}

@app.get("/auth/profile")
async def get_profile(username: str = Depends(verify_token)):
    user = users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(id=user["id"], username=user["username"], email=user["email"])

# Test endpoint to verify authentication
@app.get("/api/test-auth")
async def test_auth(username: str = Depends(verify_token)):
    return {"message": f"Hello {username}, you are authenticated!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Running the Application

1. **Start the FastAPI backend:**
   ```bash
   cd your-fastapi-backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Next.js frontend:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Testing the Integration

1. Navigate to http://localhost:3000
2. You'll be redirected to http://localhost:3000/login
3. Use the credentials from your FastAPI backend (e.g., username: "admin", password: "password123")
4. After successful login, you'll be redirected to the dashboard
5. Use the "Token Debugger" to verify the Bearer token is properly stored
6. Test the "Fetch Profile" and "Test Authenticated Request" buttons
7. Check the browser console for detailed request logs showing the Authorization headers

## 🔧 How It Works

### Bearer Token Format
The system automatically formats the Authorization header as:
```
Authorization: Bearer <your-jwt-token>
```

### Cookie Management
- Tokens are stored in secure HTTP cookies using `js-cookie`
- Cookies are automatically included in all requests
- Automatic cleanup on logout or token expiration

### API Client
- `apiClient` automatically includes `Authorization: Bearer <token>` headers
- Handles 401 responses by clearing cookies and redirecting to login
- Supports all HTTP methods (GET, POST, PUT, DELETE, PATCH)

### Authentication Flow
1. User submits login credentials
2. Backend validates and returns JWT token with `token_type: "bearer"`
3. Frontend stores token in secure cookie
4. All subsequent API requests include `Authorization: Bearer <token>` automatically
5. On logout or 401 response, cookies are cleared

### Debugging
The dashboard includes a "Token Debugger" component that shows:
- Current token status
- Token type and format
- Expected Authorization header format
- Full token for debugging (expandable)

## Features Implemented

- ✅ **Secure Cookie Storage**: Tokens stored in HTTP cookies
- ✅ **Automatic Bearer Headers**: All requests include `Authorization: Bearer <token>`
- ✅ **JWT Token Authentication**: Secure token-based authentication
- ✅ **Protected Routes**: Automatic redirection for unauthenticated users
- ✅ **Error Handling**: Proper error messages and user feedback
- ✅ **Loading States**: Visual feedback during API calls
- ✅ **401 Handling**: Automatic logout on authentication failures
- ✅ **Debug Tools**: Built-in token debugging and verification
- ✅ **TypeScript Support**: Full type safety throughout
- ✅ **Responsive Design**: Works on all device sizes

## Security Considerations

1. **HTTPS**: Use HTTPS in production
2. **Token Expiration**: Implement proper token expiration handling
3. **Password Hashing**: Use proper password hashing (bcrypt, Argon2, etc.)
4. **CORS**: Configure CORS properly for your domain
5. **Rate Limiting**: Implement rate limiting on login endpoints
6. **Input Validation**: Validate all inputs on both frontend and backend
7. **Cookie Security**: Use secure, httpOnly cookies in production

## File Structure

```
src/
├── config/
│   └── api.ts              # API configuration and types
├── services/
│   └── authService.ts      # Authentication service with debugging
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── utils/
│   ├── cookies.ts          # Cookie management utilities
│   └── apiClient.ts        # API client with automatic Bearer headers
├── components/
│   ├── ProtectedRoute.tsx  # Protected route component
│   └── TokenDebugger.tsx   # Token debugging component
└── app/
    ├── login/
    │   └── page.tsx        # Login page
    ├── dashboard/
    │   └── page.tsx        # Dashboard with debug tools
    └── page.tsx            # Home page with redirects
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your FastAPI app has CORS middleware configured as shown in the example above.

### Token Issues
- Ensure your JWT secret key is secure and consistent
- Check token expiration times
- Verify the token format in Authorization headers
- Use the Token Debugger to verify token storage

### Network Issues
- Ensure both frontend and backend are running
- Check the API base URL in your environment configuration
- Verify the backend endpoints match the expected paths
- Check browser console for detailed request logs

### Cookie Issues
- Ensure cookies are being set properly (check browser dev tools)
- Verify cookie domain and path settings
- Check for HTTPS requirements in production

### Debugging Headers
To verify the Bearer token is being sent correctly:
1. Open browser developer tools
2. Go to the Network tab
3. Make an authenticated request (e.g., fetch profile)
4. Check the request headers for `Authorization: Bearer <token>`
5. Use the Token Debugger component in the dashboard 