import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { Info, X } from 'lucide-react';

export const InfoTag = ({ yaw, pitch, title, text }) => {
    const [isOpen, setIsOpen] = useState(false);

    const alpha = (pitch * Math.PI) / 180;
    const beta = (yaw * Math.PI) / 180;
    const radius = 460;

    const x = radius * Math.cos(alpha) * Math.sin(beta);
    const y = radius * Math.sin(alpha);
    const z = radius * Math.cos(alpha) * Math.cos(beta);

    return (
        <group position={[x, y, z]}>
            {/* 3D Pulse Core Anchor Dot */}
            <mesh onClick={() => setIsOpen(!isOpen)}>
                <circleGeometry args={[8, 16]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
            </mesh>

            <Html center distanceFactor={radius}>
                <div style={{ position: 'relative', pointerEvents: 'auto' }}>
                    {!isOpen ? (
                        <button 
                            onClick={() => setIsOpen(true)}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#ef4444', border: 'none', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 0 15px #ef4444'
                            }}
                        >
                            <Info size={18} />
                        </button>
                    ) : (
                        <div style={{
                            width: '260px', background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(16px)', border: '1px solid #ef4444',
                            borderRadius: '16px', padding: '16px', color: '#fff',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.5)', textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#ef4444' }}>{title}</h4>
                                <X size={16} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', opacity: 0.6 }} />
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85, lineHeight: '1.4' }}>{text}</p>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
};