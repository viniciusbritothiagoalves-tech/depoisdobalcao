/**
 * CONFIGURAÇÕES GERAIS — DEPOIS DO BALCÃO
 * Centralize aqui os dados de contato, integrações e placeholders.
 */

const CONFIG = {
  // Número oficial de WhatsApp para redirecionamento da empresa (DDI 55 + DDD 38 + 99863-6150)
  WHATSAPP_NUMBER: "5538998636150",

  // URL de Webhook para envio dos leads para Banco de Dados / Planilha Google / CRM (Opcional)
  // Exemplo: "https://script.google.com/macros/s/XXXXX/exec" ou webhook do Make/Zapier/n8n
  LEAD_WEBHOOK_URL: "",

  // URL do formulário Tally (Embed Opcional)
  // Se preenchido com a URL real do Tally (ex: "https://tally.so/embed/xxxxxx"), o formulário Tally será exibido.
  // Se deixado como placeholder ou vazio, o formulário nativo completo é utilizado por padrão.
  TALLY_FORM_URL: "[TALLY_FORM_URL]",

  // URL da Política de Privacidade
  PRIVACY_POLICY_URL: "politica-de-privacidade.html",

  // Identificadores de Rastreamento (Opcionais)
  GOOGLE_ANALYTICS_ID: "[GOOGLE_ANALYTICS_ID]",
  META_PIXEL_ID: "[META_PIXEL_ID]",

  // Dados Institucionais
  BRAND_NAME: "Depois do Balcão",

  // Prova Social / Depoimentos Reais (Vazio por padrão)
  TESTIMONIALS: []
};

// Exporta globalmente para o navegador
window.APP_CONFIG = CONFIG;
