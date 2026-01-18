import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Droplets, TrendingUp, Shield, ArrowRight, Play, Database, BarChart3, Sparkles } from 'lucide-react';

// --- Enhanced Fluid Background with New Colors ---
const FluidBackground = ({ scrollProgress }: { scrollProgress: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef(scrollProgress);

    useEffect(() => {
        scrollRef.current = scrollProgress;
    }, [scrollProgress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Enhanced wave configuration with transparency for realistic water
        const waves = [
            { amplitude: 70, frequency: 0.003, speed: 0.008, colors: ['rgba(0, 87, 146, 0.15)', 'rgba(0, 119, 182, 0.25)'], offset: 0 },
            { amplitude: 55, frequency: 0.007, speed: 0.012, colors: ['rgba(0, 119, 182, 0.2)', 'rgba(83, 205, 226, 0.3)'], offset: 150 },
            { amplitude: 45, frequency: 0.011, speed: 0.018, colors: ['rgba(83, 205, 226, 0.25)', 'rgba(144, 224, 239, 0.35)'], offset: 300 },
            { amplitude: 35, frequency: 0.016, speed: 0.025, colors: ['rgba(144, 224, 239, 0.3)', 'rgba(209, 244, 250, 0.4)'], offset: 450 },
        ];

        const animate = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;
            const currentScroll = scrollRef.current;

            ctx.clearRect(0, 0, width, height);

            // Smooth water level transition
            const waterLevel = height * 0.7 - (currentScroll * height * 1.1);

            // Draw gradient waves with enhanced transparency and blending
            waves.forEach((wave, i) => {
                ctx.beginPath();
                ctx.moveTo(0, height);

                for (let x = 0; x <= width; x += 6) {
                    const y = waterLevel +
                        Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
                        Math.cos(x * wave.frequency * 0.5 + time * wave.speed * 0.5) * (wave.amplitude * 0.25);

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                // Multi-stop gradient for realistic water depth
                const waveGradient = ctx.createLinearGradient(0, waterLevel - 200, 0, height);
                waveGradient.addColorStop(0, wave.colors[0]);
                waveGradient.addColorStop(0.3, wave.colors[1]);
                waveGradient.addColorStop(0.7, wave.colors[1]);

                // Add deeper color at bottom for depth
                const deepColor = i === 0 ? 'rgba(0, 87, 146, 0.35)' : wave.colors[1];
                waveGradient.addColorStop(1, deepColor);

                ctx.fillStyle = waveGradient;
                ctx.fill();

                // Enhanced shimmering stroke on top wave with subtle refraction effect
                if (i === waves.length - 1) {
                    // Main shimmer
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 0.04) * 0.25})`;
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    // Secondary shimmer for depth
                    ctx.beginPath();
                    ctx.moveTo(0, height);
                    for (let x = 0; x <= width; x += 6) {
                        const y = waterLevel +
                            Math.sin(x * wave.frequency + time * wave.speed + wave.offset + 0.5) * wave.amplitude +
                            Math.cos(x * wave.frequency * 0.5 + time * wave.speed * 0.5) * (wave.amplitude * 0.25) - 3;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.strokeStyle = `rgba(144, 224, 239, ${0.3 + Math.sin(time * 0.05 + 1) * 0.15})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            });

            time += 1;
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

// --- Floating Geometric Shapes ---
const FloatingShapes = () => {
    const shapes = [
        { size: 80, color: 'from-cyan-400/20 to-blue-500/20', delay: 0, x: '10%', y: '20%' },
        { size: 120, color: 'from-blue-400/15 to-cyan-500/15', delay: 0.5, x: '85%', y: '15%' },
        { size: 60, color: 'from-cyan-300/25 to-blue-400/25', delay: 1, x: '75%', y: '60%' },
        { size: 100, color: 'from-blue-500/10 to-cyan-400/10', delay: 1.5, x: '15%', y: '70%' },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
            {shapes.map((shape, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
                    style={{
                        width: shape.size,
                        height: shape.size,
                        left: shape.x,
                        top: shape.y,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 8,
                        delay: shape.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

// --- Noise Texture Overlay ---
const NoiseOverlay = () => (
    <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
        }}
    />
);

// --- Spotlight Feature Card ---
const SpotlightCard = ({ icon: Icon, title, description, delay = 0 }: { icon: React.ElementType, title: string, description: string, delay?: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.8,
                delay: delay * 0.15,
                ease: [0.22, 1, 0.36, 1]
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative h-full overflow-hidden rounded-3xl"
        >
            {/* Spotlight effect */}
            {isHovered && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
                    }}
                />
            )}

            {/* Card content */}
            <div className="relative h-full bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 hover:border-blue-200/60 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md">
                    <Icon className="w-8 h-8 text-primary" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
};

// --- Staggered Text with Shine Effect ---
const StaggeredText = ({ text, className = "", delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const letters = text.split('');

    return (
        <div className={`${className} relative`}>
            {/* Shine overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                    duration: 2.5,
                    delay: delay + 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 5
                }}
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)'
                }}
            />

            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: delay + index * 0.03,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className="inline-block"
                >
                    {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
            ))}
        </div>
    );
};

// --- Landing Page ---
const Landing = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Smooth scroll transform
    const { scrollYProgress } = useScroll({
        container: containerRef
    });

    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const maxScroll = scrollHeight - clientHeight;
            setScrollProgress(Math.min(scrollTop / maxScroll, 1));
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 snap-y snap-mandatory scroll-smooth">

            <FluidBackground scrollProgress={scrollProgress} />
            <FloatingShapes />
            <NoiseOverlay />

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/40 border-b border-white/30 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <Droplets className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">GroundTruth</span>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Analytics', 'Enterprise', 'Pricing'].map((item, i) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i, duration: 0.5 }}
                                className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                            </motion.a>
                        ))}
                    </div>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-7 py-3 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-slate-900/30 hover:scale-105 transition-all duration-300"
                    >
                        Login
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section with Parallax */}
            <section className="relative h-screen w-full flex flex-col items-center justify-center snap-start snap-always px-4">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 text-center max-w-6xl mx-auto space-y-10 mt-[-5vh]"
                >

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 backdrop-blur-xl shadow-sm"
                    >
                        <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI-Powered Hydro Intelligence</span>
                    </motion.div>

                    <div className="space-y-4">
                        <StaggeredText
                            text="GroundTruth"
                            className="text-8xl md:text-9xl font-black bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tighter leading-none drop-shadow-2xl"
                            delay={0.3}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent font-bold text-4xl md:text-6xl tracking-tight leading-tight bg-[length:200%] animate-gradient">
                                Track Your Water. Know the Ground Truth.
                            </div>
                        </motion.div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                        className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
                    >
                        The world's first real-time aquifer monitoring platform with predictive analytics that see beneath the surface.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-6"
                    >
                        <button
                            onClick={() => navigate('/login')}
                            className="group px-10 py-5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scroll to Explore</span>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                        <ChevronDown className="w-7 h-7 text-slate-400" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-40 px-6 snap-start">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="text-center mb-24 space-y-6">
                            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Intelligence at Scale
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
                                Satellite imagery, IoT sensors, and machine learning unified into one powerful platform.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SpotlightCard icon={Database} title="Unified Data" description="Integrate data from thousands of sensors into a single source of truth." delay={0} />
                        <SpotlightCard icon={TrendingUp} title="Predictive AI" description="Forecast water levels up to 6 months in advance with proprietary ML models." delay={1} />
                        <SpotlightCard icon={Shield} title="Bank-Grade Security" description="Your critical infrastructure data protected by end-to-end encryption." delay={2} />
                        <SpotlightCard icon={BarChart3} title="Custom Analytics" description="Build dashboards to track the metrics that matter most to stakeholders." delay={3} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-24 bg-white/90 backdrop-blur-sm border-t border-slate-200 snap-end">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                            <Droplets className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">GroundTruth</span>
                    </div>

                    <div className="text-slate-500 text-sm font-medium">
                        &copy; 2026 GroundTruth Inc. All rights reserved.
                    </div>

                    <div className="flex gap-8">
                        {['Privacy', 'Terms', 'Contact'].map(link => (
                            <a key={link} href="#" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Landing;
