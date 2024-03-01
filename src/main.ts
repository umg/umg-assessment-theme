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
    product: {
      variants: JSON;
    }
  }
}
class ProductInfo {
  constructor() {
    this.init();
  }
  init() {
    this.inputQuantity();
    this.removeCartItems();
    this.OnSubmitForm();
  }

  inputQuantity() {
    const input = document.querySelector('#quantity-input') as HTMLInputElement;
    const changeEvent = new Event('change', { bubbles: true });
    const btns : NodeListOf<HTMLButtonElement> =  document.querySelectorAll('.quantity__button')
    btns.forEach((button: HTMLButtonElement) =>
      button.addEventListener('click', function(event) {
        event.preventDefault();
        
        const previousValue = input.value;
        const target = event.target as HTMLInputElement;
        target.name === 'plus' ? input.stepUp() : input.stepDown();
        if (previousValue !== input.value) input.dispatchEvent(changeEvent);
      })
    );
  }

  removeCartItems() {
    const instance = this;
    const removeButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.remove-cart-item');
    removeButtons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', function(evt) {
        evt.preventDefault();
        const url = button.dataset.url;
        if (!url) return;
        fetch(url)
        .then((response) => response.text())
        .then(response => {
          instance.onCartChanged();
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
      });
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

class VariantSelector {
  options: Array<any> = [];
  variantData: any = null;
  currentVariant: any = null;
  constructor() {
    this.init();
  }
 
  init() {
    this.onVariantChange()
  }

  onVariantChange() {
    const instance = this;
    const variantRadios: NodeListOf<HTMLInputElement> = document.querySelectorAll('.variants-picker input[type="radio"]');
    variantRadios.forEach((radio: HTMLInputElement) => {
      radio.addEventListener('change', (event: Event) => {
        instance.getSelectedOptions();
        instance.getSelectedVariant();
        if (instance.currentVariant) {
          const target: HTMLInputElement = event.target as HTMLInputElement;
          const handle = target.dataset.productUrl;
          if (!handle) return;
          instance.updateURL(handle);
          instance.renderProductInfo(handle);
        }
      });
    });

    
  }
  getSelectedOptions() {
    this.options = Array.from(document.querySelectorAll('input[type="radio"]:checked'), (select) => (select as HTMLInputElement).value);
  }

  getVariantJSON() {
    this.variantData = this.variantData || window.product.variants;
    return this.variantData;
  }

  getSelectedVariant() {
    this.currentVariant = this.getVariantJSON().find((variant: any) => {
      const findings = !variant.options
        .map((option: any, index: number) => {
          return this.options[index] === option;
        })
        .includes(false);

      if (findings) return variant;
    });
  }

  updateURL(handle : string) {
    if (!this.currentVariant) return;
    window.history.replaceState({}, '', `${handle}?variant=${this.currentVariant.id}`);
  }

  renderProductInfo(handle : string) {
      fetch(`${handle}?variant=${this.currentVariant.id}`)
        .then((response) => response.text())
        .then((responseText) => {
          const id = `main-product`;
          const html = new DOMParser().parseFromString(responseText, 'text/html');

          const oldContent = document.getElementById(id);
          const newContent = html.getElementById(id);

          if (oldContent && newContent) oldContent.innerHTML = newContent.innerHTML;
          const product = new ProductInfo();
          product.init();
          this.init();
        });
  }
};

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
      cartDrawer.classList.replace('opacity-0', 'opacity-100');
      container.classList.remove('translate-x-full');
      container.classList.add('translate-x-0');

      setTimeout(() => {
        cartDrawer.classList.remove('hidden');
      }, 500);
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
new VariantSelector();
new CartDrawer();
