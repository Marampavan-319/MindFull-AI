"use strict";

// MindFull Carrier — navigation, career assessment, results, and rule-based helper.
const careerCards = document.querySelectorAll(".career-card");
const continueButton = document.querySelector("#continue-button");
const selectionTitle = document.querySelector("#selection-title");
const selectionMessage = document.querySelector("#selection-message");
const toast = document.querySelector("#toast");
const currentYear = document.querySelector("#current-year");
const homeScreen = document.querySelector("#home-screen");
const guidanceContent = document.querySelector("#guidance-content");
const partnershipScreen = document.querySelector("#partnership-screen");
const assessmentScreen = document.querySelector("#assessment-screen");
const viewButtons = document.querySelectorAll("[data-view]");
const navButtons = document.querySelectorAll(".header-nav [data-view]");
const assessmentTitle = document.querySelector("#assessment-title");
const assessmentIntro = document.querySelector("#assessment-intro");
const questionProgress = document.querySelector("#question-progress");
const progressFill = document.querySelector("#progress-fill");
const questionContainer = document.querySelector("#question-container");
const previousQuestionButton = document.querySelector("#previous-question");
const nextQuestionButton = document.querySelector("#next-question");
const showResultsButton = document.querySelector("#show-results");
const assessmentForm = document.querySelector("#assessment-form");
const formHint = document.querySelector("#form-hint");
const resultsPanel = document.querySelector("#results-panel");
const resultTitle = document.querySelector("#result-title");
const resultSummary = document.querySelector("#result-summary");
const recommendationList = document.querySelector("#recommendation-list");

let selectedCategory = null;
let currentQuestionIndex = 0;
let answers = {};
let toastTimer = null;

const categoryNames = {
  employment: "Employment",
  "higher-studies": "Higher Studies",
  "government-jobs": "Government Jobs",
  "college-career": "College Career",
  entrepreneurship: "Entrepreneurship"
};

