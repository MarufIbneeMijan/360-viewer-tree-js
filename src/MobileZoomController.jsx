import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export const MobileZoomController = ({ setFov, isTopView }) => {
    const { camera, gl } = useThree();
    const initialDistance = useRef(null);
    const initialFov = useRef(null);

    useEffect(() => {
        if (isTopView) return; // Allow default map panning behaviors when looking from above

        const domElement = gl.domElement;

        // Helper: Calculate the direct pixel length between two touch coordinates
        const getTouchDistance = (touches) => {
            if (touches.length < 2) return 0;
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                initialDistance.current = getTouchDistance(e.touches);
                initialFov.current = camera.fov;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && initialDistance.current !== null) {
                e.preventDefault(); // Prevents the mobile browser itself from zooming or bouncing
                
                const currentDistance = getTouchDistance(e.touches);
                const delta = currentDistance / initialDistance.current;

                // Scaling inversely: Increasing distance (pinching out) drops FOV (Zooming In)
                setFov((prev) => {
                    const targetFov = initialFov.current / delta;
                    const constrainedFov = Math.max(30, Math.min(95, targetFov));
                    
                    // Direct low-latency hardware matrix injection
                    camera.fov = constrainedFov;
                    camera.updateProjectionMatrix();
                    
                    return constrainedFov;
                });
            }
        };

        const handleTouchEnd = () => {
            initialDistance.current = null;
        };

        // Attach touch triggers directly into the WebGL drawing window
        domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        domElement.addEventListener('touchend', handleTouchEnd);

        return () => {
            domElement.removeEventListener('touchstart', handleTouchStart);
            domElement.removeEventListener('touchmove', handleTouchMove);
            domElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [camera, gl, isTopView, setFov]);

    return null;
};