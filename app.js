/* ==========================================================================
   FORNECEDORES TOP BRÁS — SCRIPT DA PÁGINA DE VENDAS (MOBILE FIRST)
   Funcionalidades: FAQ Accordion, Sticky CTA Bar, Checkout & Toasts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. FAQ ACCORDION (INTERATIVO & ACESSÍVEL)
  // ------------------------------------------------------------------------
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const trigger = card.querySelector('.faq-trigger');
    const content = card.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');

        // Fecha os outros para leitura compacta
        faqCards.forEach(other => {
          if (other !== card && other.classList.contains('open')) {
            other.classList.remove('open');
            const otherContent = other.querySelector('.faq-content');
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });

        if (isOpen) {
          card.classList.remove('open');
          content.style.maxHeight = null;
        } else {
          card.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });

  // ------------------------------------------------------------------------
  // 2. STICKY CTA BAR (SURGE APÓS A PRIMEIRA DOBRA NO MOBILE)
  // ------------------------------------------------------------------------
  const stickyCtaBar = document.getElementById('stickyCtaBar');
  const heroSection = document.querySelector('.hero');
  const offerSection = document.getElementById('oferta');

  function handleScroll() {
    if (!stickyCtaBar) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = heroSection ? heroSection.offsetHeight : 450;
    
    let isPastHero = scrollY > (heroHeight * 0.65);
    let isInOffer = false;

    if (offerSection) {
      const rect = offerSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        isInOffer = true;
      }
    }

    if (isPastHero && !isInOffer) {
      stickyCtaBar.classList.add('visible');
    } else {
      stickyCtaBar.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ------------------------------------------------------------------------
  // 3. CHECKOUT CTAs (LINK DIRETO CAKTO — SEM DUPLICAR INITIATECHECKOUT)
  // O evento InitiateCheckout é disparado nativamente pela própria Cakto.
  // ------------------------------------------------------------------------
  const CAKTO_CHECKOUT_URL = 'https://pay.cakto.com.br/dega2d9_1273419';
  const checkoutButtons = document.querySelectorAll('.btn-checkout');

  checkoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');

      // Se for link de âncora interna (ex: #oferta), deixa rolar suavemente
      if (href && href.startsWith('#')) {
        return;
      }

      // Se for button sem href nativo, redireciona para a Cakto
      if (btn.tagName === 'BUTTON') {
        e.preventDefault();
        window.location.href = CAKTO_CHECKOUT_URL;
      }
    });
  });

  // ------------------------------------------------------------------------
  // 4. LINK CARD: GUIA DO BRÁS
  // ------------------------------------------------------------------------
  const cardGuia = document.getElementById('catCardGuia');
  if (cardGuia) {
    cardGuia.addEventListener('click', (e) => {
      e.preventDefault();

      // Dispara evento ViewContent para navegação de interesse no Guia
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_name: 'Guia do Brás',
          content_category: 'Roteiro e Polos'
        });
      }

      const guiaSection = document.getElementById('guia-do-bras');
      if (guiaSection) {
        guiaSection.scrollIntoView({ behavior: 'smooth' });
        guiaSection.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        guiaSection.style.boxShadow = '0 0 30px rgba(244, 185, 66, 0.4)';
        guiaSection.style.borderColor = 'rgba(244, 185, 66, 0.8)';
        setTimeout(() => {
          guiaSection.style.boxShadow = '';
          guiaSection.style.borderColor = '';
        }, 2000);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 5. TOAST NOTIFICATION
  // ------------------------------------------------------------------------
  let toastTimeout = null;
  window.showToast = function(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };
});
