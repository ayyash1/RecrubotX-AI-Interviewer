"""
Activity Logger Service
========================

Centralized service for logging all user activities and broadcasting
them to connected superuser WebSocket clients in real time.
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import WebSocket

from database.superuser_crud import create_activity_log


class ActivityBroadcaster:
    """
    Singleton that maintains connected superuser WebSocket clients
    and pushes new activity events in real time.
    """

    def __init__(self):
        self.connections: List[WebSocket] = []

    def register(self, websocket: WebSocket):
        """Register a new superuser WebSocket connection."""
        self.connections.append(websocket)

    def unregister(self, websocket: WebSocket):
        """Unregister a disconnected WebSocket."""
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, event: dict):
        """Broadcast an activity event to all connected superusers."""
        if not self.connections:
            return

        message = json.dumps(event, default=str)
        disconnected = []

        for ws in self.connections:
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(ws)

        # Clean up disconnected clients
        for ws in disconnected:
            self.unregister(ws)


# Global singleton
activity_broadcaster = ActivityBroadcaster()


async def log_activity(
    db,
    user_id: str,
    user_email: str,
    user_role: str,
    action_type: str,
    action_detail: Dict[str, Any] = None,
    ip_address: str = None,
    resource_type: str = None,
    resource_id: str = None,
):
    """
    Log an activity to the database AND broadcast to connected
    superuser WebSocket clients.
    """
    # Store in database
    log_id = await create_activity_log(
        db=db,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
        action_type=action_type,
        action_detail=action_detail,
        ip_address=ip_address,
        resource_type=resource_type,
        resource_id=resource_id,
    )

    # Broadcast to connected superusers
    event = {
        "id": log_id,
        "user_id": user_id,
        "user_email": user_email,
        "user_role": user_role,
        "action_type": action_type,
        "action_detail": action_detail or {},
        "ip_address": ip_address,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "timestamp": datetime.utcnow().isoformat(),
    }

    # Fire-and-forget broadcast (don't block the API response)
    try:
        await activity_broadcaster.broadcast(event)
    except Exception as e:
        print(f"⚠ Activity broadcast error: {e}")

    return log_id
