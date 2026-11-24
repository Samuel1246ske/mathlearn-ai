// Mobile navigation
document.querySelectorAll(".menu-toggle").forEach(button=>button.addEventListener("click",()=>{const nav=document.querySelector(".nav");nav.classList.toggle("open");button.textContent=nav.classList.contains("open")?"✕":"☰";}));

// Supabase-powered lessons and learning progress

const LESSONS_URL = "https://cnqjpzjdhascrjouzynu.supabase.co";
const LESSONS_KEY = "sb_publishable_34w3u5w8U6IgNJlFZGRL8A_UHAdNEXD";

const lessonClient = window.supabase
  ? window.supabase.createClient(LESSONS_URL, LESSONS_KEY)
  : null;
const classSelect = document.getElementById("classSelect");
const lessonGrid = document.getElementById("lessonGrid");
const classSummary = document.getElementById("classSummary");

async function renderLessons() {
  if (!classSelect || !lessonGrid) return;

  const selectedClass = classSelect.value.replace(/\s/g, "");

  classSummary.textContent = "Loading your lessons...";
  lessonGrid.innerHTML = "";

  try {
    const { data: lessons, error } = await lessonClient
      .from("lessons")
      .select("id, class_level, title, topic, content")
      .eq("class_level", selectedClass)
      .eq("published", true)
      .order("title");

    if (error) throw error;

    if (!lessons || lessons.length === 0) {
      classSummary.textContent = "No lessons available for this class yet.";
      return;
    }

    const { data: { user } } = await lessonClient.auth.getUser();

    let completedIds = [];

    if (user) {
      const { data: progress, error: progressError } =
        await lessonClient
          .from("learning_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("completed", true);

      if (progressError) throw progressError;

      completedIds = progress.map(item => item.lesson_id);
    }

    classSummary.textContent =
      `${lessons.length} Mathematics lessons available for ${classSelect.value}.`;

    lessonGrid.innerHTML = lessons.map(lesson => {
      const completed = completedIds.includes(lesson.id);

      return `
        <article class="lesson-card">
          <span class="lesson-symbol">📘</span>
          <h3>${lesson.title}</h3>
          <p><strong>${lesson.topic}</strong></p>
          <p>${lesson.content}</p>
          <button
            class="lesson-complete-btn"
            data-lesson-id="${lesson.id}"
            ${completed ? "disabled" : ""}
            style="margin-top:15px;padding:10px 15px;border:0;border-radius:9px;background:${completed ? "#d9f5e5" : "#6845d5"};color:${completed ? "#176b3a" : "white"};cursor:pointer;">
            ${completed ? "✓ Completed" : "Mark as completed"}
          </button>
        </article>
      `;
    }).join("");

  } catch (error) {
    classSummary.textContent = "Unable to load lessons: " + error.message;
  }
}

if (classSelect) {
  classSelect.addEventListener("change", renderLessons);
  renderLessons();
}

if (lessonGrid) {
  lessonGrid.addEventListener("click", async event => {
    const button = event.target.closest(".lesson-complete-btn");

    if (!button) return;

    button.disabled = true;
    button.textContent = "Saving...";

    try {
      const { data: { user }, error: authError } =
        await lessonClient.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        alert("Please log in before marking a lesson as completed.");
        window.location.href = "auth.html";
        return;
      }

      const { error } = await lessonClient
        .from("learning_progress")
        .upsert({
          student_id: user.id,
          lesson_id: button.dataset.lessonId,
          completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "student_id,lesson_id"
        });

      if (error) throw error;

      button.textContent = "✓ Completed";
      button.style.background = "#d9f5e5";
      button.style.color = "#176b3a";

    } catch (error) {
      alert("Could not save your progress: " + error.message);
      button.disabled = false;
      button.textContent = "Mark as completed";
    }
  });
}
// Three-question quiz connected to Supabase

const questions = [
  {
    q: "What is 7 × 8?",
    o: ["54", "56", "64", "48"],
    a: 1,
    why: "7 × 8 = 56."
  },
  {
    q: "Solve: x + 5 = 12",
    o: ["x = 5", "x = 6", "x = 7", "x = 8"],
    a: 2,
    why: "Subtract 5 from both sides: x = 7."
  },
  {
    q: "What is half of 3/4?",
    o: ["3/8", "2/4", "3/2", "1/4"],
    a: 0,
    why: "Half of 3/4 is 3/8."
  }
];

let qi = 0;
let score = 0;
let chosen = false;
let quizFinished = false;

const qTitle = document.getElementById("quizQuestion");
const qOpts = document.getElementById("quizOptions");
const qFeed = document.getElementById("quizFeedback");
const next = document.getElementById("nextQuestion");

async function saveQuizAttempt(finalScore) {
  const SUPABASE_URL = "https://cnqjpzjdhascrjouzynu.supabase.co";

  const SUPABASE_KEY = "sb_publishable_34w3u5w8U6IgNJlFZGRL8A_UHAdNEXD";

const lessonClient = window.supabase
  ? window.supabase.createClient(LESSONS_URL, LESSONS_KEY)
  : null;

  const { data: { user }, error: userError } =
    await client.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("Please log in to save your quiz score.");
  }

  const { error } = await client
    .from("quiz_attempts")
    .insert({
      student_id: user.id,
      score: finalScore,
      total_questions: questions.length
    });

  if (error) throw error;
}

function drawQuiz() {
  if (!qTitle) return;

  chosen = false;

  const q = questions[qi];

  document.getElementById("quizCount").textContent =
    `QUESTION ${qi + 1} OF ${questions.length}`;

  document.getElementById("quizProgress").style.width =
    ((qi + 1) / questions.length * 100) + "%";

  qTitle.textContent = q.q;
  qFeed.textContent = "";

  next.disabled = true;
  next.textContent =
    qi === questions.length - 1
      ? "See my result →"
      : "Next question →";

  qOpts.innerHTML = q.o.map((v, i) =>
    `<button class="quiz-option" data-index="${i}">
      ${String.fromCharCode(65 + i)}. ${v}
    </button>`
  ).join("");

  qOpts.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      if (chosen) return;

      chosen = true;

      const selected = Number(button.dataset.index);

      if (selected === q.a) {
        score++;
        button.classList.add("correct");
        qFeed.textContent = "Correct! " + q.why;
      } else {
        button.classList.add("wrong");
        qOpts.children[q.a].classList.add("correct");
        qFeed.textContent = "Not quite. " + q.why;
      }

      next.disabled = false;
    });
  });
}

if (qTitle) {
  drawQuiz();

  next.addEventListener("click", async () => {

    if (quizFinished) {
      qi = 0;
      score = 0;
      quizFinished = false;
      drawQuiz();
      return;
    }

    if (qi < questions.length - 1) {
      qi++;
      drawQuiz();
      return;
    }

    quizFinished = true;
    next.disabled = true;

    qTitle.textContent =
      `You scored ${score} out of ${questions.length}!`;

    qOpts.innerHTML = "";

    qFeed.textContent = "Saving your result...";

    try {
      await saveQuizAttempt(score);

      qFeed.textContent =
        "Your score has been saved successfully! 🎉";

    } catch (error) {
      qFeed.textContent =
        "Score could not be saved: " + error.message;
    }

    next.textContent = "Try again ↻";
    next.disabled = false;
  });
    }
