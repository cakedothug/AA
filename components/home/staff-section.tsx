import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const staffMembers = [
  {
    name: "João Silva",
    role: "Fundador",
    avatar: "https://ui-avatars.com/api/?name=João+Silva&background=FF0A54&color=fff",
    discord: "joaosilva#1234"
  },
  {
    name: "Maria Santos",
    role: "Administradora",
    avatar: "https://ui-avatars.com/api/?name=Maria+Santos&background=00E5FF&color=fff",
    discord: "mariasantos#5678"
  },
  {
    name: "Pedro Costa",
    role: "Moderador",
    avatar: "https://ui-avatars.com/api/?name=Pedro+Costa&background=10B981&color=fff",
    discord: "pedrocosta#9012"
  },
  {
    name: "Ana Ferreira",
    role: "Suporte",
    avatar: "https://ui-avatars.com/api/?name=Ana+Ferreira&background=A855F7&color=fff",
    discord: "anaferreira#3456"
  }
];

const StaffSection: React.FC = () => {
  return (
    <section id="staff" className="py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-rajdhani font-bold text-white mb-4">
            Conheça Nossa <span className="text-[#FF0A54]">Equipe</span>
          </h2>
          <p className="text-gray-400">
            Dedicados a proporcionar a melhor experiência de roleplay no FiveM
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {staffMembers.map((member, index) => (
            <motion.div 
              key={index}
              className="glassmorphism p-6 rounded-lg text-center card-hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#FF0A54] animate-pulse opacity-70 blur-sm"></div>
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="rounded-full w-24 h-24 object-cover relative z-10 border-2 border-[#2D2D2D]"
                />
              </div>
              <h3 className="text-xl font-rajdhani font-bold text-white mb-1">
                {member.name}
              </h3>
              <div className="text-[#00E5FF] font-medium mb-2">
                {member.role}
              </div>
              <p className="text-gray-400 text-sm">
                {member.discord}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="max-w-3xl mx-auto text-center p-8 glassmorphism rounded-lg border border-[#2D2D2D]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-rajdhani font-bold text-white mb-4">
            Quer fazer parte da nossa equipe?
          </h3>
          <p className="text-gray-300 mb-6">
            Estamos sempre à procura de pessoas dedicadas e apaixonadas por roleplay para juntar-se à nossa equipe de staff. Se você tem compromisso com a comunidade e deseja contribuir para o crescimento do Tokyo Edge RP, candidate-se agora!
          </p>
          <Link href="/application">
            <Button className="cyberpunk-btn bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white px-6 py-3 rounded-md font-rajdhani font-bold text-lg">
              APLICAR PARA STAFF
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StaffSection;
