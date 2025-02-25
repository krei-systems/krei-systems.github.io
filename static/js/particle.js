const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

const config = {
    particles: [],
    maxParticles: 100,
    connectionDistance: 150,
    mouseRadius: 100,
    colors: ['#4285f4', '#34a853', '#fbbc05', '#ea4335'],
    speed: 1
};

const mouse = { x: null, y: null };
class Particle {
    constructor() {
        this.reset();
    }

    reset() {

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.size = Math.random() * 2 + 1;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * config.speed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (mouse.x !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseRadius) {
                const force = (config.mouseRadius - distance) / config.mouseRadius;
                this.vx += (dx / distance) * force * 0.02;
                this.vy += (dy / distance) * force * 0.02;
            }
        }


        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;


        this.x = Math.max(0, Math.min(this.x, canvas.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height));
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


function createParticles() {
    for (let i = 0; i < config.maxParticles; i++) {
        config.particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < config.particles.length; i++) {
        for (let j = i + 1; j < config.particles.length; j++) {
            const dx = config.particles[i].x - config.particles[j].x;
            const dy = config.particles[i].y - config.particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(config.particles[i].x, config.particles[i].y);
                ctx.lineTo(config.particles[j].x, config.particles[j].y);
                const opacity = (1 - distance / config.connectionDistance) * 0.5;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animate() {

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    config.particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
}

createParticles();
animate();