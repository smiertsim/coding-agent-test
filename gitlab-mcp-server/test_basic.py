#!/usr/bin/env python3
"""
Simple test script to verify GitLab MCP Server functionality.

This script tests the configuration loading and basic initialization
without requiring an actual GitLab token.
"""

import os
import sys
import tempfile
import json
from pathlib import Path

# Add the source directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from gitlab_mcp_server.config import load_config, GitLabConfig


def test_config_loading():
    """Test configuration loading from various sources."""
    print("Testing configuration loading...")
    
    # Test 1: Environment variable
    print("\n1. Testing environment variable configuration:")
    os.environ["GITLAB_TOKEN"] = "test-token-env"
    os.environ["GITLAB_URL"] = "https://test.gitlab.com"
    
    try:
        config = load_config()
        print(f"✓ Loaded config from environment:")
        print(f"  Token: {config.gitlab_token[:10]}...")
        print(f"  URL: {config.gitlab_url}")
        print(f"  Timeout: {config.timeout}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 2: Config file
    print("\n2. Testing config file configuration:")
    config_data = {
        "gitlab_token": "test-token-file",
        "gitlab_url": "https://file.gitlab.com",
        "timeout": 60,
        "max_results": 50
    }
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(config_data, f)
        config_file = f.name
    
    try:
        config = load_config(config_file=config_file)
        print(f"✓ Loaded config from file:")
        print(f"  Token: {config.gitlab_token[:10]}...")
        print(f"  URL: {config.gitlab_url}")
        print(f"  Timeout: {config.timeout}")
        print(f"  Max results: {config.max_results}")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        os.unlink(config_file)
    
    # Test 3: Explicit parameters
    print("\n3. Testing explicit parameter configuration:")
    try:
        config = load_config(
            gitlab_token="test-token-param",
            gitlab_url="https://param.gitlab.com"
        )
        print(f"✓ Loaded config from parameters:")
        print(f"  Token: {config.gitlab_token[:10]}...")
        print(f"  URL: {config.gitlab_url}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 4: Missing token error
    print("\n4. Testing missing token error handling:")
    # Clear environment
    if "GITLAB_TOKEN" in os.environ:
        del os.environ["GITLAB_TOKEN"]
    
    try:
        config = load_config()
        print(f"✗ Should have failed with missing token")
    except ValueError as e:
        print(f"✓ Correctly caught missing token error: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")


def test_gitlab_client_init():
    """Test GitLab client initialization."""
    print("\n\nTesting GitLab client initialization...")
    
    try:
        from gitlab_mcp_server.gitlab_client import GitLabClient
        
        config = GitLabConfig(
            gitlab_token="test-token",
            gitlab_url="https://gitlab.com"
        )
        
        client = GitLabClient(config)
        print("✓ GitLab client created successfully")
        print(f"  URL: {client.config.gitlab_url}")
        print(f"  Timeout: {client.config.timeout}")
        
        # Note: We can't test authentication without a real token
        print("  (Authentication test skipped - requires real token)")
        
    except Exception as e:
        print(f"✗ Error creating GitLab client: {e}")


def test_server_import():
    """Test server module import."""
    print("\n\nTesting server module import...")
    
    try:
        from gitlab_mcp_server.server import create_app
        print("✓ Server module imported successfully")
        print("  (Server creation test skipped - requires authentication)")
    except Exception as e:
        print(f"✗ Error importing server module: {e}")


def main():
    """Run all tests."""
    print("GitLab MCP Server Test Suite")
    print("=" * 40)
    
    test_config_loading()
    test_gitlab_client_init()
    test_server_import()
    
    print("\n" + "=" * 40)
    print("Test suite completed!")
    print("\nTo test with a real GitLab token:")
    print("1. Set GITLAB_TOKEN environment variable")
    print("2. Run: gitlab-mcp-server")
    print("3. Test MCP protocol with a compatible client")


if __name__ == "__main__":
    main()