import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>1. Introdução</h2>
          <p>
            Esta Política de Privacidade descreve como o Tokyo Edge Roleplay coleta, usa e compartilha 
            informações pessoais quando você utiliza nosso servidor de FiveM e nosso site.
          </p>
          
          <h2>2. Informações Coletadas</h2>
          <p>
            Podemos coletar os seguintes tipos de informações:
          </p>
          <ul>
            <li>Informações de identificação como nome de usuário e endereço IP</li>
            <li>Informações do Discord (se você vincular sua conta)</li>
            <li>Estatísticas e logs de jogo</li>
            <li>Informações de comunicação e suporte</li>
          </ul>
          
          <h2>3. Uso das Informações</h2>
          <p>
            Utilizamos as informações coletadas para:
          </p>
          <ul>
            <li>Fornecer, manter e melhorar nossos serviços</li>
            <li>Proteger a segurança do servidor e dos usuários</li>
            <li>Comunicar-se com você e responder a solicitações</li>
            <li>Cumprir com obrigações legais</li>
          </ul>
          
          <h2>4. Compartilhamento de Informações</h2>
          <p>
            Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes circunstâncias:
          </p>
          <ul>
            <li>Com sua permissão explícita</li>
            <li>Para cumprir requisitos legais</li>
            <li>Para proteger direitos, propriedade ou segurança do Tokyo Edge Roleplay e seus usuários</li>
          </ul>
          
          <h2>5. Segurança</h2>
          <p>
            Empregamos medidas de segurança razoáveis para proteger suas informações contra acesso não autorizado,
            alteração, divulgação ou destruição.
          </p>
          
          <h2>6. Seus Direitos</h2>
          <p>
            Você tem direito a:
          </p>
          <ul>
            <li>Acessar e receber uma cópia das suas informações pessoais</li>
            <li>Corrigir informações imprecisas</li>
            <li>Solicitar a exclusão de suas informações pessoais</li>
            <li>Objetar ou restringir o processamento de suas informações pessoais</li>
          </ul>
          
          <h2>7. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. 
            Notificaremos sobre mudanças significativas através do nosso Discord oficial.
          </p>
          
          <h2>8. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo Discord.
          </p>
          
          <div className="my-8">
            <p>
              Última atualização: 28 de Abril de 2023
            </p>
            <p>
              <Link href="/terms">
                <a className="text-primary underline">Ver nossos Termos de Serviço</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}