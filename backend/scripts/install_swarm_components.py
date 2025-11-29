#!/usr/bin/env python3
"""
Installation Script for Swarm Corporation Components
Installs all Python packages and verifies component availability
"""

import subprocess
import sys
import os
from pathlib import Path

# Components that can be installed via pip
PIP_PACKAGES = [
    "swarm-shield>=0.0.1",
    "doc-master>=1.0.0",
    "omniparse>=1.0.0",
    "agentparse>=1.0.0",
    "research-paper-hive>=1.0.0",
    "advanced-research>=1.0.0",
    "agent-rag-protocol>=1.0.0",
    "multi-agent-rag-template>=1.0.0",
    "zero>=1.0.0",
    "swarms-utils>=1.0.0",
]

# Components that need to be installed from GitHub
GITHUB_REPOS = {
    "swarm-shield": "https://github.com/The-Swarm-Corporation/swarm-shield.git",
    "doc-master": "https://github.com/The-Swarm-Corporation/doc-master.git",
    "OmniParse": "https://github.com/The-Swarm-Corporation/OmniParse.git",
    "AgentParse": "https://github.com/The-Swarm-Corporation/AgentParse.git",
    "Research-Paper-Hive": "https://github.com/The-Swarm-Corporation/Research-Paper-Hive.git",
    "AdvancedResearch": "https://github.com/The-Swarm-Corporation/AdvancedResearch.git",
    "AgentRAGProtocol": "https://github.com/The-Swarm-Corporation/AgentRAGProtocol.git",
    "Multi-Agent-RAG-Template": "https://github.com/The-Swarm-Corporation/Multi-Agent-RAG-Template.git",
    "Zero": "https://github.com/The-Swarm-Corporation/Zero.git",
    "swarms-utils": "https://github.com/The-Swarm-Corporation/swarms-utils.git",
    "Custom-Swarms-Spec-Template": "https://github.com/The-Swarm-Corporation/Custom-Swarms-Spec-Template.git",
}

def run_command(cmd, check=True):
    """Run a shell command"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False

def install_pip_packages():
    """Install packages via pip"""
    print("\n=== Installing pip packages ===")
    for package in PIP_PACKAGES:
        print(f"\nInstalling {package}...")
        success = run_command(f"{sys.executable} -m pip install {package}", check=False)
        if not success:
            print(f"Warning: Failed to install {package} via pip. You may need to install from source.")

def install_from_github():
    """Install packages from GitHub repositories"""
    print("\n=== Installing from GitHub repositories ===")
    temp_dir = Path("/tmp/swarm_components") if sys.platform != "win32" else Path(os.getenv("TEMP", ".")) / "swarm_components"
    temp_dir.mkdir(exist_ok=True)
    
    for name, url in GITHUB_REPOS.items():
        print(f"\nInstalling {name} from {url}...")
        repo_dir = temp_dir / name.lower().replace("-", "_")
        
        # Clone or update repository
        if repo_dir.exists():
            print(f"  Updating existing repository...")
            run_command(f"cd {repo_dir} && git pull", check=False)
        else:
            print(f"  Cloning repository...")
            run_command(f"git clone {url} {repo_dir}", check=False)
        
        # Install package
        if repo_dir.exists() and (repo_dir / "setup.py").exists():
            print(f"  Installing package...")
            run_command(f"cd {repo_dir} && {sys.executable} -m pip install -e .", check=False)
        elif repo_dir.exists() and (repo_dir / "pyproject.toml").exists():
            print(f"  Installing package (pyproject.toml)...")
            run_command(f"cd {repo_dir} && {sys.executable} -m pip install -e .", check=False)
        else:
            print(f"  Warning: No setup.py or pyproject.toml found. Skipping installation.")

def verify_installations():
    """Verify that components can be imported"""
    print("\n=== Verifying installations ===")
    
    components = [
        ("swarm_shield", "SwarmShield"),
        ("doc_master", "doc-master"),
        ("omniparse", "OmniParse"),
        ("agentparse", "AgentParse"),
        ("research_paper_hive", "Research-Paper-Hive"),
        ("advanced_research", "AdvancedResearch"),
        ("agent_rag_protocol", "AgentRAGProtocol"),
        ("multi_agent_rag_template", "Multi-Agent-RAG-Template"),
        ("zero", "Zero"),
        ("swarms_utils", "swarms-utils"),
    ]
    
    results = {}
    for module_name, display_name in components:
        try:
            __import__(module_name)
            results[display_name] = "✓ Available"
            print(f"  {display_name}: ✓ Available")
        except ImportError:
            results[display_name] = "✗ Not available"
            print(f"  {display_name}: ✗ Not available")
    
    return results

def main():
    """Main installation function"""
    print("=" * 60)
    print("Swarm Corporation Components Installation Script")
    print("=" * 60)
    
    # Install pip packages
    install_pip_packages()
    
    # Install from GitHub (optional, for latest versions)
    print("\n=== GitHub Installation (Optional) ===")
    response = input("Install components from GitHub repositories? (y/n): ").strip().lower()
    if response == 'y':
        install_from_github()
    
    # Verify installations
    results = verify_installations()
    
    # Summary
    print("\n" + "=" * 60)
    print("Installation Summary")
    print("=" * 60)
    available = sum(1 for status in results.values() if "✓" in status)
    total = len(results)
    print(f"Available: {available}/{total}")
    
    if available < total:
        print("\nSome components are not available. This is normal if:")
        print("  1. Components need to be installed from source")
        print("  2. Components are optional and not required")
        print("  3. Components have dependencies that need to be installed separately")
    
    print("\nInstallation complete!")

if __name__ == "__main__":
    main()

