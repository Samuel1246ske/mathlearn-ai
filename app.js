// Mobile navigation
document.querySelectorAll(".menu-toggle").forEach(button=>button.addEventListener("click",()=>{const nav=document.querySelector(".nav");nav.classList.toggle("open");button.textContent=nav.classList.contains("open")?"✕":"☰";}));

// Class-based topic catalogue
const topics={
"JSS 1":[["🔢","Number Bases","Understand place value and number representation."],["➕","Basic Operations","Addition, subtraction, multiplication and division."],["📐","Basic Geometry","Lines, angles and simple shapes."],["🍕","Fractions and Decimals","Parts of a whole and decimal notation."],["✖️","Introduction to Algebra","Use letters to represent unknown values."],["📊","Introduction to Statistics","Collect and interpret simple data."]],
"JSS 2":[["✖️","Algebraic Expressions","Simplify expressions and collect like terms."],["📐","Angles and Polygons","Explore angle relationships and polygons."],["📈","Graphs","Read, plot and interpret graphs."],["🔢","Integers","Work with positive and negative numbers."],["📏","Mensuration","Explore perimeter, area and volume."],["📊","Statistics","Find mean, median and mode."]],
"JSS 3":[["🧮","Linear Equations","Solve equations using balanced steps."],["📉","Quadratic Expressions","Explore quadratic expressions and patterns."],["📐","Trigonometry","Meet sine, cosine and tangent ratios."],["🎲","Probability","Describe and calculate chance."],["📈","Graphs of Functions","Plot and interpret relationships."],["📏","Geometry","Explore circles and geometric properties."]]
};
const classSelect=document.getElementById("classSelect"),lessonGrid=document.getElementById("lessonGrid");
function renderLessons(){if(!classSelect||!lessonGrid)return;const cls=classSelect.value;document.getElementById("classSummary").textContent="Showing starter topics for "+cls;lessonGrid.innerHTML=topics[cls].map((t,i)=>`<article class="lesson-card" style="animation-delay:${i*60}ms"><span class="lesson-symbol">${t[0]}</span><h3>${t[1]}</h3><p>${t[2]}</p><small>Explore topic ↗</small></article>`).join("");}
if(classSelect){classSelect.addEventListener("change",renderLessons);renderLessons();}

// Demonstration tutor: sample responses only, not a live AI service.
const form=document.getElementById("chatForm"),input=document.getElementById("question"),messages=document.getElementById("messages");
function say(text,who){const el=document.createElement("div");el.className="chat-bubble "+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
function answer(q){q=q.toLowerCase();if(q.includes("2x + 3 = 11")||q.includes("2x+3=11"))return "Let's solve 2x + 3 = 11.\\n\\nStep 1: Subtract 3 from both sides.\\n2x = 11 - 3 = 8.\\n\\nStep 2: Divide both sides by 2.\\nx = 8 ÷ 2 = 4.\\n\\nAnswer: x = 4. Check: 2(4) + 3 = 11. Well done!";if(q.includes("fraction"))return "A fraction represents part of a whole. For example, 1/2 means one of two equal parts.\\n\\nTry: what is 1/2 + 1/2?";if(q.includes("mean"))return "The mean is the average. For 2, 4 and 6: add them (12), then divide by 3. The mean is 4.";if(q.includes("algebra"))return "Algebra uses letters for unknown numbers. Example: x + 3 = 7. Subtract 3 from both sides: x = 4.";return "Good question! This prototype has a few built-in sample explanations, not a live AI connection yet. Try: solve 2x + 3 = 11; explain fractions; or explain the mean. A live AI tutor is a later development stage.";}
if(form){form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(!q)return;say(q,"user");input.value="";setTimeout(()=>say(answer(q),"bot"),300);});document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.prompt;input.focus();}));document.getElementById("clearChat").addEventListener("click",()=>messages.innerHTML='<div class="welcome"><b>Fresh page, fresh thinking! ✨</b><p>What maths question shall we explore?</p></div>');const voice=document.getElementById("voiceBtn"),status=document.getElementById("voiceStatus"),SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR){const rec=new SR();rec.lang="en-NG";voice.addEventListener("click",()=>{status.textContent="Listening…";try{rec.start()}catch(e){status.textContent="Please try again."}});rec.onresult=e=>{input.value=e.results[0][0].transcript;status.textContent="Voice captured. Press send."};rec.onerror=()=>status.textContent="Voice input unavailable; type instead.";}else{voice.disabled=true;status.textContent="Voice input is not supported in this browser."}}

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

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

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