const questionSets = {
  employment: [
    { question: "What would you most like from your first job?", options: ["Build practical technical or professional skills", "Have stability and a clear career ladder", "Solve real problems and work with people", "Explore different roles before specializing"] },
    { question: "Which work activity sounds most interesting?", options: ["Building or fixing things with technology", "Analyzing information and finding patterns", "Communicating, coordinating, or helping people", "Designing, creating, or presenting ideas"] },
    { question: "How do you prefer to learn a new skill?", options: ["Build a small project hands-on", "Follow a structured course", "Learn from a mentor or teammate", "Try tasks and learn from mistakes"] },
    { question: "What is your biggest current priority?", options: ["Getting my first internship or job", "Improving my technical skills", "Preparing a resume and interview answers", "Understanding which roles fit my interests"] },
    { question: "How much time can you spend preparing each week?", options: ["A few hours", "Around 5–10 hours", "10–20 hours", "More than 20 hours"] }
  ],
  "higher-studies": [
    { question: "What attracts you most to further study?", options: ["Deep expertise in a subject", "Better eligibility for specific careers", "Research and discovering new ideas", "Studying abroad or experiencing a new environment"] },
    { question: "Which learning style suits you best?", options: ["Theory and academic reading", "Projects and practical labs", "Research, experiments, and analysis", "A mix of theory and hands-on work"] },
    { question: "Have you identified a subject area yet?", options: ["Yes, I know my specialization", "I have two or three interests", "Not yet; I need to explore", "I want advice based on career outcomes"] },
    { question: "What should your next step focus on?", options: ["Comparing courses and colleges", "Preparing for entrance exams", "Exploring research opportunities", "Understanding fees, scholarships, and funding"] },
    { question: "What is your likely timeline?", options: ["I want to continue immediately", "Within the next year", "In two or more years", "I'm still deciding whether to study further"] }
  ],
  "government-jobs": [
    { question: "What appeals to you about government service?", options: ["Public service and community impact", "Job stability and structured progression", "A role connected to my degree or technical skills", "A specific department or type of work"] },
    { question: "What kind of exam preparation can you manage?", options: ["A short daily routine", "A consistent 1–2 hour daily plan", "Several focused hours per day", "I need help building a realistic routine"] },
    { question: "Which area would you like to explore?", options: ["Civil or administrative services", "Banking, railways, or staff selection exams", "Technical or engineering posts", "State-level or local government roles"] },
    { question: "How familiar are you with eligibility requirements?", options: ["I have checked age and qualification rules", "I know a little but need to verify details", "I haven't researched them yet", "I need help comparing exam options"] },
    { question: "What support would help most right now?", options: ["A syllabus and exam comparison", "A study timetable", "Practice questions and mock tests", "Help choosing which exam to target"] }
  ],
  "college-career": [
    { question: "What is your main goal during college?", options: ["Get an internship or placement", "Build projects and a strong portfolio", "Improve grades and subject foundations", "Explore different fields and discover my strengths"] },
    { question: "Which skill do you most want to improve?", options: ["Programming and problem-solving", "Communication and teamwork", "Web development or app building", "Research, data, or AI skills"] },
    { question: "What project stage are you at?", options: ["I haven't started one yet", "I have a basic project idea", "I've built something and want to improve it", "I want to publish and present my projects"] },
    { question: "How much time can you realistically set aside each week?", options: ["1–3 hours", "4–6 hours", "7–10 hours", "More than 10 hours"] },
    { question: "What would make the biggest difference this month?", options: ["A clear learning roadmap", "A project I can demonstrate", "Resume, GitHub, and interview practice", "A manageable routine and accountability"] }
  ],
  entrepreneurship: [
    { question: "What motivates you most about entrepreneurship?", options: ["Solving a problem people have", "Building something of my own", "Creating income or independence", "Turning a technical idea into a product"] },
    { question: "Do you have a business idea?", options: ["Yes, and I know the problem it solves", "I have a few ideas to compare", "I notice problems but need an idea", "I want to learn how to spot opportunities"] },
    { question: "What can you contribute first?", options: ["Technical skills or building a prototype", "Understanding customers and talking to people", "Organizing, marketing, or selling", "Time to research and learn before investing"] },
    { question: "What is your biggest uncertainty?", options: ["Whether people need the idea", "How to build the product", "How to find customers and market it", "Costs, pricing, and earning revenue"] },
    { question: "What would be a realistic first step?", options: ["Talk to potential users", "Create a small prototype", "Research competitors and alternatives", "Test a simple version with a few customers"] }
  ]
};

const recommendationSets = {
  employment: [
    ["Choose 2–3 target roles", "Compare the responsibilities and required skills for roles that interest you. Pick a small shortlist rather than applying randomly."],
    ["Build proof of skills", "Create one small project or work sample related to your target role, and write down what you contributed."],
    ["Prepare your application", "Update your resume, keep your GitHub or portfolio organized, and practise explaining a project in simple language."]
  ],
  "higher-studies": [
    ["Shortlist programs", "Compare course content, eligibility, location, fees, and outcomes for three programs that interest you."],
    ["Check entrance requirements", "Use official institution and exam websites to verify dates, eligibility, syllabi, and required documents."],
    ["Plan your preparation", "Set a weekly study routine and investigate scholarships or funding early if cost is a concern."]
  ],
  "government-jobs": [
    ["Pick a realistic exam target", "Compare eligibility, syllabus, exam stages, and typical preparation demands before committing to an exam."],
    ["Use official information", "Verify notifications, dates, age limits, and qualifications on the relevant official recruitment website."],
    ["Start a small routine", "Try a consistent study block with syllabus-based practice questions, revision, and a weekly mock test."]
  ],
  "college-career": [
    ["Choose one priority", "Pick one goal for the next four weeks—such as a project, coding practice, or interview preparation."],
    ["Make a demonstrable project", "Build a small, complete project, add a clear README, and explain the problem, tools, and what you learned."],
    ["Create a weekly rhythm", "Split time into learning, building, and reviewing. Keep the plan small enough to repeat during busy college weeks."]
  ],
  entrepreneurship: [
    ["Validate the problem", "Speak with a few people who might use your idea. Ask about their current problems before pitching your solution."],
    ["Build the smallest test", "Create a simple prototype, mock-up, or manual version that helps you test the main assumption."],
    ["Track costs and feedback", "Estimate basic costs, record what users say, and decide what to improve before investing significant money."]
  ]
};

