import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Termos de Serviço</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>1. Introdução</h2>
          <p>
            Bem-vindo ao Tokyo Edge Roleplay. Estes Termos de Serviço regem o uso do nosso servidor de FiveM e site. 
            Ao acessar nosso servidor ou site, você concorda com estes termos.
          </p>
          
          <h2>2. Regras de Conduta</h2>
          <p>
            Todos os jogadores devem seguir as regras de conduta do servidor, incluindo:
          </p>
          <ul>
            <li>Respeitar todos os membros da comunidade</li>
            <li>Não usar cheats, mods ou hacks</li>
            <li>Não fazer spam ou propaganda não autorizada</li>
            <li>Não compartilhar conteúdo impróprio ou ilegal</li>
            <li>Seguir as regras de roleplay estabelecidas</li>
          </ul>
          
          <h2>3. Contas e Responsabilidade</h2>
          <p>
            Você é responsável por manter a segurança da sua conta e senha. 
            A administração não pode e não será responsável por qualquer perda ou dano resultante do não cumprimento desta obrigação.
          </p>
          
          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo disponível no servidor Tokyo Edge Roleplay, incluindo mas não limitado a scripts, texturas, 
            modelos 3D, logos e marcas, são propriedade do Tokyo Edge Roleplay ou de seus licenciadores.
          </p>
          
          <h2>5. Modificações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Alterações significativas serão comunicadas através de nosso Discord oficial.
          </p>
          
          <h2>6. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco pelo Discord.
          </p>
          
          <div className="my-8">
            <p>
              Última atualização: 28 de Abril de 2023
            </p>
            <p>
              <Link href="/privacy">
                <a className="text-primary underline">Ver nossa Política de Privacidade</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}