import cv2
import numpy as np
import sys

def find_watermark(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []
    
    for i in range(50):
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frames.append(gray)
        
    cap.release()
    
    if not frames:
        print("Failed to read video")
        return
        
    frames = np.array(frames)
    
    std_dev = np.std(frames, axis=0)
    
    h, w = std_dev.shape
    bottom_right = std_dev[h//2:, w//2:]
    
    mask = bottom_right < 5
    
    y_indices, x_indices = np.where(mask)
    if len(y_indices) == 0:
        print("No static watermark found in bottom right")
        return
        
    min_x, max_x = np.min(x_indices), np.max(x_indices)
    min_y, max_y = np.min(y_indices), np.max(y_indices)
    
    final_x = min_x + w//2
    final_y = min_y + h//2
    final_w = max_x - min_x
    final_h = max_y - min_y
    
    print(f"Estimated watermark box: x={final_x}, y={final_y}, w={final_w}, h={final_h}")

find_watermark(sys.argv[1])
