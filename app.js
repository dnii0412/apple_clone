// Hamburger menu toggle
const hamburgerMenu = document.querySelector(".hamburger-menu");
const navMenu = document.querySelector(".nav-menu");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
    hamburgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
  }
});

// Close menu when clicking on a menu item
const menuItems = document.querySelectorAll(".nav-menu li");
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    hamburgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

function goToStore() {
  window.location.href = "store.html";
}

// TV Carousel Dot Navigation
const tvCarousel = document.querySelector(".tv-carousel");
const carouselDots = document.querySelectorAll(".carousel-dots .dot");

if (tvCarousel && carouselDots.length > 0) {
  // Update active dot based on scroll position
  function updateActiveDot() {
    const carouselFigures = tvCarousel.querySelectorAll("figure");
    if (carouselFigures.length === 0) return;

    const scrollLeft = tvCarousel.scrollLeft;
    const carouselWidth = tvCarousel.offsetWidth;
    const scrollPosition = scrollLeft + carouselWidth / 2;

    // Find which figure is currently in view
    let activeIndex = 0;
    let minDistance = Infinity;

    carouselFigures.forEach((figure, index) => {
      const figureLeft = figure.offsetLeft;
      const figureWidth = figure.offsetWidth;
      const figureCenter = figureLeft + figureWidth / 2;
      const distance = Math.abs(scrollPosition - figureCenter);

      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
    });

    // Update dots
    carouselDots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // Scroll to slide when dot is clicked
  carouselDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const carouselFigures = tvCarousel.querySelectorAll("figure");
      if (carouselFigures[index]) {
        const figureLeft = carouselFigures[index].offsetLeft;
        const carouselPadding = 12;
        tvCarousel.scrollTo({
          left: figureLeft - carouselPadding,
          behavior: "smooth",
        });
      }
    });
  });

  // Update dots on scroll
  tvCarousel.addEventListener("scroll", updateActiveDot);

  // Initial update
  updateActiveDot();
}

