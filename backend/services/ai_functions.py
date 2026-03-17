import json
import logging
from services.ai.provider import get_provider

logger = logging.getLogger(__name__)

def _call(prompt: str, system: str = "") -> str:
    try:
        return get_provider().complete(prompt, system)
    except Exception as e:
        logger.error(f"AI Call failed: {str(e)}")
        raise e

def _parse_json(text: str):
    # Strip markdown fences if present
    text = text.strip()
    if text.startswith("```"):
        # Find start of content
        first_line_end = text.find("\n")
        last_fence_start = text.rfind("```")
        if first_line_end != -1 and last_fence_start != -1:
            text = text[first_line_end:last_fence_start]
        elif text.startswith("```json"):
            text = text[7:-3]
        else:
            text = text[3:-3]
    return json.loads(text.strip())

def extract_paper_context(paper_text: str) -> dict:
    system = "You are a research analysis assistant. Always respond with valid JSON only, no markdown, no explanation."
    prompt = f"""
        Read the following academic paper draft and extract a context object.
        Return ONLY a JSON object with these fields:
        {{
        "domain": "the primary academic field (e.g. clinical psychology)",
        "subfield": "the specific subfield",
        "thesis": "one sentence summary of the paper's core argument",
        "style": "formal or discursive",
        "key_terms": ["list", "of", "5", "domain-specific", "terms"]
        }}

        Paper:
        {paper_text}
    """
    return _parse_json(_call(prompt, system))

def extract_structure(point: str, context: dict) -> dict:
    system = "You are a structural analysis assistant. Always respond with valid JSON only, no markdown, no explanation."
    prompt = f"""A researcher is writing a paper in {context['domain']} with this thesis: {context['thesis']}.

They want to make this specific point:
"{point}"

Extract the underlying structural pattern of this point, stripped of its domain-specific language.

Return ONLY a JSON object:
{{
  "point": "the original point",
  "structure": "a concise label for the structural pattern",
  "core_pattern": "one sentence describing the abstract pattern",
  "key_variables": {{
    "trigger": "...",
    "mechanism": "...",
    "outcome": "..."
  }}
}}"""
    return _parse_json(_call(prompt, system))

def generate_analogues(structure: dict, context: dict) -> list:
    system = "You are a cross-disciplinary research assistant. Always respond with valid JSON only, no markdown, no explanation."
    prompt = f"""A researcher has identified this structural pattern:
Structure: {structure['structure']}
Pattern: {structure['core_pattern']}

Their paper is in {context['domain']}. Find 4 fields where this SAME structural pattern appears in a different domain. Do not include {context['domain']} itself.

Return ONLY a JSON array:
[
  {{
    "field": "Mathematics",
    "concept": "Fixed-point theorems",
    "search_query": "fixed point theorem self-referential systems",
    "why": "one sentence explaining the structural parallel"
  }}
]

Choose fields with well-established academic literature. Be structurally rigorous, not just thematically similar."""
    return _parse_json(_call(prompt, system))

def generate_reframe(point: str, analogue: dict, citation: dict, context: dict) -> dict:
    system = "You are a research writing assistant. Always respond with valid JSON only, no markdown, no explanation."
    prompt = f"""A researcher's paper is in {context['domain']}.
Their point: "{point}"

Analogous structure in {analogue['field']}:
Concept: {analogue['concept']}
Why parallel: {analogue['why']}
Citation: {citation['title']} by {citation['authors']} ({citation['year']})

Do two things:
1. Reframe the researcher's point using the language of {analogue['field']}. 2-3 sentences, academically rigorous.
2. Write a "how to use this" note: how could the researcher cite this analogue to strengthen their argument. 2 sentences.

Return ONLY:
{{
  "reframe": "...",
  "how_to_use": "..."
}}"""
    return _parse_json(_call(prompt, system))
