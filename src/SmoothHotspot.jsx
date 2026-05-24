import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const SmoothHotspot = ({ yaw, pitch, text, onClick }) => {
    const ringRef = useRef();
    const [hovered, setHovered] = useState(false);

    const alpha = (pitch * Math.PI) / 180;
    const beta = (yaw * Math.PI) / 180;
    const radius = 450; 

    const x = radius * Math.cos(alpha) * Math.sin(beta);
    const y = radius * Math.sin(alpha);
    const z = radius * Math.cos(alpha) * Math.cos(beta);

    useFrame((state) => {
        if (ringRef.current) {
            const time = state.clock.getElapsedTime();
            const pulse = 1 + Math.sin(time * 4) * 0.08;
            ringRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    return (
        <group position={[x, y, z]}>
            {/* Expanded 3D Ring Geometry */}
            <mesh 
                ref={ringRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
            >
                <ringGeometry args={[14, 19, 32]} /> {/* Increased ring dimensions */}
                <meshBasicMaterial 
                    color={hovered ? "#3b82f6" : "#ffffff"} 
                    side={THREE.DoubleSide} 
                    transparent 
                    opacity={0.85} 
                />
            </mesh>

            {/* Enlarged DOM Overlay Pill */}
            <Html center distanceFactor={radius}>
                <div 
                    onClick={onClick}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        padding: '12px 24px', // Increased padding for a larger touch target
                        background: hovered ? '#3b82f6' : 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '30px',
                        color: '#fff',
                        fontSize: '16px', // Scaled up font text size
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s ease',
                        transform: hovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                >
                    {text}
                </div>
            </Html>
        </group>
    );
};