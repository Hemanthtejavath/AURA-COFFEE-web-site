/*
  AURA COFFEE ROASTERS - JavaScript

  Think of this file as the "behavior" layer of the website.
  HTML gives the page structure, CSS makes it look good, and this file makes
  things interactive: menu, tabs, cart, checkout popup, animations, and 3D cup.
*/

document.addEventListener("DOMContentLoaded", () => {

  function getElement(id) {
    return document.getElementById(id);
  }

  function formatMoney(amount) {
    return `$${amount.toFixed(2)}`;
  }

  // ------------------------------------------------------------
  // 1. Sticky header and active navigation links
  // ------------------------------------------------------------

  const siteHeader = getElement("siteHeader");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateHeaderOnScroll() {
    if (!siteHeader) return;
    siteHeader.classList.toggle("scrolled", window.scrollY > 20);
  }

  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        navLinks.forEach((link) => {
          const pointsToCurrentSection = link.getAttribute("href") === `#${sectionId}`;
          link.classList.toggle("active", pointsToCurrentSection);
        });
      }
    });
  }

  window.addEventListener("scroll", () => {
    updateHeaderOnScroll();
    updateActiveNavLink();
  });

  updateHeaderOnScroll();
  updateActiveNavLink();

  // ------------------------------------------------------------
  // 2. Mobile navigation menu
  // ------------------------------------------------------------

  const mobileToggle = getElement("mobileToggle");
  const navMenu = getElement("navMenu");

  function closeMobileMenu() {
    mobileToggle?.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("open");
  }

  mobileToggle?.addEventListener("click", () => {
    const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu?.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // ------------------------------------------------------------
  // 3. Brew guide tabs
  // ------------------------------------------------------------

  const brewTabs = document.querySelectorAll(".brew-tab");
  const brewPanels = document.querySelectorAll(".brew-content");

  function showBrewPanel(panelId) {
    brewTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.target === panelId);
    });

    brewPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === panelId);
    });
  }

  brewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showBrewPanel(tab.dataset.target);
    });
  });

  // ------------------------------------------------------------
  // 4. Shopping cart
  // ------------------------------------------------------------

  const CART_STORAGE_KEY = "aura_cart_items";

  const CATALOG = {
    "Solstice Bloom": {
      name: "Solstice Bloom",
      origin: "Ethiopia | Yirgacheffe",
      price: 19.5,
      image: "assets/product-light.png",
    },
    "Amber Hearth": {
      name: "Amber Hearth",
      origin: "Colombia | Huila",
      price: 18.5,
      image: "assets/product-medium.png",
    },
    "Eclipse Roast": {
      name: "Eclipse Roast",
      origin: "Indonesia | Sumatra",
      price: 20,
      image: "assets/product-dark.png",
    },
  };

  let cartItems = loadCart();

  const cartTrigger = getElement("cartTrigger");
  const cartBadge = getElement("cartBadge");
  const cartDrawer = getElement("cartDrawer");
  const cartOverlay = getElement("cartOverlay");
  const cartCloseBtn = getElement("cartCloseBtn");
  const cartItemsContainer = getElement("cartItemsContainer");
  const cartSubtotal = getElement("cartSubtotal");
  const checkoutBtn = getElement("checkoutBtn");

  function loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart);
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }

  function getCartCount() {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  function getCartSubtotal() {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function findCartItem(productName) {
    return cartItems.find((item) => item.name === productName);
  }

  function openCart() {
    cartDrawer?.classList.add("active");
    cartDrawer?.setAttribute("aria-hidden", "false");
    cartOverlay?.classList.add("active");
  }

  function closeCart() {
    cartDrawer?.classList.remove("active");
    cartDrawer?.setAttribute("aria-hidden", "true");
    cartOverlay?.classList.remove("active");
  }

  function createEmptyCartHTML() {
    return `
      <div class="cart-empty-state">
        <svg class="empty-cart-icon" width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p>Your cart is empty</p>
        <a href="#products" class="btn btn-primary btn-sm close-cart-link">Shop Our Roasts</a>
      </div>
    `;
  }

  function createCartItemHTML(item) {
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">

        <div class="cart-item-details">
          <span class="cart-item-origin">${item.origin}</span>
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">${formatMoney(item.price * item.quantity)}</div>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-controls">
            <button class="qty-btn qty-minus" data-product="${item.name}" aria-label="Decrease quantity">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-product="${item.name}" aria-label="Increase quantity">+</button>
          </div>

          <button class="remove-item-btn" data-product="${item.name}" aria-label="Remove ${item.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  function renderCart() {
    const totalItems = getCartCount();

    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? "flex" : "none";
    }

    if (cartSubtotal) {
      cartSubtotal.textContent = formatMoney(getCartSubtotal());
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = cartItems.length === 0;
    }

    if (!cartItemsContainer) return;

    if (cartItems.length === 0) {
      cartItemsContainer.innerHTML = createEmptyCartHTML();
      return;
    }

    cartItemsContainer.innerHTML = cartItems.map(createCartItemHTML).join("");
  }

  function addToCart(productName) {
    const product = CATALOG[productName];
    if (!product) return;

    const existingItem = findCartItem(productName);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    openCart();
  }

  function changeQuantity(productName, changeAmount) {
    const item = findCartItem(productName);
    if (!item) return;

    item.quantity += changeAmount;

    if (item.quantity <= 0) {
      removeFromCart(productName);
      return;
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(productName) {
    cartItems = cartItems.filter((item) => item.name !== productName);
    saveCart();
    renderCart();
  }

  cartTrigger?.addEventListener("click", openCart);
  cartCloseBtn?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.product;
      addToCart(productName);
      showAddedToast(productName);
    });
  });

  cartItemsContainer?.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (event.target.classList.contains("close-cart-link")) {
      closeCart();
      return;
    }

    if (!button) return;

    const productName = button.dataset.product;
    if (!productName) return;

    if (button.classList.contains("qty-plus")) {
      changeQuantity(productName, 1);
    }

    if (button.classList.contains("qty-minus")) {
      changeQuantity(productName, -1);
    }

    if (button.classList.contains("remove-item-btn")) {
      removeFromCart(productName);
    }
  });

  renderCart();

  // ------------------------------------------------------------
  // 5. Checkout success modal and sparkle effect
  // ------------------------------------------------------------

  const successModal = getElement("successModal");
  const successOverlay = getElement("successModalOverlay");
  const successOrderNumber = getElement("successOrderNumber");
  const successModalCloseBtn = getElement("successModalCloseBtn");

  function openSuccessModal() {
    successModal?.classList.add("active");
    successOverlay?.classList.add("active");
  }

  function closeSuccessModal() {
    successModal?.classList.remove("active");
    successOverlay?.classList.remove("active");
  }

  function triggerCheckoutSparkles() {
    const colors = ["#C28C48", "#4E6B56", "#FAF8F5", "#C28C48"];

    for (let i = 0; i < 50; i += 1) {
      const sparkle = document.createElement("div");
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 200;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      sparkle.className = "success-sparkle";
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.left = "50%";
      sparkle.style.top = "50%";
      sparkle.style.setProperty("--tx", `${x}px`);
      sparkle.style.setProperty("--ty", `${y}px`);

      document.body.appendChild(sparkle);
      sparkle.addEventListener("animationend", () => sparkle.remove());
    }
  }

  function checkout() {
    if (cartItems.length === 0) return;

    closeCart();

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    if (successOrderNumber) {
      successOrderNumber.textContent = `#AURA-${orderNumber}`;
    }

    openSuccessModal();
    triggerCheckoutSparkles();

    cartItems = [];
    saveCart();
    renderCart();
  }

  checkoutBtn?.addEventListener("click", checkout);
  successModalCloseBtn?.addEventListener("click", closeSuccessModal);
  successOverlay?.addEventListener("click", closeSuccessModal);

  // ------------------------------------------------------------
  // 6. Toast notification
  // ------------------------------------------------------------

  const toastContainer = getElement("toastContainer");

  function showAddedToast(productName) {
    if (!toastContainer || !productName) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        style="color: var(--accent-gold);">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span>Added <strong>${productName}</strong> to cart!</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 2800);
  }

  // ------------------------------------------------------------
  // 7. Newsletter form
  // ------------------------------------------------------------

  const newsletterForm = getElement("newsletterForm");
  const newsletterMsg = getElement("newsletterMsg");

  newsletterForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = newsletterForm.querySelector(".newsletter-input");
    const email = emailInput?.value.trim();

    if (!email || !newsletterMsg) return;

    newsletterForm.style.display = "none";
    newsletterMsg.style.display = "block";
    emailInput.value = "";
  });

  // ------------------------------------------------------------
  // 8. Reveal sections when they scroll into view
  // ------------------------------------------------------------

  const revealElements = document.querySelectorAll(".reveal-on-scroll");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  // ------------------------------------------------------------
  // 9. Three.js 3D coffee cup
  // ------------------------------------------------------------

  const canvasContainer = getElement("cup3dContainer");
  const loadingIndicator = getElement("canvasLoading");

  if (canvasContainer && typeof THREE !== "undefined") {
    let renderer;
    let scene;
    let camera;

    const cupGroup = new THREE.Group();
    const steamParticles = [];

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragRotation = { x: 0.25, y: 0 };
    let scrollRotation = { x: 0.25, y: 0 };
    let targetRotation = { x: 0.25, y: 0 };
    let currentRotation = { x: 0.25, y: 0 };

    function createLights() {
      const ambientLight = new THREE.AmbientLight(0xfff7e8, 0.65);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 8, 3);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 20;
      mainLight.shadow.bias = -0.001;
      scene.add(mainLight);

      const rimLight = new THREE.DirectionalLight(0xc28c48, 0.5);
      rimLight.position.set(-5, -3, -5);
      scene.add(rimLight);
    }

    function createCupModel() {
      const porcelainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xfaf8f5,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 0.8,
      });

      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xc28c48,
        roughness: 0.25,
        metalness: 0.85,
      });

      const coffeeMaterial = new THREE.MeshStandardMaterial({
        color: 0x241710,
        roughness: 0.1,
        metalness: 0.08,
      });

      const saucer = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 1.4, 0.12, 48),
        porcelainMaterial
      );
      saucer.position.y = -1.1;
      saucer.castShadow = true;
      saucer.receiveShadow = true;
      cupGroup.add(saucer);

      const saucerTrim = new THREE.Mesh(
        new THREE.TorusGeometry(2.09, 0.02, 8, 48),
        goldMaterial
      );
      saucerTrim.rotation.x = Math.PI / 2;
      saucerTrim.position.y = -1.04;
      cupGroup.add(saucerTrim);

      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 0.95, 1.6, 48, 1),
        porcelainMaterial
      );
      cupBody.position.y = -0.3;
      cupBody.castShadow = true;
      cupBody.receiveShadow = true;
      cupGroup.add(cupBody);

      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.29, 0.05, 32),
        coffeeMaterial
      );
      coffee.position.y = 0.44;
      cupGroup.add(coffee);

      const rimTrim = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.03, 8, 48),
        goldMaterial
      );
      rimTrim.rotation.x = Math.PI / 2;
      rimTrim.position.y = 0.5;
      cupGroup.add(rimTrim);

      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI * 1.3),
        porcelainMaterial
      );
      handle.position.set(1.2, -0.3, 0);
      handle.rotation.z = -Math.PI / 1.5;
      handle.castShadow = true;
      cupGroup.add(handle);

      createSteam();
      scene.add(cupGroup);
    }

    function createSteam() {
      const steamGroup = new THREE.Group();
      const steamGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const steamMaterial = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });

      steamGroup.position.set(0, 0.5, 0);

      for (let i = 0; i < 20; i += 1) {
        const particle = new THREE.Mesh(steamGeometry, steamMaterial.clone());
        resetSteamParticle(particle);
        particle.position.y = Math.random() * 1.5;
        particle.material.opacity = (1 - particle.position.y / 1.5) * 0.22;

        steamGroup.add(particle);
        steamParticles.push(particle);
      }

      cupGroup.add(steamGroup);
    }

    function resetSteamParticle(particle) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.95;
      const size = 0.5 + Math.random() * 1.2;

      particle.position.x = Math.cos(angle) * radius;
      particle.position.y = 0;
      particle.position.z = Math.sin(angle) * radius;
      particle.scale.set(size, size, size);
      particle.material.opacity = 0.22;

      particle.userData.speedY = 0.01 + Math.random() * 0.015;
      particle.userData.speedXZ = (Math.random() - 0.5) * 0.005;
      particle.userData.fadeSpeed = 0.0015 + Math.random() * 0.0025;
    }

    function animateSteam() {
      steamParticles.forEach((particle) => {
        particle.position.y += particle.userData.speedY;
        particle.position.x += particle.userData.speedXZ;
        particle.position.z += particle.userData.speedXZ;
        particle.material.opacity -= particle.userData.fadeSpeed;
        particle.scale.x += 0.006;
        particle.scale.y += 0.006;
        particle.scale.z += 0.006;

        if (particle.position.y > 1.6 || particle.material.opacity <= 0) {
          resetSteamParticle(particle);
        }
      });
    }

    function calculateScrollRotation() {
      const cupSection = getElement("cup-experience");
      if (!cupSection) return;

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const sectionTop = cupSection.getBoundingClientRect().top + scrollY;
      const sectionHeight = cupSection.offsetHeight;
      const start = sectionTop - viewportHeight;
      const end = sectionTop + sectionHeight;
      const progress = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));

      scrollRotation.y = progress * Math.PI * 2.8;
      scrollRotation.x = 0.22 + Math.sin(progress * Math.PI) * 0.16;
    }

    function resizeCanvas() {
      camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }

    function init3D() {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasContainer.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        40,
        canvasContainer.clientWidth / canvasContainer.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 7.5);
      scene.add(camera);

      createLights();
      createCupModel();
      calculateScrollRotation();

      setTimeout(() => {
        loadingIndicator?.classList.add("fade-out");
      }, 300);
    }

    function animate3D() {
      animateSteam();

      if (isDragging) {
        targetRotation = { ...dragRotation };
      } else {
        targetRotation = { ...scrollRotation };
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      cupGroup.rotation.x = currentRotation.x;
      cupGroup.rotation.y = currentRotation.y;

      renderer.render(scene, camera);
      requestAnimationFrame(animate3D);
    }

    canvasContainer.addEventListener("pointerdown", (event) => {
      isDragging = true;
      dragStart = { x: event.clientX, y: event.clientY };
      dragRotation = { ...currentRotation };
    });

    window.addEventListener("pointermove", (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      dragRotation.y = currentRotation.y + deltaX * 0.007;
      dragRotation.x = Math.max(
        -Math.PI / 4,
        Math.min(Math.PI / 3, currentRotation.x + deltaY * 0.007)
      );

      dragStart = { x: event.clientX, y: event.clientY };
    });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", calculateScrollRotation);

    init3D();
    animate3D();
  }
});