currentYear.textContent = new Date().getFullYear();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function showView(view) {
  homeScreen.hidden = view !== "home";
  guidanceContent.hidden = view !== "guidance";
  partnershipScreen.hidden = view !== "partnership";
  assessmentScreen.hidden = true;
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

viewButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showView(button.dataset.view);
  });
});

function selectCategory(category) {
  selectedCategory = category;
  careerCards.forEach((card) => {
    const isSelected = card.dataset.category === category;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
  selectionTitle.textContent = categoryNames[category] + " — let's explore it together.";
  selectionMessage.textContent = "Continue to answer five questions tailored to this path.";
  continueButton.disabled = false;
}

careerCards.forEach((card) => card.addEventListener("click", () => selectCategory(card.dataset.category)));

function startAssessment() {
  if (!selectedCategory) {
    showToast("Choose a career path first.");
    return;
  }
  currentQuestionIndex = 0;
  answers = {};
  resultsPanel.hidden = true;
  assessmentForm.hidden = false;
  assessmentTitle.textContent = "Let's explore " + categoryNames[selectedCategory].toLowerCase() + ".";
  assessmentIntro.textContent = "Answer five short questions about your interests and preferences. There are no right or wrong answers.";
  guidanceContent.hidden = true;
  assessmentScreen.hidden = false;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  const questions = questionSets[selectedCategory];
  const item = questions[currentQuestionIndex];
  questionProgress.textContent = "Question " + (currentQuestionIndex + 1) + " of " + questions.length;
  progressFill.style.width = ((currentQuestionIndex + 1) / questions.length * 100) + "%";
  previousQuestionButton.disabled = currentQuestionIndex === 0;
  nextQuestionButton.hidden = currentQuestionIndex === questions.length - 1;
  showResultsButton.hidden = currentQuestionIndex !== questions.length - 1;
  formHint.textContent = answers[currentQuestionIndex] === undefined ? "Choose one answer to continue." : "Answer saved. You can change it before viewing your guidance.";
  formHint.classList.remove("error");

  const card = document.createElement("div");
  card.className = "question-card";
  const heading = document.createElement("h2");
  heading.textContent = item.question;
  card.appendChild(heading);
  const options = document.createElement("div");
  options.className = "answer-options";
  item.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "assessment-answer";
    radio.value = String(index);
    radio.checked = answers[currentQuestionIndex] === index;
    radio.addEventListener("change", () => {
      answers[currentQuestionIndex] = index;
      formHint.textContent = "Answer saved. You can change it before viewing your guidance.";
      formHint.classList.remove("error");
    });
    const text = document.createElement("span");
    text.textContent = option;
    label.append(radio, text);
    options.appendChild(label);
  });
  card.appendChild(options);
  questionContainer.replaceChildren(card);
}

function hasAnswerForCurrentQuestion() {
  if (answers[currentQuestionIndex] === undefined) {
    formHint.textContent = "Please choose one answer before continuing.";
    formHint.classList.add("error");
    return false;
  }
  return true;
}

continueButton.addEventListener("click", startAssessment);
nextQuestionButton.addEventListener("click", () => {
  if (!hasAnswerForCurrentQuestion()) return;
  currentQuestionIndex += 1;
  renderQuestion();
});
previousQuestionButton.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    renderQuestion();
  }
});
assessmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasAnswerForCurrentQuestion()) return;
  showResults();
});

