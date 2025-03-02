document.addEventListener('keydown', function(event) {
    if (event.key === '0') {
      window.location.href = '/';
    } else if (event.key === '1') {
      window.history.back();
    }
  });
  const options = document.querySelectorAll('[style*="cursor: pointer"]');
  options.forEach(option => {
    option.addEventListener('touchstart', function() {
      this.style.backgroundColor = '#333';
    });
    option.addEventListener('touchend', function() {
      this.style.backgroundColor = 'transparent';
    });
  });