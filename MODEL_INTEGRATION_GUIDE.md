# Model Integration Guide

This guide explains how to integrate AI models into the PashuVision system.

## Model Architecture

The system uses ONNX models for breed classification and disease detection.

### Breed Classification Model
- **Type**: ConvNeXt-based classifier
- **Input**: 224x224 RGB images
- **Output**: Breed probabilities
- **Classes**: 50+ cattle and buffalo breeds

### Disease Detection Model
- **Type**: Custom CNN
- **Input**: 224x224 RGB images
- **Output**: Disease probabilities
- **Classes**: 10+ common diseases

## Integration Steps

1. **Model Loading**
   ```javascript
   const predictor = new BreedPredictor();
   await predictor.loadModel();
   ```

2. **Image Preprocessing**
   ```javascript
   const processedImage = await predictor.preprocessImage(image);
   ```

3. **Prediction**
   ```javascript
   const prediction = await predictor.predict(processedImage);
   ```

4. **Post-processing**
   ```javascript
   const result = predictor.postprocess(prediction);
   ```

## API Integration

The models are integrated through REST API endpoints:

- `POST /api/predict` - Breed prediction
- `POST /api/detect-diseases` - Disease detection
- `GET /api/ai/status` - Model status

## Performance Optimization

- Model quantization for faster inference
- Batch processing for multiple images
- Caching for repeated predictions
- GPU acceleration when available

## Error Handling

- Model loading failures
- Invalid input images
- Prediction timeouts
- Memory management

## Monitoring

- Inference time tracking
- Accuracy monitoring
- Model performance metrics
- Error rate analysis