function showResults() {
  const recommendations = recommendationSets[selectedCategory];
  const answerCount = Object.keys(answers).length;
  if (answerCount < questionSets[selectedCategory].length) {
    showToast("Please answer all five questions first.");
    return;
  }
  resultTitle.textContent = "Your " + categoryNames[selectedCategory] + " starting plan";
  resultSummary.textContent = "You've completed the reflection questions. Based on the path you chose, here are practical steps you can try next. Treat these as options to explore, not a final verdict about your future.";
  recommendationList.replaceChildren();
  recommendations.forEach(([title, description], index) => {
    const item = document.createElement("article");
    item.className = "recommendation-item";
    const heading = document.createElement("h3");
    heading.textContent = (index + 1) + ". " + title;
    const text = document.createElement("p");
    text.textContent = description;
    item.append(heading, text);
    recommendationList.appendChild(item);
  });
  assessmentForm.hidden = true;
  resultsPanel.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#back-to-paths").addEventListener("click", () => {
  assessmentScreen.hidden = true;
  guidanceContent.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelector("#retake-assessment").addEventListener("click", startAssessment);
document.querySelector("#change-path").addEventListener("click", () => {
  assessmentScreen.hidden = true;
  guidanceContent.hidden = false;
  window.scrollTo({ top: document.querySelector("#career-paths").offsetTop - 90, behavior: "smooth" });
});

// The hero anchor should remain useful when clicked.
document.querySelector(".hero-button").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#career-paths").scrollIntoView({ behavior: "smooth" });
});

// Simple rule-based chatbot: no external API or claim of live AI.
const chatToggle = document.querySelector("#chat-toggle");
const chatPanel = document.querySelector("#chat-panel");
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");

chatToggle.addEventListener("click", () => {
  const opening = chatPanel.hidden;
  chatPanel.hidden = !opening;
  chatToggle.setAttribute("aria-expanded", String(opening));
  if (opening) chatInput.focus();
});
document.querySelector("#close-chat").addEventListener("click", () => {
  chatPanel.hidden = true;
  chatToggle.setAttribute("aria-expanded", "false");
  chatToggle.focus();
});

function getChatReply(question) {
  const text = question.toLowerCase();
  if (/internship|intern|experience/.test(text)) return "Start by choosing one role or skill area. Build a small related project, prepare a one-page resume, and apply through company career pages and trusted internship platforms. Check each opportunity carefully before sharing personal information.";
  if (/resume|cv|portfolio|github/.test(text)) return "Keep your resume concise and truthful. Pin 2–3 projects, add a clear README to each repository, explain your own contribution, and include working demos when possible. Never list skills you cannot discuss in an interview.";
  if (/skill|learn|programming|coding|developer/.test(text)) return "Choose one target role and learn its core skills in small steps. Practise fundamentals, build a tiny project, explain your code aloud, and repeat. Consistent practice is usually more useful than collecting many unfinished courses.";
  if (/higher stud|master|m.?s.?|m.?tech|college|university|research/.test(text)) return "Compare programs by curriculum, eligibility, cost, faculty or research fit, and career outcomes. Verify requirements and deadlines on official institution websites before making decisions.";
  if (/government|govt|exam|civil service|banking|railway/.test(text)) return "First compare eligibility, syllabus, exam stages, and the time you can prepare. Use official recruitment notifications for dates and rules, then build a steady plan with revision and practice tests.";
  if (/business|entrepreneur|startup|customer|idea/.test(text)) return "Start with the problem, not just the product idea. Talk to potential users, check how they solve it today, test a small version, and estimate costs before making a large investment.";
  if (/confused|don't know|dont know|choose|career path|what should i do/.test(text)) return "It's okay not to know yet. Pick one small experiment: explore a role, speak to someone doing that work, or build a tiny project. Notice what interests you and what skills you want to practise next.";
  if (/hello|hi|hey/.test(text)) return "Hey! 👋 Tell me what you're exploring—jobs, college skills, government exams, higher studies, or a business idea—and I'll share a practical starting point.";
  return "I can help with basic guidance about internships, resumes and GitHub, learning skills, higher studies, government exams, and starting a business. Try asking about one of those topics. For exact deadlines, eligibility, or official rules, check the relevant official source.";
}

function addChatMessage(message, type) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + (type === "user" ? "user-bubble" : "bot-bubble");
  bubble.textContent = message;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  addChatMessage(question, "user");
  addChatMessage(getChatReply(question), "bot");
  chatInput.value = "";
  chatInput.focus();
});

console.log("MindFull Carrier Step 2 loaded successfully.");
