import { useState, useRef } from 'react';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const ImageUpload = ({ value, onChange, className = '' }) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        _skipAuthRedirect: true
      });

      if (response.data.success) {
        onChange(response.data.url);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('productImage')}</label>

      {value ? (
        // Image preview
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = '';
              e.target.alt = 'Failed to load';
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md transition-colors"
              title={t('delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <p className="text-white text-xs font-medium">Image uploaded successfully</p>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
              <p className="text-sm text-green-600 font-medium">{t('uploading')}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{t('dragDrop')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('maxFileSize')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
