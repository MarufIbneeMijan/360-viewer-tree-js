import React from 'react';
import { MiniMap } from './MiniMap';

export const ResponsiveSidebar = ({ 
    visible, 
    setVisible, 
    isTopView, 
    setIsTopView, 
    isCalcMode, 
    setIsCalcMode, 
    handleRecenter, 
    currentRoomKey, 
    rooms, 
    handleRoomTransition 
}) => {
    return (
        <React.Fragment>
            {/* ⚙️ UPGRADED MOBILE ACCESSIBLE GEAR TRIGGER */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setVisible(!visible);
                }}
                style={{
                    ...styles.menuTrigger,
                    // Repositions neatly to the bottom right on mobile screens for comfortable thumb tapping
                    bottom: window.innerWidth <= 768 ? '24px' : 'auto',
                    top: window.innerWidth <= 768 ? 'auto' : '24px',
                    right: window.innerWidth <= 768 ? '24px' : 'auto',
                    left: window.innerWidth <= 768 ? 'auto' : '24px',
                }}
            >
                ⚙️
            </button>

            {/* 🎛️ ADAPTIVE NAVIGATION SIDEBAR PANEL */}
            <div 
                style={{
                    ...styles.sidebar,
                    // Responsive Layout Matrix: Swaps from left drawer into a fluid bottom sheet overlay
                    width: window.innerWidth <= 768 ? '100vw' : '310px',
                    height: window.innerWidth <= 768 ? '70vh' : 'auto',
                    maxHeight: window.innerWidth <= 768 ? '500px' : 'calc(100vh - 120px)',
                    bottom: window.innerWidth <= 768 ? 0 : 'auto',
                    top: window.innerWidth <= 768 ? 'auto' : '96px',
                    left: window.innerWidth <= 768 ? 0 : '24px',
                    borderRadius: window.innerWidth <= 768 ? '24px 24px 0 0' : '20px',
                    transform: visible 
                        ? 'translateY(0) translateX(0)' 
                        : (window.innerWidth <= 768 ? 'translateY(100%)' : 'translateX(-380px)'),
                }}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Mobile Slide Indication Accent Bar */}
                {window.innerWidth <= 768 && <div style={styles.mobileDragHandle} onClick={() => setVisible(false)} />}

                <h3 style={styles.panelHeader}>PROPTECH HUB PANEL</h3>
                <hr style={styles.divider} />
                
                <div style={styles.scrollableContentGrid}>
                    <button 
                        onClick={() => { setIsTopView(!isTopView); setIsCalcMode(false); setVisible(window.innerWidth > 768); }} 
                        style={{ ...styles.actionBtn, border: isTopView ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', background: isTopView ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)' }}
                    >
                        {isTopView ? "👁️ Exit Bird's Eye View" : "🗺️ Switch to Top View"}
                    </button>

                    {!isTopView && (
                        <button 
                            onClick={() => { setIsCalcMode(!isCalcMode); setVisible(window.innerWidth > 768); }} 
                            style={{ ...styles.actionBtn, color: isCalcMode ? '#ef4444' : '#fff', border: isCalcMode ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {isCalcMode ? "❌ Close Calculator" : "📏 Open Spatial Calculator"}
                        </button>
                    )}

                    <button onClick={() => { handleRecenter(); setVisible(window.innerWidth > 768); }} style={styles.actionBtn}>🎯 Recenter Camera View</button>
                    
                    <hr style={styles.divider} />
                    <MiniMap currentRoomKey={currentRoomKey} rooms={rooms} onNavigate={(key) => { handleRoomTransition(key); setVisible(window.innerWidth > 768); }} />
                </div>
            </div>
        </React.Fragment>
    );
};

const styles = {
    menuTrigger: { position: 'fixed', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', touchAction: 'manipulation' },
    sidebar: { position: 'fixed', background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', zIndex: 9998, transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxSizing: 'border-box', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    mobileDragHandle: { width: '40px', height: '5px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', margin: '-8px auto 16px auto', cursor: 'pointer', flexShrink: 0 },
    scrollableContentGrid: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px' },
    panelHeader: { margin: 0, fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1.5px', fontWeight: '800', flexShrink: 0 },
    divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '14px 0', flexShrink: 0 },
    actionBtn: { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', touchAction: 'manipulation', flexShrink: 0 }
};