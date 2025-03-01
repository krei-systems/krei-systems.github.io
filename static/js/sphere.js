// This code are referenced from three.js—https://codepen.io/search/pens?q=sphere, https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js,
// https://medium.com/@banyapon/how-to-create-multiple-neon-spheres-with-javascript-and-three-js-263f6c3d0d69, and https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
document.addEventListener('DOMContentLoaded', () => {

  const getWindowDimensions = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  };
  
  const dimensions = getWindowDimensions();
  const isMobile = dimensions.width < 768;
  
  const canvas = document.getElementById('sphere-canvas');
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75, 
    dimensions.width / dimensions.height, 
    0.1, 
    1000
  );

  camera.position.z = isMobile ? 35 : 30;
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false, 
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setSize(dimensions.width, dimensions.height);
  renderer.setClearColor(0x100B06, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);
  
  const sphereSize = isMobile ? 8 : 10;
  
  const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(sphereSize, isMobile ? 1 : 2),
    new THREE.MeshPhongMaterial({
      color: 0xFD8128, wireframe: true, transparent: true, 
      opacity: 0.5, emissive: 0xFD8128, emissiveIntensity: 0.2
    })
  );

  sphereGroup.add(sphere);
  
  const innerSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(sphereSize * 0.95, isMobile ? 1 : 1),
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
  
  const particleCount = isMobile ? 30 : 50;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const radius = (isMobile ? 6 : 8) * Math.random();
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
      size: isMobile ? 0.5 : 0.4, 
      vertexColors: true, 
      transparent: true,
      opacity: 0.8, 
      depthTest: false, 
      depthWrite: false
    })
  );

  sphereGroup.add(particles);
  
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let autoRotateSpeed = isMobile ? 0.004 : 0.003;
  let autoRotationActive = true;
  let throttleValue = 0;
  
  const zoomCamera = (direction) => {
    const minZoom = isMobile ? 20 : 15;
    const maxZoom = isMobile ? 45 : 50;
    const zoomStep = isMobile ? 0.7 : 0.5;
    
    const newZ = camera.position.z + direction * zoomStep;
    if (newZ <= maxZoom && newZ >= minZoom) {
      camera.position.z = newZ;
    }
  };
  
  const startDragHandler = (clientX, clientY) => {
    isDragging = true;
    autoRotationActive = false;
    previousMousePosition = { x: clientX, y: clientY };
  };
  
  const moveDragHandler = (clientX, clientY) => {
    if (isDragging) {
      const deltaMove = {
        x: clientX - previousMousePosition.x,
        y: clientY - previousMousePosition.y
      };
      const sensitivity = isMobile ? 0.006 : 0.005;
      sphereGroup.rotation.y += deltaMove.x * sensitivity;
      sphereGroup.rotation.x += deltaMove.y * sensitivity;
      previousMousePosition = { x: clientX, y: clientY };
    }
  };
  
  canvas.addEventListener('mousedown', (e) => {
    startDragHandler(e.clientX, e.clientY);
  });
  
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      startDragHandler(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  
  const endDragHandler = () => {
    isDragging = false;
    setTimeout(() => { autoRotationActive = true; }, 2000);
  };
  
  window.addEventListener('mouseup', endDragHandler);
  window.addEventListener('touchend', endDragHandler);
  
  window.addEventListener('mousemove', (e) => {
    moveDragHandler(e.clientX, e.clientY);
  });
  
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      moveDragHandler(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  
  let initialPinchDistance = 0;
  
  const getPinchDistance = (touches) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };
  
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistance = getPinchDistance(e.touches);
    }
  }, { passive: false });
  
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getPinchDistance(e.touches);
      const pinchDelta = currentDistance - initialPinchDistance;
      
      if (Math.abs(pinchDelta) > 5) {
        zoomCamera(pinchDelta > 0 ? -1 : 1);
        initialPinchDistance = currentDistance;
      }
    }
  }, { passive: false });
  
  window.addEventListener('keydown', (e) => {
    if (e.shiftKey) {
      if (e.key === 'ArrowUp') {
        zoomCamera(-1); 
        e.preventDefault(); 
      } else if (e.key === 'ArrowDown') {
        zoomCamera(1); 
        e.preventDefault(); 
      }
    }
  });
  const handleResize = () => {
    const newDimensions = getWindowDimensions();
    const newIsMobile = newDimensions.width < 768;
    
    camera.aspect = newDimensions.width / newDimensions.height;
    camera.updateProjectionMatrix();
    renderer.setSize(newDimensions.width, newDimensions.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, newIsMobile ? 1.5 : 2));
    
    updateTextStyles(newDimensions.width);
  };
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
  });
  
  const textOverlay = document.createElement('div');
  textOverlay.style.position = 'absolute';
  textOverlay.style.top = isMobile ? '25%' : '30%';
  textOverlay.style.left = '50%';
  textOverlay.style.transform = 'translate(-50%, -50%)';
  textOverlay.style.textAlign = 'center';
  textOverlay.style.pointerEvents = 'none';
  textOverlay.style.zIndex = '10';
  textOverlay.style.width = '90%';
  
  const mainText = document.createElement('h1');
  mainText.style.color = '#FD8128';
  mainText.style.fontFamily = 'Arial, sans-serif';
  mainText.style.fontWeight = 'bold';
  mainText.style.margin = '0';
  mainText.style.textShadow = '0 0 10px rgba(253, 129, 40, 0.5)';
  
  const spacer = document.createElement('div');
  
  const subText = document.createElement('h2');
  subText.style.color = '#FD8128';
  subText.style.fontFamily = 'Arial, sans-serif';
  subText.style.fontWeight = 'normal';
  subText.style.margin = '0';
  subText.style.opacity = '0.8';
  
  const updateTextStyles = (width) => {
    const isNarrow = width < 768;
    
    mainText.style.fontSize = isNarrow ? '2.5rem' : '4.5rem';
    spacer.style.height = isNarrow ? '10px' : '20px';
    subText.style.fontSize = isNarrow ? '1.5rem' : '2.5rem';
    instructionsText.innerHTML = isNarrow ? 
      'Pinch to zoom in/out' : 
      'Press SHIFT + ↑/↓ to zoom in/out';
  };
  
  textOverlay.appendChild(mainText);
  textOverlay.appendChild(spacer);
  textOverlay.appendChild(subText);
  document.body.appendChild(textOverlay);
  
  const instructionsText = Object.assign(document.createElement('div'), {
    style: 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: #FD8128; font-family: Georgia, Cambria, Palatino, "Palatino Linotype", "Times New Roman", Times, serif; background-color: #100B06; padding: 5px 10px; border-radius: 4px; text-align: center; pointer-events: none; width: 80%; max-width: 300px;'
  });
  document.body.appendChild(instructionsText);

  updateTextStyles(dimensions.width);
  
  const initialParticlePositions = positions.slice();
  let time = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    
    if (autoRotationActive) {
      sphereGroup.rotation.y += autoRotateSpeed;
      sphereGroup.rotation.x += autoRotateSpeed * 0.3;
    }
    const updateFrequency = isMobile ? 5 : 3;
    throttleValue++;
    if (throttleValue % updateFrequency === 0) {
      time = Date.now() * 0.0005;
      
      innerSphere.scale.setScalar(1.0 + Math.sin(time) * 0.03);
      const particleUpdateLimit = isMobile ? 8 : 15;
      const startIdx = (throttleValue / updateFrequency) % particleCount;
      
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