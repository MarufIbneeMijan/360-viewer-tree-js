import React from 'react';

export const SmoothFade = ({ active }) => {
    return (
        <div 
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                backgroundColor: '#000000',
                zIndex: 9999,
                pointerEvents: 'none', // Allows clicking through when transparent
                opacity: active ? 1 : 0,
                visibility: active ? 'visible' : 'hidden',
                transition: 'opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.4s'
            }}
        />
    );
};