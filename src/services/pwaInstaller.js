// EchoSpeak PWA & Smartphone App Installer Service
// Handles beforeinstallprompt, QR code generation, and mobile installation guides

export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.localIP = '192.168.0.84';
    this.port = window.location.port || '5174';
    this.phoneUrl = `http://${this.localIP}:${this.port}/`;
    this.httpsUrl = 'https://samehedward.github.io/English_Teacher/';
    this.tunnelPassword = '';
    this.activeUrlMode = 'https'; // 'https' or 'local'

    this.init();
  }

  init() {
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        }).catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
      });
    }

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] EchoSpeak installed to home screen successfully!');
      this.deferredPrompt = null;
      this.hideInstallBanner();
    });

    this.bindModalEvents();
  }

  showInstallBanner() {
    const installBtn = document.getElementById('headerInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  }

  hideInstallBanner() {
    const installBtn = document.getElementById('headerInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  triggerNativeInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
        }
        this.deferredPrompt = null;
      });
    } else {
      this.openMobileModal();
    }
  }

  openMobileModal() {
    const modal = document.getElementById('mobileAppModal');
    if (!modal) return;

    this.updateModalDisplay();
    modal.classList.add('open');
  }

  updateModalDisplay() {
    const qrImg = document.getElementById('mobileQrCodeImg');
    const urlDisplay = document.getElementById('mobileAppUrlDisplay');
    const tunnelPwdBadge = document.getElementById('mobileTunnelPwdBadge');

    const targetUrl = this.activeUrlMode === 'https' 
      ? this.httpsUrl 
      : `http://${this.localIP}:${window.location.port || '5174'}/`;

    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&bgcolor=0f172a&color=ffffff&margin=8`;
    }
    if (urlDisplay) {
      urlDisplay.textContent = targetUrl;
    }
    if (tunnelPwdBadge) {
      tunnelPwdBadge.style.display = (this.activeUrlMode === 'https' && this.tunnelPassword) ? 'block' : 'none';
    }
  }

  bindModalEvents() {
    // Header trigger button
    const openBtn = document.getElementById('headerInstallBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.triggerNativeInstall();
        } else {
          this.openMobileModal();
        }
      });
    }

    // Modal close buttons
    const modal = document.getElementById('mobileAppModal');
    const closeBtn = document.getElementById('closeMobileModalBtn');
    const copyBtn = document.getElementById('copyPhoneUrlBtn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    // Copy URL to clipboard
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const urlDisplay = document.getElementById('mobileAppUrlDisplay');
        const textToCopy = urlDisplay ? urlDisplay.textContent.trim() : this.httpsUrl;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = '✓';
            setTimeout(() => { copyBtn.textContent = 'Kopieren'; }, 1500);
          }).catch(() => {
            this._fallbackCopy(textToCopy, copyBtn);
          });
        } else {
          this._fallbackCopy(textToCopy, copyBtn);
        }
      });
    }

    // Connection Mode Toggles
    const btnHttps = document.getElementById('btnSelectHttps');
    const btnLocal = document.getElementById('btnSelectLocal');

    if (btnHttps) {
      btnHttps.addEventListener('click', () => {
        this.activeUrlMode = 'https';
        btnHttps.classList.add('active');
        if (btnLocal) btnLocal.classList.remove('active');
        this.updateModalDisplay();
      });
    }

    if (btnLocal) {
      btnLocal.addEventListener('click', () => {
        this.activeUrlMode = 'local';
        btnLocal.classList.add('active');
        if (btnHttps) btnHttps.classList.remove('active');
        this.updateModalDisplay();
      });
    }
  }

  _fallbackCopy(text, btn) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (btn) {
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = 'Kopieren'; }, 1500);
      }
    } catch (e) {
      console.warn('Fallback copy failed:', e);
    }
  }
}

export const pwaInstaller = new PWAInstaller();
