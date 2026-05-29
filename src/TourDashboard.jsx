import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// --- CUSTOM MODULE IMPORTS ---
import { TOUR_DATA } from './TourData';
import { PanoramaSphere } from './PanoramaSphere';
import { SmoothHotspot } from './SmoothHotspot';
import { InfoTag } from './InfoTag';
import { SmoothFade } from './SmoothFade';
import { MobileZoomController } from './MobileZoomController';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { NadirLogo } from './NadirLogo';
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

    // VR & Sensor States
    const [isVrMode, setIsVrMode] = useState(false);
    const [deviceRotation, setDeviceRotation] = useState({ alpha: 0, beta: 90, gamma: 0 });

    const controlsRef = useRef();
    const activeRoom = TOUR_DATA.rooms[currentRoomKey];

    // --- MOBILE SENSOR (GYRO) RUNTIME LIFECYCLE ---
    useEffect(() => {
        if (!isVrMode) return;

        const handleOrientation = (event) => {
            if (event.alpha !== null) {
                setDeviceRotation({
                    alpha: event.alpha,
                    beta: event.beta,
                    gamma: event.gamma
                });
            }
        };

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
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [isVrMode]);

    // Handle Room-to-Room Transitions Natively
    const [loadingRoomTitle, setLoadingRoomTitle] = useState("");
    const handleRoomTransition = (targetRoomKey) => {
    if (targetRoomKey === currentRoomKey || isTransitioning) return;
    
    // Grab the upcoming room's title from your data registry map
    const nextRoomTitle = TOUR_DATA.rooms[targetRoomKey]?.title || "NEW SPACE";
    setLoadingRoomTitle(nextRoomTitle);
    
    setIsTransitioning(true);
    
    setTimeout(() => {
        setCurrentRoomKey(targetRoomKey);
        handleRecenter();
        
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300); 
    }, 450);
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

    // Camera Recenter Routine
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

    // Consolidated Top View View Toggle Logic (Fixed Exit Recenter)
    const toggleTopView = () => {
        if (isTopView) {
            handleRecenter();
        } else {
            setIsTopView(true); 
            setIsVrMode(false); 
            setIsCalcMode(false); 
            setCalcPoints([]); 
            setCalculatedDistance(null); 
            
            if (controlsRef.current) {
                controlsRef.current.reset();
                controlsRef.current.target.set(0, 0, 0);
                if (controlsRef.current.object) {
                    const cam = controlsRef.current.object;
                    cam.up.set(0, 0, -1); 
                    cam.position.set(0, 700, 0); 
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
            
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(() => {});
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
            <SmoothFade active={isTransitioning} roomTitle={loadingRoomTitle} />

            <div onWheel={handleWheelZoom} style={{ ...uiStyles.canvasWrapper, display: isVrMode ? 'flex' : 'block' }}>
                {/* PRIMARY VIEWING PORTION */}
                <div style={{ width: isVrMode ? '50%' : '100%', height: '100%', position: 'relative' }}>
                    <Canvas camera={isTopView ? { position: [0, 700, 0] } : { position: [0, 0, 0.1], fov: fov, near: 0.1, far: 1000 }}>
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

                            {!isTopView && !isVrMode && activeRoom.hotspots.map((hs, i) => (
                                <SmoothHotspot key={`hs-${i}`} yaw={hs.yaw} pitch={hs.pitch} text={hs.text} onClick={() => handleRoomTransition(hs.target)} />
                            ))}

                            {!isTopView && !isVrMode && activeRoom.infoTags?.map((tag, i) => (
                                <InfoTag key={`tag-${i}`} yaw={tag.yaw} pitch={tag.pitch} title={tag.title} text={tag.text} />
                            ))}
                            {!isTopView && (
                                <NadirLogo 
                                    logoPath="/tour_assets/pocketsculpt_logo.png" // Path to your transparent png asset inside the public folder
                                    radius={7} // Adjust size dynamically to seamlessly match your tripod footprint base
                                />
                            )}
                        </Suspense>
                    </Canvas>
                </div>

                {/* STEREOSCOPIC VR EYE COMPONENT SCREEN */}
                {isVrMode && (
                    <div style={{ width: '50%', height: '100%', borderLeft: '2px solid #000', boxSizing: 'border-box' }}>
                        <Canvas camera={{ position: [0, 0, 0.1], fov: fov, near: 0.1, far: 1000 }}>
                            <Suspense fallback={null}>
                                <PanoramaSphere imagePath={activeRoom.image} isTopView={false} />
                            </Suspense>
                        </Canvas>
                    </div>
                )}
            </div>

            {/* 🏠 LOWER ROOM TITLE HUD CARD */}
            {!isTransitioning && !isTopView && !isVrMode && (
                <div style={{ 
                    ...uiStyles.hudCard, 
                    transform: (showHudCard && !controlsVisible) ? 'translateX(-50%)' : 'translateX(-50%) translateY(calc(100% + 40px))',
                    opacity: (showHudCard && !controlsVisible) ? 1 : 0,
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

            {/* 🥽 FLOATING VR CLOSE TRIGGER */}
            {isVrMode && (
                <button onClick={toggleVrMode} style={uiStyles.vrCloseBtn}>✕ Exit Immersive VR</button>
            )}

            {/* 🚀 PREMIUM RESPONSIVE SIDEBAR NAVIGATION OVERLAY */}
            {!isVrMode && (
                <ResponsiveSidebar 
                    visible={controlsVisible}
                    setVisible={setControlsVisible}
                    isTopView={isTopView}
                    setIsTopView={toggleTopView} 
                    isCalcMode={isCalcMode}
                    setIsCalcMode={setIsCalcMode}
                    handleRecenter={handleRecenter}
                    currentRoomKey={currentRoomKey}
                    rooms={TOUR_DATA.rooms}
                    handleRoomTransition={handleRoomTransition}
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
    vrCloseBtn: { position: 'absolute', top: '24px', right: '24px', padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', color: '#fff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', zIndex: 99999, boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }
};