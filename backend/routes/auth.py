from fastapi import APIRouter, HTTPException, Header, Cookie, Response
from typing import Optional
import logging
import os

from models import (
    AuthUrlRequest,
    AuthUrlResponse,
    AuthCallbackRequest,
    AuthResponse,
    UserResponse,
    LogoutResponse,
    AuthStatusResponse
)
from services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.post("/github/url", response_model=AuthUrlResponse)
async def get_github_auth_url(request: AuthUrlRequest):
    """
    Generate GitHub OAuth URL for authentication
    
    This endpoint creates the GitHub OAuth URL that the frontend
    should redirect users to for authentication.
    """
    logger.info(f"Generating GitHub auth URL for redirect: {request.redirect_url}")
    
    try:
        result = await auth_service.get_github_auth_url(request.redirect_url)
        return AuthUrlResponse(
            success=result["success"],
            auth_url=result["auth_url"]
        )
    except Exception as e:
        logger.error(f"Failed to generate auth URL: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/github/callback", response_model=AuthResponse)
async def handle_github_callback(request: AuthCallbackRequest, response: Response):
    """
    Handle GitHub OAuth callback with authorization code
    
    This endpoint exchanges the OAuth code for user session data
    and sets secure HTTP-only cookies for session management.
    """
    logger.info("Processing GitHub OAuth callback")
    
    try:
        result = await auth_service.exchange_code_for_session(request.code)
        
        # Log user details to console as requested
        user_data = result["user"]
        logger.info("=== USER LOGIN SUCCESSFUL ===")
        logger.info(f"User ID: {user_data['id']}")
        logger.info(f"Email: {user_data['email']}")
        logger.info(f"Name: {user_data.get('name', 'N/A')}")
        logger.info(f"GitHub Username: {user_data.get('github_username', 'N/A')}")
        logger.info(f"Avatar URL: {user_data.get('avatar_url', 'N/A')}")
        logger.info(f"Created At: {user_data['created_at']}")
        logger.info("=============================")
        
        # Set HTTP-only cookies for security
        # Use secure=False for local development, secure=True for production
        is_production = os.getenv("ENVIRONMENT", "development") == "production"
        
        response.set_cookie(
            key="access_token",
            value=result["access_token"],
            httponly=True,
            secure=is_production,
            samesite="lax",
            max_age=3600  # 1 hour
        )
        
        response.set_cookie(
            key="refresh_token",
            value=result["refresh_token"],
            httponly=True,
            secure=is_production,
            samesite="lax",
            max_age=604800  # 7 days
        )
        
        return AuthResponse(
            success=result["success"],
            user=user_data,
            access_token=result["access_token"],
            refresh_token=result["refresh_token"]
        )
        
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user", response_model=UserResponse)
async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Get current authenticated user details
    
    Uses either cookie-based or header-based authentication.
    """
    logger.info("Getting current user details")
    
    # Try to get token from cookie first, then from Authorization header
    token = access_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="No authentication token provided")
    
    try:
        result = await auth_service.get_user_from_token(token)
        
        return UserResponse(
            success=result["success"],
            user=result["user"]
        )
        
    except Exception as e:
        logger.error(f"Failed to get user: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout", response_model=LogoutResponse)
async def logout_user(
    response: Response,
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Logout user and clear session cookies
    
    Invalidates the user session and clears authentication cookies.
    """
    logger.info("Processing user logout")
    
    # Try to get token from cookie first, then from Authorization header
    token = access_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
    
    try:
        if token:
            result = await auth_service.logout_user(token)
        else:
            result = {"success": True, "message": "Logged out successfully"}
        
        # Clear authentication cookies
        is_production = os.getenv("ENVIRONMENT", "development") == "production"
        response.delete_cookie(key="access_token", httponly=True, secure=is_production, samesite="lax")
        response.delete_cookie(key="refresh_token", httponly=True, secure=is_production, samesite="lax")
        
        logger.info("User logged out successfully")
        
        return LogoutResponse(
            success=result["success"],
            message=result["message"]
        )
        
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        # Still clear cookies even if logout fails
        is_production = os.getenv("ENVIRONMENT", "development") == "production"
        response.delete_cookie(key="access_token", httponly=True, secure=is_production, samesite="lax")
        response.delete_cookie(key="refresh_token", httponly=True, secure=is_production, samesite="lax")
        
        return LogoutResponse(
            success=True,
            message="Logged out successfully"
        )


@router.get("/status", response_model=AuthStatusResponse)
async def get_auth_status(
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Check authentication status
    
    Returns whether user is authenticated and user data if available.
    """
    logger.info("Checking authentication status")
    
    # Try to get token from cookie first, then from Authorization header
    token = access_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
    
    if not token:
        return AuthStatusResponse(authenticated=False, user=None)
    
    try:
        result = await auth_service.get_user_from_token(token)
        
        return AuthStatusResponse(
            authenticated=True,
            user=result["user"]
        )
        
    except Exception as e:
        logger.error(f"Token validation failed: {str(e)}")
        return AuthStatusResponse(authenticated=False, user=None) 