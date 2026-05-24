import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- CUSTOM MODULE IMPORTS ---
import { TOUR_DATA } from './TourData';
import { PanoramaSphere } from './PanoramaSphere';
import { SmoothHotspot } from './SmoothHotspot';
import { InfoTag } from './InfoTag';
import { SmoothFade } from './SmoothFade';
import { MiniMap } from './MiniMap';
import { MobileZoomController } from './MobileZoomController';
import { ResponsiveSidebar } from './ResponsiveSidebar';
// --- 🗺️ SEPARATED TOP VIEW ENGINE ---
const TopViewController = ({ isTopView }) => {
    const { camera, size } = useThree();

    useEffect(() => {
        if (isTopView) {
            const aspect = size.width / size.height;
            const frustumSize = 600;

            camera.left = -frustumSize * aspect / 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = -frustumSize / 2;
            camera.near = 1;
            camera.far = 2000;
            
            camera.position.set(0, 700, 0);
            camera.up.set(0, 0, -1); 
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
    }, [isTopView, camera, size]);

    return null;
};

export const TourDashboard = () => {
    const [currentRoomKey, setCurrentRoomKey] = useState(TOUR_DATA.initial_room);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [showHudCard, setShowHudCard] = useState(true); // 🚀 HUD Visibility State Control Toggle
    
    // Core Utility States
    const [fov, setFov] = useState(75); 
    const [isTopView, setIsTopView] = useState(false); 
    const [isCalcMode, setIsCalcMode] = useState(false); 
    const [calcPoints, setCalcPoints] = useState([]); 
    const [calculatedDistance, setCalculatedDistance] = useState(null);

    const controlsRef = useRef();
    const activeRoom = TOUR_DATA.rooms[currentRoomKey];

    const handleRoomTransition = (targetRoomKey) => {
        if (targetRoomKey === currentRoomKey || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentRoomKey(targetRoomKey);
            handleRecenter();
            setTimeout(() => setIsTransitioning(false), 200);
        }, 400);
    };

    const handleWheelZoom = (e) => {
        if (isTopView) return; 
        e.preventDefault();

        setFov((prev) => {
            const zoomDirection = e.deltaY > 0 ? 4 : -4;
            const nextFov = Math.max(30, Math.min(95, prev + zoomDirection));

            if (controlsRef.current && controlsRef.current.object) {
                controlsRef.current.object.fov = nextFov;
                controlsRef.current.object.updateProjectionMatrix();
            }
            return nextFov;
        });
    };

    const handleRecenter = () => {
    setIsTopView(false);
    setFov(75);
    if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.target.set(0, 0, 0);
        if (controlsRef.current.object) {
            const cam = controlsRef.current.object;
            cam.fov = 75;
            cam.up.set(0, 1, 0); // 🚀 Ensure standard up-vector here too!
            cam.position.set(0, 0, 0.1);
            cam.updateProjectionMatrix();
        }
    }
};

    const handleCanvasClick = (e) => {
        if (!isCalcMode || calcPoints.length >= 2) return;
        if (e.point) {
            const strikePoint = e.point.clone();
            const nextPoints = [...calcPoints, strikePoint];
            setCalcPoints(nextPoints);

            if (nextPoints.length === 2) {
                const distanceInUnits = nextPoints[0].distanceTo(nextPoints[1]);
                setCalculatedDistance(distanceInUnits / 140); 
            }
        }
    };

    const handleBackgroundClick = () => {
        if (isCalcMode) return;
        if (controlsVisible) setControlsVisible(false);
    };

    return (
        <div style={uiStyles.fullscreenContainer}>
            <SmoothFade active={isTransitioning} />

            {/* 🌐 CORE WEBGL ENGINE CANVAS GRID */}
            <div 
                onWheel={handleWheelZoom} 
                style={uiStyles.canvasWrapper}
                onMouseDown={handleBackgroundClick}
            >
                <Canvas 
                    orthographic={isTopView} 
                    camera={isTopView ? { position: [0, 700, 0] } : { position: [0, 0, 0.1], fov: fov, near: 0.1, far: 1000 }}
                >
                    <TopViewController isTopView={isTopView} />
                    <MobileZoomController setFov={setFov} isTopView={isTopView} />
                    <OrbitControls 
                        ref={controlsRef}
                        enableZoom={isTopView} 
                        enablePan={isTopView}  
                        rotateSpeed={isTopView ? 0.4 : -0.3}
                        maxPolarAngle={isTopView ? Math.PI / 2.2 : Math.PI} 
                        dampingFactor={0.05}
                        enableDamping
                    />

                    <Suspense fallback={null}>
                        <group onClick={(e) => { e.stopPropagation(); if (isCalcMode) handleCanvasClick(e); }}>
                            <PanoramaSphere imagePath={activeRoom.image} isTopView={isTopView} />
                        </group>

                        {!isTopView && activeRoom.hotspots.map((hs, i) => (
                            <SmoothHotspot key={`hs-${i}`} yaw={hs.yaw} pitch={hs.pitch} text={hs.text} onClick={() => handleRoomTransition(hs.target)} />
                        ))}

                        {!isTopView && activeRoom.infoTags?.map((tag, i) => (
                            <InfoTag key={`tag-${i}`} yaw={tag.yaw} pitch={tag.pitch} title={tag.title} text={tag.text} />
                        ))}

                        {/* Render Calculation Nodes */}
                        {calcPoints.map((pt, idx) => (
                            <mesh key={`node-${idx}`} position={pt}>
                                <sphereGeometry args={[5, 16, 16]} />
                                <meshBasicMaterial color="#ef4444" depthTest={false} />
                            </mesh>
                        ))}

                        {calcPoints.length === 2 && (
                            <line>
                                <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(calcPoints)} />
                                <lineBasicMaterial attach="material" color="#ef4444" linewidth={4} depthTest={false} />
                            </line>
                        )}
                    </Suspense>
                </Canvas>
            </div>

            {/* 🏠 ROOM DETAILS HUD CARD (With Integrated Expand/Collapse Handler) */}
            {!isTransitioning && !isTopView && (
                <div style={{ 
                    ...uiStyles.hudCard, 
                    transform: showHudCard ? 'translateX(-50%)' : 'translateX(-50%) translateY(calc(100% - 24px))',
                    opacity: showHudCard ? 1 : 0.4
                }}>
                    {/* Minimal Toggle Handle Strip */}
                    <button 
                        onClick={() => setShowHudCard(!showHudCard)} 
                        style={uiStyles.hudToggleTab}
                        title={showHudCard ? "Hide Details" : "Show Details"}
                    >
                        {showHudCard ? "🔽 Hide Panel" : "🔼 Show Panel: " + activeRoom.title}
                    </button>

                    {/* Conditional inner contents wrapper to prevent text layout spillover while minimized */}
                    <div style={{ display: showHudCard ? 'block' : 'none', marginTop: '10px' }}>
                        <h2 style={uiStyles.hudTitle}>{activeRoom.title}</h2>
                        <p style={uiStyles.hudDesc}>{activeRoom.description}</p>
                    </div>
                </div>
            )}

            {/* 📐 FLOATING CALCULATION METRICS DRAW BOARD */}
            {isCalcMode && (
                <div style={uiStyles.measurementCard}>
                    <div style={uiStyles.badge}>
                        <span style={uiStyles.pulseDot}></span> 
                        {calculatedDistance ? "VECTOR BOUND BAKE COMPLETE" : "SPATIAL TOOLKIT ACTIVE"}
                    </div>
                    
                    <p style={uiStyles.wizardGuideText}>
                        {!calculatedDistance && calcPoints.length === 0 && "📍 Step 1: Click anywhere on the room canvas surface to anchor Node A."}
                        {!calculatedDistance && calcPoints.length === 1 && "📍 Step 2: Drag view orbit paths and click floor line targets to lock Node B."}
                        {calculatedDistance && "✅ Calculations rendered cleanly over 3D coordinates system mapping lines."}
                    </p>

                    {calculatedDistance && (
                        <div style={uiStyles.metricDisplayContainer}>
                            <h3 style={uiStyles.metricValue}>{calculatedDistance.toFixed(2)} <span style={uiStyles.unitText}>meters</span></h3>
                            <p style={uiStyles.subText}>Approximated Dimensions: {(calculatedDistance * 3.28084).toFixed(1)} feet</p>
                        </div>
                    )}

                    <button onClick={() => { setCalcPoints([]); setCalculatedDistance(null); }} style={uiStyles.resetCalcBtn}>
                        {calculatedDistance ? "🔄 Trace New Line" : "🔄 Clear Plotted Nodes"}
                    </button>
                </div>
            )}
          

            {/* SETTINGS GEAR PIN BUTTON */}
            {/* <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setControlsVisible(!controlsVisible); 
                }} 
                style={uiStyles.menuTrigger}
            >
                ⚙️
            </button> */}

            {/* 🎛️ SIDEBAR MANAGEMENT CONTROL UNIT DRAWER */}
            <div 
                style={{ ...uiStyles.sidebar, transform: controlsVisible ? 'translateX(0)' : 'translateX(-380px)' }}
                onClick={(e) => e.stopPropagation()} 
            >
                <h3 style={uiStyles.panelHeader}>PROPTECH HUB PANEL</h3>
                <hr style={uiStyles.divider} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* // 🚀 THE PERMANENT FIX: Swap your Top View toggle button with this codebase: */}
            <button 
                onClick={() => { 
                    if (isTopView) {
                        // --- CLEAN EXIT PIPELINE ---
                        setIsTopView(false);
                        setFov(75);
                        
                        if (controlsRef.current) {
                            controlsRef.current.reset();
                            controlsRef.current.target.set(0, 0, 0);
                            
                            if (controlsRef.current.object) {
                                const cam = controlsRef.current.object;
                                cam.fov = 75;
                                cam.near = 0.1;
                                cam.far = 1000;
                                
                                // 🚀 THE FIX: Force the global world Up-Vector back to standard tracking axes
                                cam.up.set(0, 1, 0); 
                                cam.position.set(0, 0, 0.1);
                                cam.lookAt(0, 0, 0);
                                cam.updateProjectionMatrix();
                            }
                        }
                    } else {
                        // --- ENTER PIPELINE ---
                        setIsTopView(true); 
                        setIsCalcMode(false); 
                        setCalcPoints([]); 
                        setCalculatedDistance(null); 
                    }
                }} 
                style={{ 
                    ...uiStyles.actionBtn, 
                    border: isTopView ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', 
                    background: isTopView ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)' 
                }}
            >
                {isTopView ? "👁️ Exit Bird's Eye View" : "🗺️ Switch to Top View"}
            </button>

                    {!isTopView && (
                        <button 
                            onClick={() => { setIsCalcMode(!isCalcMode); setCalcPoints([]); setCalculatedDistance(null); }} 
                            style={{ ...uiStyles.actionBtn, color: isCalcMode ? '#ef4444' : '#fff', border: isCalcMode ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {isCalcMode ? "❌ Close Calculator" : "📏 Open Spatial Calculator"}
                        </button>
                    )}

                    <button onClick={handleRecenter} style={uiStyles.actionBtn}>🎯 Recenter Camera View</button>
                    
                    <hr style={uiStyles.divider} />
                    <MiniMap currentRoomKey={currentRoomKey} rooms={TOUR_DATA.rooms} onNavigate={handleRoomTransition} />
                </div>
            </div>
                <ResponsiveSidebar 
                visible={controlsVisible}
                setVisible={setControlsVisible}
                isTopView={isTopView}
                setIsTopView={setIsTopView}
                isCalcMode={isCalcMode}
                setIsCalcMode={setIsCalcMode}
                handleRecenter={handleRecenter}
                currentRoomKey={currentRoomKey}
                rooms={TOUR_DATA.rooms}
                handleRoomTransition={handleRoomTransition}
            />
        </div>

        
    );
};

