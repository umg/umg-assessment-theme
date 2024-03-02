import './styles.css';

console.log('hello from UMG!');

declare global {
  interface Window {
    theme: {
      routes: {
        cart_add_url: string;
        cart_update_url: string;
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
    this.inputQuantity();
  }
  init() {
    this.OnSubmitForm();
  }

  inputQuantity() {
    const input = document.querySelector('#product-page #quantity-input') as HTMLInputElement;
    const changeEvent = new Event('change', { bubbles: true });
    const btns: NodeListOf<HTMLButtonElement> = document.querySelectorAll('#product-page .quantity__button');
    btns.forEach((button: HTMLButtonElement) =>
      button.addEventListener('click', function(event) {
        event.preventDefault();
        
        const previousValue = input.value;
        const target = event.currentTarget as HTMLInputElement;
        target.name === 'plus' ? input.stepUp() : input.stepDown();
        console.log(previousValue !== input.value, input.value)
        if (previousValue !== input.value) {
          input.dispatchEvent(changeEvent);  
          input.setAttribute('value', input.value);  
        }
      })
    );
  }

  OnSubmitForm() {
    const instance = this;
    const form = document.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', function(evt) {
      evt.preventDefault();
      const submitButton : HTMLInputElement | null = form.querySelector('[type="submit"]');
      if(!submitButton) return;

      if (submitButton.disabled) return;

      submitButton.disabled = true;
      submitButton.classList.add('opacity-50');
      const loadingElement = submitButton.querySelector('.loading') as HTMLElement;
      loadingElement?.classList.remove('hidden');

      const formData = new FormData(form);
      const quantityInput = document.getElementById('quantity-input') as HTMLInputElement;
      if(quantityInput) {
        formData.append('quantity', quantityInput.value);
      }
      const variantsSelectors : NodeListOf<HTMLInputElement> = document.querySelectorAll('.variants-picker input[type="radio"]:checked') ;
      if(variantsSelectors.length > 0) {
        variantsSelectors.forEach((variant) => {
          formData.append(variant.name, variant.value); 
        });
      }
      const config = {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: `application/json` },
        body: formData
      }

      fetch(`${window.theme.routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then(response => {
        const drawer = new CartDrawer();
        drawer.onCartChanged();
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50');
        if(loadingElement)
        loadingElement.classList.add('hidden');
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      }).finally(() => {
        submitButton.classList.remove('opacity-50');
        loadingElement?.classList.add('hidden');
      });
    });

  }

  renderSection(content: string, sectionId: string, loading: HTMLElement) {
    const html = new DOMParser().parseFromString(content, 'text/html');
    const mainContent = document.getElementById(sectionId);
    const newContent = html.getElementById(sectionId);
    if (!mainContent || !newContent) return;
    mainContent.innerHTML = newContent.innerHTML;
    loading?.classList.add('hidden');
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

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(``);
  }

  renderProductInfo(handle : string) {
      fetch(`${handle}?variant=${this.currentVariant.id}`)
        .then((response) => response.text())
        .then((responseText) => {
          const id = `product-page`;
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
    this.cartQuantity();
  }

  init() {
    this.setHeaderCart();
    this.removeCartItems();
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
    closeCartBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      this.closeCart();
    });
    document.addEventListener('click', (event) => {
      const cartDrawer: HTMLElement | null = document.querySelector('#cart-drawer');
      if(!cartDrawer?.getAttribute('class')?.includes('hidden'))
      {
        const container = cartDrawer?.querySelector('.cart-container')
        const outsideClick = container?.contains(event.target);
        // If the click is outside the cart drawer and not on the close button, close the cart drawer.
        if (!outsideClick) {
          this.closeCart();
        }
      }
      
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

  renderSection(content: string, sectionId: string, loading: HTMLElement) {
    const html = new DOMParser().parseFromString(content, 'text/html');
    const mainContent = document.getElementById(sectionId);
    const newContent = html.getElementById(sectionId);
    if (!mainContent || !newContent) return;
    mainContent.innerHTML = newContent.innerHTML;
    loading?.classList.add('hidden');
  }

  onCartChanged() {
    this.openCart();
    const cart = document.getElementById('cart-drawer');
    const loading = cart?.querySelector('.loading') as HTMLElement;
    loading?.classList.remove('hidden');
    fetch(`${window.theme.routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          this.renderSection(responseText, 'cart-drawer', loading);
          this.init();
          this.cartQuantity();
        })
        .catch((e) => {
          console.error(e);
        });

    const cartCount = document.getElementById('cart-drawer-count');
    if (cartCount){
      
    }
  }

  cartQuantity() {
    const instance = this;
    const cartDrawer = document.getElementById('cart-drawer');
    const changeEvent = new Event('change', { bubbles: true });
    const btns = cartDrawer?.querySelectorAll('.quantity__button');
    btns?.forEach((button) =>
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const target: HTMLInputElement = event.currentTarget as HTMLInputElement;
        const elementId = target.dataset.id;
        const input = cartDrawer?.querySelector(`#${elementId}`) as HTMLInputElement;
        const previousValue = input.value;
        target.name === 'plus' ? input.stepUp() : input.stepDown();
        if (previousValue !== input.value) {
          input.dispatchEvent(changeEvent);  
          input.setAttribute('value', input.value);
          const key = input.dataset.key  as string;
          const value = input.value as string;
          instance.updateCartQuantity(key, value);
        }
      })
    );
  }

  updateCartQuantity(key: string, value: string) {
    const updates = {
      [key]: value
    };
    const config = {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', Accept: `application/json`},
      body: JSON.stringify({ updates })
    }
    const cart = document.getElementById('cart-drawer');
    const loading = cart?.querySelector('.loading') as HTMLElement;
    loading?.classList.remove('hidden');

    fetch(`${window.theme.routes.cart_update_url}`, config)
    .then((response) => response.json())
    .then(response => {
      this.onCartChanged();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    }).finally(() => {
     console.log('done')
    });

  }
  

  removeCartItems() {
    const instance = this;
    const removeButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.remove-cart-item');
    removeButtons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', function(evt) {
        evt.preventDefault();
        const cart = document.getElementById('cart-drawer');
        const loading = cart?.querySelector('.loading') as HTMLElement;
        loading?.classList.remove('hidden');
        const url = button.dataset?.url;
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

}

new ProductInfo();
new VariantSelector();
new CartDrawer();
