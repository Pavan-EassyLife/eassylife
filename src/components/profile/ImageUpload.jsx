import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import { Upload, X, Loader2, Camera, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { useProfile } from '../../hooks/useProfile.js';
import 'react-image-crop/dist/ReactCrop.css';

/**
 * ImageUpload - Component for uploading and cropping profile images
 * Features drag-and-drop, circular crop, and API integration
 */
const ImageUpload = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const { uploadProfileImage, imageUploading } = useProfile();
  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'crop', 'uploading', 'success'
  
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // File validation
  const validateFile = (file) => {
    if (!file) {
      throw new Error('Please select a file');
    }

    if (!acceptedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    return true;
  };

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only JPEG, PNG, and WebP images are allowed');
      } else {
        setError('Invalid file selected');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        validateFile(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result);
          setStep('crop');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError(error.message);
      }
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes.map(type => `.${type.split('/')[1]}`)
    },
    maxFiles: 1,
    maxSize,
    multiple: false
  });

  // Generate cropped image
  const getCroppedImg = useCallback((image, crop) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!crop || !canvas || !ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) {
      setError('Please adjust the crop area');
      return;
    }

    setStep('uploading');
    setError(null);

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      if (!croppedImageBlob) {
        throw new Error('Failed to process image');
      }

      const file = new File([croppedImageBlob], 'profile-image.jpg', {
        type: 'image/jpeg',
      });

      const result = await uploadProfileImage(file);
      
      if (result.success) {
        setStep('success');
        if (onSuccess) {
          onSuccess(result.data);
        }
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      setError(error.message);
      setStep('crop');
    }
  };

  // Handle close
  const handleClose = () => {
    setImageSrc(null);
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      aspect: 1,
    });
    setCompletedCrop(null);
    setError(null);
    setStep('upload');
    if (onClose) {
      onClose();
    }
  };

  // Reset to upload step
  const handleReset = () => {
    setImageSrc(null);
    setError(null);
    setStep('upload');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {step === 'upload' && 'Change Profile Picture'}
              {step === 'crop' && 'Crop Your Image'}
              {step === 'uploading' && 'Uploading...'}
              {step === 'success' && 'Upload Complete'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Upload Step */}
            {step === 'upload' && (
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, WebP up to {Math.round(maxSize / (1024 * 1024))}MB
                  </p>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Crop Step */}
            {step === 'crop' && imageSrc && (
              <div className="space-y-4">
                <div className="max-h-80 overflow-hidden rounded-lg">
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={(completedCrop) => setCompletedCrop(completedCrop)}
                    aspect={1}
                    circularCrop
                    className="max-w-full"
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      className="max-w-full h-auto"
                      onLoad={() => {
                        const { width, height } = imgRef.current;
                        const size = Math.min(width, height);
                        const x = (width - size) / 2;
                        const y = (height - size) / 2;
                        
                        setCrop({
                          unit: 'px',
                          width: size,
                          height: size,
                          x,
                          y,
                          aspect: 1,
                        });
                      }}
                    />
                  </ReactCrop>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!completedCrop}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Uploading Step */}
            {step === 'uploading' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Uploading your profile picture...</p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium">Profile picture updated!</p>
                <p className="text-gray-600 text-sm">Your new profile picture has been saved.</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageUpload;
