import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const LocomotionPad = ({ activeRoom, onStep }) => {
    const [hovered, setHovered] = useState(null);
    const paths = activeRoom?.adjacentPoints || {};

    const directions = [
        { key: 'forward', icon: <ChevronUp size={24} strokeWidth={2} />, gridArea: '1 / 2 / 2 / 3', label: 'Walk Forward' },
        { key: 'left', icon: <ChevronLeft size={24} strokeWidth={2} />, gridArea: '2 / 1 / 3 / 2', label: 'Step Left' },
        { key: 'backward', icon: <ChevronDown size={24} strokeWidth={2} />, gridArea: '3 / 2 / 4 / 3', label: 'Step Backward' },
        { key: 'right', icon: <ChevronRight size={24} strokeWidth={2} />, gridArea: '2 / 3 / 3 / 4', label: 'Step Right' },
    ];

    return (
        <div style={styles.padWrapper} onClick={(e) => e.stopPropagation()}>
            <div style={styles.dPadGrid}>
                {/* Minimalist Tech Style Center Hub Core */}
                <div style={styles.centerCore} />

                {directions.map((d) => {
                    const targetNodeKey = paths[d.key];
                    const isAvailable = !!targetNodeKey;
                    const isHovered = hovered === d.key;

                    return (
                        <button
                            key={d.key}
                            disabled={!isAvailable}
                            onMouseEnter={() => isAvailable && setHovered(d.key)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => isAvailable && onStep(targetNodeKey)}
                            title={isAvailable ? d.label : "Obstacle / Wall"}
                            style={{
                                ...styles.dirBtn,
                                gridArea: d.gridArea,
                                opacity: isAvailable ? (isHovered ? 1 : 0.7) : 0.12,
                                background: isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                borderColor: isHovered ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                boxShadow: isHovered ? '0 0 16px rgba(59, 130, 246, 0.3)' : 'none',
                            }}
                        >
                            {d.icon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    // Balanced perfectly on screen layouts, adapting seamlessly between Desktop corners and Mobile centers
    padWrapper: { 
        position: 'absolute', 
        bottom: window.innerWidth <= 768 ? '180px' : '40px', 
        right: window.innerWidth <= 768 ? '50%' : '40px', 
        transform: window.innerWidth <= 768 ? 'translateX(50%)' : 'none', 
        zIndex: 999 
    },
    // High-end tactical gaming D-pad arrangement
    dPadGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 52px)', 
        gridTemplateRows: 'repeat(3, 52px)', 
        gap: '8px', 
        padding: '12px', 
        background: 'rgba(15, 23, 42, 0.4)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255, 255, 255, 0.06)', 
        borderRadius: '28px', 
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)', 
        position: 'relative' 
    },
    centerCore: { 
        gridArea: '2 / 2 / 3 / 3', 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.04)', 
        borderRadius: '50%', 
        margin: '8px' 
    },
    dirBtn: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#fff', 
        border: '1px solid', 
        borderRadius: '14px', 
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)', 
        outline: 'none',
        padding: 0
    }
};