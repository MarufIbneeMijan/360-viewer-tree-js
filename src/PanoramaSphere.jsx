import React, { useEffect, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const PanoramaSphere = ({ imagePath, isTopView }) => {
    const sphereRef = useRef();
    const texture = useTexture(imagePath);

    useEffect(() => {
        if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
        }
    }, [texture]);

    return (
        <mesh 
            ref={sphereRef} 
            position={[0, 0, 0]}
            // 🚀 Subtle architectural flattening scale shift when looking down from Top View
            scale={isTopView ? [1, 0.85, 1] : [1, 1, 1]}
        >
            <sphereGeometry args={[500, 60, 40]} scale={[-1, 1, 1]} />
            <meshBasicMaterial 
                map={texture} 
                side={THREE.BackSide} 
                transparent
                // 🚀 Drops opacity to 0.45 when looking from above so the floor layout structure details pop clearly
                opacity={isTopView ? 0.45 : 1.0} 
            />
        </mesh>
    );
};