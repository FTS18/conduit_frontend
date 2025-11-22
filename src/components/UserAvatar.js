import React, { useState } from 'react';

const sizeMap = {
  sm: '24px',
  md: '32px',
  lg: '48px'
};

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C9A3'
];

const UserAvatar = ({ username = 'U', image, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (image && !imageError) {
    return (
      <div style={{ position: 'relative', width: sizeMap[size], height: sizeMap[size] }}>
        <img 
          src={image} 
          alt={username} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            width: sizeMap[size], 
            height: sizeMap[size], 
            borderRadius: '50%', 
            objectFit: 'cover',
            display: imageLoading ? 'none' : 'block'
          }}
        />
        {imageLoading && (
          <div
            style={{
              width: sizeMap[size],
              height: sizeMap[size],
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px'
            }}>
            ...
          </div>
        )}
      </div>
    );
  }

  const initials = (username || 'U')
    .split(' ')
    .map(n => n && n[0] ? n[0] : '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const bgColor = colors[Math.abs((username || 'U').split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];

  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: '50%',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: size === 'sm' ? '10px' : size === 'md' ? '14px' : '18px'
      }}>
      {initials}
    </div>
  );
};

export default UserAvatar;
