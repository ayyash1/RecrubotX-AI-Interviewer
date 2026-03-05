"""Email Verification Service

Sends OTP verification codes via an email API provider (no SMTP).

Why API (MVP-friendly):
- Works reliably on common hosts (Render/Vercel) where SMTP ports can be blocked.
- Free-tier providers exist (e.g., Brevo has a generous free daily limit).

OTPs are stored in MongoDB with expiry timestamps.
"""

import os
import random
from datetime import datetime, timedelta

import httpx
from dotenv import load_dotenv

load_dotenv()

OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6


def generate_otp() -> str:
    """Generate a secure 6-digit OTP."""
    return str(random.randint(100000, 999999))


async def store_otp(db, email: str, otp: str):
    """Store OTP in MongoDB with expiry timestamp."""
    await db.email_otps.delete_many({"email": email.lower()})  # Remove old OTPs
    await db.email_otps.insert_one({
        "email": email.lower(),
        "otp": otp,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "verified": False,
    })


async def verify_otp(db, email: str, otp: str) -> bool:
    """Check if OTP is valid and not expired."""
    record = await db.email_otps.find_one({
        "email": email.lower(),
        "otp": otp,
        "expires_at": {"$gt": datetime.utcnow()},
        "verified": False,
    })
    if record:
        await db.email_otps.update_one(
            {"_id": record["_id"]},
            {"$set": {"verified": True}}
        )
        return True
    return False


async def is_email_verified(db, email: str) -> bool:
    """Check if an email has been verified (OTP was confirmed)."""
    record = await db.email_otps.find_one({
        "email": email.lower(),
        "verified": True,
        "expires_at": {"$gt": datetime.utcnow() - timedelta(minutes=30)},  # Valid for 30 min after verification
    })
    return record is not None


async def cleanup_expired_otps(db):
    """Remove expired OTP records."""
    await db.email_otps.delete_many({
        "expires_at": {"$lt": datetime.utcnow()}
    })


def _is_production() -> bool:
    env = (
        os.getenv("APP_ENV")
        or os.getenv("ENV")
        or os.getenv("ENVIRONMENT")
        or ""
    ).strip().lower()
    return env in {"prod", "production"}


def _otp_html(otp: str) -> str:
    return f"""
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="background: #0a2a5e; padding: 32px; text-align: center; color: white;">
            <h1>RecruBotX</h1>
        </div>
        <div style="padding: 32px; text-align: center;">
            <p>Your verification code is:</p>
            <h2 style="font-size: 36px; letter-spacing: 8px; color: #0a2a5e;">{otp}</h2>
            <p style="color: #6b7280;">Expires in 10 minutes.</p>
        </div>
    </div>
    """


async def _send_via_brevo(to_email: str, otp: str) -> bool:
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    from_email = os.getenv("EMAIL_FROM_EMAIL", "").strip()
    from_name = os.getenv("EMAIL_FROM_NAME", "RecruBotX").strip() or "RecruBotX"
    if not api_key or not from_email:
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "sender": {"name": from_name, "email": from_email},
        "to": [{"email": to_email}],
        "subject": f"RecruBotX - Your Verification Code: {otp}",
        "htmlContent": _otp_html(otp),
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code in {200, 201, 202}:
        print(f"[SUCCESS] OTP sent via Brevo to {to_email}")
        return True

    print(f"[ERROR] Brevo API failed: {response.status_code} {response.text}")
    return False


async def _send_via_resend(to_email: str, otp: str) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    resend_from = os.getenv("RESEND_FROM", "RecruBotX <onboarding@resend.dev>").strip()
    if not api_key:
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "from": resend_from,
        "to": [to_email],
        "subject": f"RecruBotX - Your Verification Code: {otp}",
        "html": _otp_html(otp),
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code in {200, 201}:
        print(f"[SUCCESS] OTP sent via Resend to {to_email}")
        return True

    print(f"[ERROR] Resend API failed: {response.status_code} {response.text}")
    return False


async def send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP verification email via an email API provider.

    Provider selection order:
    1) EMAIL_PROVIDER if set ("brevo" or "resend")
    2) If BREVO_API_KEY is present -> Brevo
    3) If RESEND_API_KEY is present -> Resend
    4) Development fallback (prints OTP) ONLY when not production
    """

    provider = (os.getenv("EMAIL_PROVIDER") or "").strip().lower()

    try_order: list[str]
    if provider:
        try_order = [provider]
    else:
        try_order = []
        if os.getenv("BREVO_API_KEY"):
            try_order.append("brevo")
        if os.getenv("RESEND_API_KEY"):
            try_order.append("resend")

    for p in try_order:
        if p == "brevo":
            if await _send_via_brevo(to_email, otp):
                return True
        elif p == "resend":
            if await _send_via_resend(to_email, otp):
                return True

    if _is_production():
        print("[ERROR] No email provider configured for OTP sending.")
        return False

    print(f"[WARNING] No email provider configured. OTP for {to_email}: {otp}")
    return True

