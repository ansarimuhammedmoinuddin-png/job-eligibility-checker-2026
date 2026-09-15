import sys
from pathlib import Path

# Ensure repository root is on sys.path so 'backend' is importable
# regardless of whether pytest is invoked from root or the backend directory.
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
