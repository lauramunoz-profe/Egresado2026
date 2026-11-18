const progress = document.getElementById('progressBar');
const statusText = document.getElementById('bootStatus');
const startBtn = document.getElementById('startBtn');
const intro = document.getElementById('intro');
const mainContent = document.getElementById('mainContent');

const messages = ['Cargando recuerdos...', 'Verificando aprendizajes...', 'Compilando experiencias...', 'Sistema listo.'];
let step = 0;
setTimeout(() => progress.style.width = '100%', 100);
const bootTimer = setInterval(() => {
  step++;
  statusText.textContent = messages[Math.min(step, messages.length - 1)];
  if (step >= messages.length - 1) {
    clearInterval(bootTimer);
    startBtn.disabled = false;
    startBtn.classList.add('ready');
  }
}, 650);

// Desbloqueo silencioso al terminar de leer el mensaje
const letterLayout = document.getElementById('letterLayout');
const letterEnd = document.getElementById('letterEnd');
const sideAction = document.getElementById('sideAction');
let diplomaUnlocked = false;
let canUnlockByTime = false;

function unlockDiplomaButton() {
  if (diplomaUnlocked) return;
  diplomaUnlocked = true;
  letterLayout.classList.add('has-diploma');
  sideAction.hidden = false;
  burstParticles();
}

function checkIfFinishedReading() {
  if (diplomaUnlocked || !canUnlockByTime || !mainContent.classList.contains('active')) return;
  const rect = letterEnd.getBoundingClientRect();
  if (rect.top <= window.innerHeight - 20) {
    unlockDiplomaButton();
  }
}

startBtn.addEventListener('click', () => {
  intro.classList.remove('active');
  mainContent.classList.add('active');
  mainContent.setAttribute('aria-hidden', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  burstParticles();

  // Espera 25 segundos en silencio mientras leen y luego habilita el botón al llegar al final
  setTimeout(() => {
    canUnlockByTime = true;
    checkIfFinishedReading();
  }, 25000);
});

window.addEventListener('scroll', checkIfFinishedReading, { passive: true });
window.addEventListener('resize', checkIfFinishedReading);

// Modal del diploma
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const diplomaModal = document.getElementById('diplomaModal');
const studentNameInput = document.getElementById('studentNameInput');
const studentNameDisplay = document.getElementById('studentNameDisplay');

openModalBtn.addEventListener('click', () => {
  diplomaModal.classList.add('open');
  diplomaModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => studentNameInput.focus(), 100);
});

function closeModal() {
  diplomaModal.classList.remove('open');
  diplomaModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeModal);
diplomaModal.addEventListener('click', (e) => {
  if (e.target === diplomaModal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && diplomaModal.classList.contains('open')) closeModal();
});

// Actualización en vivo del nombre en el diploma
studentNameInput.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  studentNameDisplay.textContent = value || 'Egresado/a de la Promoción 2026';
});

// Descargar diploma como imagen PNG a todo color (funciona en local y en web)
const downloadImgBtn = document.getElementById('downloadImgBtn');
const downloadStatus = document.getElementById('downloadStatus');

