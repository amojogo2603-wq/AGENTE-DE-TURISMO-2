/*
  Akaiá Turismo — configuração PÚBLICA da prévia.
  Nada sensível aqui: sem tokens, chaves, senhas nem dados de clientes.

  whatsappLink: preencher SOMENTE após aprovação da empresa, no formato
                https://wa.me/<número com DDI e DDD, só dígitos>
                (o main.js só aceita links https://wa.me/…; qualquer outro valor é ignorado)
  instagramUrl: preencher SOMENTE após confirmação, no formato
                https://www.instagram.com/<perfil>
*/
const SITE_CONFIG = {
  whatsappLink: '', // preencher somente após aprovação da empresa
  instagramUrl: ''  // preencher somente após confirmação
};
Object.freeze(SITE_CONFIG);
