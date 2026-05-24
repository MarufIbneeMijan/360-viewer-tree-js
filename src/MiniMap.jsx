import React from 'react';

export const MiniMap = ({ currentRoomKey, rooms, onNavigate }) => {
    return (
        <div style={{
            position: 'relative', width: '100%', height: '180px',
            background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800' }}>
                PROPERTY RADAR MAP
            </div>
            
            {/* Minimal Blueprint Grid Visuals */}
            <div style={{ position: 'absolute', top: '30%', left: '15%', width: '70%', height: '2px', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', top: '15%', left: '45%', width: '2px', height: '70%', background: 'rgba(255,255,255,0.05)' }} />

            {Object.keys(rooms).map((key) => {
                const room = rooms[key];
                const isActive = key === currentRoomKey;

                return (
                    <button
                        key={key}
                        onClick={() => onNavigate(key)}
                        style={{
                            position: 'absolute',
                            left: `${room.mapX}%`,
                            top: `${room.mapY}%`,
                            transform: 'translate(-50%, -50%)',
                            width: isActive ? '14px' : '10px',
                            height: isActive ? '14px' : '10px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#3b82f6' : '#94a3b8',
                            border: isActive ? '3px solid #fff' : '2px solid #1e293b',
                            boxShadow: isActive ? '0 0 15px #3b82f6' : 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.3s ease'
                        }}
                        title={room.title}
                    />
                );
            })}
        </div>
    );
};