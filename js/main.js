<script>
// -----------------------------
// MODAL
// -----------------------------
const artModal = document.getElementById('artModal');
const modalImage = document.getElementById('modalImage');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('artModalClose');
const modalContent = document.querySelector('.art-modal-content');

let scrollPosition = 0;

document.querySelectorAll('.art-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const textDiv = item.querySelector('.art-text');

    if (img) {
      modalImage.src = img.src;
      modalImage.alt = img.alt;
      modalImage.style.display = 'block';
    } else {
      modalImage.style.display = 'none';
    }

    modalText.textContent = textDiv ? textDiv.textContent : '';
    artModal.classList.add('active');
  });
});

const closeModal = () => {
  artModal.classList.remove('active');

  // Unlock scroll
  document.documentElement.style.overflow = '';
  document.body.style.top = '';

  // Restore scroll position
  window.scrollTo(0, scrollPosition);
};

modalClose.addEventListener('click', closeModal);
artModal.addEventListener('click', e => {
  if (e.target === artModal) closeModal();
});

// Prevent scroll leak inside modal content
modalContent.addEventListener('touchstart', function(e) {
  const scrollTop = this.scrollTop;
  const scrollHeight = this.scrollHeight;
  const offsetHeight = this.offsetHeight;
  const atTop = scrollTop === 0;
  const atBottom = scrollTop + offsetHeight >= scrollHeight;

  if (atTop) this.scrollTop = 1;
  if (atBottom) this.scrollTop = scrollHeight - offsetHeight - 1;
}, {passive: false});


// -----------------------------
// TABS
// -----------------------------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Deselect all tabs
    tabs.forEach(t => t.setAttribute('aria-selected','false'));
    // Hide all panels
    panels.forEach(p => p.classList.remove('active'));

    // Select clicked tab
    tab.setAttribute('aria-selected','true');

    // Show corresponding panel
    const targetId = tab.getAttribute('data-target');
    const panel = document.getElementById(targetId);
    panel.classList.add('active');

    // Special case for Music panel: make sure album links are visible
    if(targetId === 'music') {
      panel.querySelectorAll('.album-links').forEach(linkDiv => {
        linkDiv.style.maxHeight = 'none';
        linkDiv.style.overflow = 'visible';
      });
    }
  });
});

// Preload all art images
const artImages = document.querySelectorAll('.art-item img');
artImages.forEach(img => {
  const preloaded = new Image(); // create a new Image object
  preloaded.src = img.src;       // set its src to preload
});

// -----------------------------
// CANVAS BACKGROUND - FRAME ANIMATION
// -----------------------------
const canvas = document.getElementById('grayscaleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// GIF frames
const totalFrames = 89;
const frames = [];
let loadedFrames = 0;
let frameIndex = 0;

const fps = 30;
const frameDuration = 1000 / fps;
let lastFrameTime = 0;

for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    img.src = `images/gifFrames/brand/${i}.png`;
    img.onload = () => {
        loadedFrames++;
        if (loadedFrames === totalFrames) {
            requestAnimationFrame(drawAll); // start only when all frames loaded
        }
    };
    img.onerror = () => console.error(`Failed to load frame ${i}`);
    frames.push(img);
}


// Mouse trail
const trail = [];
const layerConfigs = [
    {radius: 25, opacity: 0.6},
    {radius: 18, opacity: 0.4},
    {radius: 12, opacity: 0.2},
];
document.addEventListener('mousemove', e => {
    trail.push({x: e.clientX, y: e.clientY});
    if (trail.length > 200) trail.shift();
});

// -----------------------------
// Multiple floating copies
// -----------------------------
const copies = [];

// Configure how many copies you want
const numCopies = 30;

for (let i = 0; i < numCopies; i++) {
    copies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2, // horizontal speed
        vy: (Math.random() - 0.5) * 2, // vertical speed
        scale: 0.4 + Math.random() * 0.3 // random size
    });
}

