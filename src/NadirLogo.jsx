import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export const NadirLogo = ({ logoPath = '/tour_assets/pocketsculpt_logo.png', radius = 6 }) => {
    // Load the transparent PNG asset
    const texture = useLoader(THREE.TextureLoader, logoPath);
    
    // Optimize texture filtering configuration
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return (
        <mesh 
            // 🚀 FIX: Higher values mean this renders AFTER the background sphere, making it visible
            renderOrder={10}
            position={[0, -45, 0]} // Brought slightly closer up to the camera path
            rotation={[-Math.PI / 2, 0, 0]}
        >
            <circleGeometry args={[radius, 64]} />
            <meshBasicMaterial 
                map={texture} 
                transparent={true} 
                opacity={0.9} 
                side={THREE.DoubleSide}
                depthWrite={false}
                // 🚀 FIX: Prevents the surrounding sphere from masking out the floor graphic
                depthTest={false} 
            />
        </mesh>
    );
};