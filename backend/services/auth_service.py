import os
from typing import Optional, Dict, Any
from supabase import create_client, Client
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """Service for handling Supabase authentication operations"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            logger.warning("Supabase URL and key not provided. Auth service will not function without proper configuration.")
            self.supabase = None
            return
            
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("AuthService initialized successfully")
    
    async def get_github_auth_url(self, redirect_url: str) -> Dict[str, Any]:
        """Generate GitHub OAuth URL"""
        if not self.supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            
        try:
            logger.info(f"Generating GitHub auth URL with redirect: {redirect_url}")
            
            response = self.supabase.auth.sign_in_with_oauth({
                "provider": "github",
                "options": {
                    "redirect_to": redirect_url
                }
            })
            
            if not response.url:
                raise HTTPException(status_code=400, detail="Failed to generate OAuth URL")
                
            logger.info("GitHub auth URL generated successfully")
            return {
                "auth_url": response.url,
                "success": True
            }
        except Exception as e:
            logger.error(f"Failed to generate auth URL: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to generate auth URL: {str(e)}")
    
    async def exchange_code_for_session(self, code: str) -> Dict[str, Any]:
        """Exchange OAuth code for user session"""
        if not self.supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            
        try:
            logger.info("Exchanging OAuth code for session")
            
            # Call the exchange method with the correct parameter structure for latest version
            response = self.supabase.auth.exchange_code_for_session({
                "auth_code": code
            })
            
            # Comprehensive debug logging to understand the response structure
            logger.info(f"Full response: {response}")
            logger.info(f"Response type: {type(response)}")
            logger.info(f"Response dir: {[attr for attr in dir(response) if not attr.startswith('_')]}")
            
            # Try to access the response in multiple ways to handle different versions
            user = None
            session = None
            
            # Method 1: Check if response has data attribute (common pattern)
            if hasattr(response, 'data') and response.data is not None:
                logger.info("Response has data attribute")
                data = response.data
                logger.info(f"Data type: {type(data)}")
                logger.info(f"Data content: {data}")
                
                if hasattr(data, 'user'):
                    user = data.user
                if hasattr(data, 'session'):
                    session = data.session
                    
            # Method 2: Check if response has direct user/session attributes
            elif hasattr(response, 'user') and hasattr(response, 'session'):
                logger.info("Response has direct user/session attributes")
                user = response.user
                session = response.session
                
            # Method 3: Check if response is a dict
            elif isinstance(response, dict):
                logger.info("Response is a dictionary")
                user = response.get('user')
                session = response.get('session')
                
                # Also check if there's nested data
                if not user and 'data' in response:
                    data = response['data']
                    user = data.get('user') if isinstance(data, dict) else None
                    session = data.get('session') if isinstance(data, dict) else None
            
            logger.info(f"Extracted user: {user}")
            logger.info(f"User type: {type(user) if user else None}")
            logger.info(f"Extracted session: {session}")
            logger.info(f"Session type: {type(session) if session else None}")
            
            if not user or not session:
                logger.error("No user or session found in response")
                logger.error(f"Full response structure: {response}")
                raise HTTPException(status_code=400, detail="Failed to authenticate user - no user or session data found")
            
            # Extract user metadata with comprehensive error handling
            user_metadata = {}
            try:
                if hasattr(user, 'user_metadata'):
                    metadata_attr = getattr(user, 'user_metadata')
                    logger.info(f"User metadata attribute type: {type(metadata_attr)}")
                    logger.info(f"User metadata content: {metadata_attr}")
                    
                    if isinstance(metadata_attr, dict):
                        user_metadata = metadata_attr
                    elif isinstance(metadata_attr, str):
                        # Try to parse as JSON if it's a string
                        import json
                        try:
                            user_metadata = json.loads(metadata_attr)
                            logger.info(f"Parsed user metadata from JSON: {user_metadata}")
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse user_metadata as JSON: {metadata_attr}")
                            user_metadata = {}
                    else:
                        logger.warning(f"Unexpected user_metadata type: {type(metadata_attr)}")
                        user_metadata = {}
                        
                elif isinstance(user, dict) and 'user_metadata' in user:
                    metadata_attr = user['user_metadata']
                    if isinstance(metadata_attr, dict):
                        user_metadata = metadata_attr
                    else:
                        logger.warning(f"User metadata in dict is not a dict: {type(metadata_attr)}")
                        user_metadata = {}
                else:
                    logger.info("No user_metadata found in user object")
                    
            except Exception as meta_error:
                logger.warning(f"Error extracting user metadata: {meta_error}")
                user_metadata = {}
            
            # Extract user data with safe access patterns
            def safe_get_attr(obj, attr_name, default=None):
                """Safely get attribute from object or dict"""
                if hasattr(obj, attr_name):
                    return getattr(obj, attr_name, default)
                elif isinstance(obj, dict):
                    return obj.get(attr_name, default)
                return default
            
            user_id = safe_get_attr(user, 'id')
            user_email = safe_get_attr(user, 'email')
            user_created_at = safe_get_attr(user, 'created_at')
            
            # Extract session tokens with safe access
            access_token = safe_get_attr(session, 'access_token')
            refresh_token = safe_get_attr(session, 'refresh_token')
            
            if not user_id or not user_email or not access_token:
                logger.error(f"Missing required user data: id={user_id}, email={user_email}, access_token present={bool(access_token)}")
                raise HTTPException(status_code=400, detail="Incomplete user authentication data")
            
            user_data = {
                "id": user_id,
                "email": user_email,
                "name": user_metadata.get("full_name") if user_metadata else None,
                "avatar_url": user_metadata.get("avatar_url") if user_metadata else None,
                "github_username": user_metadata.get("user_name") if user_metadata else None,
                "created_at": str(user_created_at) if user_created_at else None
            }
            
            # Log user details to console as requested
            logger.info("=== USER AUTHENTICATION SUCCESSFUL ===")
            logger.info(f"User ID: {user_data['id']}")
            logger.info(f"Email: {user_data['email']}")
            logger.info(f"Name: {user_data['name']}")
            logger.info(f"GitHub Username: {user_data['github_username']}")
            logger.info(f"Avatar URL: {user_data['avatar_url']}")
            logger.info(f"Created At: {user_data['created_at']}")
            logger.info("=======================================")
            
            return {
                "user": user_data,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "success": True
            }
                
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Authentication failed with exception: {str(e)}")
            logger.error(f"Exception type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")
    
    async def get_user_from_token(self, access_token: str) -> Dict[str, Any]:
        """Get user details from access token"""
        if not self.supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            
        try:
            logger.info("Getting user from access token")
            
            # Use the correct method from Supabase Python client
            response = self.supabase.auth.get_user(access_token)
            
            if response.user:
                # Safely extract user metadata
                user_metadata = response.user.user_metadata if hasattr(response.user, 'user_metadata') else {}
                if not isinstance(user_metadata, dict):
                    user_metadata = {}
                
                user_data = {
                    "id": response.user.id,
                    "email": response.user.email,
                    "name": user_metadata.get("full_name") if user_metadata else None,
                    "avatar_url": user_metadata.get("avatar_url") if user_metadata else None,
                    "github_username": user_metadata.get("user_name") if user_metadata else None,
                    "created_at": str(response.user.created_at) if response.user.created_at else None
                }
                
                logger.info(f"User data retrieved successfully: {response.user.email}")
                return {"user": user_data, "success": True}
            else:
                logger.error("Invalid access token")
                raise HTTPException(status_code=401, detail="Invalid token")
                
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
    
    async def logout_user(self, access_token: str) -> Dict[str, Any]:
        """Logout user and invalidate session"""
        if not self.supabase:
            raise HTTPException(status_code=500, detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
            
        try:
            logger.info("Logging out user")
            
            # For security, we'll just clear the cookies on the backend
            # The actual session invalidation happens when we clear the HTTP-only cookies
            # Since we can't directly invalidate the Supabase session with just a token
            logger.info("User logged out successfully")
            
            return {"success": True, "message": "Logged out successfully"}
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Logout failed: {str(e)}")

# Global auth service instance
auth_service = AuthService() 