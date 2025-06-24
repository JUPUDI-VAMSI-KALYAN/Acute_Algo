import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from models import (
    FeedbackRequest,
    FeedbackResponse,
    FeedbackItem,
    FeedbackListResponse,
    UpvoteRequest,
    UpvoteResponse,
    PublicFeatureListResponse,
)
from services.database_service import DatabaseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

# Initialize database service
db_service = DatabaseService()


@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """Submit new feedback"""
    try:
        # Validate category
        valid_categories = ['bug', 'feature', 'improvement', 'general', 'compliment']
        if request.category not in valid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        
        # Validate rating if provided
        if request.rating is not None and (request.rating < 1 or request.rating > 5):
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )
        
        # Save feedback to database
        feedback_id = await db_service.create_feedback(
            name=request.name,
            email=request.email,
            category=request.category,
            subject=request.subject,
            message=request.message,
            rating=request.rating,
            allow_contact=request.allow_contact
        )
        
        if feedback_id:
            logger.info(f"Feedback submitted successfully with ID: {feedback_id}")
            return FeedbackResponse(
                success=True,
                message="Thank you for your feedback! We'll get back to you soon.",
                feedback_id=feedback_id
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to submit feedback"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit feedback. Please try again."
        )


@router.get("/", response_model=FeedbackListResponse)
async def get_feedback_list(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority")
):
    """Get list of feedback items (admin endpoint)"""
    try:
        result = await db_service.get_feedback_list(
            page=page,
            limit=limit,
            category=category,
            status=status,
            priority=priority
        )
        
        return FeedbackListResponse(
            success=True,
            data=result["feedback"],
            total=result["total"],
            page=page,
            limit=limit,
            total_pages=result["total_pages"]
        )
        
    except Exception as e:
        logger.error(f"Error getting feedback list: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get feedback list"
        )


@router.get("/{feedback_id}", response_model=FeedbackItem)
async def get_feedback_by_id(feedback_id: int):
    """Get feedback by ID (admin endpoint)"""
    try:
        feedback = await db_service.get_feedback_by_id(feedback_id)
        
        if not feedback:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )
            
        return feedback
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feedback {feedback_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get feedback"
        )


@router.put("/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: int,
    status: str,
    admin_notes: Optional[str] = None
):
    """Update feedback status (admin endpoint)"""
    try:
        valid_statuses = ['open', 'in_progress', 'resolved', 'closed']
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        success = await db_service.update_feedback_status(
            feedback_id=feedback_id,
            status=status,
            admin_notes=admin_notes
        )
        
        if success:
            return {"success": True, "message": "Feedback status updated successfully"}
        else:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feedback status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update feedback status"
        )


@router.put("/{feedback_id}/priority")
async def update_feedback_priority(feedback_id: int, priority: str):
    """Update feedback priority (admin endpoint)"""
    try:
        valid_priorities = ['low', 'medium', 'high', 'critical']
        if priority not in valid_priorities:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
            )
        
        success = await db_service.update_feedback_priority(
            feedback_id=feedback_id,
            priority=priority
        )
        
        if success:
            return {"success": True, "message": "Feedback priority updated successfully"}
        else:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feedback priority: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update feedback priority"
        )


@router.get("/stats/summary")
async def get_feedback_stats():
    """Get feedback statistics (admin endpoint)"""
    try:
        stats = await db_service.get_feedback_stats()
        
        return {
            "success": True,
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Error getting feedback stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get feedback statistics"
        )


# ===================== PUBLIC FEATURE REQUESTS ENDPOINTS =====================

@router.get("/features/public", response_model=PublicFeatureListResponse)
async def get_public_feature_requests(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query("upvotes", description="Sort by: upvotes, recent, trending"),
    status: Optional[str] = Query(None, description="Filter by status"),
    user_identifier: Optional[str] = Query(None, description="User identifier for upvote status")
):
    """Get public feature requests with upvote information"""
    try:
        result = await db_service.get_public_feature_requests(
            page=page,
            limit=limit,
            sort=sort,
            status=status,
            user_identifier=user_identifier
        )
        
        return PublicFeatureListResponse(
            success=True,
            data=result["features"],
            total=result["total"],
            page=page,
            limit=limit,
            total_pages=result["total_pages"]
        )
        
    except Exception as e:
        logger.error(f"Error getting public feature requests: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get feature requests"
        )


@router.post("/{feedback_id}/upvote", response_model=UpvoteResponse)
async def upvote_feedback(feedback_id: int, request: UpvoteRequest):
    """Upvote a feedback item (public endpoint)"""
    try:
        # Check if feedback exists and is a public feature request
        feedback = await db_service.get_feedback_by_id(feedback_id)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        if feedback.get("category") != "feature":
            raise HTTPException(
                status_code=400, 
                detail="Only feature requests can be upvoted"
            )
        
        if not feedback.get("isPublic", False):
            raise HTTPException(
                status_code=400, 
                detail="This feature request is not public"
            )
        
        # Add upvote
        result = await db_service.add_upvote(
            feedback_id=feedback_id,
            user_identifier=request.user_identifier,
            user_email=request.user_email,
            user_name=request.user_name
        )
        
        if result["success"]:
            return UpvoteResponse(
                success=True,
                message="Upvote added successfully",
                upvote_count=result["upvote_count"],
                user_has_upvoted=True
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to add upvote")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upvoting feedback {feedback_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upvote feedback"
        )


@router.delete("/{feedback_id}/upvote", response_model=UpvoteResponse)
async def remove_upvote(feedback_id: int, user_identifier: str = Query(...)):
    """Remove upvote from a feedback item (public endpoint)"""
    try:
        result = await db_service.remove_upvote(
            feedback_id=feedback_id,
            user_identifier=user_identifier
        )
        
        if result["success"]:
            return UpvoteResponse(
                success=True,
                message="Upvote removed successfully",
                upvote_count=result["upvote_count"],
                user_has_upvoted=False
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to remove upvote")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing upvote from feedback {feedback_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to remove upvote"
        )


@router.get("/features/trending", response_model=PublicFeatureListResponse)
async def get_trending_feature_requests(
    limit: int = Query(10, ge=1, le=50, description="Number of trending features"),
    user_identifier: Optional[str] = Query(None, description="User identifier for upvote status")
):
    """Get trending feature requests (most upvoted in last 30 days)"""
    try:
        result = await db_service.get_trending_feature_requests(
            limit=limit,
            user_identifier=user_identifier
        )
        
        return PublicFeatureListResponse(
            success=True,
            data=result["features"],
            total=len(result["features"]),
            page=1,
            limit=limit,
            total_pages=1
        )
        
    except Exception as e:
        logger.error(f"Error getting trending feature requests: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get trending features"
        ) 