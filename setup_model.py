#!/usr/bin/env python3
"""
Setup script for PashuVision AI models
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'torch',
        'onnx',
        'onnxruntime',
        'numpy',
        'opencv-python'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} is missing")
    
    return missing_packages

def install_dependencies(packages):
    """Install missing dependencies"""
    if not packages:
        print("✅ All dependencies are already installed")
        return True
    
    print(f"📦 Installing missing packages: {', '.join(packages)}")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + packages)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        'backend/models',
        'backend/data',
        'backend/data/images'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")

def setup_mock_model():
    """Create mock model for testing"""
    try:
        # Run the mock model creation script
        result = subprocess.run([
            sys.executable, 'create_mock_model.py',
            '--output', 'backend/models/convnext_breed_model.onnx',
            '--info', 'backend/models/model_info.json',
            '--classes', '50'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Mock model created successfully")
            return True
        else:
            print(f"❌ Failed to create mock model: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error creating mock model: {e}")
        return False

def verify_setup():
    """Verify the setup is working"""
    model_path = Path('backend/models/convnext_breed_model.onnx')
    info_path = Path('backend/models/model_info.json')
    
    if model_path.exists() and info_path.exists():
        print("✅ Model files are present")
        return True
    else:
        print("❌ Model files are missing")
        return False

def main():
    parser = argparse.ArgumentParser(description='Setup PashuVision AI models')
    parser.add_argument('--skip-deps', action='store_true',
                       help='Skip dependency installation')
    parser.add_argument('--mock-only', action='store_true',
                       help='Only create mock model')
    
    args = parser.parse_args()
    
    print("🚀 Setting up PashuVision AI models...")
    
    # Check and install dependencies
    if not args.skip_deps:
        missing = check_dependencies()
        if missing:
            if not install_dependencies(missing):
                print("💥 Setup failed: Could not install dependencies")
                return False
    
    # Create directories
    create_directories()
    
    # Create mock model
    if args.mock_only or not Path('backend/models/convnext_breed_model.onnx').exists():
        if not setup_mock_model():
            print("💥 Setup failed: Could not create mock model")
            return False
    
    # Verify setup
    if verify_setup():
        print("🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the backend server: cd backend && npm run dev")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Access the application at http://localhost:5173")
        return True
    else:
        print("💥 Setup verification failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
