import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base gradient with theme colors - Neutral Shift */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50" />

            {/* Large wavy floating blob 1 - Primary Accent (Teal) */}
            <motion.div
                className="absolute -top-40 -left-40 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl opacity-20"
                animate={{
                    x: [0, 200, 100, -50, 0],
                    y: [0, -150, 50, 100, 0],
                    scale: [1, 1.2, 1.1, 1],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Wavy blob 2 - Warmth (Subtle) */}
            <motion.div
                className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-secondary/5 to-transparent blur-3xl opacity-20"
                animate={{
                    x: [0, -100, 50, 0],
                    y: [0, 100, -50, 0],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Large wavy blob 3 - Neutral/Slate */}
            <motion.div
                className="absolute -bottom-40 left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-slate-200/10 to-transparent blur-3xl opacity-30"
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -100, 100, 0],
                }}
                transition={{
                    duration: 45,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
            />

        </div>
    );
};

export default AnimatedBackground;
