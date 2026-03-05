"""
Superuser WebSocket for Real-Time Activity Feed
=================================================

WebSocket endpoint that streams activity events to authenticated
superuser clients. Uses JWT token verification via query parameter.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from api.auth_middleware import verify_jwt_token
from services.activity_logger import activity_broadcaster

router = APIRouter(prefix="/ws", tags=["Superuser WebSocket"])


@router.websocket("/superuser/activity-feed")
async def superuser_activity_feed(
    websocket: WebSocket,
    token: str = Query(None),
):
    """
    WebSocket endpoint for real-time activity streaming.
    
    Connect with: ws://host/ws/superuser/activity-feed?token=<JWT>
    
    The client receives JSON objects for each new activity event.
    """
    # Verify JWT token
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    payload = verify_jwt_token(token)
    if payload is None or payload.get("role") != "superuser":
        await websocket.close(code=4003, reason="Unauthorized")
        return

    # Accept connection
    await websocket.accept()
    activity_broadcaster.register(websocket)

    try:
        # Keep connection alive — listen for pings or close
        while True:
            data = await websocket.receive_text()
            # Client can send "ping" to keep alive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        activity_broadcaster.unregister(websocket)
