# Complete Model Setup Guide

This guide provides comprehensive instructions for setting up the AI models for PashuVision.

## Prerequisites

- Python 3.8+
- ONNX Runtime
- PyTorch
- OpenCV

## Model Installation

1. Download the model files
2. Place them in the `backend/models/` directory
3. Update the model paths in the configuration

## Model Files Required

- `convnext_breed_model.onnx` - Main breed classification model
- `model_info.json` - Model metadata and configuration

## Configuration

Update the model paths in `backend/src/ai/BreedPredictor.js`:

```javascript
const MODEL_PATH = './models/convnext_breed_model.onnx';
```

## Testing

Run the model test to verify installation:

```bash
cd backend
node src/ai/BreedPredictor.js
```

## Troubleshooting

- Ensure model files are in the correct directory
- Check file permissions
- Verify ONNX Runtime installation
- Check model compatibility with your system

