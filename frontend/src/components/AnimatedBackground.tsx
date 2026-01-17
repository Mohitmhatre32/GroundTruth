import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base gradient with theme colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-cyan-50" />

            {/* Large wavy floating blob 1 - Complex path */}
            <motion.div
                className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/20 to-cyan-200/40 blur-3xl"
                animate={{
                    x: [0, 200, 100, -50, 0],
                    y: [0, -150, 50, 100, 0],
                    scale: [1, 1.4, 1.2, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360]
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Wavy blob 2 - Figure-8 pattern */}
            <motion.div
                className="absolute top-0 -right-40 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-primary/15 to-blue-200/35 blur-3xl"
                animate={{
                    x: [0, -180, -100, 50, 0],
                    y: [0, 200, -50, 150, 0],
                    scale: [1, 1.3, 1.5, 1.2, 1],
                    rotate: [0, -90, -180, -270, -360]
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Large wavy blob 3 - Organic movement */}
            <motion.div
                className="absolute -bottom-40 left-0 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-cyan-200/30 to-primary/25 blur-3xl"
                animate={{
                    x: [0, 150, -100, 80, 0],
                    y: [0, -200, -50, 100, 0],
                    scale: [1, 1.2, 1.4, 1.1, 1],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
            />

            {/* Center wavy blob - Circular flow */}
            <motion.div
                className="absolute top-1/3 left-1/3 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/18 to-indigo-200/30 blur-3xl"
                animate={{
                    x: [-200, 150, 200, -150, -200],
                    y: [-150, 180, -100, 150, -150],
                    scale: [1, 1.5, 1.3, 1.2, 1],
                    rotate: [0, 120, 240, 360, 480]
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 6
                }}
            />

            {/* Bottom right wavy blob */}
            <motion.div
                className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-sky-200/40 to-primary/20 blur-3xl"
                animate={{
                    x: [0, -150, 100, -80, 0],
                    y: [0, 180, -100, 120, 0],
                    scale: [1, 1.4, 1.1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 8
                }}
            />

            {/* Small accent blob with wave pattern */}
            <motion.div
                className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/25 to-cyan-300/35 blur-2xl"
                animate={{
                    x: [0, 120, -80, 60, 0],
                    y: [0, -100, 80, -60, 0],
                    scale: [1, 1.3, 1.1, 1.2, 1],
                    rotate: [0, 180, 360, 540, 720]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 3
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
