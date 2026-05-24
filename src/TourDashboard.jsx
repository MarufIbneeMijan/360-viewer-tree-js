import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- CUSTOM MODULE IMPORTS ---
import { TOUR_DATA } from './TourData';
import { PanoramaSphere } from './PanoramaSphere';
import { SmoothHotspot } from './SmoothHotspot';
import { InfoTag } from './InfoTag';
import { SmoothFade } from './SmoothFade';
import { MobileZoomController } from './MobileZoomController';
import { ResponsiveSidebar } from './ResponsiveSidebar';

// --- 🗺️ SEPARATED TOP VIEW ENGINE ---
const TopViewController = ({ isTopView }) => {
    return null; // Handled directly inside the core canvas hook to prevent frame collisions
};

export const TourDashboard = () => {
    const [currentRoomKey, setCurrentRoomKey] = useState(TOUR_DATA.initial_room);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [showHudCard, setShowHudCard] = useState(true);
    
    // Core Utility States
    const [fov, setFov] = useState(75); 
    const [isTopView, setIsTopView] = useState(false); 
    const [isCalcMode, setIsCalcMode] = useState(false); 
    const [calcPoints, setCalcPoints] = useState([]); 
    const [calculatedDistance, setCalculatedDistance] = useState(null);

    // --- 🥽 MOBILE VR & SENSOR STATES ---
    const [isVrMode, setIsVrMode] = useState(false);
    const [deviceRotation, setDeviceRotation] = useState({ alpha: 0, beta: 90, gamma: 0 });

    const controlsRef = useRef();
    const activeRoom = TOUR_DATA.rooms[currentRoomKey];

    // --- 📱 MOBILE DEVICE ORIENTATION LIFECYCLE CONTROLLER ---
    useEffect(() => {
        if (!isVrMode) return;

        const handleOrientation = (event) => {
            // Read orientation vectors directly from phone hardware gyroscopes
            if (event.alpha !== null) {
                setDeviceRotation({
                    alpha: event.alpha, // Rotation around Z axis (compass heading)
                    beta: event.beta,   // Rotation around X axis (front-to-back tilt)
                    gamma: event.gamma  // Rotation around Y axis (left-to-right tilt)
                });
            }
        };

        // Secure security permissions for iOS 13+ devices
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        alert("Permission to access device sensors was denied.");
                        setIsVrMode(false);
                    }
                })
                .catch(console.error);
        } else {
            // Android and desktop browsers skip the secure handshake step
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [isVrMode]);

    // Custom Device Orientation Driver Injection
    const GyroCameraController = () => {
        if (!isVrMode) return null;
        
        // Map degrees directly back into standard mathematical radian angles
        const alphaRad = THREE.MathUtils.degToRad(deviceRotation.alpha);
        const betaRad = THREE.MathUtils.degToRad(deviceRotation.beta);
        const gammaRad = THREE.MathUtils.degToRad(deviceRotation.gamma);

        // Render loops inject rotation straight to active OrbitControls vectors
        if (controlsRef.current) {
            const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');
            controlsRef.current.object.quaternion.setFromEuler(euler);
        }
        return null;
    };

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
        if (isTopView || isVrMode) return; 
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

    // --- 🎯 RECENTER AND VIEW TRANSLATION ENGINE ---
    const handleRecenter = () => {
        setIsTopView(false);
        setFov(75);
        if (controlsRef.current) {
            controlsRef.current.reset();
            controlsRef.current.target.set(0, 0, 0);
            if (controlsRef.current.object) {
                const cam = controlsRef.current.object;
                cam.fov = 75;
                cam.up.set(0, 1, 0);
                cam.position.set(0, 0, 0.1);
                cam.lookAt(0, 0, 0);
                cam.updateProjectionMatrix();
            }
        }
    };

    // 🚀 FIXED: Robust central toggle function handles entry and exits instantly
    // 🚀 THE FIXED TOGGLE FUNCTION: Swap this block into TourDashboard.jsx
