from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
from services import parser, ai_functions

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = parser.parse_document(content, file.filename)
        
        # Extract paper context using AI
        context = ai_functions.extract_paper_context(text)
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Import session_store from main (using a more robust way later or just app.state)
        # For now, we'll assume we can access it from the app instance or a shared module.
        # Let's use a shared store in main.py for simplicity as per instructions.
        from main import session_store
        session_store[session_id] = context
        
        return {
            "session_id": session_id,
            "context": context
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
