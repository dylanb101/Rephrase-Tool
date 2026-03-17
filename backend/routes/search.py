from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import ai_functions, openalex

router = APIRouter()

class SearchRequest(BaseModel):
    session_id: str
    point: str

@router.post("/search")
async def search_analogies(request: SearchRequest):
    from main import session_store
    
    if request.session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a paper first.")
    
    context = session_store[request.session_id]
    
    try:
        # 1. Extract structure
        structure = ai_functions.extract_structure(request.point, context)
        
        # 2. Generate candidates
        candidates = ai_functions.generate_analogues(structure, context)
        
        results = []
        nodes = [{"id": "root", "label": "Your Point", "type": "root"}]
        edges = []
        
        for i, candidate in enumerate(candidates):
            # 3. Find citation
            citation = openalex.find_citation(candidate["search_query"], candidate["field"])
            
            if citation:
                # 4. Generate reframe
                reframe_data = ai_functions.generate_reframe(request.point, candidate, citation, context)
                
                # 5. Build result object
                result = {
                    "field": candidate["field"],
                    "concept": candidate["concept"],
                    "why": candidate["why"],
                    "reframe": reframe_data["reframe"],
                    "how_to_use": reframe_data["how_to_use"],
                    "citation": citation
                }
                results.append(result)
                
                # 6. Build graph nodes/edges
                node_id = f"field-{i}"
                nodes.append({"id": node_id, "label": candidate["field"], "type": "analogue"})
                edges.append({"source": "root", "target": node_id, "label": "structural analogy"})
        
        return {
            "structure": structure,
            "results": results,
            "graph": {
                "nodes": nodes,
                "edges": edges
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
