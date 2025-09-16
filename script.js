// Juego basado en QUESTIONS (archivo questions.js)
// Selecciona 10 preguntas aleatorias de la lista y termina el juego tras contestarlas

// Elementos DOM
const questionEl = document.getElementById('question') // Fixed typo
const answersEl = document.getElementById('answers')
const feedbackEl = document.getElementById('feedback')
// No hay botón de siguiente; el avance es automático

// Estado del juego
let pool = [] // preguntas seleccionadas (10 aleatorias)
let currentIndex = 0
let score = 0
let answered = false
const scoreDisplay = document.getElementById('score-display')

function pickRandomQuestions(allQuestions, count) {
  const copy = allQuestions.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

function startGame() {
  // Si QUESTIONS no existe o tiene menos de 10 preguntas, usamos lo que haya
  const totalNeeded = 10
  const available = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : []
  const pickCount = Math.min(totalNeeded, available.length)
  pool = available.length ? pickRandomQuestions(available, pickCount) : []
  currentIndex = 0
  score = 0
  updateScoreDisplay()
  answered = false
  feedbackEl.textContent = ''
    // nextBtn.hidden = true // Removed reference to nextBtn.hidden

  if (pool.length === 0) {
    questionEl.textContent = 'No hay preguntas disponibles.'
    answersEl.innerHTML = ''
    return
  }

  renderQuestion()
}

function renderQuestion() {
  const quiz = pool[currentIndex]
  questionEl.textContent = `${currentIndex + 1}. ${quiz.question}`
  answersEl.innerHTML = ''
  feedbackEl.textContent = ''
  answered = false

  quiz.choices.forEach((choice, i) => {
    const btn = document.createElement('button')
    btn.className = 'answer'
    btn.textContent = choice
    btn.type = 'button'
    btn.dataset.index = i
    btn.addEventListener('click', onAnswer)
    answersEl.appendChild(btn)
  })
}

function onAnswer(e) {
  if (answered) return
  answered = true

  const selected = Number(e.currentTarget.dataset.index)
  const buttons = Array.from(document.querySelectorAll('.answer'))
  const quiz = pool[currentIndex]

  buttons.forEach((b) => {
    b.disabled = true
    const idx = Number(b.dataset.index)
    if (idx === quiz.correctIndex) {
      b.classList.add('correct')
    }
    if (idx === selected && idx !== quiz.correctIndex) {
      b.classList.add('wrong')
    }
  })

  if (selected === quiz.correctIndex) {
    score += 1
    feedbackEl.textContent = '¡Correcto!'
    updateScoreDisplay()
    // Después de una pausa corta vamos a la siguiente pregunta
    setTimeout(() => {
      advanceOrFinish()
    }, 700)
  } else {
    // Marcar la respuesta correcta (ya lo hicimos con clase 'correct') y la seleccionada incorrecta
    const correctText = quiz.choices[quiz.correctIndex]
    feedbackEl.textContent = `Incorrecto. La respuesta correcta es: ${correctText}`
    // Tiempo ligeramente mayor para que el usuario vea ambas marcas
    setTimeout(() => {
      advanceOrFinish()
    }, 1400)
  }
}

function advanceOrFinish() {
  if (currentIndex + 1 >= pool.length) {
    showFinalResults()
  } else {
    currentIndex += 1
    renderQuestion()
  }
}

function showFinalResults() {
  questionEl.textContent = `Juego terminado: has respondido ${pool.length} preguntas.`
  answersEl.innerHTML = ''
  feedbackEl.textContent = `Puntuación: ${score} / ${pool.length}`
    // nextBtn.hidden = true // Removed reference to nextBtn.hidden
  // Celebración con confetti
  launchConfetti()
}

function updateScoreDisplay() {
  if (scoreDisplay) {
    scoreDisplay.textContent = `Puntos: ${score}`
  }
}

// Confetti simple sin librerías externas
function launchConfetti() {
  const duration = 3000
  const end = Date.now() + duration
  const colors = ['#ffcc00', '#ff6b6b', '#6ee7b7', '#60a5fa', '#c084fc']

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = 0
  canvas.style.left = 0
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const particles = []
  const particleCount = 120
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    })
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rot * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    })
  }

  function update() {
    const now = Date.now()
    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08 // gravedad
      p.rot += p.rotSpeed
    })
    draw()
    if (Date.now() < end) {
      requestAnimationFrame(update)
    } else {
      // fade out y limpiar
      canvas.remove()
    }
  }

  update()
}

// Iniciar al cargar
startGame()
