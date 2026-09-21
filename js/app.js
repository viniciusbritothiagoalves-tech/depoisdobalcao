/**
 * DEPOIS DO BALCÃO — SCRIPT PRINCIPAL DA LANDING PAGE
 * UX/UI, Interações, Validações Rigorosas (Anti-Burla de WhatsApp), Gravação de Leads e WhatsApp Redirect
 */

(function () {
  'use strict';

  // Carrega configurações globais
  const config = window.APP_CONFIG || {};

  /* ========================================================================
     1. SISTEMA DE ANALYTICS & EVENTOS
     ======================================================================== */
  function trackEvent(eventName, eventParams = {}) {
    console.log(`[Analytics Event] ${eventName}:`, eventParams);

    if (typeof window.gtag === 'function' && config.GOOGLE_ANALYTICS_ID && !config.GOOGLE_ANALYTICS_ID.includes('[')) {
      window.gtag('event', eventName, eventParams);
    }

    if (typeof window.fbq === 'function' && config.META_PIXEL_ID && !config.META_PIXEL_ID.includes('[')) {
      window.fbq('trackCustom', eventName, eventParams);
    }

    document.dispatchEvent(new CustomEvent('lp_event', { detail: { name: eventName, params: eventParams } }));
  }

  // Dispara page_view inicial
  trackEvent('page_view', { page: window.location.pathname });

  /* ========================================================================
     2. CAPTURA DE PARÂMETROS DE URL / ATRIBUIÇÃO DE ORIGEM
     ======================================================================== */
  function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_content: urlParams.get('utm_content') || '',
      src: urlParams.get('src') || '',
      video: urlParams.get('video') || ''
    };
  }

  function fillAttributionFields() {
    const params = getUrlParams();
    for (const [key, value] of Object.entries(params)) {
      const field = document.getElementById(key);
      if (field) {
        field.value = value;
      }
    }
  }

  /* ========================================================================
     3. ROLAGEM SUAVE & CTAS
     ======================================================================== */
  function initSmoothScroll() {
    const ctaButtons = [
      document.getElementById('header-cta-btn'),
      document.getElementById('hero-cta-btn'),
      document.getElementById('mobile-sticky-btn')
    ];

    ctaButtons.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById('formulario');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          trackEvent('click_solicitar_orcamento', { source_button: btn.id });
        }
      });
    });
  }

  /* ========================================================================
     4. CTA STICKY NO MOBILE (APARECE APÓS O HERO)
     ======================================================================== */
  function initStickyMobileCta() {
    const heroSection = document.querySelector('.hero-section');
    const stickyBar = document.getElementById('mobile-sticky-bar');

    if (!heroSection || !stickyBar) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            stickyBar.classList.add('is-visible');
            stickyBar.setAttribute('aria-hidden', 'false');
          } else {
            stickyBar.classList.remove('is-visible');
            stickyBar.setAttribute('aria-hidden', 'true');
          }
        });
      }, {
        threshold: 0.1
      });

      observer.observe(heroSection);
    } else {
      window.addEventListener('scroll', () => {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        if (heroBottom < 0) {
          stickyBar.classList.add('is-visible');
        } else {
          stickyBar.classList.remove('is-visible');
        }
      }, { passive: true });
    }
  }

  /* ========================================================================
     5. FAQ ACCORDION (ACESSIBILIDADE E ANIMAÇÃO SUAVE)
     ======================================================================== */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      const panel = item.querySelector('.faq-answer-panel');

      if (!btn || !panel) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            const otherPanel = otherItem.querySelector('.faq-answer-panel');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 30 + 'px';
        } else {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = null;
        }
      });
    });
  }

  /* ========================================================================
     6. VALIDAÇÃO RIGOROSA DE WHATSAPP BRASILEIRO (ANTI-BURLA)
     ======================================================================== */
  // Lista oficial de todos os DDDs válidos dos estados brasileiros (inclui 51, 53, 54, 55 no RS)
  const VALID_BRAZILIAN_DDDS = new Set([
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, 27, 28,                 // RJ / ES
    31, 32, 33, 34, 35, 37, 38,         // MG
    41, 42, 43, 44, 45, 46, 47, 48, 49, // PR / SC
    51, 53, 54, 55,                     // RS (DDDs iniciados com 5)
    61, 62, 63, 64, 65, 66, 67, 68, 69, // DF / GO / TO / MT / MS / AC / RO
    71, 73, 74, 75, 77, 79,             // BA / SE
    81, 82, 83, 84, 85, 86, 87, 88, 89, // PE / AL / PB / RN / CE / PI
    91, 92, 93, 94, 95, 96, 97, 98, 99  // PA / AM / RR / AP / MA
  ]);

  function validateBrazilianWhatsApp(rawPhone) {
    const digits = (rawPhone || '').replace(/\D/g, '');

    if (!digits) {
      return { isValid: false, message: 'Por favor, informe seu número de WhatsApp.' };
    }

    // Regra 1: O formato obrigatório é (99) 99999-9999 (exatamente 11 dígitos)
    if (digits.length !== 11) {
      return { 
        isValid: false, 
        message: 'Número incompleto. O formato obrigatório é (99) 99999-9999 (DDD do estado + 9 dígitos).' 
      };
    }

    const ddd = parseInt(digits.substring(0, 2), 10);
    const ninthDigit = digits[2];
    const remainingDigits = digits.substring(3);

    // Regra 2: O DDD deve ser de um estado brasileiro válido (NUNCA código de país 55 com outro DDD)
    if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
      return { 
        isValid: false, 
        message: `O DDD (${ddd}) não existe no Brasil. Digite apenas o DDD do seu estado (ex: 38, 11, 21, 51, 55...). Não utilize o código do país (+55).` 
      };
    }

    // Regra 3: O número após o DDD do estado é OBRIGATÓRIO o número 9
    if (ninthDigit !== '9') {
      return { 
        isValid: false, 
        message: 'O número de celular/WhatsApp deve começar obrigatoriamente com o dígito 9 após o DDD: (DD) 9XXXX-XXXX.' 
      };
    }

    // Regra 4 (Anti-burla): Não permitir todos os 11 dígitos idênticos (ex: 11111111111, 00000000000)
    if (/^(\d)\1{10}$/.test(digits)) {
      return { 
        isValid: false, 
        message: 'Por favor, informe um número de telefone real e ativo.' 
      };
    }

    // Regra 5 (Anti-burla): Não permitir os 8 dígitos finais todos idênticos (ex: (11) 99999-9999, (38) 98888-8888)
    if (/^(\d)\1{7}$/.test(remainingDigits)) {
      return { 
        isValid: false, 
        message: 'Número inválido detectado. Informe seu WhatsApp real para receber o orçamento.' 
      };
    }

    // Regra 6 (Anti-burla): Não permitir sequências falsas óbvias de teste
    if (remainingDigits === '12345678' || remainingDigits === '01234567') {
      return { 
        isValid: false, 
        message: 'Número de teste detectado. Digite um número de WhatsApp ativo.' 
      };
    }

    return { isValid: true, digits: digits };
  }

  /* ========================================================================
     7. MÁSCARAS DE INPUT (TELEFONE E CEP)
     ======================================================================== */
  function maskPhone(value) {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.substring(0, 11);

    if (clean.length > 10) {
      // (99) 99999-9999
      return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (clean.length > 6) {
      // (99) 9999...
      return clean.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
    } else if (clean.length > 2) {
      return clean.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (clean.length > 0) {
      return clean.replace(/^(\d{0,2})$/, '($1');
    }
    return clean;
  }

  function maskCep(value) {
    let clean = value.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.substring(0, 8);
    if (clean.length > 5) {
      return clean.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    }
    return clean;
  }

  function checkPhoneField(showError = false) {
    const phoneInput = document.getElementById('campo-whatsapp');
    const errorElem = document.getElementById('whatsapp-error-msg');
    const helperElem = document.getElementById('whatsapp-helper');
    if (!phoneInput) return true;

    const value = phoneInput.value;
    const cleanDigits = value.replace(/\D/g, '');

    // Se o usuário ainda está digitando e não atingiu 11 dígitos, não exibe erro a menos que seja submit/blur
    if (!showError && cleanDigits.length < 11) {
      phoneInput.classList.remove('is-invalid', 'is-valid');
      if (errorElem) errorElem.style.display = 'none';
      if (helperElem) helperElem.style.display = 'block';
      return false;
    }

    const res = validateBrazilianWhatsApp(value);
    if (!res.isValid) {
      phoneInput.classList.add('is-invalid');
      phoneInput.classList.remove('is-valid');
      if (errorElem) {
        errorElem.textContent = res.message;
        errorElem.style.display = 'block';
      }
      if (helperElem) helperElem.style.display = 'none';
      return false;
    } else {
      phoneInput.classList.remove('is-invalid');
      phoneInput.classList.add('is-valid');
      if (errorElem) errorElem.style.display = 'none';
      if (helperElem) helperElem.style.display = 'block';
      return true;
    }
  }

  function initInputMasks() {
    const phoneInput = document.getElementById('campo-whatsapp');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
        if (e.target.value.replace(/\D/g, '').length === 11) {
          checkPhoneField(false);
        }
      });

      phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim().length > 0) {
          checkPhoneField(true);
        }
      });
    }

    const cepInput = document.getElementById('campo-cep');
    if (cepInput) {
      cepInput.addEventListener('input', (e) => {
        e.target.value = maskCep(e.target.value);
      });
    }
  }

  /* ========================================================================
     8. LÓGICA CONDICIONAL DO FORMULÁRIO DE QUALIFICAÇÃO
     ======================================================================== */
  function initConditionalForm() {
    const form = document.getElementById('orcamento-form');
    if (!form) return;

    let hasStartedForm = false;
    form.addEventListener('focusin', () => {
      if (!hasStartedForm) {
        hasStartedForm = true;
        trackEvent('form_start');
      }
    }, { once: true });

    // 1. Estilização de cartões selecionados (Radio cards)
    const radioInputs = form.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(radio => {
      radio.addEventListener('change', () => {
        const name = radio.getAttribute('name');
        const groupCards = form.querySelectorAll(`input[name="${name}"]`);
        groupCards.forEach(input => {
          const card = input.closest('.option-card');
          if (card) {
            if (input.checked) {
              card.classList.add('is-selected');
            } else {
              card.classList.remove('is-selected');
            }
          }
        });
      });
    });

    // 2. Campo 4: Embalagem -> Condicional "Outro"
    const embalagemRadios = form.querySelectorAll('input[name="embalagem"]');
    const outroBlock = document.getElementById('condicional-embalagem-outro');
    const outroInput = document.getElementById('campo-embalagem-detalhe');

    embalagemRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'Outro' && radio.checked) {
          outroBlock.classList.add('is-visible');
          outroInput.focus();
        } else {
          outroBlock.classList.remove('is-visible');
          if (outroInput) outroInput.value = '';
        }
      });
    });

    // 3. Campo 5: Tamanho do rótulo -> Sim vs Não
    const tamanhoRadios = form.querySelectorAll('input[name="sabe_tamanho"]');
    const medidasBlock = document.getElementById('condicional-tamanho-medidas');
    const orientacaoBlock = document.getElementById('condicional-tamanho-orientacao');

    tamanhoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'Sim' && radio.checked) {
          medidasBlock.classList.add('is-visible');
          orientacaoBlock.classList.remove('is-visible');
        } else if (radio.value.startsWith('Não') && radio.checked) {
          medidasBlock.classList.remove('is-visible');
          orientacaoBlock.classList.add('is-visible');
          const w = document.getElementById('campo-largura');
          const h = document.getElementById('campo-altura');
          if (w) w.value = '';
          if (h) h.value = '';
        }
      });
    });
  }

  /* ========================================================================
     9. ARMAZENAMENTO DE LEADS (LOCAL STORAGE + WEBHOOK NUVEM)
     ======================================================================== */
  function saveLeadToStorage(leadData) {
    // 1. Gravação no LocalStorage do Navegador
    try {
      const STORAGE_KEY = 'depois_do_balcao_leads';
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push(leadData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      console.log('Lead salvo com sucesso no armazenamento local:', leadData);
    } catch (err) {
      console.error('Erro ao salvar lead no localStorage:', err);
    }

    // 2. Disparo para Webhook / Planilha Google / CRM (se configurado)
    if (config.LEAD_WEBHOOK_URL && !config.LEAD_WEBHOOK_URL.includes('[')) {
      try {
        fetch(config.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
          mode: 'no-cors'
        }).then(() => {
          console.log('Lead enviado com sucesso para o Webhook');
        }).catch(e => console.warn('Aviso: erro ao enviar para webhook:', e));
      } catch (e) {
        console.warn('Erro fetch webhook:', e);
      }
    }
  }

  /* ========================================================================
     10. GERAÇÃO DE MENSAGEM E URL DO WHATSAPP
     ======================================================================== */
  function buildWhatsAppUrl(lead) {
    let tamanhoTexto = lead.sabe_tamanho;
    if (lead.sabe_tamanho === 'Sim') {
      const l = lead.largura_cm ? `${lead.largura_cm}cm` : '';
      const a = lead.altura_cm ? `${lead.altura_cm}cm` : '';
      if (l || a) {
        tamanhoTexto = `${l} x ${a}`.trim();
      }
    } else {
      tamanhoTexto = 'Preciso de orientação';
    }

    let embalagemTexto = lead.embalagem;
    if (lead.embalagem === 'Outro' && lead.embalagem_outro_detalhe) {
      embalagemTexto = `Outro (${lead.embalagem_outro_detalhe})`;
    }

    // Template oficial de mensagem
    const messageLines = [
      'Olá! Acabei de preencher minha solicitação de orçamento pelo Depois do Balcão.',
      '',
      `Nome: ${lead.nome}`,
      `Produto: ${lead.produto}`,
      `Embalagem: ${embalagemTexto}`,
      `Tamanho: ${tamanhoTexto}`,
      `Quantidade: ${lead.quantidade}`,
      `Possuo logomarca: ${lead.possui_logo}`,
      `CEP: ${lead.cep}`,
      '',
      'Gostaria de continuar meu orçamento.'
    ];

    const fullMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);

    // Número oficial de destino configurado (+55 38 99863-6150)
    const rawNumber = config.WHATSAPP_NUMBER || '5538998636150';
    const cleanNumber = rawNumber.replace(/\D/g, '');

    return {
      isPlaceholder: false,
      text: fullMessage,
      url: `https://wa.me/${cleanNumber}?text=${encodedMessage}`
    };
  }

  function showSuccessModal(lead, waResult) {
    const modal = document.createElement('div');
    modal.id = 'success-lead-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(11, 20, 38, 0.85)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.padding = '1.5rem';

    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; max-width:520px; width:100%; padding:2.25rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); border:1px solid #E2E8F0; text-align:center;">
        <div style="width:56px; height:56px; background:#FEF3C7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto; color:#D97706;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 style="font-size:1.5rem; font-weight:800; color:#0F172A; margin-bottom:0.75rem;">Solicitação Registrada!</h3>
        <p style="font-size:0.9375rem; color:#475569; line-height:1.6; margin-bottom:1.5rem;">
          Seus dados foram salvos com sucesso e estamos preparando seu atendimento.
        </p>
        
        <p style="font-size:0.875rem; color:#64748B; margin-bottom:1.5rem;">
          Você será direcionado para o atendimento via WhatsApp em instantes...
        </p>

        <a href="${waResult.url}" id="modal-wa-link" style="display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; width:100%; padding:0.875rem 1.5rem; background:#E5A419; color:#0B1426; font-weight:700; border-radius:8px; text-decoration:none; font-size:1rem; box-shadow:0 4px 12px rgba(229,164,25,0.25);">
          CONTINUAR NO WHATSAPP
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>

        <button type="button" id="modal-close-btn" style="margin-top:1rem; background:transparent; border:none; color:#64748B; font-size:0.875rem; cursor:pointer; text-decoration:underline;">
          Fechar esta janela
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    // Redireciona em 1.2s automaticamente para o WhatsApp oficial
    setTimeout(() => {
      trackEvent('whatsapp_redirect', { lead_id: lead.id, destino: '5538998636150' });
      window.location.href = waResult.url;
    }, 1200);
  }

  /* ========================================================================
     11. SUBMISSÃO DO FORMULÁRIO E VALIDAÇÕES
     ======================================================================== */
  function initFormSubmission() {
    const form = document.getElementById('orcamento-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const whatsapp = form.whatsapp.value.trim();
      const produto = form.produto.value.trim();
      const embalagemRadio = form.querySelector('input[name="embalagem"]:checked');
      const sabeTamanhoRadio = form.querySelector('input[name="sabe_tamanho"]:checked');
      const quantidadeRadio = form.querySelector('input[name="quantidade"]:checked');
      const possuiLogoRadio = form.querySelector('input[name="possui_logo"]:checked');
      const cep = form.cep.value.trim();
      const consentimento = form.consentimento.checked;

      // Validação: Nome
      if (!nome) {
        alert('Por favor, informe o seu nome completo.');
        form.nome.focus();
        return;
      }

      // Validação Rigorosa: WhatsApp Brasileiro e Anti-Burla
      const phoneValidation = validateBrazilianWhatsApp(whatsapp);
      if (!phoneValidation.isValid) {
        alert(phoneValidation.message);
        form.whatsapp.focus();
        checkPhoneField(true);
        return;
      }

      // Validação: Produto
      if (!produto) {
        alert('Por favor, informe o que você vende.');
        form.produto.focus();
        return;
      }

      // Validação: Embalagem
      if (!embalagemRadio) {
        alert('Por favor, selecione onde pretende aplicar o rótulo.');
        return;
      }

      if (embalagemRadio.value === 'Outro' && !form.embalagem_outro_detalhe.value.trim()) {
        alert('Por favor, conte qual é a sua embalagem.');
        form.embalagem_outro_detalhe.focus();
        return;
      }

      // Validação: Tamanho
      if (!sabeTamanhoRadio) {
        alert('Por favor, indique se já sabe aproximadamente o tamanho do rótulo.');
        return;
      }

      // Validação: Quantidade
      if (!quantidadeRadio) {
        alert('Por favor, selecione a quantidade que pretende pedir (mínimo 100 unidades).');
        return;
      }

      // Validação: Logo
      if (!possuiLogoRadio) {
        alert('Por favor, indique se você já possui logomarca.');
        return;
      }

      // Validação: CEP
      if (!cep || cep.replace(/\D/g, '').length < 8) {
        alert('Por favor, informe o CEP para entrega (8 dígitos no formato 00000-000).');
        form.cep.focus();
        return;
      }

      // Validação: Consentimento LGPD
      if (!consentimento) {
        alert('Por favor, marque a caixa de concordância para envio dos dados conforme a Política de Privacidade.');
        form.consentimento.focus();
        return;
      }

      // Desabilita botão durante envio
      const submitBtn = document.getElementById('btn-submit-orcamento');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'REGISTRANDO SOLICITAÇÃO...';
      }

      // Monta objeto do lead completo
      const lead = {
        id: 'lead_' + Date.now(),
        data_hora: new Date().toISOString(),
        nome: nome,
        whatsapp: whatsapp,
        whatsapp_numeros: phoneValidation.digits,
        produto: produto,
        embalagem: embalagemRadio.value,
        embalagem_outro_detalhe: form.embalagem_outro_detalhe ? form.embalagem_outro_detalhe.value.trim() : '',
        sabe_tamanho: sabeTamanhoRadio.value,
        largura_cm: form.largura_cm ? form.largura_cm.value.trim() : '',
        altura_cm: form.altura_cm ? form.altura_cm.value.trim() : '',
        quantidade: quantidadeRadio.value,
        possui_logo: possuiLogoRadio.value,
        cep: cep,
        observacao: form.observacao ? form.observacao.value.trim() : '',
        atribuicao: {
          utm_source: form.utm_source ? form.utm_source.value : '',
          utm_medium: form.utm_medium ? form.utm_medium.value : '',
          utm_campaign: form.utm_campaign ? form.utm_campaign.value : '',
          utm_content: form.utm_content ? form.utm_content.value : '',
          src: form.src ? form.src.value : '',
          video: form.video ? form.video.value : ''
        }
      };

      // 1. Salva o lead localmente e dispara webhook
      saveLeadToStorage(lead);

      // 2. Dispara evento de submit
      trackEvent('form_submit', {
        produto: lead.produto,
        embalagem: lead.embalagem,
        quantidade: lead.quantidade,
        possui_logo: lead.possui_logo,
        src: lead.atribuicao.src
      });

      // 3. Monta mensagem e URL oficial do WhatsApp
      const waResult = buildWhatsAppUrl(lead);

      // 4. Apresenta modal de confirmação e redireciona
      showSuccessModal(lead, waResult);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          ENVIAR E CONTINUAR NO WHATSAPP
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    });
  }

  /* ========================================================================
     12. INTEGRAÇÃO TALLY (SE CONFIGURADO)
     ======================================================================== */
  function checkTallyIntegration() {
    const tallyUrl = config.TALLY_FORM_URL;
    const isConfigured = tallyUrl && !tallyUrl.includes('[') && tallyUrl.trim().length > 0;

    if (isConfigured) {
      const tallyWrapper = document.getElementById('tally-wrapper');
      const nativeForm = document.getElementById('orcamento-form');

      if (tallyWrapper && nativeForm) {
        nativeForm.style.display = 'none';
        tallyWrapper.style.display = 'block';

        const params = new URLSearchParams(window.location.search).toString();
        const finalUrl = params ? `${tallyUrl}?${params}` : tallyUrl;

        tallyWrapper.innerHTML = `
          <iframe 
            src="${finalUrl}" 
            width="100%" 
            height="650" 
            frameborder="0" 
            marginheight="0" 
            marginwidth="0" 
            title="Solicitação de Orçamento - Depois do Balcão"
            style="border: none; border-radius: 12px;">
          </iframe>
        `;
      }
    }
  }

  /* ========================================================================
     13. PROVA SOCIAL CONDICIONAL
     ======================================================================== */
  function renderTestimonialsIfPresent() {
    const section = document.getElementById('secao-prova-social');
    const container = document.getElementById('depoimentos-container');

    if (!section || !container) return;

    const testimonials = config.TESTIMONIALS || [];
    if (Array.isArray(testimonials) && testimonials.length > 0) {
      section.style.display = 'block';
      container.innerHTML = testimonials.map(item => `
        <div class="testimonial-card" style="background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:1.75rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <p style="font-size:0.9375rem; color:#334155; line-height:1.6; margin-bottom:1rem; font-style:italic;">"${item.depoimento}"</p>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            ${item.foto ? `<img src="${item.foto}" alt="${item.nome}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;">` : ''}
            <div>
              <strong style="display:block; font-size:0.875rem; color:#0F172A;">${item.nome}</strong>
              <span style="font-size:0.75rem; color:#64748B;">${item.negocio || ''}</span>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      section.style.display = 'none';
    }
  }

  /* ========================================================================
     14. INJEÇÃO DE DADOS INSTITUCIONAIS
     ======================================================================== */
  function injectFooterData() {
    if (config.PRIVACY_POLICY_URL) {
      const policyLinks = [
        document.getElementById('link-politica-form'),
        document.getElementById('link-footer-politica')
      ];
      policyLinks.forEach(link => {
        if (link) link.setAttribute('href', config.PRIVACY_POLICY_URL);
      });
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ========================================================================
     15. ANIMAÇÕES LEVES DE ROLAGEM (INTERSECTION OBSERVER)
     ======================================================================== */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-trigger');
    if (!animatedElements.length) return;

    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(el => el.classList.add('is-animated'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-animated');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  /* ========================================================================
     INICIALIZAÇÃO NO CARREGAMENTO DO DOM
     ======================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    fillAttributionFields();
    initSmoothScroll();
    initStickyMobileCta();
    initFaqAccordion();
    initInputMasks();
    initConditionalForm();
    initFormSubmission();
    checkTallyIntegration();
    renderTestimonialsIfPresent();
    injectFooterData();
    initScrollAnimations();
  });

})();
