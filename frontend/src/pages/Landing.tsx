import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, ArrowRight } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#027598] to-[#014f66] text-white">
            {/* Background Waves - Multiple layers for depth */}
            <div className="absolute bottom-0 left-0 w-[200%] h-full z-0 opacity-30 pointer-events-none">
                <div className="absolute bottom-0 w-full h-[30vh] bg-[url('https://raw.githubusercontent.com/Mohitmhatre32/GroundTruth/main/assets/wave.svg')] bg-repeat-x bg-bottom bg-contain animate-wave opacity-70"></div>
                <div className="absolute bottom-[-10px] w-full h-[35vh] bg-[url('https://raw.githubusercontent.com/Mohitmhatre32/GroundTruth/main/assets/wave.svg')] bg-repeat-x bg-bottom bg-contain animate-wave animation-delay-2000 opacity-50"></div>
                <div className="absolute bottom-[-20px] w-full h-[40vh] bg-[url('https://raw.githubusercontent.com/Mohitmhatre32/GroundTruth/main/assets/wave.svg')] bg-repeat-x bg-bottom bg-contain animate-wave animation-delay-4000 opacity-30"></div>
            </div>

            {/* Since I cannot guarantee the external SVG loads, I will use a CSS based Fallback or pure CSS wave if the image fails. 
          Actually, let's use a pure CSS shape approach for reliability if the URL is dummy. 
          I'll stick to a CSS gradient/shape overlay approach which is safer.
      */}

            <div className="absolute bottom-0 left-0 right-0 h-64 bg-white/5 skew-y-3 origin-bottom-right transform translate-y-20"></div>
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-white/10 -skew-y-2 origin-bottom-left transform translate-y-10"></div>


            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col justify-center items-center text-center">

                <div className="mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20 shadow-xl">
                        <Droplets size={48} className="text-[#69d2e7] animate-bounce" />
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-lg">
                        GroundTruth
                    </h1>

                    <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
                        Track Your Water. See the Ground Truth.
                    </p>

                    <div className="mt-4 flex flex-col items-center gap-2 text-blue-200/80 uppercase tracking-widest text-sm font-semibold">
                        <span>Monitor • Predict • Protect</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 mt-8 animate-fade-in-up delay-150">
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-4 bg-secondary hover:bg-[#cda624] text-[#243A40] text-lg font-bold rounded-full shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg font-semibold rounded-full transition-all hover:scale-105"
                    >
                        Log In
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Landing;
