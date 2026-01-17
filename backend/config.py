import os
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path

# <--- ADD THIS: Fix for Windows DNS/Firebase Connection Error
os.environ["GRPC_DNS_RESOLVER"] = "native"

BASE_DIR = Path(__file__).resolve().parent
CRED_PATH = BASE_DIR / "serviceAccountKey.json"

def init_firebase():
    if not firebase_admin._apps:
        if not CRED_PATH.exists():
            raise FileNotFoundError(f"Key not found at: {CRED_PATH}")
        
        cred = credentials.Certificate(str(CRED_PATH))
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin Initialized")

def get_db():
    init_firebase()
    return firestore.client()