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

