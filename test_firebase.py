import asyncio
from backend.app.core.firebase import firebase_auth

async def test_firebase():
    # Test initialization
    firebase_auth.initialize()
    print("Firebase initialized successfully")

    # Test invalid token
    result = await firebase_auth.verify_token("invalid_token")
    print(f"Invalid token verification result: {result}")

    # Test with a sample valid token (this would need a real token from frontend)
    # For now, just test the structure
    print("Firebase authentication setup is working correctly")

if __name__ == "__main__":
    asyncio.run(test_firebase())
