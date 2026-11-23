
const topicsByClass = {
  "JSS 1": [
    ["🔢", "Number Bases", "Understand numbers and place values."],
    ["➕", "Basic Operations", "Addition, subtraction, multiplication and division."],
    ["📐", "Basic Geometry", "Lines, angles and shapes."],
    ["📊", "Statistics", "Collect and interpret simple data."],
    ["🍕", "Fractions", "Learn fractions, decimals and percentages."],
    ["✖️", "Introduction to Algebra", "Understand letters and simple expressions."]
  ],
  "JSS 2": [
    ["✖️", "Algebraic Expressions", "Simplify and evaluate expressions."],
    ["📐", "Angles and Polygons", "Explore angles and geometric figures."],
    ["📈", "Graphs", "Read and interpret graphs."],
    ["🔢", "Integers", "Work with positive and negative numbers."],
    ["📏", "Mensuration", "Perimeter, area and volume."],
    ["📊", "Statistics", "Mean, median and mode."]
  ],
  "JSS 3": [
    ["🧮", "Linear Equations", "Solve equations step by step."],
    ["📉", "Quadratic Expressions", "Explore quadratic expressions."],
    ["📐", "Trigonometry", "Learn basic trigonometric ratios."],
    ["📊", "Probability", "Understand chance and probability."],
    ["📈", "Graphs of Functions", "Plot and interpret graphs."],
    ["📏", "Geometry", "Study circles and geometric theorems."]
  ]
};

const classSelect = document.getElementById("classSelect");
const topicsContainer = document.getElementById("topics");

function showTopics() {
  const selectedClass = classSelect.value;
  const topics = topicsByClass[selectedClass];

  topicsContainer.innerHTML = topics.map(topic => `
    <article class="topic-card">
      <div class="topic-icon">${topic[0]}</div>
      <h3>${topic[1]}</h3>
      <p>${topic[2]}</p>
    </article>
  `).join("");
}

classSelect.addEventListener("change", showTopics);
showTopics();

const chatForm = document.getElementById("chatForm");
const questionInput = document.getElementById("question");
const messages = document.getElementById("messages");

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function getMathAnswer(question) {
  const q = question.toLowerCase().replace(/[?]/g, "").trim();

  if (q.includes("2x + 3 = 11") || q.includes("2x+3=11")) {
    return "Let's solve 2x + 3 = 11.\n\nStep 1: Subtract 3 from both sides.\n2x = 11 - 3\n2x = 8\n\nStep 2: Divide both sides by 2.\nx = 8 ÷ 2\n\nAnswer: x = 4.\n\nWell done! Try substituting 4 into the original equation to check your answer.";
  }

  if (q.includes("fraction")) {
    return "A fraction represents part of a whole.\n\nFor example, 1/2 means one part out of two equal parts.\n\nTry this: What is 1/2 + 1/2?";
  }

  if (q.includes("mean")) {
    return "The mean is the average of a group of numbers.\n\nExample: 2, 4 and 6.\n\nStep 1: Add the numbers: 2 + 4 + 6 = 12.\nStep 2: Divide by how many numbers there are: 12 ÷ 3 = 4.\n\nThe mean is 4.";
  }

  if (q.includes("algebra")) {
    return "Algebra uses letters to represent unknown numbers.\n\nExample: x + 3 = 7.\n\nSubtract 3 from both sides:\nx = 7 - 3\n\nTherefore, x = 4.";
  }

  return "Thanks for your question! I am currently running in demonstration mode, so I can explain a few sample Mathematics topics.\n\nTry asking:\n• How do I solve 2x + 3 = 11?\n• What is a fraction?\n• Explain mean in Mathematics.\n• What is algebra?\n\nA live AI connection will be added in a later development stage.";
}

chatForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const question = questionInput.value.trim();
  if (!question) return;

  addMessage(question, "user");
  questionInput.value = "";

  setTimeout(() => {
    addMessage(getMathAnswer(question), "bot");
  }, 500);
});

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-NG";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", function() {
    voiceStatus.textContent = "Listening... Speak now.";
    recognition.start();
  });

  recognition.onresult = function(event) {
    questionInput.value = event.results[0][0].transcript;
    voiceStatus.textContent = "Voice captured. Press Send.";
  };

  recognition.onerror = function() {
    voiceStatus.textContent = "Voice input failed. Please try typing.";
  };

  recognition.onend = function() {
    if (voiceStatus.textContent === "Listening... Speak now.") {
      voiceStatus.textContent = "Voice input ended.";
    }
  };
} else {
  voiceBtn.disabled = true;
  voiceStatus.textContent = "Voice input is not supported in this browser.";
}
