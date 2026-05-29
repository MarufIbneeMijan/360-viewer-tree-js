import React from 'react';

// 🚀 ACCEPT THE roomTitle PROP HERE
export const SmoothFade = ({ active, roomTitle }) => {
    return (
        <div style={{
            ...styles.fadeOverlay,
            opacity: active ? 1 : 0,
            pointerEvents: active ? 'all' : 'none',
        }}>
            {active && (
                <div style={styles.glassCard}>
                    {/* 🏃‍♂️ ANIMATED RUNNING CHARACTER CONTAINER */}
                    <div style={styles.characterWrapper}>
                        <svg 
                            style={styles.runnerSvg} 
                            viewBox="0 0 100 100" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Backpack */}
                            <path d="M30 45 C25 45, 22 55, 25 65 C28 72, 35 70, 35 65 Z" fill="#2563eb" opacity="0.8" stroke="#1e293b" strokeWidth="2"/>
                            <circle cx="30" cy="42" r="4" fill="#1d4ed8" stroke="#1e293b" strokeWidth="1.5"/>
                            
                            {/* Left Leg (Back) */}
                            <path d="M42 68 Q30 75 25 70 Q28 65 38 64" fill="none" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round"/>
                            
                            {/* Torso/Body */}
                            <path d="M35 48 Q45 48 48 65 Q40 70 35 60 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5"/>
                            
                            {/* Right Leg (Front - Running) */}
                            <path d="M46 68 Q52 78 62 82 Q58 86 50 78" fill="none" stroke="#3b82f6" strokeWidth="5.5" strokeLinecap="round"/>
                            
                            {/* Head & Cap */}
                            <circle cx="52" cy="35" r="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5"/>
                            <path d="M48 29 Q54 26 62 31 Q52 32 46 33" fill="#3b82f6" stroke="#1e293b" strokeWidth="2"/>
                            {/* Happy Face details */}
                            <circle cx="55" cy="34" r="1" fill="#1e293b"/>
                            <path d="M53 38 Q55 40 57 38" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
                            
                            {/* Left Arm holding Compass */}
                            <path d="M44 50 Q56 50 62 44" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>
                            <circle cx="64" cy="43" r="3.5" fill="#f59e0b" stroke="#1e293b" strokeWidth="1.5"/>
                            
                            {/* Right Arm (Swinging back) */}
                            <path d="M36 50 Q28 56 24 52" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                    </div>

                    {/* 📊 PROGRESS BAR TRACK */}
                    <div style={styles.progressTrack}>
                        <div style={styles.progressBar} />
                    </div>

                    {/* 🔤 DYNAMIC TYPOGRAPHY SECTION */}
                    <div style={styles.textWrapper}>
                        {/* 🚀 FIX: Shows the actual destination name dynamically */}
                        <h2 style={styles.statusText}>{roomTitle || "ENTERING SPACE"}</h2>
                        <span style={styles.brandText}>POCKETSCULPT MULTIVERSE ENGINE</span>
                    </div>

                    {/* 🧭 CORNER HUD RADAR DECORATION */}
                    <div style={styles.radarWrapper}>
                        <div style={styles.radarRing}>
                            <div style={styles.radarArrow}>→</div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes runnerBob {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-7px) rotate(2deg); }
                }
                @keyframes barFill {
                    0% { width: 0%; left: 0; }
                    100% { width: 100%; left: 0; }
                }
                @keyframes pulseBlue {
                    0%, 100% { opacity: 0.7; text-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
                    50% { opacity: 1; text-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
                }
                @keyframes radarScan {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ... keep your identical styles object mapping directly beneath intact!
const styles = {
    fadeOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#090d16', zIndex: 9999, transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', align: 'center', justifyContent: 'center' },
    glassCard: { position: 'relative', width: '90%', maxWidth: '560px', padding: '40px 32px', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)', overflow: 'hidden', boxSizing: 'border-box' },
    characterWrapper: { width: '120px', height: '120px', marginBottom: '24px', animation: 'runnerBob 0.5s ease-in-out infinite' },
    runnerSvg: { width: '100%', height: '100%' },
    progressTrack: { position: 'relative', width: '100%', maxWidth: '400px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', overflow: 'hidden', marginBottom: '28px' },
    progressBar: { position: 'absolute', top: 0, height: '100%', background: 'linear-gradient(90deg, #2563eb, #60a5fa)', borderRadius: '20px', animation: 'barFill 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite' },
    textWrapper: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' },
    statusText: { margin: 0, color: '#60a5fa', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', animation: 'pulseBlue 1.5s ease-in-out infinite' },
    brandText: { fontSize: '0.65rem', fontWeight: '700', color: '#475569', letterSpacing: '3px' },
    radarWrapper: { position: 'absolute', bottom: '24px', right: '32px' },
    radarRing: { width: '44px', height: '44px', border: '2px solid rgba(96, 165, 250, 0.15)', borderTop: '2px solid #3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'radarScan 1.2s linear infinite' },
    radarArrow: { color: '#60a5fa', fontSize: '1rem', fontWeight: '700', transform: 'rotate(-45deg)' }
};