function drawAll(timestamp) {
    // Partially fade canvas for motion trails
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; // lower alpha keeps trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (loadedFrames === totalFrames) {
        // Advance frame based on FPS
        if (timestamp - lastFrameTime > frameDuration) {
            frameIndex = (frameIndex + 1) % totalFrames;
            lastFrameTime = timestamp;
        }
        const frame = frames[frameIndex];

        // Draw and move each floating copy
        copies.forEach((c, i) => {
            // Apply soft glow and rotation
            ctx.save();
            const w = frame.width * c.scale;
            const h = frame.height * c.scale;
            ctx.translate(c.x + w / 2, c.y + h / 2);

            // Subtle rotation
            ctx.rotate(Math.sin(timestamp / 500 + i) * 0.1);

            // Pulsing scale (breathing)
            const currentScale = c.scale + Math.sin(timestamp / 400 + i) * 0.05;

            ctx.shadowColor = 'rgba(255,0,0,0.5)';
            ctx.shadowBlur = 20;

            ctx.drawImage(frame, -w / 2, -h / 2, w * (currentScale / c.scale), h * (currentScale / c.scale));
            ctx.restore();

            // Update position
            c.x += c.vx;
            c.y += c.vy;

            // Bounce off edges
            if (c.x < 0 || c.x + w > canvas.width) c.vx *= -1;
            if (c.y < 0 || c.y + h > canvas.height) c.vy *= -1;
        });

        // Twinkling particles
        for (let j = 0; j < 0; j++) {
            ctx.fillStyle = `rgba(255,0,0,${Math.random()})`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Request next frame
    requestAnimationFrame(drawAll);
}



window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
</script>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('worldbuilding');
  const container = panel.querySelector('.art-grid');
  const toggleBtn = document.getElementById('worldSearchToggle');
  const search = document.getElementById('worldSearch');

  if (!container || !toggleBtn) return;

  const items = Array.from(container.children);
  const originalOrder = [...items];

  const normalize = text =>
    text
      .toLowerCase()
      .replace(/^(the|a|an)\s+/i, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  let searchActive = false;

  function render(itemsToRender, withHeaders = false) {
    container.innerHTML = '';
    let currentLetter = '';

    itemsToRender.forEach(item => {
      if (withHeaders) {
        const letter = normalize(item.querySelector('h3').textContent)
          .charAt(0)
          .toUpperCase();

        if (letter !== currentLetter) {
          currentLetter = letter;
          const header = document.createElement('div');
          header.className = 'az-header';
          header.textContent = letter;
          container.appendChild(header);
        }
      }

      container.appendChild(item);
    });
  }

  toggleBtn.addEventListener('click', () => {
    searchActive = !searchActive;

    if (searchActive) {
      toggleBtn.textContent = 'CLOSE';
      search.hidden = false;
      search.value = '';
      search.focus();

      const sorted = [...originalOrder].sort((a, b) =>
        normalize(a.querySelector('h3').textContent)
          .localeCompare(normalize(b.querySelector('h3').textContent))
      );

      render(sorted, true);
    } else {
      toggleBtn.textContent = 'SEARCH';
      search.hidden = true;
      render(originalOrder, false);
    }
  });

  search.addEventListener('input', e => {
    const term = normalize(e.target.value);

    const filtered = originalOrder
      .filter(item =>
        normalize(item.querySelector('h3').textContent).includes(term)
      )
      .sort((a, b) =>
        normalize(a.querySelector('h3').textContent)
          .localeCompare(normalize(b.querySelector('h3').textContent))
      );

    render(filtered, true);
  });
});
</script>


<script>
// -----------------------------
// MODAL
// -----------------------------
const artModal = document.getElementById('artModal');
const modalImage = document.getElementById('modalImage');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('artModalClose');

document.querySelectorAll('.art-item img').forEach(img => {
  img.addEventListener('click', () => {
    const textDiv = img.parentElement.querySelector('.art-text');
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modalText.textContent = textDiv ? textDiv.textContent : '';
    artModal.classList.add('active');
  });
});
modalClose.addEventListener('click', () => artModal.classList.remove('active'));
artModal.addEventListener('click', e => { if(e.target===artModal) artModal.classList.remove('active'); });

// -----------------------------
// TABS
// -----------------------------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Deselect all tabs
    tabs.forEach(t => t.setAttribute('aria-selected','false'));
    // Hide all panels
    panels.forEach(p => p.classList.remove('active'));

    // Select clicked tab
    tab.setAttribute('aria-selected','true');

    // Show corresponding panel
    const targetId = tab.getAttribute('data-target');
    const panel = document.getElementById(targetId);
    panel.classList.add('active');

    // Special case for Music panel: make sure album links are visible
    if(targetId === 'music') {
      panel.querySelectorAll('.album-links').forEach(linkDiv => {
        linkDiv.style.maxHeight = 'none';
        linkDiv.style.overflow = 'visible';
      });
    }
  });
});
// -----------------------------
// CANVAS BACKGROUND
// -----------------------------
</script>