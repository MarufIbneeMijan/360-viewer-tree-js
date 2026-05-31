import React, { useEffect, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const PanoramaSphere = ({ imagePath, isTopView, onTextureLoaded }) => {
    const sphereRef = useRef();

    // 🚀 FIX: Swapped to drei's ultra-optimized useTexture hook directly
    const texture = useTexture(imagePath);

    useEffect(() => {
        if (texture) {
            // Optimize mapping properties and textures color profile
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            
            // 🚀 CRITICAL UX FIX: Instantly notify the dashboard container that the asset 
            // is fully compiled and ready to display on the viewport canvas
            if (onTextureLoaded) {
                onTextureLoaded();
            }
        }
    }, [texture, onTextureLoaded]);

    return (
        <mesh 
            ref={sphereRef} 
            position={[0, 0, 0]}
            // Subtle architectural flattening scale shift when looking down from Top View
            scale={isTopView ? [1, 0.85, 1] : [1, 1, 1]}
        >
            {/* 🚀 CLEANUP FIX: Kept geometry tracking scale standard, using BackSide 
               material mapping properties below to invert the panorama sphere cleanly!
            */}
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial 
                map={texture} 
                side={THREE.BackSide} 
                transparent={true}
                // Drops opacity to 0.45 when looking from above so the floor layout structure details pop clearly
                opacity={isTopView ? 0.45 : 1.0} 
            />
        </mesh>
    );
};