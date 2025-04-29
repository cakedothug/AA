import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Building2, 
  Car, 
  Phone, 
  Shield, 
  Users, 
  Wallet, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: <Building2 className="h-8 w-8 text-[#00E5FF]" />,
    title: "Sistema Imobiliário",
    description: "Compre, venda e decore propriedades. De apartamentos a mansões, encontre seu lugar ideal na cidade."
  },
  {
    icon: <Car className="h-8 w-8 text-[#FF0A54]" />,
    title: "Veículos Customizados",
    description: "Centenas de veículos exclusivos com modificações realistas e sistema de dano avançado."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-[#00E5FF]" />,
    title: "Empregos Legais",
    description: "Mais de 15 empregos legais com progressão de carreira e salários dinâmicos."
  },
  {
    icon: <Shield className="h-8 w-8 text-[#FF0A54]" />,
    title: "Facções Criminosas",
    description: "Integre-se a facções organizadas com territórios disputáveis e missões exclusivas."
  },
  {
    icon: <Wallet className="h-8 w-8 text-[#00E5FF]" />,
    title: "Economia Realista",
    description: "Sistema econômico dinâmico com inflação, mercado de ações e lavagem de dinheiro."
  },
  {
    icon: <Phone className="h-8 w-8 text-[#FF0A54]" />,
    title: "Smartphone Avançado",
    description: "Celular com redes sociais, banco, aplicativos de serviços e muito mais."
  },
  {
    icon: <Users className="h-8 w-8 text-[#00E5FF]" />,
    title: "Comunidade Ativa",
    description: "Eventos semanais organizados pela equipe e jogadores, com premiações exclusivas."
  },
  {
    icon: <Smartphone className="h-8 w-8 text-[#FF0A54]" />,
    title: "Aplicativo Companion",
    description: "Acesse informações do servidor e receba notificações através do nosso aplicativo."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-[#121212] to-[#1A1A1A]">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-rajdhani font-bold text-white mb-4">
            Funcionalidades <span className="text-[#00E5FF]">Exclusivas</span>
          </h2>
          <p className="text-gray-400">
            Descubra os recursos que fazem o Tokyo Edge RP se destacar entre os servidores de roleplay brasileiros
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="glassmorphism p-6 rounded-lg card-hover border-t-2"
              style={{ 
                borderColor: index % 2 === 0 ? "#00E5FF" : "#FF0A54" 
              }}
              variants={item}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1A1A] mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-rajdhani font-bold text-white mb-2 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
