import httpx
from typing import Dict, Optional

def reconstruct_abstract(inverted_index: dict) -> str:
    """
    Reconstructs an abstract from OpenAlex inverted index format.
    """
    if not inverted_index:
        return ""
    
    # Create a list of (position, word) tuples
    word_positions = []
    for word, positions in inverted_index.items():
        for pos in positions:
            word_positions.append((pos, word))
    
    # Sort by position
    word_positions.sort()
    
    # Join the words
    return " ".join([word for pos, word in word_positions])

def find_citation(search_query: str, field: str) -> Optional[dict]:
    """
    Calls OpenAlex API to find the top citation for a search query.
    """
    url = "https://api.openalex.org/works"
    params = {
        "search": search_query,
        "filter": "type:article",
        "sort": "cited_by_count:desc",
        "per-page": 3,
        "select": "title,authorships,publication_year,doi,abstract_inverted_index,cited_by_count",
        "mailto": "research-tool@example.com"
    }
    
    try:
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        
        results = data.get("results", [])
        if not results:
            return None
        
        top_result = results[0]
        
        # Format authors: "First Author et al."
        authorships = top_result.get("authorships", [])
        if authorships:
            first_author = authorships[0].get("author", {}).get("display_name", "Unknown")
            if len(authorships) > 1:
                authors = f"{first_author} et al."
            else:
                authors = first_author
        else:
            authors = "Unknown Author"
            
        abstract_raw = reconstruct_abstract(top_result.get("abstract_inverted_index", {}))
        abstract = abstract_raw[:200] + ("..." if len(abstract_raw) > 200 else "")
        
        return {
            "title": top_result.get("title"),
            "authors": authors,
            "year": top_result.get("publication_year"),
            "doi": top_result.get("doi"),
            "cited_by_count": top_result.get("cited_by_count"),
            "abstract": abstract
        }
    except Exception as e:
        print(f"OpenAlex API error: {str(e)}")
        return None
