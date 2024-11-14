# ~/Desktop/hackathons/intelredhat/production/kubo-models/models/lipsync/src/processor.py
import numpy as np
import openvino.runtime as ov
import librosa
import soundfile as sf
from pathlib import Path

class LipSyncProcessor:
    def __init__(self):
        self.model_dir = Path("/app/model")  # Docker container path
        self.model_path = self.model_dir / "lipsync_model_ir.xml"
        self.frame_length = 0.04  # 40ms per frame

        # Initialize OpenVINO
        self.core = ov.Core()
        self._load_model()
        
    def _load_model(self):
        print(f"Loading model from {self.model_path}")
        self.model = self.core.read_model(str(self.model_path))
        
        # Configure for Intel optimizations
        config = {
            "PERFORMANCE_HINT": "LATENCY",
            "INFERENCE_NUM_THREADS": "4",
            "INFERENCE_PRECISION_HINT": "FP32"
        }
        
        self.compiled_model = self.core.compile_model(self.model, "CPU", config)
        self.input_layer = self.compiled_model.input(0)
        self.output_layer = self.compiled_model.output(0)
        print("Model loaded successfully")

    def process_audio(self, audio_file: str) -> dict:
        try:
            # Load audio
            audio_data, sr = librosa.load(audio_file, sr=16000)
            
            # Convert to mel spectrogram
            mel_spec = librosa.feature.melspectrogram(
                y=audio_data,
                sr=sr,
                n_mels=80,
                n_fft=400,
                hop_length=int(self.frame_length * sr)
            )
            
            # Prepare for inference
            mel_spec = mel_spec.reshape(1, 80, -1).astype(np.float32)
            
            # Run inference
            result = self.compiled_model([mel_spec])[self.output_layer]
            predictions = np.argmax(result[0], axis=-1)
            
            # Calculate duration
            duration = len(audio_data) / sr
            
            # Convert to mouth cues
            viseme_map = ['X', 'A', 'B', 'C', 'D', 'E', 'F']
            mouth_cues = []
            current_viseme = None
            current_start = 0
            
            for i, pred in enumerate(predictions):
                frame_time = i * self.frame_length
                viseme = viseme_map[pred]
                
                if viseme != current_viseme:
                    if current_viseme is not None:
                        mouth_cues.append({
                            "start": round(current_start, 2),
                            "end": round(frame_time, 2),
                            "value": current_viseme
                        })
                    current_viseme = viseme
                    current_start = frame_time
            
            # Add final mouth cue
            if current_viseme is not None:
                mouth_cues.append({
                    "start": round(current_start, 2),
                    "end": round(duration, 2),
                    "value": current_viseme
                })
            
            # Post-process cues for better transitions
            merged_cues = []
            min_duration = 0.03  # 30ms minimum duration
            
            for i, cue in enumerate(mouth_cues):
                duration = cue["end"] - cue["start"]
                if duration < min_duration and i > 0:
                    merged_cues[-1]["end"] = cue["end"]
                else:
                    merged_cues.append(cue)
            
            return {
                "metadata": {
                    "soundFile": audio_file,
                    "duration": round(duration, 2)
                },
                "mouthCues": merged_cues
            }
            
        except Exception as e:
            print(f"Error processing audio: {e}")
            raise