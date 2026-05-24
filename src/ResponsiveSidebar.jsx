import React, { useState } from 'react';
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
    handleRoomTransition,
    toggleVrMode
}) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const [hoveredBtn, setHoveredBtn] = useState(null);

    return (
        <React.Fragment>
            {/* ⚙️ LUXURY ACCENTED TRIGGER BUTTON */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setVisible(!visible);
                }}
                onMouseEnter={() => setHoveredBtn('gear')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                    ...styles.menuTrigger,
                    bottom: isMobile ? '24px' : 'auto',
                    top: isMobile ? 'auto' : '24px',
                    right: isMobile ? '24px' : 'auto',
                    left: isMobile ? 'auto' : '24px',
                    border: visible ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: visible ? '0 0 20px rgba(59, 130, 246, 0.3)' : (hoveredBtn === 'gear' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.3)'),
                    transform: hoveredBtn === 'gear' ? 'scale(1.06) rotate(15deg)' : 'scale(1) rotate(0deg)',
                }}
            >
                ⚙️
            </button>

            {/* 🎛️ GLASSMORPHISM ARCHITECTURAL OVERLAY DECK PANEL */}
            <div 
                style={{
                    ...styles.sidebar,
                    width: isMobile ? '100vw' : '320px',
                    height: isMobile ? '72vh' : 'auto',
                    maxHeight: isMobile ? '480px' : 'calc(100vh - 140px)',
                    bottom: isMobile ? 0 : 'auto',
                    top: isMobile ? 'auto' : '96px',
                    left: isMobile ? 0 : '24px',
                    borderRadius: isMobile ? '28px 28px 0 0' : '24px',
                    transform: visible 
                        ? 'translateY(0) translateX(0)' 
                        : (isMobile ? 'translateY(100%)' : 'translateX(-390px)'),
                }}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Mobile Slide Indication Tab Accent */}
                {isMobile && (
                    <div style={styles.mobileDragHandle} onClick={() => setVisible(false)} />
                )}

                <h3 style={styles.panelHeader}>PropTech Studio Panel</h3>
                <div style={styles.gradientDivider} />
                
                {/* Core Scrollable Functional System List */}
               <div style={styles.scrollableContentGrid}>
            <button 
                onClick={() => setIsTopView()} // 🚀 Fires the master consolidated view handler instantly
                onMouseEnter={() => setHoveredBtn('topview')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ 
                    ...styles.actionBtn, 
                    ...(isTopView ? styles.activeActionBtn : {}),
                    ...(hoveredBtn === 'topview' && !isTopView ? styles.hoverActionBtn : {})
                }}
            >
                <span style={{ marginRight: '10px' }}>{isTopView ? "👁️" : "🗺️"}</span>
                {isTopView ? "Exit Bird's Eye View" : "Switch to Top View"}
            </button>

            {/* --- 🚀 IMMERSIVE MOBILE VR TRIGGER BUTTON BLOCK --- */}
            {!isTopView && isMobile && (
                <button 
                    onClick={() => { toggleVrMode(); setVisible(false); }}
                    onMouseEnter={() => setHoveredBtn('vrmode')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ 
                        ...styles.actionBtn,
                        ...(hoveredBtn === 'vrmode' ? styles.hoverActionBtn : {})
                    }}
                >
                    <span style={{ marginRight: '10px' }}>🥽</span>
                    Activate Headset VR Mode
                </button>
            )}

            {!isTopView && (
                <button 
                    onClick={() => { setIsCalcMode(!isCalcMode); if (isMobile) setVisible(false); }}
                    onMouseEnter={() => setHoveredBtn('calc')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ 
                        ...styles.actionBtn,
                        ...(isCalcMode ? styles.activeCalcBtn : {}),
                        ...(hoveredBtn === 'calc' && !isCalcMode ? styles.hoverActionBtn : {})
                    }}
                >
                    <span style={{ marginRight: '10px' }}>{isCalcMode ? "❌" : "📏"}</span>
                    {isCalcMode ? "Close Calculator" : "Open Spatial Calculator"}
                </button>
            )}

            <button 
                onClick={() => { handleRecenter(); if (isMobile) setVisible(false); }}
                onMouseEnter={() => setHoveredBtn('recenter')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...styles.actionBtn, ...(hoveredBtn === 'recenter' ? styles.hoverActionBtn : {}) }}
            >
                <span style={{ marginRight: '10px' }}>🎯</span>
                Recenter Camera View
            </button>
            
            <div style={styles.gradientDivider} />
            <div style={styles.minimapContainer}>
                <MiniMap currentRoomKey={currentRoomKey} rooms={rooms} onNavigate={(key) => { handleRoomTransition(key); if (isMobile) setVisible(false); }} />
            </div>
        </div>
            </div>
        </React.Fragment>
    );
};

// --- ✨ MODERNISED HIGH-END LUXURY DESIGN DICTIONARY MAPS ---
const styles = {
    // ⚙️ Translucent Neon-reactive Control Anchor Circle
    menuTrigger: { position: 'fixed', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.55)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '1.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(16px)', webkitBackdropFilter: 'blur(16px)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', touchAction: 'manipulation' },
    
    // 🎛️ Deep Frosted-Glassmorphism Sidebar Deck Template
    sidebar: { position: 'fixed', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(24px) saturate(180%)', webkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.07)', padding: '28px 24px', zIndex: 9998, transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)', boxSizing: 'border-box', boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.65)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    
    mobileDragHandle: { width: '44px', height: '4px', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '10px', margin: '-12px auto 20px auto', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    scrollableContentGrid: { display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1, paddingRight: '2px' },
    
    // Minimal Architectural Uppercase Header Font Layout
    panelHeader: { margin: 0, fontSize: '0.75rem', color: '#3b82f6', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', flexShrink: 0, opacity: 0.95 },
    
    // Sleek Linear Gradient Border Divider that fades elegantly off-screen
    gradientDivider: { height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)', margin: '16px 0', border: 'none', flexShrink: 0 },
    
    // Minimal, organic interactive action buttons base style rules
    actionBtn: { width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', color: '#cbd5e1', fontWeight: '500', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', touchAction: 'manipulation', flexShrink: 0, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },
    
    // Fluid Interactive State Additions:
    hoverActionBtn: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', transform: 'translateX(4px)' },
    activeActionBtn: { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#60a5fa', fontWeight: '600', boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)' },
    activeCalcBtn: { background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(220, 38, 38, 0.05) 100%)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', fontWeight: '600', boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)' },
    
    minimapContainer: { background: 'rgba(0, 0, 0, 0.15)', borderRadius: '16px', padding: '4px', border: '1px solid rgba(255,255,255,0.02)' }
};