// Auto-scrolling Content Cards with Continuous Motion
function initAutoScrollingCards() {
  const contentCardsContainer = document.querySelector(
    ".content-cards-container"
  );
  const cardsWrapper = document.querySelector(".content-cards");

  if (!contentCardsContainer || !cardsWrapper) return;

  let currentIndex = 0;
  let isScrolling = false;
  let scrollInterval = null;
  let animationFrameId = null;
  let isPaused = false;
  let isHovered = false;
  const cardWidth = 420; // Match CSS width
  const cardGap = 12; // Match CSS gap
  const scrollSpeed = 1.2; // pixels per frame for smooth continuous scroll (increased for faster scrolling)
  const hoverScrollSpeed = 0.3; // Slower speed when hovered

  // Get all original cards (not duplicates)
  function getOriginalCards() {
    return Array.from(cardsWrapper.children).filter(
      (card) => !card.classList.contains("duplicate")
    );
  }

  // Initialize: duplicate cards for seamless infinite loop
  function duplicateCards() {
    const originalCards = getOriginalCards();
    if (originalCards.length === 0) return;

    // Clone all cards and append for seamless looping
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("duplicate");
      cardsWrapper.appendChild(clone);
    });
  }

  // Update active card highlight based on scroll position
  function updateActiveCard() {
    const containerRect = contentCardsContainer.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const allCards = cardsWrapper.querySelectorAll(".content-card");

    allCards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      const threshold = cardRect.width / 2 + 60; // Buffer for detection

      if (distance < threshold) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  }

  // Linear continuous auto-scroll function
  function linearAutoScroll() {
    // Always continue the animation loop, even when paused
    // This ensures smooth resumption when unpaused
    animationFrameId = requestAnimationFrame(linearAutoScroll);

    if (isPaused) {
      return; // Skip scrolling but keep loop running
    }

    const originalCards = getOriginalCards();
    const totalCards = originalCards.length;
    if (totalCards === 0) return;

    const scrollDistance = cardWidth + cardGap;
    const maxScroll = scrollDistance * totalCards;
    const currentScroll = contentCardsContainer.scrollLeft;

    // Determine scroll speed based on hover state
    const currentScrollSpeed = isHovered ? hoverScrollSpeed : scrollSpeed;

    // Seamless loop: reset to beginning when reaching end
    if (currentScroll >= maxScroll - 10) {
      contentCardsContainer.scrollLeft = 0;
      updateActiveCard();
    } else {
      // Continuous linear scroll (slower when hovered)
      contentCardsContainer.scrollLeft += currentScrollSpeed;
      updateActiveCard();
    }
  }

  // Start linear auto-scrolling
  function startAutoScroll() {
    // Only start if not already running
    if (!animationFrameId) {
      // Clear any intervals (legacy cleanup)
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      // Start continuous linear scroll loop
      animationFrameId = requestAnimationFrame(linearAutoScroll);
    }
  }

  // Slow down auto-scroll on hover (instead of stopping)
  contentCardsContainer.addEventListener("mouseenter", () => {
    isHovered = true;
    // Scroll continues but at slower speed
  });

  // Resume normal speed when mouse leaves
  contentCardsContainer.addEventListener("mouseleave", () => {
    isHovered = false;
    // Resume normal speed immediately
  });

  // Touch/swipe gesture handling
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isTouching = false;
  let isDragging = false;
  let lastScrollLeft = 0;
  let scrollVelocity = 0;
  let momentumCheckInterval = null;

  // Detect touch start
  contentCardsContainer.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isTouching = true;
      isDragging = false;
      lastScrollLeft = contentCardsContainer.scrollLeft;

      // Pause auto-scroll immediately on touch
      isPaused = true;
      // Animation loop continues running, just skips scrolling
    },
    { passive: true }
  );

  // Detect touch move (dragging)
  contentCardsContainer.addEventListener(
    "touchmove",
    (e) => {
      if (!isTouching) return;

      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;

      const deltaX = Math.abs(touchEndX - touchStartX);
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Detect horizontal drag
      if (deltaX > deltaY && deltaX > 10) {
        isDragging = true;
      }

      // Track scroll velocity for momentum detection
      const currentScrollLeft = contentCardsContainer.scrollLeft;
      scrollVelocity = currentScrollLeft - lastScrollLeft;
      lastScrollLeft = currentScrollLeft;
    },
    { passive: true }
  );

  // Detect touch end (swipe complete)
  contentCardsContainer.addEventListener(
    "touchend",
    () => {
      if (isDragging) {
        // Snap to nearest card after swipe
        snapToNearestCard();
      }

      isTouching = false;
      isDragging = false;

      // Resume auto-scroll after touch interaction ends
      setTimeout(() => {
        if (!isTouching && !isDragging) {
          isPaused = false;
          if (!animationFrameId) {
            startAutoScroll();
          }
        }
      }, 1500); // Resume after 1.5 seconds
    },
    { passive: true }
  );

  // Mouse drag support for desktop
  let isMouseDown = false;
  let mouseStartX = 0;

  contentCardsContainer.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
    lastScrollLeft = contentCardsContainer.scrollLeft;

    // Pause auto-scroll on mouse down
    isPaused = true;
    // Animation loop continues running, just skips scrolling
  });

  contentCardsContainer.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
      isDragging = true;
      const currentScrollLeft = contentCardsContainer.scrollLeft;
      scrollVelocity = currentScrollLeft - lastScrollLeft;
      lastScrollLeft = currentScrollLeft;
    }
  });

  contentCardsContainer.addEventListener("mouseup", () => {
    if (isDragging) {
      snapToNearestCard();
    }
    isMouseDown = false;
    isDragging = false;

    // Resume auto-scroll after mouse drag
    setTimeout(() => {
      if (!isMouseDown && !isDragging) {
        isPaused = false;
        if (!animationFrameId) {
          startAutoScroll();
        }
      }
    }, 1500);
  });

  // Snap to nearest card after swipe/drag
  function snapToNearestCard() {
    const originalCards = getOriginalCards();
    if (originalCards.length === 0) return;

    const scrollDistance = cardWidth + cardGap;
    const currentScroll = contentCardsContainer.scrollLeft;
    const containerWidth = contentCardsContainer.offsetWidth;

    // Find the card closest to the center of the viewport
    let nearestIndex = 0;
    let minDistance = Infinity;

    originalCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const containerRect = contentCardsContainer.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    const targetScroll = nearestIndex * scrollDistance;

    contentCardsContainer.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });

    currentIndex = nearestIndex;

    // Update active card after snap
    setTimeout(() => {
      updateActiveCard();
    }, 100);
  }

  // Update active card on scroll (for highlighting, but don't pause auto-scroll)
  contentCardsContainer.addEventListener(
    "scroll",
    () => {
      // Only update active card, don't interfere with auto-scroll
      // Auto-scroll is controlled by isPaused flag from user interactions
      updateActiveCard();
    },
    { passive: true }
  );

  // Initialize on page load
  duplicateCards();
  updateActiveCard();

  // Start continuous auto-scroll immediately
  startAutoScroll();

  // Handle page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pause when tab is hidden
      isPaused = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      // Resume when tab becomes visible
      updateActiveCard();
      if (!isPaused) {
        startAutoScroll();
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAutoScrollingCards);
} else {
  initAutoScrollingCards();
}
