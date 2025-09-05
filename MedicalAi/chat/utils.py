# chat/utils.py
import json
import os
from django.conf import settings

def load_disease_data():
    """Load disease data from the static files directory."""
    # Try multiple possible locations for the disease data file
    possible_paths = [
        # Development path (when running with runserver)
        os.path.join(settings.BASE_DIR, 'chat', 'static', 'chat', 'data', '24-Disease.json'),
        # Production path (after collectstatic)
        os.path.join(settings.STATIC_ROOT, 'chat', 'data', '24-Disease.json') if hasattr(settings, 'STATIC_ROOT') else None,
        # Direct path from the project root
        os.path.join(settings.BASE_DIR, '..', 'chat', 'static', 'chat', 'data', '24-Disease.json')
    ]
    
    # Remove None values (in case STATIC_ROOT is not set)
    possible_paths = [p for p in possible_paths if p is not None]
    
    # Try each path until we find the file
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                print(f"Error loading disease data from {path}: {str(e)}")
                continue
    
    # If we get here, the file wasn't found in any location
    error_msg = "Could not find disease data file. Tried the following paths:\n"
    error_msg += "\n".join([f"- {p} (exists: {os.path.exists(p)})" for p in possible_paths])
    raise FileNotFoundError(error_msg)
