import './styles.css';

console.log('hello from UMG!');

class CartDrawer {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    this.toggleVariants();
    this.setHeaderCart();
  }

  toggleVariants() {
    const variantRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('.variants-picker input[type="radio"]');
    const onVariantChange = (event: Event) => {
      const target: HTMLInputElement = event.target as HTMLInputElement;
      const variantId = target.dataset.variantId;
      const handle = target.dataset.productHandle;
      if (variantId) {
        const newUrl: string = `${window.theme.routes.root_url}products/${handle}?variant=${variantId}`;
        window.history.replaceState({}, '', newUrl);
        this.renderSection(newUrl, 'main-product');
      }
    };

    variantRadios.forEach((radio: HTMLInputElement) => {
      radio.addEventListener('change', onVariantChange);
    });
  }

  setHeaderCart() {
    const cartLink: HTMLElement | null = document.querySelector('#cart-drawer-btn');
    if (!cartLink) return;
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.openCart();
    });

    const closeCartBtn: HTMLElement | null = document.querySelector('#cart-drawer .close-btn');
    if (!closeCartBtn) return;
    closeCartBtn.addEventListener('click', (event) => {
      event.preventDefault();
      this.closeCart();
    });
  }

  openCart() {
    const cartDrawer: HTMLElement | null = document.querySelector('#cart-drawer');
    const container: HTMLElement | null = document.querySelector('#cart-drawer .cart-container');
    if (!cartDrawer || !container) return;
    cartDrawer.classList.toggle('hidden');
    cartDrawer.classList.replace('opacity-0', 'opacity-100');
    container.classList.remove('translate-x-full');
    container.classList.add('translate-x-0');
  }

  closeCart() {
    const cartDrawer: HTMLElement | null = document.querySelector('#cart-drawer');
    const container: HTMLElement | null = document.querySelector('#cart-drawer .cart-container');
    if (!cartDrawer || !container) return;
    cartDrawer.classList.replace('opacity-100', 'opacity-0');
    container.classList.remove('translate-x-0');
    container.classList.add('translate-x-full');

    setTimeout(() => {
      cartDrawer.classList.add('hidden');
    }, 500);
  }

  renderSection(url: string, sectionId: string) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(responseText => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const mainContent = document.getElementById(sectionId);
        const newContent = html.getElementById(sectionId);
        if (!mainContent || !newContent) return;
        mainContent.innerHTML = newContent.innerHTML;
        this.toggleVariants();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }
}

new CartDrawer();
