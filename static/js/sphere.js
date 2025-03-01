// This code is from three.js—https://codepen.io/search/pens?q=sphere, https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js,
// https://medium.com/@banyapon/how-to-create-multiple-neon-spheres-with-javascript-and-three-js-263f6c3d0d69, and https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('sphere-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false, 
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x100B06, 1);
  renderer.setPixelRatio(1); 
  
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);
  
  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(10, 1),
    new THREE.MeshBasicMaterial({
      color: 0xFD8128, 
      wireframe: true, 
      transparent: false, 
      opacity: 0.8
    })
  );
  sphereGroup.add(sphere);
  
  const innerSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(9, 0),
    new THREE.MeshBasicMaterial({
      color: 0xFD8128, 
      transparent: true, 
      opacity: 0.1
    })
  );
  sphereGroup.add(innerSphere);
  
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const radius = 8 * Math.random();
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    colors[i * 3] = 1.0;
    colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
    colors[i * 3 + 2] = 0.1 + Math.random() * 0.2;
  }
  
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      size: 0.4, 
      vertexColors: true, 
      transparent: false,
      sizeAttenuation: true
    })
  );
  sphereGroup.add(particles);
  
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let autoRotateSpeed = 0.005;
  let autoRotationActive = true;
  let animationFrameId = null;
  let lastRenderTime = 0;
  
  const zoomCamera = (direction) => {
    const newZ = camera.position.z + direction * 0.5;
    if (newZ <= 50 && newZ >= 15) {
      camera.position.z = newZ;
    }
  };
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotationActive = false;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
    setTimeout(() => { autoRotationActive = true; }, 2000);
  });
  
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      sphereGroup.rotation.y += deltaMove.x * 0.005;
      sphereGroup.rotation.x += deltaMove.y * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });
  
  window.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      e.preventDefault(); 
      zoomCamera(e.deltaY > 0 ? 1 : -1);
    }
  }, { passive: false }); 
  
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  window.addEventListener('resize', handleResize);
  
  document.body.appendChild(Object.assign(document.createElement('div'), {
    innerHTML: 'Press SHIFT and use mouse wheel to zoom in/out',
    style: 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: #FD8128; font-family: Arial, sans-serif; font-size: 14px; pointer-events: none; background-color: #100B06; padding: 5px 10px; border-radius: 4px;'
  }));
  
  const clock = new THREE.Clock();
  clock.start();
  
  const animate = (time) => {
    if (time - lastRenderTime < 33) { 
      animationFrameId = requestAnimationFrame(animate);
      return;
    }
    
    lastRenderTime = time;
    const timeInSeconds = clock.getElapsedTime();
    
    if (autoRotationActive) {
      sphereGroup.rotation.y += autoRotateSpeed;
      sphereGroup.rotation.x += autoRotateSpeed * 0.5;
    }
    
    innerSphere.scale.set(
      1.0 + Math.sin(timeInSeconds) * 0.04,
      1.0 + Math.sin(timeInSeconds) * 0.04,
      1.0 + Math.sin(timeInSeconds) * 0.04
    );
    
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  
  animate(0);
  
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mouseup', () => {});
    window.removeEventListener('mousemove', () => {});
    window.removeEventListener('wheel', () => {});
    
    particlesGeometry.dispose();
    sphere.geometry.dispose();
    sphere.material.dispose();
    innerSphere.geometry.dispose();
    innerSphere.material.dispose();
    renderer.dispose();
  };
});