import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// Dados simulados da equipe
const teamMembers = [
  {
    id: 1,
    name: "Ricardo Oliveira",
    role: "Fundador & Desenvolvedor",
    avatar: "https://i.pravatar.cc/150?img=1",
    discord: "thuglife#0001",
    description: "Fundador do servidor Tokyo Edge Roleplay e principal desenvolvedor dos sistemas de jogo."
  },
  {
    id: 2,
    name: "Ana Souza",
    role: "Administradora & Moderadora",
    avatar: "https://i.pravatar.cc/150?img=5",
    discord: "anasouza#1234",
    description: "Responsável pela gestão da comunidade e coordenação da equipe de moderação."
  },
  {
    id: 3,
    name: "Carlos Mendes",
    role: "Desenvolvedor & Mapper",
    avatar: "https://i.pravatar.cc/150?img=3",
    discord: "carlosm#4567",
    description: "Especialista em criação de mapas personalizados e integração de recursos exclusivos."
  },
  {
    id: 4,
    name: "Julia Lima",
    role: "Designer & Social Media",
    avatar: "https://i.pravatar.cc/150?img=4",
    discord: "julialima#7890",
    description: "Criadora das artes do servidor e responsável pela comunicação nas redes sociais."
  },
  {
    id: 5,
    name: "Pedro Alves",
    role: "Moderador & Suporte",
    avatar: "https://i.pravatar.cc/150?img=8",
    discord: "pedroalves#2345",
    description: "Moderador sênior e responsável pelo atendimento de suporte aos jogadores."
  },
  {
    id: 6,
    name: "Mariana Costa",
    role: "Gestora de Eventos",
    avatar: "https://i.pravatar.cc/150?img=9",
    discord: "maricosta#3456",
    description: "Coordenadora de eventos especiais e atividades da comunidade no servidor."
  }
];

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Nossa Equipe</h1>
        <p className="text-muted-foreground">
          Conheça os membros dedicados que trabalham para tornar o Tokyo Edge Roleplay uma experiência incrível.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground mb-4">{member.discord}</p>
            </div>
            <CardContent className="bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{member.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Quer fazer parte da equipe?</h2>
        <p className="text-muted-foreground mb-6">
          Estamos sempre em busca de pessoas talentosas e dedicadas para ajudar a melhorar nossa comunidade.
          Se você tem interesse em se juntar à equipe do Tokyo Edge Roleplay, entre em contato conosco pelo Discord.
        </p>
        <a 
          href="https://discord.gg/NZAAaAmQtC" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
        >
          <i className="fab fa-discord mr-2"></i> Entrar no Discord
        </a>
      </div>
    </div>
  );
}