// This code are referenced from three.js—https://codepen.io/search/pens?q=sphere, https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js,
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);
  
  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(10, 2),
    new THREE.MeshPhongMaterial({
      color: 0xFD8128, wireframe: true, transparent: true, 
      opacity: 0.5, emissive: 0xFD8128, emissiveIntensity: 0.2
    })
  );
  sphereGroup.add(sphere);
  
  const innerSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(9.5, 1),
    new THREE.MeshPhongMaterial({
      color: 0xFD8128, transparent: true, opacity: 0.15,
      emissive: 0xFD8128, emissiveIntensity: 0.3
    })
  );
  sphereGroup.add(innerSphere);
  
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pointLight1 = new THREE.PointLight(0xFD8128, 2, 100);
  pointLight1.position.set(20, 20, 20);
  scene.add(pointLight1);
  
  const particleCount = 50;
  const particlesGeometry = new THREE.BufferGeometry();
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
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      size: 0.4, vertexColors: true, transparent: true,
      opacity: 0.8, depthTest: false, depthWrite: false
    })
  );
  sphereGroup.add(particles);
  
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let autoRotateSpeed = 0.003;
  let autoRotationActive = true;
  let throttleValue = 0;
  
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
  
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      autoRotationActive = false;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });
  
  const endDragHandler = () => {
    isDragging = false;
    setTimeout(() => { autoRotationActive = true; }, 2000);
  };
  
  window.addEventListener('mouseup', endDragHandler);
  window.addEventListener('touchend', endDragHandler);
  
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
  
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      sphereGroup.rotation.y += deltaMove.x * 0.005;
      sphereGroup.rotation.x += deltaMove.y * 0.005;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: false });
  
  window.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      zoomCamera(e.deltaY > 0 ? 1 : -1);
    }
  });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 250);
  });
  
  document.body.appendChild(Object.assign(document.createElement('div'), {
    innerHTML: 'Press SHIFT and use mouse wheel to zoom in/out',
    style: 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: #FD8128; font-family: Arial, sans-serif; font-size: 14px; pointer-events: none; background-color: #100B06; padding: 5px 10px; border-radius: 4px;'
  }));
  
  const initialParticlePositions = positions.slice();
  let time = 0;
  
  const animate = () => {
    requestAnimationFrame(animate);
    
    if (autoRotationActive) {
      sphereGroup.rotation.y += autoRotateSpeed;
      sphereGroup.rotation.x += autoRotateSpeed * 0.3;
    }
    throttleValue++;
    if (throttleValue % 3 === 0) {
      time = Date.now() * 0.0005;
      
      innerSphere.scale.setScalar(1.0 + Math.sin(time) * 0.03);
      
      const particleUpdateLimit = 15;
      const startIdx = (throttleValue / 3) % particleCount;
      
      for (let i = 0; i < particleUpdateLimit; i++) {
        const idx = (startIdx + i) % particleCount;
        const posIdx = idx * 3;
        
        particlesGeometry.attributes.position.array[posIdx] = 
          initialParticlePositions[posIdx] + Math.cos(time + idx) * 0.2;
        particlesGeometry.attributes.position.array[posIdx + 1] = 
          initialParticlePositions[posIdx + 1] + Math.sin(time + idx) * 0.2;
      }  
      particlesGeometry.attributes.position.needsUpdate = true;
    } 
    renderer.render(scene, camera);
  };
  animate();
});