import './styles.css';

console.log('hello from UMG!');

declare global {
  interface Window {
    theme: {
      routes: {
        cart_add_url: string;
        cart_url: string;
        root_url: string;
      };
    };
  }
}
class ProductInfo {
  constructor() {
    this.init();
  }
  init() {
    this.toggleVariants();
    this.OnSubmitForm();
  }
  

  toggleVariants() {
    const variantRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('.variants-picker input[type="radio"]');
    const onVariantChange = (event: Event) => {
      const target: HTMLInputElement = event.target as HTMLInputElement;
      const variantId = target.dataset.variantId;
      const handle = target.dataset.productHandle;
      if (variantId) {
        const url: string = `${window.theme.routes.root_url}products/${handle}?variant=${variantId}`;
        window.history.replaceState({}, '', url);
        fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
      .then(responseText => {
        this.renderSection(responseText, 'main-product');
        this.init();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
       
      }
    };

    variantRadios.forEach((radio: HTMLInputElement) => {
      radio.addEventListener('change', onVariantChange);
    });
  }

  OnSubmitForm() {
    const instance = this;
    const form: HTMLFormElement  | null = document.querySelector('#product_form');
    if (!form) return;
    form.addEventListener('submit', function(evt) {
      evt.preventDefault();
      const submitButton : HTMLInputElement | null = form.querySelector('[type="submit"]');
      if(!submitButton) return;

      if (submitButton.getAttribute('aria-disabled') === 'true') return;

      submitButton.setAttribute('aria-disabled', 'true');
      submitButton.classList.add('loading');

      const formData = new FormData(form);
      const config = {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: `application/json` },
        body: formData
      }

      fetch(`${window.theme.routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then(response => {
        instance.onCartChanged();
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      }).finally(() => {
        submitButton.setAttribute('aria-disabled', 'false');
        submitButton.classList.remove('loading');
      });
    });

  }

  onCartChanged() {
    fetch(`${window.theme.routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          this.renderSection(responseText, 'cart-drawer');
          this.init();
          const drawer = new CartDrawer();
          drawer.init();
          drawer.openCart();
        })
        .catch((e) => {
          console.error(e);
        });
  }


  renderSection(content: string, sectionId: string) {
    const html = new DOMParser().parseFromString(content, 'text/html');
    const mainContent = document.getElementById(sectionId);
    const newContent = html.getElementById(sectionId);
    console.log(mainContent)
    console.log(newContent)
    if (!mainContent || !newContent) return;
    mainContent.innerHTML = newContent.innerHTML;
  }

}

class CartDrawer {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    this.setHeaderCart();
  }
  
  setHeaderCart() {
    const cartLink: HTMLElement | null = document.querySelector('#cart-drawer-btn');
    if (!cartLink) return;
    cartLink.addEventListener('click', (event) => {
      // Check if cart-drawer exists in DOM
      const cartDrawer: HTMLElement | null = document.querySelector('#cart-drawer');
      if (!cartDrawer) return;
      // If cart-drawer exists, open it
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
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

}

new ProductInfo();
new CartDrawer();
