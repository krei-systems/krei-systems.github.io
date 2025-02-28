document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  
  let currentIndex = 0;
  const totalSlides = slides.length;
  
  // Initialize slider
  updateSlider();
  
  // Event listeners
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
  });
  
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  });
  
  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.getAttribute('data-index'));
      updateSlider();
    });
  });
  
  // Touch events for mobile swipe
  let touchStartX = 0;
  let touchEndX = 0;
  
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - next slide
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlider();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - previous slide
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlider();
    }
  }
  
  // Auto-advance slides every 5 seconds
  let slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  }, 5000);
  
  // Pause auto-advance when interacting with slider
  slider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  slider.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlider();
    }, 5000);
  });
  
});
// 3D interaction effect
document.addEventListener('mousemove', (e) => {
  const container = document.querySelector('.containerp');
  const logo = document.querySelector('.logo');
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mouseX = e.clientX - rect.left - centerX;
  const mouseY = e.clientY - rect.top - centerY;
  
  const rotateY = mouseX * 0.01;
  const rotateX = -mouseY * 0.01;
  
  logo.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

let lastScrollTop = 0;
let isScrolling = false;
let gridPosition = { x: 0, y: 0 };
const grid = document.querySelector('.background-grid');
grid.style.animation = 'none';

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        gridPosition.x += 2;  
        gridPosition.y += 2;
      } else if (st < lastScrollTop) {
        gridPosition.x -= 2;
        gridPosition.y -= 2;
      }
      grid.style.backgroundPosition = `${gridPosition.x}px ${gridPosition.y}px`;
      
      lastScrollTop = st <= 0 ? 0 : st;
      isScrolling = false;
    });
    
    isScrolling = true;
  }
});
grid.style.backgroundPosition = '0px 0px';

