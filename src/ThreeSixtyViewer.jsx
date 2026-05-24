import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const ThreeSixtyViewer = () => {
    const { activeProjectId } = useParams();
    const navigate = useNavigate();

    // --- 📡 API ROUTING CONFIGURATION ---
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const API_PROJECTS = `${API_BASE}/api/projects`;
    const STATIC_ASSETS = `${API_BASE}/static/`;

    // --- 📊 STATE MANAGEMENT ---
    const [projectData, setProjectData] = useState(null);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 🌐 THREE.JS & INTERACTION REFS ---
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const sphereRef = useRef(null);

    // Interaction variables tracking drag mechanics
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const lon = useRef(0); // Longitude / Yaw tracking matrix
    const lat = useRef(0); // Latitude / Pitch tracking matrix

    const activeRoom = projectData?.sections?.[0]?.rooms.find(r => r.id === currentRoomId);

    // 1. 🗃️ HYDRATE TOUR MANIFEST DATABASE FROM PYTHON EXE
    useEffect(() => {
        const fetchProjectManifest = async () => {
            const targetId = activeProjectId && activeProjectId !== "undefined" ? activeProjectId : "5b6858bc";
            try {
                setLoading(true);
                const response = await axios.get(`${API_PROJECTS}/${targetId}`);
                setProjectData(response.data);
                
                if (response.data.sections?.[0]?.rooms?.length > 0) {
                    setCurrentRoomId(response.data.sections[0].rooms[0].id);
                }
            } catch (err) {
                console.error("❌ Failed to pull data from backend microservice:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectManifest();
    }, [activeProjectId]);

    // 2. ⚙️ INITIALIZE THREE.JS CONTAINER WEBGL CANVAS CONTEXT
    useEffect(() => {
        if (!projectData || !mountRef.current) return;

        const width = mountRef.current.clientWidth || window.innerWidth;
        const height = mountRef.current.clientHeight || window.innerHeight;

        // Establish core virtual world space
        const scene = new THREE.Scene();
        
        // Field of View set to comfortable 75 degrees perspective matrix standard
        const camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera3D.position.set(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);

        // Build panoramic inverted geometry mesh projection wrapper sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Inverts sphere vectors so texture wraps cleanly on the inside walls

        const material = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Slate fallback initialization frame
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Cache parameters securely onto component lifecycle reference nodes
        sceneRef.current = scene;
        cameraRef.current = camera3D;
        rendererRef.current = renderer;
        sphereRef.current = sphere;

        // Continuous render timeline thread loop pass execution wrapper
        let animationFrameId;
        const animateLoop = () => {
            animationFrameId = requestAnimationFrame(animateLoop);

            // Bound latitude camera limits safely to avoid spherical flip distortions
            lat.current = Math.max(-85, Math.min(85, lat.current));

            // Convert polar coordinates to standard 3D cartesian spatial vector mapping coordinates
            const phi = THREE.MathUtils.degToRad(90 - lat.current);
            const theta = THREE.MathUtils.degToRad(lon.current);

            const lookTarget = new THREE.Vector3();
            lookTarget.x = 500 * Math.sin(phi) * Math.sin(theta);
            lookTarget.y = 500 * Math.cos(phi);
            lookTarget.z = 500 * Math.sin(phi) * Math.cos(theta);

            camera3D.lookAt(lookTarget);
            renderer.render(scene, camera3D);
        };
        animateLoop();

        // Handle dynamic aspect ratio matrix adjustments on window resizing updates
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            geometry.dispose();
            material.dispose();
        };
    }, [projectData]);

    // 3. 🔄 DYNAMIC DIRECT HTTP IMAGES LOADER ENGINE JUMPS
    useEffect(() => {
        if (!activeRoom || !sphereRef.current) return;

        // Clean any potential Windows backend backslash path artifacts out smoothly
        const normalizedAssetPath = activeRoom.image_path.replace(/\\/g, '/');
        const completeTargetUrl = `${STATIC_ASSETS}${normalizedAssetPath}`;

        console.log("🎮 Three.js texture pipeline fetching raw binary asset directly:", completeTargetUrl);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous'); // Bypass CORS requirements natively over local microservice streams

        textureLoader.load(
            completeTargetUrl,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;

                // Hot swap texture buffers on the inner mesh surface instantly
                sphereRef.current.material.map = texture;
                sphereRef.current.material.needsUpdate = true;
            },
            undefined,
            (err) => {
                console.error("❌ Three.js loader was blocked parsing asset path texture:", err);
            }
        );
    }, [currentRoomId, projectData]);

    // 4. 🕹️ STABLE DRAG NAVIGATION ENGINE INTERACTION DRIVERS
    const onMouseDown = (e) => {
        isDragging.current = true;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
        if (!isDragging.current) return;
        
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };

        // Adjust tracking values directly inside WebGL viewport calculations
        lon.current += deltaX * 0.15;
        lat.current -= deltaY * 0.15;
    };

    const onMouseUp = () => {
        isDragging.current = false;
    };

    // 5. 🔌 NAVIGATION OVERLAYS TRIGGER CALLS
    const handleTeleportRoom = (targetRoomId) => {
        setCurrentRoomId(targetRoomId);
        // Reset view direction vectors straight into initial lobby look targets
        lon.current = 0;
        lat.current = 0;
    };

    if (loading) return <div style={styles.centerContainer}>Hydrating 360 Spatial Manifest Data...</div>;
    if (!projectData) return <div style={styles.centerContainer}>Error: Microservice Unreachable. Verify Python EXE is online.</div>;

    return (
        <div style={styles.viewerWrapper}>
            {/* 🌐 CANVAS INJECTION BOX MOUNT ENTRY */}
            <div 
                ref={mountRef} 
                style={styles.canvasContainer}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            />

            {/* 🔌 INTERACTIVE WEB UI OVERLAY HOTSPOTS PANEL */}
            {activeRoom?.hotspots?.map((hs, idx) => {
                // Since this model does not need Python computing orientation matrix values, 
                // you can position buttons statically, map them onto coordinates, or render list menus.
                return null; // Ready to be mapped out to matching custom button matrices!
            })}

            {/* 🏠 NATIVE AMBIENT TEXT HUD BLOCKS */}
            {activeRoom && (
                <div style={styles.hudCard}>
                    <h2 style={styles.hudTitle}>{activeRoom.title}</h2>
                    <p style={styles.hudDesc}>{activeRoom.description}</p>
                    <div style={styles.navigationRow}>
                        {projectData.sections[0].rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => handleTeleportRoom(room.id)}
                                style={{
                                    ...styles.navButton,
                                    backgroundColor: room.id === currentRoomId ? '#3b82f6' : 'rgba(255,255,255,0.06)'
                                }}
                            >
                                {room.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 🎨 PREMIUM EMBEDDED DESIGN SHEET PROFILES ---
const styles = {
    viewerWrapper: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },
    canvasContainer: { width: '100%', height: '100%', cursor: 'grab' },
    centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', color: '#94a3b8', fontSize: '1.1rem', backgroundColor: '#020617', fontWeight: '600' },
    hudCard: { position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '20px', color: '#fff', textAlign: 'center', zIndex: 100, boxSizing: 'border-box' },
    hudTitle: { margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '800' },
    hudDesc: { margin: '0 0 16px 0', opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.4', color: '#cbd5e1' },
    navigationRow: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
    navButton: { padding: '8px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }
};

export default ThreeSixtyViewer;