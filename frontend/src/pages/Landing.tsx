import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Droplets, TrendingUp, Shield, Zap, ArrowRight, Play, Database, BarChart3 } from 'lucide-react';

// Fluid Background with Advanced Effects
const FluidBackground = ({ scrollProgress }: { scrollProgress: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let time = 0;
        const particles: any[] = [];

        // Create flowing particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * (canvas.width / dpr),
                y: Math.random() * (canvas.height / dpr),
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const waves = [
            { amplitude: 40, frequency: 0.015, speed: 0.025, offset: 0 },
            { amplitude: 30, frequency: 0.02, speed: 0.03, offset: Math.PI / 3 },
            { amplitude: 35, frequency: 0.018, speed: 0.028, offset: Math.PI / 2 }
        ];

        let animationFrameId: number;

        const animate = () => {
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;

            ctx.clearRect(0, 0, width, height);

            // Water rises from 60% to 15% as user scrolls
            const waterLevel = height * (0.6 - (scrollProgress * 0.45));

            // Draw gradient background for water - matching PRIMARY color #027598
            const bgGradient = ctx.createLinearGradient(0, waterLevel - 200, 0, height);
            bgGradient.addColorStop(0, 'rgba(2, 117, 152, 0.03)');
            bgGradient.addColorStop(0.5, 'rgba(2, 117, 152, 0.08)');
            bgGradient.addColorStop(1, 'rgba(2, 117, 152, 0.12)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, waterLevel - 200, width, height);

            // Draw waves
            waves.forEach((wave, index) => {
                ctx.beginPath();
                ctx.moveTo(0, height);

                for (let x = 0; x <= width; x += 3) {
                    const y = waterLevel +
                        Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
                        Math.sin(x * wave.frequency * 0.3 + time * wave.speed * 1.8) * (wave.amplitude * 0.4);

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                const alpha = 0.06 - (index * 0.015);
                ctx.fillStyle = `rgba(2, 117, 152, ${alpha})`;
                ctx.fill();
            });

            // Draw flowing particles
            particles.forEach(particle => {
                if (particle.y > waterLevel - 50) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(2, 117, 152, ${particle.opacity * 0.3})`;
                    ctx.fill();

                    particle.x += particle.speedX;
                    particle.y += particle.speedY * 0.5;

                    if (particle.y > height) {
                        particle.y = waterLevel - 50;
                        particle.x = Math.random() * width;
                    }
                    if (particle.x < 0) particle.x = width;
                    if (particle.x > width) particle.x = 0;
                }
            });

            // Shimmer effect on water surface
            const shimmer = ctx.createLinearGradient(0, waterLevel - 80, 0, waterLevel + 80);
            shimmer.addColorStop(0, 'rgba(255, 255, 255, 0)');
            shimmer.addColorStop(0.5, `rgba(255, 255, 255, ${0.08 + Math.sin(time * 0.05) * 0.04})`);
            shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = shimmer;
            ctx.fillRect(0, waterLevel - 80, width, 160);

            time += 1;
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [scrollProgress]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Animated Metric Card
const MetricCard = ({ value, label, trend, delay = 0 }: { value: string, label: string, trend?: string, delay?: number }) => (
    <div
        className="group relative"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500">
            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold bg-gradient-to-br from-primary to-[#025f7a] bg-clip-text text-transparent">{value}</span>
                {trend && <span className="text-sm text-success">↑ {trend}</span>}
            </div>
            <p className="text-sm text-textMuted font-medium uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

// Feature Card with Icon
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) => (
    <div
        className="group relative"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700" />
        <div className="relative h-full bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 hover:bg-white/60 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#025f7a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/20">
                <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-textMain mb-3">{title}</h3>
            <p className="text-textMuted leading-relaxed">{description}</p>
        </div>
    </div>
);

// Main Landing Page
const Landing = () => {
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollTop = containerRef.current.scrollTop;
                const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
                const progress = Math.min(scrollTop / scrollHeight, 1);
                setScrollProgress(progress);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                container.removeEventListener('scroll', handleScroll);
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, []);

    const features = [
        { icon: Database, title: 'Unified Data Platform', description: 'Consolidate groundwater data from multiple sources into a single, real-time intelligence layer.' },
        { icon: TrendingUp, title: 'AI-Powered Forecasting', description: 'Machine learning models predict aquifer behavior with 99.9% accuracy up to 6 months ahead.' },
        { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption and compliance certifications protect your critical infrastructure data.' },
        { icon: BarChart3, title: 'Advanced Analytics', description: 'Transform raw sensor data into actionable insights with customizable dashboards and reports.' }
    ];

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-y-auto bg-background scroll-smooth">
            {/* Mouse follower gradient */}
            <div
                className="fixed pointer-events-none z-50 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out"
                style={{
                    background: 'radial-gradient(circle, rgba(2,117,152,0.3) 0%, transparent 70%)',
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192
                }}
            />

            {/* Fixed Fluid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <FluidBackground scrollProgress={scrollProgress} />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/30 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#025f7a] rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                <Droplets className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent">
                                GroundTruth
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#platform" className="text-textMain hover:text-primary transition-colors font-medium">Platform</a>
                            <a href="#features" className="text-textMain hover:text-primary transition-colors font-medium">Solutions</a>
                            <a href="#insights" className="text-textMain hover:text-primary transition-colors font-medium">Insights</a>
                            <a href="#pricing" className="text-textMain hover:text-primary transition-colors font-medium">Pricing</a>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="group relative bg-gradient-to-r from-primary to-[#025f7a] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
                        >
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#025f7a] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/40 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                <span className="text-sm font-semibold text-textMain">Real-time Intelligence Platform</span>
                            </div>

                            <h1 className="text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
                                <span className="block text-textMain">The Truth</span>
                                <span className="block text-textMain">Lies </span>
                                <span className="block bg-gradient-to-r from-primary via-[#0394c4] to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                    Deep
                                </span>
                            </h1>

                            <p className="text-xl text-textMuted leading-relaxed max-w-xl">
                                Transform groundwater monitoring into strategic intelligence. Real-time data, predictive analytics, and unparalleled precision.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button className="group relative bg-gradient-to-r from-primary to-[#025f7a] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Explore Platform
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#025f7a] to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>

                                <button className="group bg-white/60 backdrop-blur-xl hover:bg-white/80 text-textMain px-8 py-4 rounded-full font-semibold text-lg border border-white/40 transition-all duration-300 hover:border-primary/40 hover:shadow-xl flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" />
                                    Watch Demo
                                </button>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <MetricCard value="99.9%" label="Accuracy" delay={0} />
                                <MetricCard value="24/7" label="Monitoring" delay={100} />
                                <MetricCard value="15K+" label="Sensors" trend="12%" delay={200} />
                            </div>
                        </div>

                        {/* Right Content - Glassmorphic Dashboard Card */}
                        <div className="relative z-10">
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl animate-pulse" />

                                {/* Main Card */}
                                <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-2xl">
                                    <div className="space-y-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4 border-b border-white/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success/50" />
                                                <span className="font-semibold text-textMain uppercase tracking-wide text-sm">Live Monitoring</span>
                                            </div>
                                            <span className="text-xs text-textMuted font-medium">Updated 2s ago</span>
                                        </div>

                                        {/* Main Metric */}
                                        <div>
                                            <div className="flex items-baseline gap-3 mb-2">
                                                <span className="text-7xl font-bold bg-gradient-to-br from-primary to-[#025f7a] bg-clip-text text-transparent">14.2</span>
                                                <span className="text-3xl text-gray-400 font-light">m</span>
                                            </div>
                                            <p className="text-sm text-textMuted font-medium">Aquifer Water Level</p>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-textMuted font-medium">Current Depth</span>
                                                <span className="text-textMain font-bold">79%</span>
                                            </div>
                                            <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-r from-primary via-[#0394c4] to-secondary rounded-full animate-gradient bg-[length:200%_auto]"
                                                    style={{ width: '79%' }}
                                                />
                                                <div className="absolute inset-0 bg-white/20 rounded-full" style={{
                                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                                                    animation: 'shimmer 2s infinite'
                                                }} />
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                                                <div className="text-3xl font-bold text-textMain mb-1">+2.3m</div>
                                                <div className="text-xs text-textMuted uppercase tracking-wide font-medium">This Month</div>
                                            </div>
                                            <div className="bg-gradient-to-br from-success/20 to-success/10 backdrop-blur-sm rounded-2xl p-4 border border-success/30">
                                                <div className="text-3xl font-bold text-success mb-1">Stable</div>
                                                <div className="text-xs text-textMuted uppercase tracking-wide font-medium">Status</div>
                                            </div>
                                        </div>

                                        {/* Chart placeholder */}
                                        <div className="pt-4">
                                            <div className="h-32 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-end justify-around p-4 gap-2">
                                                {[65, 45, 80, 60, 90, 75, 85].map((height, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-primary to-[#0394c4] rounded-t-lg transition-all duration-300 hover:from-[#025f7a] hover:to-primary"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-textMuted font-medium px-2">
                                                <span>Mon</span>
                                                <span>Tue</span>
                                                <span>Wed</span>
                                                <span>Thu</span>
                                                <span>Fri</span>
                                                <span>Sat</span>
                                                <span>Sun</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex flex-col items-center gap-2 animate-bounce">
                        <span className="text-xs text-textMuted font-medium uppercase tracking-wider">Scroll to explore</span>
                        <ChevronDown className="w-6 h-6 text-primary" strokeWidth={2.5} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/40 px-4 py-2 rounded-full mb-6">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-textMain">Enterprise Platform</span>
                        </div>
                        <h2 className="text-6xl font-bold text-textMain mb-6 tracking-tight">
                            Intelligence at <span className="bg-gradient-to-r from-primary to-[#025f7a] bg-clip-text text-transparent">Scale</span>
                        </h2>
                        <p className="text-xl text-textMuted max-w-3xl mx-auto leading-relaxed">
                            Transform raw sensor data into strategic insights with our AI-powered platform designed for critical infrastructure.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} delay={index * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6 lg:px-8">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="relative overflow-hidden">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#025f7a] to-[#014d64] animate-gradient bg-[length:200%_200%]" style={{ borderRadius: '2rem' }} />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

                        <div className="relative px-12 py-16 lg:px-20 lg:py-20">
                            <div className="text-center">
                                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                                    Ready to Transform Your<br />Water Management?
                                </h2>
                                <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Join leading organizations using GroundTruth to make data-driven decisions about their most critical resource.
                                </p>

                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button onClick={() => navigate('/login')} className="group relative bg-white text-primary px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-white/30 hover:scale-105 overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Free Trial
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>

                                    <button className="group bg-white/10 backdrop-blur-xl text-white px-10 py-5 rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center gap-2">
                                        <Play className="w-5 h-5 fill-current" />
                                        Watch Platform Demo
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-white/20">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white mb-1">500+</div>
                                        <div className="text-sm text-white/60 uppercase tracking-wider">Organizations</div>
                                    </div>
                                    <div className="w-px h-12 bg-white/20" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white mb-1">50M+</div>
                                        <div className="text-sm text-white/60 uppercase tracking-wider">Data Points</div>
                                    </div>
                                    <div className="w-px h-12 bg-white/20" />
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                                        <div className="text-sm text-white/60 uppercase tracking-wider">Uptime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-16 px-6 lg:px-8 bg-white/30 backdrop-blur-2xl border-t border-white/40">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#025f7a] rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Droplets className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-textMain to-textMuted bg-clip-text text-transparent">
                                    GroundTruth
                                </span>
                            </div>
                            <p className="text-textMuted max-w-sm leading-relaxed">
                                Real-time groundwater intelligence for critical infrastructure and environmental management.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-textMain mb-4">Platform</h4>
                            <ul className="space-y-2 text-textMuted">
                                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-textMain mb-4">Company</h4>
                            <ul className="space-y-2 text-textMuted">
                                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/40 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-textMuted text-sm">
                            © 2026 GroundTruth. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-textMuted hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="text-textMuted hover:text-primary transition-colors">Terms of Service</a>
                            <a href="#" className="text-textMuted hover:text-primary transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
