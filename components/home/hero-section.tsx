import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import backgroundImage from "../../assets/SITE.webp";

const HeroSection: React.FC = () => {
  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <section className="relative py-20 md:py-32 hero-gradient overflow-hidden">
      <div className="absolute inset-0 z-0" style={backgroundStyle}>
        <div className="w-full h-full bg-[#0F1A2C] bg-opacity-80"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-rajdhani font-bold mb-4">
            <span className="text-white">BEM-VINDO AO</span><br/>
            <span className="text-[#00E5FF]">TOKYO</span>
            <span className="text-[#FF0A54]">EDGE</span>
            <span className="text-white">RP</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            A cidade que nunca dorme e as oportunidades estão por toda parte. Os inteligentes constroem seus impérios, os rebeldes desafiam a lei, e os guardiões da ordem mantêm a paz.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button asChild className="cyberpunk-btn bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-6 py-3 rounded-md font-rajdhani font-bold text-lg">
              <Link href="#join">COMO JOGAR</Link>
            </Button>
            <Button asChild className="cyberpunk-btn bg-transparent border-2 border-[#FF0A54] hover:bg-[#FF0A54]/10 text-[#FF0A54] px-6 py-3 rounded-md font-rajdhani font-bold text-lg">
              <Link href="/application">APLICAR PARA STAFF</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
