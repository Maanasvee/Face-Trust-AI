# Model Training Notebooks

Jupyter notebooks for training AI models used in FaceTrust AI.

## Datasets Required

1. **Face Recognition**: LFW People Dataset
   - https://www.kaggle.com/datasets/atulanandjha/lfwpeople
   - Place in: `datasets/lfw-people/`

2. **Deepfake Detection**: Deepfake and Real Images
   - https://www.kaggle.com/datasets/manjilkarki/deepfake-and-real-images
   - Place in: `datasets/deepfake/real/` and `datasets/deepfake/fake/`

3. **Emotion Detection**: FER2013
   - https://www.kaggle.com/datasets/msambare/fer2013
   - Place in: `datasets/fer2013/train/` and `datasets/fer2013/test/`

4. **Liveness Detection**: Yawn Eye Dataset
   - https://www.kaggle.com/datasets/selfishgene/yawn-eye-dataset
   - Place in: `datasets/yawn-eye/`

## Setup

```bash
pip install jupyter notebook
pip install tensorflow torch torchvision opencv-python scikit-learn matplotlib
```

## Running Notebooks

```bash
jupyter notebook
```

Then open each notebook in order:
1. `1_face_recognition_training.ipynb`
2. `2_deepfake_detection_training.ipynb`
3. `3_emotion_detection_training.ipynb`

## Note

For the prototype, we use pre-trained models (DeepFace) for faster deployment. These notebooks are provided for custom model training if needed.
