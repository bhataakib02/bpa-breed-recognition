#!/usr/bin/env python3
"""
Create mock ONNX model for testing PashuVision
"""

import numpy as np
import onnx
from onnx import helper, TensorProto
import argparse
from pathlib import Path

def create_mock_onnx_model(output_path, input_size=(1, 3, 224, 224), num_classes=50):
    """
    Create a mock ONNX model for testing
    
    Args:
        output_path (str): Output path for ONNX model
        input_size (tuple): Input tensor size
        num_classes (int): Number of output classes
    """
    try:
        # Create input tensor
        input_tensor = helper.make_tensor_value_info(
            'input', 
            TensorProto.FLOAT, 
            [input_size[0], input_size[1], input_size[2], input_size[3]]
        )
        
        # Create output tensor
        output_tensor = helper.make_tensor_value_info(
            'output', 
            TensorProto.FLOAT, 
            [input_size[0], num_classes]
        )
        
        # Create a simple mock model (identity-like operation)
        # This is just for testing - not a real breed classifier
        nodes = [
            # Global average pooling
            helper.make_node(
                'GlobalAveragePool',
                inputs=['input'],
                outputs=['pooled'],
                name='global_avg_pool'
            ),
            # Flatten
            helper.make_node(
                'Flatten',
                inputs=['pooled'],
                outputs=['flattened'],
                name='flatten'
            ),
            # Dummy linear layer (just for structure)
            helper.make_node(
                'MatMul',
                inputs=['flattened', 'weight'],
                outputs=['output'],
                name='linear'
            )
        ]
        
        # Create weight tensor
        weight_shape = [input_size[1], num_classes]  # Simplified
        weight_data = np.random.randn(*weight_shape).astype(np.float32)
        weight_tensor = helper.make_tensor(
            'weight',
            TensorProto.FLOAT,
            weight_shape,
            weight_data.flatten().tolist()
        )
        
        # Create graph
        graph = helper.make_graph(
            nodes,
            'mock_breed_classifier',
            [input_tensor],
            [output_tensor],
            [weight_tensor]
        )
        
        # Create model
        model = helper.make_model(graph)
        model.opset_import[0].version = 11
        
        # Save model
        onnx.save(model, output_path)
        
        # Verify model
        onnx.checker.check_model(model)
        
        print(f"✅ Mock ONNX model created: {output_path}")
        print(f"   Input shape: {input_size}")
        print(f"   Output classes: {num_classes}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating mock model: {str(e)}")
        return False

def create_model_info(output_path, num_classes=50):
    """
    Create model info JSON file
    """
    import json
    
    model_info = {
        "name": "Mock Breed Classifier",
        "version": "1.0.0",
        "description": "Mock model for testing PashuVision",
        "input_shape": [1, 3, 224, 224],
        "output_classes": num_classes,
        "breeds": [
            "Holstein Friesian", "Jersey", "Guernsey", "Ayrshire", "Brown Swiss",
            "Murrah", "Nili-Ravi", "Surti", "Mehsana", "Jaffarabadi",
            "Gir", "Sahiwal", "Red Sindhi", "Tharparkar", "Kankrej",
            "Ongole", "Krishna Valley", "Amritmahal", "Hallikar", "Kangayam",
            "Bargur", "Umblachery", "Pulikulam", "Malnad Gidda", "Deoni",
            "Dangi", "Gaolao", "Kenkatha", "Kherigarh", "Mewati",
            "Nagori", "Rathi", "Hariana", "Khillari", "Malvi",
            "Nimari", "Ponwar", "Siri", "Vechur", "Kasaragod",
            "Crossbreed 1", "Crossbreed 2", "Crossbreed 3", "Crossbreed 4", "Crossbreed 5",
            "Unknown Breed 1", "Unknown Breed 2", "Unknown Breed 3", "Unknown Breed 4", "Unknown Breed 5"
        ],
        "created_at": "2024-01-01T00:00:00Z",
        "model_type": "mock",
        "accuracy": "N/A (Mock Model)"
    }
    
    try:
        with open(output_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        print(f"✅ Model info created: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error creating model info: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Create mock ONNX model for testing')
    parser.add_argument('--output', '-o', default='./mock_breed_model.onnx', 
                       help='Output ONNX model path')
    parser.add_argument('--info', default='./model_info.json',
                       help='Output model info JSON path')
    parser.add_argument('--classes', '-c', type=int, default=50,
                       help='Number of output classes')
    parser.add_argument('--input-size', nargs=4, type=int, default=[1, 3, 224, 224],
                       help='Input tensor size (batch channels height width)')
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.info).parent.mkdir(parents=True, exist_ok=True)
    
    # Create mock model
    success1 = create_mock_onnx_model(
        args.output, 
        tuple(args.input_size), 
        args.classes
    )
    
    # Create model info
    success2 = create_model_info(args.info, args.classes)
    
    if success1 and success2:
        print("🎉 Mock model creation completed successfully!")
        print(f"📁 Model file: {args.output}")
        print(f"📁 Info file: {args.info}")
    else:
        print("💥 Mock model creation failed!")
        exit(1)

if __name__ == "__main__":
    main()
