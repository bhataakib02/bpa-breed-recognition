#!/usr/bin/env python3
"""
Convert PyTorch model to ONNX format for PashuVision
"""

import torch
import torch.onnx
import onnx
from pathlib import Path
import argparse

def convert_pytorch_to_onnx(model_path, output_path, input_size=(1, 3, 224, 224)):
    """
    Convert PyTorch model to ONNX format
    
    Args:
        model_path (str): Path to PyTorch model file
        output_path (str): Output path for ONNX model
        input_size (tuple): Input tensor size (batch, channels, height, width)
    """
    try:
        # Load PyTorch model
        print(f"Loading PyTorch model from {model_path}")
        model = torch.load(model_path, map_location='cpu')
        model.eval()
        
        # Create dummy input
        dummy_input = torch.randn(input_size)
        
        # Export to ONNX
        print(f"Converting to ONNX format...")
        torch.onnx.export(
            model,
            dummy_input,
            output_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        # Verify ONNX model
        print(f"Verifying ONNX model...")
        onnx_model = onnx.load(output_path)
        onnx.checker.check_model(onnx_model)
        
        print(f"✅ Successfully converted to ONNX: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting model: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Convert PyTorch model to ONNX')
    parser.add_argument('--input', '-i', required=True, help='Input PyTorch model path')
    parser.add_argument('--output', '-o', required=True, help='Output ONNX model path')
    parser.add_argument('--input-size', nargs=4, type=int, default=[1, 3, 224, 224],
                       help='Input tensor size (batch channels height width)')
    
    args = parser.parse_args()
    
    # Convert model
    success = convert_pytorch_to_onnx(
        args.input, 
        args.output, 
        tuple(args.input_size)
    )
    
    if success:
        print("🎉 Model conversion completed successfully!")
    else:
        print("💥 Model conversion failed!")
        exit(1)

if __name__ == "__main__":
    main()