const toggleTopView = () => {
    if (isTopView) {
        // Exiting Top View: Re-align perspective vectors back to baseline center room coordinates
        setIsTopView(false);
        setFov(75);
        if (controlsRef.current) {
            controlsRef.current.reset();
            controlsRef.current.target.set(0, 0, 0);
            if (controlsRef.current.object) {
                const cam = controlsRef.current.object;
                cam.fov = 75;
                cam.up.set(0, 1, 0); // Reset horizon axis tracking orientation
                cam.position.set(0, 0, 0.1);
                cam.lookAt(0, 0, 0);
                cam.updateProjectionMatrix();
            }
        }
    } else {
        // Entering Top View: Move camera directly overhead to a flat map perspective view layout
        setIsTopView(true); 
        setIsVrMode(false); 
        setIsCalcMode(false); 
        setCalcPoints([]); 
        setCalculatedDistance(null); 
        
        // 🚀 THE FIX: Force controls to re-pivot target tracking straight down the center line instantly
        if (controlsRef.current) {
            controlsRef.current.reset();
            controlsRef.current.target.set(0, 0, 0);
            if (controlsRef.current.object) {
                const cam = controlsRef.current.object;
                cam.up.set(0, 0, -1); // Orient top of screen to rear room vectors
                cam.position.set(0, 700, 0); // Position camera straight up on Y axis looking down
                cam.lookAt(0, 0, 0);
                cam.updateProjectionMatrix();
            }
        }
    }
};

    const toggleVrMode = () => {
        if (isVrMode) {
            setIsVrMode(false);
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            handleRecenter();
        } else {
            setIsVrMode(true);
            setIsTopView(false);
            setIsCalcMode(false);
            
            // Go fullscreen on mobile browsers for total screen immersion
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(() => {});
            }
            
            // Force horizontal landscape layout orientation locks if supported
            if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                window.screen.orientation.lock('landscape').catch(() => {});
            }
        }
    };

    const handleCanvasClick = (e) => {
        if (!isCalcMode || calcPoints.length >= 2 || isVrMode) return;
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

    return (
        <div style={uiStyles.fullscreenContainer} onClick={() => !isCalcMode && setControlsVisible(false)}>
            <SmoothFade active={isTransitioning} />

            {/* 🥽 DOUBLE-EYE SPLIT RE-RENDER WRAPPER WHEN VR MODE RUNS */}
            <div 
                onWheel={handleWheelZoom} 
                style={{
                    ...uiStyles.canvasWrapper,
                    display: isVrMode ? 'flex' : 'block',
                    flexDirection: 'row'
                }}
            >
                {/* 👁️ VIEW EYE PANEL A (Main Render) */}
                <div style={{ width: isVrMode ? '50%' : '100%', height: '100%', position: 'relative' }}>
                    <Canvas 
                        orthographic={isTopView} 
                        camera={isTopView ? { position: [0, 700, 0] } : { position: [0, 0, 0.1], fov: fov, near: 0.1, far: 1000 }}
                    >
                        <GyroCameraController />
                        <MobileZoomController setFov={setFov} isTopView={isTopView} />

                        <OrbitControls 
                            ref={controlsRef}
                            enableZoom={isTopView} 
                            enablePan={isTopView}  
                            enableRotate={!isVrMode} // Disable manual touch rotation when gyroscope sensors drive the lens
                            rotateSpeed={isTopView ? 0.4 : -0.3}
                            maxPolarAngle={isTopView ? Math.PI / 2.2 : Math.PI} 
                            dampingFactor={0.05}
                            enableDamping
                        />

                        <Suspense fallback={null}>
                            <group onClick={(e) => { e.stopPropagation(); if (isCalcMode) handleCanvasClick(e); }}>
                                <PanoramaSphere imagePath={activeRoom.image} isTopView={isTopView} />
                            </group>

                            {!isTopView && !isVrMode && activeRoom.hotspots.map((hs, i) => (
                                <SmoothHotspot key={`hs-${i}`} yaw={hs.yaw} pitch={hs.pitch} text={hs.text} onClick={() => handleRoomTransition(hs.target)} />
                            ))}

                            {!isTopView && !isVrMode && activeRoom.infoTags?.map((tag, i) => (
                                <InfoTag key={`tag-${i}`} yaw={tag.yaw} pitch={tag.pitch} title={tag.title} text={tag.text} />
                            ))}

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

                {/* 👁️ VIEW EYE PANEL B (Render Second Eye Mirror Only in VR Headset Mode) */}
                {isVrMode && (
                    <div style={{ width: '50%', height: '100%', borderLeft: '2px solid #000', boxSizing: 'border-box' }}>
                        <Canvas camera={{ position: [0, 0, 0.1], fov: fov, near: 0.1, far: 1000 }}>
                            <GyroCameraController />
                            <Suspense fallback={null}>
                                <PanoramaSphere imagePath={activeRoom.image} isTopView={false} />
                            </Suspense>
                        </Canvas>
                    </div>
                )}
            </div>

            {/* 🏠 LOWER PANEL HUD DETAIL DETAILS CARD */}
            {!isTransitioning && !isTopView && !isVrMode && (
                <div style={{ 
                    ...uiStyles.hudCard, 
                    transform: showHudCard ? 'translateX(-50%)' : 'translateX(-50%) translateY(calc(100% - 24px))',
                    bottom: window.innerWidth <= 768 ? '96px' : '32px' 
                }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowHudCard(!showHudCard)} style={uiStyles.hudToggleTab}>
                        {showHudCard ? "🔽 Hide Panel" : "🔼 Show Panel: " + activeRoom.title}
                    </button>
                    <div style={{ display: showHudCard ? 'block' : 'none', marginTop: '10px' }}>
                        <h2 style={uiStyles.hudTitle}>{activeRoom.title}</h2>
                        <p style={uiStyles.hudDesc}>{activeRoom.description}</p>
                    </div>
                </div>
            )}

            {/* 📐 FLOATING CALCULATOR MODAL OVERLAY */}
            {isCalcMode && (
                <div style={uiStyles.measurementCard} onClick={(e) => e.stopPropagation()}>
                    <div style={uiStyles.badge}><span style={uiStyles.pulseDot}></span> {calculatedDistance ? "CALCULATION COMPLETE" : "SPATIAL TOOL ACTIVE"}</div>
                    <p style={uiStyles.wizardGuideText}>
                        {!calculatedDistance && calcPoints.length === 0 && "📍 Click anywhere on the wall surface to pin Node A."}
                        {!calculatedDistance && calcPoints.length === 1 && "📍 Drag view and tap floor grids to secure Node B."}
                        {calculatedDistance && "✅ Vectors rendered successfully."}
                    </p>
                    {calculatedDistance && (
                        <div style={uiStyles.metricDisplayContainer}>
                            <h3 style={uiStyles.metricValue}>{calculatedDistance.toFixed(2)} <span style={uiStyles.unitText}>meters</span></h3>
                        </div>
                    )}
                    <button onClick={() => { setCalcPoints([]); setCalculatedDistance(null); }} style={uiStyles.resetCalcBtn}>🔄 Clear Nodes</button>
                </div>
            )}

            {/* 🥽 VR CLOSE FLOATING ESCAPE ANCHOR */}
            {isVrMode && (
                <button onClick={toggleVrMode} style={uiStyles.vrCloseBtn}>
                    ✕ Exit Immersive VR
                </button>
            )}

            {/* 🚀 RESPONSIVE SIDEBAR OVERLAY DRAWER */}
            {!isVrMode && (
                <ResponsiveSidebar 
                    visible={controlsVisible}
                    setVisible={setControlsVisible}
                    isTopView={isTopView}
                    setIsTopView={toggleTopView} // 🚀 Hooks clean toggle function natively
                    isCalcMode={isCalcMode}
                    setIsCalcMode={setIsCalcMode}
                    handleRecenter={handleRecenter}
                    currentRoomKey={currentRoomKey}
                    rooms={TOUR_DATA.rooms}
                    handleRoomTransition={handleRoomTransition}
                    // Pass down VR triggers into menus
                    isVrMode={isVrMode}
                    toggleVrMode={toggleVrMode}
                />
            )}
        </div>
    );
};

const uiStyles = {
    fullscreenContainer: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', userSelect: 'none' },
    canvasWrapper: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 },
    hudCard: { position: 'absolute', left: '50%', width: '92%', maxWidth: '520px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.11)', padding: '16px 24px 24px 24px', borderRadius: '20px', color: '#fff', textAlign: 'center', zIndex: 5, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
    hudToggleTab: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' },
    hudTitle: { margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '800' },
    hudDesc: { margin: 0, opacity: 0.75, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' },
    measurementCard: { position: 'absolute', top: '24px', right: '4%', left: '4%', margin: '0 auto', maxWidth: '310px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '22px', color: '#fff', zIndex: 1200, boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
    badge: { fontSize: '0.68rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
    pulseDot: { width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block' },
    wizardGuideText: { margin: '0 0 14px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' },
    metricDisplayContainer: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginBottom: '14px' },
    metricValue: { margin: '0', fontSize: '2rem', fontWeight: '900', color: '#fff' },
    unitText: { fontSize: '1.1rem', fontWeight: '400', color: '#94a3b8' },
    resetCalcBtn: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700' },
    vrCloseBtn: { position: 'absolute', top: '24px', right: '24px', padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', zIndex: 99999, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }
};