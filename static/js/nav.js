document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
      this.textContent = '✕';
    } else {
      this.textContent = '☰';
    }
  });