function loadImageSafe(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

downloadImgBtn.addEventListener('click', async () => {
  const rawName = studentNameInput.value.trim();
  const studentName = rawName || 'Egresado/a de la Promoción 2026';
  const safeFileName = rawName
    ? `Diploma_${rawName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, '_')}_2026.png`
    : 'Diploma_6to_Anio_Promocion_2026.png';

  downloadImgBtn.disabled = true;
  downloadImgBtn.textContent = 'GENERANDO IMAGEN...';

  try {
    await document.fonts.ready;

    const W = 1600;
    const H = 1120;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // Marco exterior dorado
    const goldGrad = ctx.createLinearGradient(0, 0, W, H);
    goldGrad.addColorStop(0, '#9c7029');
    goldGrad.addColorStop(0.35, '#f5df9e');
    goldGrad.addColorStop(0.7, '#8c6222');
    goldGrad.addColorStop(1, '#edd082');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, W, H);

    // Fondo crema interior
    const pad = 28;
    const bgGrad = ctx.createRadialGradient(W / 2, H * 0.35, 80, W / 2, H / 2, W * 0.65);
    bgGrad.addColorStop(0, '#fffdf7');
    bgGrad.addColorStop(0.65, '#f6edd6');
    bgGrad.addColorStop(1, '#ebdec0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(pad, pad, W - pad * 2, H - pad * 2);

    // Carga segura de imágenes
    const [logoImg, gradImg] = await Promise.all([
      loadImageSafe('logo.png'),
      loadImageSafe('graduacion.jpg')
    ]);

    if (gradImg) {
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.drawImage(gradImg, pad, pad, W - pad * 2, H - pad * 2);
      ctx.restore();
    }

    // Doble borde y esquinas ornamentales
    ctx.strokeStyle = '#8f6b32';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

    ctx.strokeStyle = '#c2a25e';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad + 18, pad + 18, W - (pad + 18) * 2, H - (pad + 18) * 2);

    const cOff = pad + 32;
    const cLen = 40;
    ctx.strokeStyle = '#8f6b32';
    ctx.lineWidth = 4;
    [[cOff, cOff, 1, 1], [W - cOff, cOff, -1, 1], [cOff, H - cOff, 1, -1], [W - cOff, H - cOff, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cLen, y);
      ctx.stroke();
    });

    // Encabezado institucional
    if (logoImg) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(logoImg, 110, 78, 130, 130);
      ctx.restore();
    }

    if (gradImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(W - 175, 143, 62, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(gradImg, W - 237, 81, 124, 124);
      ctx.restore();
      ctx.strokeStyle = '#9c793e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(W - 175, 143, 62, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1f2d42';
    ctx.font = '700 34px "Playfair Display", Georgia, serif';
    ctx.fillText('INSTITUTO NUESTRA SEÑORA DE FÁTIMA', W / 2, 136);

    ctx.fillStyle = '#7c6438';
    ctx.font = '500 18px "DM Mono", monospace';
    ctx.fillText('VILLA SOLDATI · BUENOS AIRES · ARGENTINA', W / 2, 172);

    ctx.strokeStyle = '#cbb686';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 228);
    ctx.lineTo(W - 110, 228);
    ctx.stroke();

    // Títulos
    ctx.fillStyle = '#826736';
    ctx.font = '500 18px "DM Mono", monospace';
    ctx.fillText('ESPACIO CURRICULAR: DESARROLLO DE SISTEMAS · CICLO LECTIVO 2026', W / 2, 275);

    ctx.fillStyle = '#1f2d42';
    ctx.font = '700 62px "Playfair Display", Georgia, serif';
    ctx.fillText('DIPLOMA DE FINALIZACIÓN', W / 2, 350);

    // Ornamento central
    ctx.strokeStyle = '#b08a48';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 190, 385);
    ctx.lineTo(W / 2 - 30, 385);
    ctx.moveTo(W / 2 + 30, 385);
    ctx.lineTo(W / 2 + 190, 385);
    ctx.stroke();
    ctx.fillStyle = '#a67f3c';
    ctx.font = '24px serif';
    ctx.fillText('✧', W / 2, 393);

    // Nombre del estudiante
    ctx.fillStyle = '#4b586b';
    ctx.font = 'italic 26px "Playfair Display", Georgia, serif';
    ctx.fillText('Se otorga el presente reconocimiento a', W / 2, 450);

    ctx.fillStyle = '#7c5821';
    ctx.font = '400 78px "Great Vibes", cursive';
    ctx.fillText(studentName, W / 2, 535);

    const nameW = Math.max(520, ctx.measureText(studentName).width + 80);
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#bfa56a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameW / 2, 552);
    ctx.lineTo(W / 2 + nameW / 2, 552);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#24364f';
    ctx.font = '700 28px "DM Mono", monospace';
    ctx.fillText('6.º AÑO · TÉCNICO EN COMPUTACIÓN', W / 2, 608);

    ctx.fillStyle = '#3f4d61';
    ctx.font = '400 25px "Playfair Display", Georgia, serif';
    wrapText(
      ctx,
      'Por haber completado con dedicación, esfuerzo y creatividad esta etapa formativa, demostrando que cada desafío técnico y personal es el punto de partida hacia una nueva versión.',
      W / 2,
      662,
      1080,
      36
    );

    // Barra de estado
    ctx.strokeStyle = '#cbb686';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(220, 765);
    ctx.lineTo(W - 220, 765);
    ctx.moveTo(220, 845);
    ctx.lineTo(W - 220, 845);
    ctx.stroke();

    ctx.fillStyle = '#7e6b46';
    ctx.font = '500 16px "DM Mono", monospace';
    ctx.fillText('ESTADO DEL SISTEMA', W / 2 - 230, 795);
    ctx.fillText('PRÓXIMO COMPILADO', W / 2 + 230, 795);

    ctx.fillStyle = '#26364d';
    ctx.font = '700 20px "DM Mono", monospace';
    ctx.fillText('ETAPA COMPLETADA (100%)', W / 2 - 230, 825);
    ctx.fillText('UN NUEVO COMIENZO', W / 2 + 230, 825);

    ctx.fillStyle = '#a67f3c';
    ctx.font = '26px serif';
    ctx.fillText('✦', W / 2, 815);

    // Sello dorado central inferior
    const sealY = 965;
    const sealGrad = ctx.createRadialGradient(W / 2, sealY, 10, W / 2, sealY, 72);
    sealGrad.addColorStop(0, '#f9e8b2');
    sealGrad.addColorStop(1, '#dfc074');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#9c722c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, 72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(W / 2, sealY, 64, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#4f3710';
    ctx.font = '700 13px "DM Mono", monospace';
    ctx.fillText('PROMOCIÓN', W / 2, sealY - 22);
    ctx.font = '700 32px "Playfair Display", Georgia, serif';
    ctx.fillText('2026', W / 2, sealY + 11);
    ctx.font = '700 13px "DM Mono", monospace';
    ctx.fillText('6.º TÉCNICA', W / 2, sealY + 33);

    // Firmas izquierda y derecha
    ctx.strokeStyle = '#8f6b32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(160, 965);
    ctx.lineTo(560, 965);
    ctx.moveTo(W - 560, 965);
    ctx.lineTo(W - 160, 965);
    ctx.stroke();

    ctx.fillStyle = '#223147';
    ctx.font = '700 22px "Playfair Display", Georgia, serif';
    ctx.fillText('Prof. Muñoz Laura', 360, 998);
    ctx.fillText('Cierre de Ciclo Lectivo', W - 360, 998);

    ctx.fillStyle = '#6e5d3e';
    ctx.font = '500 16px "DM Mono", monospace';
    ctx.fillText('Desarrollo de Sistemas · Técnico en Computación', 360, 1025);
    ctx.fillText('Buenos Aires, Argentina', W - 360, 1025);

    ctx.fillStyle = '#3a485c';
    ctx.font = 'italic 22px "Playfair Display", Georgia, serif';
    ctx.fillText('18 de noviembre de 2026', W - 360, 948);

    // Descarga directa
    const link = document.createElement('a');
    link.download = safeFileName;
    link.href = c.toDataURL('image/png');
    link.click();

    downloadStatus.textContent = '¡Diploma descargado en tu dispositivo!';
  } catch (err) {
    console.error(err);
    downloadStatus.textContent = 'Hubo un problema al generar la imagen. Intentá nuevamente.';
  } finally {
    downloadImgBtn.disabled = false;
    downloadImgBtn.innerHTML = '⤓ DESCARGAR DIPLOMA (IMAGEN PNG)';
  }
});

// Fondo de partículas liviano
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(75, Math.floor(innerWidth / 15)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.6 + .4,
    v: Math.random() * .35 + .08,
    a: Math.random() * .45 + .12
  }));
}
function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.y -= p.v;
    if (p.y < -5) { p.y = innerHeight + 5; p.x = Math.random() * innerWidth; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,195,132,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
function burstParticles() {
  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * innerWidth,
      y: innerHeight * .35 + Math.random() * innerHeight * .3,
      r: Math.random() * 2 + 1,
      v: Math.random() * 1.5 + .5,
      a: .65
    });
  }
  particles = particles.slice(-130);
}
window.addEventListener('resize', resize);
resize();
draw();