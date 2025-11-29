"""
Fix Dependency Conflicts
Attempts to resolve torch/transformers version conflicts
"""

import subprocess
import sys

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("=" * 60)
    print("PolyMathOS Dependency Fix Script")
    print("=" * 60)
    print()
    
    print("Attempting to fix torch/transformers dependency conflict...")
    print()
    
    # Option 1: Upgrade all packages
    print("Option 1: Upgrading packages...")
    success, stdout, stderr = run_command("pip install --upgrade torch transformers sentence-transformers")
    if success:
        print("✅ Packages upgraded successfully")
    else:
        print(f"❌ Upgrade failed: {stderr}")
    
    print()
    print("If upgrade doesn't work, try:")
    print("  pip install torch==2.1.0 transformers==4.35.0 sentence-transformers==2.2.2")
    print()
    print("Or make HDAM completely optional by using feature flags.")

if __name__ == "__main__":
    main()