// --- 🎨 SYSTEM STYLE SHEET ---
const uiStyles = {
    fullscreenContainer: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', userSelect: 'none' },
    canvasWrapper: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 },
    
    // Smooth translation handling variables for the slide panel
    hudCard: { position: 'absolute', bottom: '32px', left: '50%', width: '90%', maxWidth: '520px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.11)', padding: '16px 24px 24px 24px', borderRadius: '20px', color: '#fff', textAlign: 'center', zIndex: 5, transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
    hudToggleTab: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', outline: 'none', transition: 'all 0.2s' },
    
    hudTitle: { margin: '0 0 4px 0', fontSize: '1.45rem', fontWeight: '800' },
    hudDesc: { margin: 0, opacity: 0.75, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.4' },
    menuTrigger: { position: 'absolute', top: '24px', left: '24px', width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' },
    sidebar: { position: 'absolute', top: '96px', left: '24px', width: '310px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '20px', zIndex: 9998, transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxSizing: 'border-box', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
    panelHeader: { margin: 0, fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1.5px', fontWeight: '800' },
    divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '14px 0' },
    actionBtn: { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' },
    measurementCard: { position: 'absolute', top: '24px', right: '24px', width: '310px', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '22px', color: '#fff', zIndex: 1200, boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
    badge: { fontSize: '0.68rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
    pulseDot: { width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #3b82f6' },
    wizardGuideText: { margin: '0 0 14px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5', fontWeight: '500' },
    metricDisplayContainer: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginBottom: '14px' },
    metricValue: { margin: '0 0 2px 0', fontSize: '2rem', fontWeight: '900', color: '#fff' },
    unitText: { fontSize: '1.1rem', fontWeight: '400', color: '#94a3b8' },
    subText: { margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' },
    resetCalcBtn: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', transition: 'background 0.2s' }
};