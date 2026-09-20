// EchoSpeak PWA & Smartphone App Installer Service
// Handles beforeinstallprompt, QR code generation, and mobile installation guides

export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.localIP = '192.168.0.84';
    this.port = window.location.port || '5174';
    this.phoneUrl = `http://${this.localIP}:${this.port}/`;

    this.init();
  }

  init() {
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
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

    // Use current origin if not localhost, otherwise use Wi-Fi IP
    let targetUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `http://${this.localIP}:${window.location.port || '5174'}/`
      : window.location.href;

    const qrImg = document.getElementById('mobileQrCodeImg');
    const urlDisplay = document.getElementById('mobileAppUrlDisplay');

    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}&bgcolor=0f172a&color=ffffff&margin=8`;
    }
    if (urlDisplay) {
      urlDisplay.textContent = targetUrl;
    }

    modal.classList.add('open');
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

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const urlDisplay = document.getElementById('mobileAppUrlDisplay');
        if (urlDisplay) {
          navigator.clipboard.writeText(urlDisplay.textContent);
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Kopiert!';
          setTimeout(() => {
            copyBtn.innerHTML = original;
          }, 2000);
        }
      });
    }
  }
}

export const pwaInstaller = new PWAInstaller();
