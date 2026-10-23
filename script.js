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
const historyScreen = document.querySelector("#history-screen");
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
const pageStorageKey = "mindfullCarrier.lastPage";
const pageReturnStorageKey = "mindfullCarrier.pageBeforeAuth";
const assessmentStateKey = "mindfullCarrier.assessmentState";

function saveCurrentPage(page) {
  try { localStorage.setItem(pageStorageKey, page); } catch (error) { /* Page still works if storage is disabled. */ }
}

function saveAssessmentState(resultsVisible = false) {
  try {
    localStorage.setItem(assessmentStateKey, JSON.stringify({
      selectedCategory,
      currentQuestionIndex,
      answers,
      resultsVisible
    }));
  } catch (error) { /* Assessment still works if storage is disabled. */ }
}

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
  saveCurrentPage(view);
  homeScreen.hidden = view !== "home";
  guidanceContent.hidden = view !== "guidance";
  partnershipScreen.hidden = view !== "partnership";
  assessmentScreen.hidden = true;
  mentorsScreen.hidden = true;
  historyScreen.hidden = view !== "history";
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  if (view === "history") renderHistory();
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
  saveCurrentPage("assessment");
  saveAssessmentState(false);
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
      saveAssessmentState(false);
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
  saveAssessmentState(false);
  renderQuestion();
});
previousQuestionButton.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    saveAssessmentState(false);
    renderQuestion();
  }
});
assessmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!hasAnswerForCurrentQuestion()) return;
  showResults();
});

const answerGuidance = {
  employment: [
    [
      ["Create a hands-on work sample", "Build a small project related to a role you want and document what you did."],
      ["Compare role stability and growth", "Review role responsibilities, entry requirements, and progression before choosing a target."],
      ["Practise teamwork examples", "Prepare examples of solving a problem with others and explaining your contribution."],
      ["Explore before specializing", "Compare two or three entry-level roles and note which tasks interest you most."]
    ],
    [
      ["Build a technical mini-project", "Choose a beginner-friendly project that demonstrates building or fixing something."],
      ["Practise data analysis", "Try a small dataset and explain the patterns or conclusions you discover."],
      ["Strengthen communication", "Practise explaining a concept clearly and collect examples of teamwork or helping others."],
      ["Create a creative portfolio piece", "Make one design, presentation, or product idea that shows your thinking."]
    ],
    [
      ["Learn by building", "Use a short tutorial, then build a small variation without copying every step."],
      ["Follow a structured course", "Choose one course with clear milestones and complete a small exercise after each topic."],
      ["Find feedback", "Ask a mentor, teacher, or peer to review your work and suggest one improvement."],
      ["Practise through experiments", "Try small tasks, note what failed, and record what you learned."]
    ],
    [
      ["Apply to a focused shortlist", "Prepare a truthful one-page resume and apply to suitable internships or entry-level roles."],
      ["Close one skill gap", "Compare target job descriptions and practise the most common missing skill."],
      ["Practise interview stories", "Prepare concise examples about a project, a challenge, and what you learned."],
      ["Explore role fit", "Read a few job descriptions and speak to someone in a role that interests you."]
    ],
    [
      ["Use a light weekly plan", "Set two short sessions each week and make the goal small enough to finish."],
      ["Schedule steady practice", "Plan 5–10 focused hours across the week and track completed tasks."],
      ["Create a deeper work block", "Use several focused sessions for learning, building, and review without skipping rest."],
      ["Set a measurable weekly target", "Choose a project milestone or number of applications that fits your actual schedule."]
    ]
  ],
  "higher-studies": [
    [
      ["Explore subject depth", "Compare advanced modules, faculty interests, and research areas in programs you like."],
      ["Connect study to career goals", "Check which qualifications are required for the careers you are considering."],
      ["Explore research opportunities", "Read recent papers or lab pages and note questions you would like to investigate."],
      ["Compare international options carefully", "Review recognition, total cost, language requirements, and visa rules through official sources."]
    ],
    [
      ["Strengthen theory foundations", "List prerequisite topics and create a revision plan before advanced coursework."],
      ["Compare lab and project facilities", "Review practical modules, capstone projects, and available facilities."],
      ["Look for research mentorship", "Identify faculty or research groups whose work matches your interests."],
      ["Balance theory and practice", "Compare programs using both course content and hands-on opportunities."]
    ],
    [
      ["Research your specialization", "Compare entry requirements and course modules for your chosen subject."],
      ["Narrow your shortlist", "Compare two or three subject areas by interest, prerequisites, and career options."],
      ["Explore before committing", "Take an introductory course and read program outlines before selecting a field."],
      ["Compare career outcomes", "Look at alumni outcomes and the skills employers or research programs expect."]
    ],
    [
      ["Build a program comparison", "Compare curriculum, eligibility, cost, location, and outcomes in one table."],
      ["Create an entrance-exam plan", "Verify the official syllabus and dates, then schedule topic practice and mock tests."],
      ["Contact research groups", "Read faculty pages and prepare a concise, thoughtful inquiry about research fit."],
      ["Investigate funding early", "Check scholarships, assistantships, fee waivers, and deadlines on official sites."]
    ],
    [
      ["Prepare for the next intake", "Make a document checklist and work backward from verified application deadlines."],
      ["Use the next year strategically", "Build prerequisites, prepare exams if needed, and gather application materials."],
      ["Plan a longer runway", "Use the time to improve foundations, explore research, and compare programs carefully."],
      ["Run a low-risk exploration", "Compare costs and career alternatives before deciding whether further study is right for you."]
    ]
  ],
  "government-jobs": [
    [
      ["Connect preparation to public service", "Research roles and departments whose responsibilities match the impact you want to make."],
      ["Compare stable career pathways", "Compare exam stages, posting patterns, eligibility, and career progression before selecting a target."],
      ["Explore technical recruitment", "Look for official technical or engineering recruitment notices that match your degree."],
      ["Compare specific departments", "Choose a few departments and verify their current eligibility and recruitment routes."]
    ],
    [
      ["Start with a short daily routine", "Build consistency with a manageable study block and one small revision target."],
      ["Use a structured daily timetable", "Divide study time between new topics, revision, and practice questions."],
      ["Plan intensive preparation sustainably", "Set weekly targets and include mock tests and rest to avoid burnout."],
      ["Test a realistic schedule", "Try a one-week routine and adjust it to your actual college, work, and family commitments."]
    ],
    [
      ["Explore civil-service requirements", "Read the official exam syllabus, stages, eligibility, and recent notifications."],
      ["Compare major exam options", "Compare syllabus overlap, stages, and eligibility for the exams you are considering."],
      ["Search for technical posts", "Check official public-sector and recruitment sites for posts aligned with your qualification."],
      ["Check state-level opportunities", "Verify current state recruitment notifications, language requirements, and eligibility."]
    ],
    [
      ["Verify your eligibility", "Check age, qualification, category rules where applicable, and dates in the official notification."],
      ["Confirm uncertain details", "Write down your eligibility questions and verify each one using the official notice."],
      ["Start with the official notification", "Read the eligibility section and syllabus before buying materials or planning preparation."],
      ["Compare before committing", "Create a side-by-side comparison of exam eligibility, syllabus, and stages."]
    ],
    [
      ["Compare syllabi", "Pick a target exam and map its official syllabus into weekly topics."],
      ["Build a study timetable", "Schedule new topics, revision, and a regular review of weak areas."],
      ["Practise with mock tests", "Use syllabus-aligned questions and review why each mistake happened."],
      ["Choose one primary target", "Compare your eligibility and interests, then choose one main exam to prepare for first."]
    ]
  ],
  "college-career": [
    [
      ["Prepare for internships", "Pick a target role, practise common fundamentals, and apply with a truthful resume."],
      ["Build a portfolio project", "Choose a project small enough to finish and explain clearly in a demonstration."],
      ["Strengthen academic foundations", "Identify two difficult subjects and schedule short revision and practice sessions."],
      ["Explore career options", "Try a mini-project or introductory lesson in two fields and compare your interest."]
    ],
    [
      ["Practise problem-solving", "Solve small coding problems regularly and explain the approach before writing code."],
      ["Practise communication", "Explain one project aloud each week and ask a friend for feedback."],
      ["Build a web or app project", "Create a simple working feature, test it, and document how it works."],
      ["Try a data or AI mini-project", "Start with a small dataset or beginner model and explain its limitations."]
    ],
    [
      ["Start with a tiny project", "Build one useful feature first instead of trying to create a large application at once."],
      ["Turn your idea into a plan", "Write the problem, intended user, core feature, and first three implementation tasks."],
      ["Improve an existing project", "Fix a bug, improve usability, and document what changed."],
      ["Publish and explain your work", "Add a README, screenshots or demo instructions, and a clear description of your contribution."]
    ],
    [
      ["Use a small weekly routine", "Schedule a few short sessions and finish one achievable milestone."],
      ["Plan four to six hours", "Split time between learning, implementation, and reviewing what you built."],
      ["Reserve project blocks", "Set aside focused time for building and a separate session for debugging and notes."],
      ["Set a stretch goal", "Choose one measurable weekly deliverable while protecting college and rest time."]
    ],
    [
      ["Create a simple roadmap", "Choose one goal and break it into weekly tasks with a clear finish line."],
      ["Finish a demonstrable project", "Prioritize a working project over starting several projects at once."],
      ["Polish your profile", "Improve your resume, GitHub README files, and short project explanations."],
      ["Build a sustainable routine", "Use a repeatable weekly plan and review progress every weekend."]
    ]
  ],
  entrepreneurship: [
    [
      ["Start with a real customer problem", "Interview a few people about a problem they already face before choosing a solution."],
      ["Shape your idea into a small offer", "Describe who it helps, what it does, and why someone might choose it over alternatives."],
      ["Test a simple income idea", "Explore a low-cost service or product and check whether people would realistically pay for it."],
      ["Explore a technical prototype", "Define the one core feature that would let someone experience your product idea."]
    ],
    [
      ["Validate the problem first", "Ask potential users how they currently handle the problem and what frustrates them."],
      ["Compare ideas with evidence", "List your ideas, the users they serve, and the easiest low-cost test for each."],
      ["Find problems worth solving", "Observe repeated inconveniences in a community or industry and ask people about their current workarounds."],
      ["Research before investing", "Study existing solutions, likely users, and the smallest way to test demand without a large spend."]
    ],
    [
      ["Build a basic prototype", "Use your current skills to create a clickable mock-up or minimum working version of the main feature."],
      ["Talk to potential customers", "Practise asking open questions and listen for repeated needs instead of pitching immediately."],
      ["Test a simple sales channel", "Try a small, low-cost way to reach potential customers and record what gets a response."],
      ["Start with research and a budget", "Estimate basic costs and validate demand before committing money or buying tools."]
    ],
    [
      ["Test whether demand exists", "Talk to potential users and offer a simple mock-up or description to learn whether the problem matters."],
      ["Reduce technical risk", "Build the smallest prototype that tests the hardest technical assumption."],
      ["Find your first customers", "Describe your ideal customer and test one suitable outreach or marketing channel."],
      ["Work out the numbers", "Estimate costs, a realistic price, and how many sales you would need to cover expenses."]
    ],
    [
      ["Run customer conversations", "Speak with a few target users and summarize the problems that appear repeatedly."],
      ["Build a minimum viable prototype", "Create only the core feature needed to test whether the idea solves the problem."],
      ["Research alternatives", "Compare existing products, prices, customer complaints, and gaps you may be able to serve."],
      ["Run a small pilot", "Test with a few real users, collect feedback, and track whether they would use or pay for it again."]
    ]
  ]
};

function getPersonalizedRecommendations() {
  const guidance = answerGuidance[selectedCategory];
  // Every answer contributes one matching next step to the user's plan.
  return questionSets[selectedCategory].map((question, questionIndex) => {
    const answerIndex = answers[questionIndex];
    const optionsForQuestion = guidance[questionIndex];
    if (answerIndex === undefined || !optionsForQuestion || !optionsForQuestion[answerIndex]) {
      return ["Review this priority", "Revisit this question and choose the option that best matches your current situation."];
    }
    return optionsForQuestion[answerIndex];
  });
}

function showResults() {
  const answerCount = Object.keys(answers).length;
  if (answerCount < questionSets[selectedCategory].length) {
    showToast("Please answer all five questions first.");
    return;
  }
  const recommendations = getPersonalizedRecommendations();
  resultTitle.textContent = "Your " + categoryNames[selectedCategory] + " starting plan";
  resultSummary.textContent = "These next steps are tailored to your answers about your current situation and priorities. Change your answers to explore a different plan.";
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
  saveCurrentPage("assessment");
  saveAssessmentState(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#back-to-paths").addEventListener("click", () => {
  saveCurrentPage("guidance");
  assessmentScreen.hidden = true;
  guidanceContent.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelector("#retake-assessment").addEventListener("click", startAssessment);
document.querySelector("#change-path").addEventListener("click", () => {
  saveCurrentPage("guidance");
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

let pendingChatFollowUp = null;
let chatContext = { topic: null, goal: null };

function getFollowUpReply(text) {
  if (!pendingChatFollowUp) return null;

  const pending = pendingChatFollowUp;
  const normalized = text.toLowerCase().trim();
  let reply = null;

  if (pending === "roadmap-goal") {
    if (/intern|job|employment|placement|interview/.test(normalized)) {
      chatContext = { topic: "roadmap", goal: "job or internship" };
      reply = "Great—your job/internship roadmap is: (1) choose one target role, (2) identify 3 skills from real job descriptions, (3) build or polish one relevant project, (4) prepare a one-page resume and project explanation, and (5) apply to a small, relevant shortlist each week. Which role are you targeting?";
      pendingChatFollowUp = "target-role";
    } else if (/skill|project|coding|program|web|python|sql|portfolio/.test(normalized)) {
      chatContext = { topic: "roadmap", goal: "skills and projects" };
      reply = "Let's focus on skills and projects: pick one skill, practise it for 30–45 minutes a day, build one small project using it, test the main feature, and document what you learned. Which skill do you want to focus on first—web development, Python, SQL, or something else?";
      pendingChatFollowUp = "skill-focus";
    } else if (/higher|study|master|research|m.?tech|m.?s\b/.test(normalized)) {
      chatContext = { topic: "roadmap", goal: "higher studies" };
      reply = "For higher studies, start by choosing a subject area, compare 3 programs by curriculum and eligibility, verify entrance requirements on official sites, and make a preparation/funding plan. Which subject or specialization interests you?";
      pendingChatFollowUp = "study-field";
    } else if (/government|govt|exam|civil|bank|railway/.test(normalized)) {
      chatContext = { topic: "roadmap", goal: "government exams" };
      reply = "For government exams, shortlist exams that match your qualification, verify age and eligibility from official notifications, map the syllabus, and start a steady routine with practice and revision. Which exam or job category are you considering?";
      pendingChatFollowUp = "exam-target";
    } else if (/business|entrepreneur|startup|own|company/.test(normalized)) {
      chatContext = { topic: "roadmap", goal: "entrepreneurship" };
      reply = "For entrepreneurship, identify one real customer problem, talk to 3–5 potential users, compare existing solutions, test a tiny version, and estimate costs before investing. What problem or business idea are you thinking about?";
      pendingChatFollowUp = "business-idea";
    }
  } else if (pending === "target-role") {
    if (normalized.length >= 2) {
      reply = "For " + text.trim() + ", review 3–5 job descriptions and list repeated skills, practise the most important fundamentals, make one project that demonstrates them, and prepare a clear explanation of your contribution. Tell me your current skill level if you'd like a realistic weekly plan.";
    }
  } else if (pending === "skill-focus") {
    if (normalized.length >= 2) {
      reply = "Good choice. For " + text.trim() + ", start with the fundamentals, practise one small exercise each session, then build a mini-project that uses the skill. Keep notes on errors and explain your solution aloud. What is your current level: beginner, comfortable with basics, or intermediate?";
      pendingChatFollowUp = "skill-level";
    }
  } else if (pending === "skill-level") {
    if (/beginner|basic|start|new/.test(normalized)) {
      reply = "Since you're starting out, spend the first few sessions on core concepts and tiny exercises before attempting a full project. Then build one feature at a time and test it. A manageable first milestone is a small working demo within a week.";
    } else if (/intermediate|comfortable|know the basics|basics/.test(normalized)) {
      reply = "Since you know the basics, avoid repeating beginner tutorials for too long. Build a small end-to-end project, look up concepts only when needed, test edge cases, and publish a README explaining your decisions.";
    } else if (normalized.length >= 2) {
      reply = "Start with a short diagnostic: try one beginner exercise without a tutorial. If you can explain and adapt it, move to a mini-project; otherwise revise the specific concept you got stuck on.";
    }
  } else if (pending === "internship-role") {
    if (normalized.length >= 2) {
      reply = "For a " + text.trim() + " internship, focus on the fundamentals named in the role, prepare one relevant project story, practise explaining a bug you solved, and tailor your resume to the requirements. Do you want technical questions or a mock interview first?";
      pendingChatFollowUp = "interview-mode";
    }
  } else if (pending === "interview-mode") {
    if (/mock|interview|practice|questions|technical/.test(normalized)) {
      reply = /mock/.test(normalized) ? "Let's begin a mock interview. First question: introduce yourself in 45–60 seconds and connect your current skills or projects to the role. Reply with your answer and I'll give feedback." : "Start with these: (1) explain one project end-to-end, (2) describe a difficult bug and how you debugged it, (3) explain the core concepts required for the role, and (4) say what you would learn next. Practise answering each aloud in under two minutes.";
    }
  } else if (pending === "project-area") {
    if (/web|frontend|html|css|javascript|website/.test(normalized)) {
      reply = "Try a task tracker: add tasks, mark them complete, delete them, and save them in local storage. Build the interface first, then wire up each action and test empty input and refresh behaviour.";
    } else if (/python|data|csv/.test(normalized)) {
      reply = "Try a Python CSV report tool: load a CSV file, count rows and missing values, calculate simple summaries, and export a short report. Start with a small sample file and handle invalid or empty files.";
    } else if (/sql|database|mysql/.test(normalized)) {
      reply = "Try a student-course database with Students, Courses, and Enrollments tables. Add primary/foreign keys, sample rows, and queries using JOIN, GROUP BY, and constraints. Include a README with the schema and example outputs.";
    } else if (/ai|machine learning|ml|sentiment/.test(normalized)) {
      reply = "Try a small sentiment explorer: let a user enter text, classify it with a simple baseline or a clearly disclosed model, and show limitations with example cases. Focus on transparent behaviour and testing rather than claiming perfect accuracy.";
    } else if (normalized.length >= 2) {
      reply = "Choose a project small enough to finish in a few days. Define one user problem, implement one complete feature, test normal and edge cases, then write a README with screenshots and what you learned.";
    }
  } else if (pending === "career-interest") {
    if (/build|code|technology|technical|program|software|web|ai|data/.test(normalized)) {
      reply = "A practical experiment is to build a small project in the technical area you mentioned. Notice whether you enjoy solving bugs and improving it, then compare that feeling with a second activity such as analysing data or collaborating on a team task.";
    } else if (/people|help|communicat|team|service/.test(normalized)) {
      reply = "Try a role or project involving collaboration, support, teaching, coordination, or community impact. Afterward, reflect on whether you enjoyed explaining, organizing, and working with people—and compare that with one independent task.";
    } else if (/business|sell|customer|entrepreneur|own/.test(normalized)) {
      reply = "Try validating a small business problem: talk to a few potential customers, ask how they solve it today, and write down what they would value. Don't invest heavily until you have evidence that the problem matters.";
    } else if (/research|theory|study|academic|exam/.test(normalized)) {
      reply = "Try a short structured learning or research task: study one topic, summarize it in your own words, and solve a few related problems. This can help you judge whether you enjoy deeper study and exam-style preparation.";
    } else if (normalized.length >= 2) {
      reply = "Let's compare your interests with a small experiment: choose one activity you enjoy, one skill you're willing to practise, and one real-world task to try this week. Then judge the path by evidence, not pressure to decide immediately.";
    }
  } else if (pending === "study-field" || pending === "exam-target" || pending === "business-idea") {
    if (normalized.length >= 2) {
      reply = "Thanks—that gives us a starting point. Write down your next three actions, verify important requirements using official sources where relevant, and set a small milestone for this week. If you share your timeline and current level, I can help make the plan more specific.";
    }
  }

  if (reply) {
    // Keep a newly requested follow-up; otherwise clear the completed one.
    if (pendingChatFollowUp === pending) pendingChatFollowUp = null;
    return reply;
  }

  return null;
}

function getChatReply(question) {
  const text = question.toLowerCase();
  const pathContext = selectedCategory
    ? " Since you last selected " + categoryNames[selectedCategory] + ", you can use that as your current focus—or explore another path if your interests have changed."
    : "";

  const followUpReply = getFollowUpReply(question);
  if (followUpReply) return followUpReply;

  if (/roadmap|plan my career|career plan|where do i start/.test(text)) {
    pendingChatFollowUp = "roadmap-goal";
    chatContext.topic = "roadmap";
    return "Let's make this useful for your situation. What do you want the roadmap to focus on: a job/internship, skills and projects, higher studies, government exams, or entrepreneurship?";
  }
  if (/interview|internship prep|prepare for an internship/.test(text)) {
    pendingChatFollowUp = "internship-role";
    chatContext.topic = "internship";
    return "Let's tailor your preparation. Which role are you preparing for—for example, frontend developer, full-stack developer, Python developer, data analyst, or another role?";
  }
  if (/project idea|project ideas|practical project|build a project/.test(text)) {
    pendingChatFollowUp = "project-area";
    chatContext.topic = "project";
    return "Sure! Which area interests you most: web development, Python/data, SQL/database, or AI/ML? I'll suggest a project with a practical first milestone.";
  }
  if (/choose between|help me choose|career path|which career|confused|don't know|dont know/.test(text)) {
    pendingChatFollowUp = "career-interest";
    chatContext.topic = "career-choice";
    return "Let's narrow it down together. Which activities do you enjoy most: building or coding, analysing information, working with people, research/study, or business and selling? You can name more than one.";
  }
  if (/free resource|free course|learn for free|resources/.test(text)) {
    return "For free learning, start with official documentation and structured beginner material: MDN Web Docs for web development, the Python Tutorial at docs.python.org for Python, and SQLBolt for interactive SQL practice. Prefer one resource at a time, practise as you learn, and verify course or exam details on official sites.";
  }
  if (/internship|intern\b|experience/.test(text)) {
    pendingChatFollowUp = "internship-role";
    chatContext.topic = "internship";
    return "I can help with that. Which role are you targeting—frontend, full-stack, Python, data analysis, or something else?";
  }
  if (/resume|cv|portfolio|github/.test(text)) return "Keep your resume concise and truthful. Pin 2–3 projects, add a clear README to each repository, explain your own contribution, and include working demos when possible. Never list skills you cannot discuss in an interview.";
  if (/skill|learn|programming|coding|developer/.test(text)) {
    pendingChatFollowUp = "skill-focus";
    chatContext.topic = "skills";
    return "Let's make a practical learning plan. Which skill do you want to focus on first—web development, Python, SQL, communication, or something else?";
  }
  if (/higher stud|master|m.?s.?|m.?tech|college|university|research/.test(text)) {
    pendingChatFollowUp = "study-field";
    chatContext.topic = "higher-studies";
    return "What subject or specialization are you considering? I can help you outline what to compare and how to start preparing.";
  }
  if (/government|govt|exam|civil service|banking|railway/.test(text)) {
    pendingChatFollowUp = "exam-target";
    chatContext.topic = "government-exams";
    return "Which government exam or job category are you considering? If you're unsure, tell me your qualification and the type of work you prefer.";
  }
  if (/business|entrepreneur|startup|customer|idea/.test(text)) {
    pendingChatFollowUp = "business-idea";
    chatContext.topic = "entrepreneurship";
    return "Do you already have a business idea, or would you like help finding a problem worth solving?";
  }
  if (/hello|hi\b|hey/.test(text)) return "Hey! 👋 Tell me what you're exploring—jobs, college skills, government exams, higher studies, or a business idea—and I'll share a practical starting point.";
  return "I can help with career roadmaps, interview preparation, project ideas, resumes and GitHub, learning skills, higher studies, government exams, and entrepreneurship. Ask me about one specific goal and I'll suggest a practical next step." + pathContext;
}
function addChatMessage(message, type) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + (type === "user" ? "user-bubble" : "bot-bubble");
  bubble.textContent = message;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function sendChatQuestion(question) {
  const cleanedQuestion = question.trim();
  if (!cleanedQuestion) return;
  addChatMessage(cleanedQuestion, "user");
  addChatMessage(getChatReply(cleanedQuestion), "bot");
  chatInput.value = "";
  chatInput.focus();
}

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatQuestion(chatInput.value);
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendChatQuestion(button.dataset.prompt));
});


/* Step 3: mentor discovery, simulated session requests, and local persistence. */
const mentorsScreen = document.querySelector("#mentors-screen");
const bookingPanel = document.querySelector("#booking-panel");
const bookingForm = document.querySelector("#booking-form");
const bookingConfirmation = document.querySelector("#booking-confirmation");
const bookingDate = document.querySelector("#booking-date");
const bookingDuration = document.querySelector("#booking-duration");
const bookingPrice = document.querySelector("#booking-price");
const bookingMentorSummary = document.querySelector("#booking-mentor-summary");
const bookingConfirmationText = document.querySelector("#booking-confirmation-text");
const bookingConfirmationTitle = document.querySelector("#booking-confirmation-title");
const paymentCountdown = document.querySelector("#payment-countdown");
const completeDemoPaymentButton = document.querySelector("#complete-demo-payment");
const savedBookingsSection = document.querySelector("#saved-bookings");
const savedBookingsList = document.querySelector("#saved-bookings-list");
const bookingStorageKey = "mindfullCarrier.demoMentorRequests";
const mentorProfiles = {
  alex: { name: "Alex Rivera", specialty: "Frontend and full-stack development" },
  samira: { name: "Samira Khan", specialty: "Python, data analysis, and AI projects" },
  jordan: { name: "Jordan Miles", specialty: "Resume, communication, and interviews" },
  dev: { name: "Dev Patel", specialty: "Higher studies and research planning" }
};
let chosenMentorId = null;

function showHistory() {
  saveCurrentPage("history");
  homeScreen.hidden = true;
  guidanceContent.hidden = true;
  assessmentScreen.hidden = true;
  partnershipScreen.hidden = true;
  mentorsScreen.hidden = true;
  historyScreen.hidden = false;
  renderHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMentors() {
  saveCurrentPage("mentors");
  homeScreen.hidden = true;
  guidanceContent.hidden = true;
  assessmentScreen.hidden = true;
  partnershipScreen.hidden = true;
  historyScreen.hidden = true;
  mentorsScreen.hidden = false;
  bookingPanel.hidden = true;
  bookingForm.hidden = false;
  bookingConfirmation.hidden = true;
  renderSavedBookings();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function readSavedBookings() {
  try {
    const stored = localStorage.getItem(bookingStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    showToast("Saved requests are unavailable in this browser session.");
    return [];
  }
}

function removeExpiredUnpaidBookings() {
  const now = Date.now();
  const bookings = readSavedBookings();
  let changed = false;
  bookings.forEach((booking) => {
    if (booking.status === "pending" && Number(booking.expiresAt) <= now) {
      booking.status = "expired";
      booking.expiredAt = now;
      changed = true;
    }
  });
  if (changed) {
    try { localStorage.setItem(bookingStorageKey, JSON.stringify(bookings)); } catch (error) { /* Recheck expiry on the next visit if storage is unavailable. */ }
  }
  return bookings;
}

function renderHistory() {
  const list = document.querySelector("#history-list");
  const empty = document.querySelector("#history-empty");
  const count = document.querySelector("#history-count");
  if (!list || !empty || !count) return;
  const bookings = removeExpiredUnpaidBookings().sort((a, b) => Number(b.createdAt || b.id || 0) - Number(a.createdAt || a.id || 0));
  list.replaceChildren();
  count.textContent = bookings.length + (bookings.length === 1 ? " request" : " requests");
  empty.hidden = bookings.length > 0;
  bookings.forEach((booking) => {
    const item = document.createElement("article");
    item.className = "history-item";
    const top = document.createElement("div");
    top.className = "history-item-top";
    const title = document.createElement("h2");
    title.textContent = (booking.mentor || "Mentor request") + " · " + (booking.duration || "—") + " minutes";
    const status = document.createElement("span");
    const state = booking.status === "paid" ? "paid" : booking.status === "pending" ? "pending" : "expired";
    status.className = "history-status history-status-" + state;
    status.textContent = state === "paid" ? "Demo payment completed" : state === "pending" ? "Payment pending" : "Payment window expired";
    top.append(title, status);
    const details = document.createElement("div");
    details.className = "history-item-details";
    const fee = document.createElement("p");
    fee.textContent = "Demo fee: ₹" + (booking.price || 0) + " · " + (booking.date || "Date not set") + (booking.time ? " at " + booking.time : "");
    const goal = document.createElement("p");
    goal.textContent = "Goal: " + (booking.goal || "Not provided");
    const created = document.createElement("p");
    created.textContent = "Request saved: " + (booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "Previously saved");
    const note = document.createElement("p");
    note.className = "history-item-note";
    note.textContent = state === "paid"
      ? "Demo only: no real money was charged and no appointment was booked."
      : state === "pending"
        ? "Finish the demo payment before the countdown ends. Unpaid requests become expired and remain visible here."
        : "No demo payment was completed before the deadline. This request is kept in your history.";
    details.append(fee, goal, created, note);
    item.append(top, details);
    list.appendChild(item);
  });
}

function renderSavedBookings() {
  const bookings = removeExpiredUnpaidBookings().filter((booking) => booking.status === "paid");
  savedBookingsList.replaceChildren();
  savedBookingsSection.hidden = bookings.length === 0;
  bookings.forEach((booking) => {
    const item = document.createElement("article");
    item.className = "saved-booking-item";
    const title = document.createElement("h3");
    title.textContent = booking.mentor + " · " + booking.duration + " minutes · ₹" + booking.price;
    const date = document.createElement("p");
    date.textContent = "Preferred time: " + booking.date + " at " + booking.time;
    const goal = document.createElement("p");
    goal.textContent = "Goal: " + booking.goal;
    const status = document.createElement("p");
    status.textContent = "Status: Demo payment completed · No real money charged";
    item.append(title, date, goal, status);
    savedBookingsList.appendChild(item);
  });
}

function chooseMentor(mentorId) {
  if (!mentorProfiles[mentorId]) return;
  chosenMentorId = mentorId;
  const mentor = mentorProfiles[mentorId];
  bookingMentorSummary.textContent = mentor.name + " · " + mentor.specialty;
  bookingPanel.hidden = false;
  bookingForm.hidden = false;
  bookingConfirmation.hidden = true;
  bookingForm.reset();
  updateBookingPrice();
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  bookingDate.min = localToday;
  bookingDate.value = localToday;
  bookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#booking-name").focus({ preventScroll: true });
}

function updateBookingPrice() {
  if (!bookingDuration || !bookingPrice) return;
  const prices = { 30: 299, 60: 499 };
  bookingPrice.textContent = "₹" + (prices[Number(bookingDuration.value)] || prices[30]);
}
bookingDuration.addEventListener("change", updateBookingPrice);
updateBookingPrice();

document.querySelector("#find-mentor").addEventListener("click", showMentors);
document.querySelector("#back-to-guidance").addEventListener("click", () => {
  saveCurrentPage("guidance");
  mentorsScreen.hidden = true;
  guidanceContent.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelectorAll("[data-mentor]").forEach((button) => {
  button.addEventListener("click", () => chooseMentor(button.dataset.mentor));
});
document.querySelector("#cancel-booking").addEventListener("click", () => {
  bookingPanel.hidden = true;
  chosenMentorId = null;
  document.querySelector("#mentor-grid").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#new-booking").addEventListener("click", () => {
  if (paymentCountdownInterval) window.clearInterval(paymentCountdownInterval);
  paymentCountdownInterval = null;
  activePendingBookingId = null;
  bookingConfirmation.hidden = true;
  bookingForm.hidden = false;
  bookingForm.reset();
  chosenMentorId = null;
  bookingPanel.hidden = true;
  document.querySelector("#mentor-grid").scrollIntoView({ behavior: "smooth", block: "start" });
});
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!chosenMentorId || !mentorProfiles[chosenMentorId]) {
    showToast("Choose a mentor before saving a request.");
    return;
  }
  if (!bookingForm.reportValidity()) return;
  const mentor = mentorProfiles[chosenMentorId];
  const booking = {
    id: Date.now(),
    mentor: mentor.name,
    specialty: mentor.specialty,
    name: document.querySelector("#booking-name").value.trim(),
    email: document.querySelector("#booking-email").value.trim(),
    duration: Number(document.querySelector("#booking-duration").value),
    price: Number(document.querySelector("#booking-duration").value) === 60 ? 499 : 299,
    date: bookingDate.value,
    time: document.querySelector("#booking-time").value,
    goal: document.querySelector("#booking-goal").value.trim(),
    status: "simulated"
  };
  if (!booking.name || !booking.email || !booking.goal || !booking.date || !booking.time) {
    showToast("Please complete every field before saving.");
    return;
  }
  booking.createdAt = Date.now();
  booking.expiresAt = booking.createdAt + 20 * 60 * 1000;
  booking.status = "pending";
  const bookings = readSavedBookings().filter((saved) => saved.status === "paid");
  bookings.unshift(booking);
  try {
    localStorage.setItem(bookingStorageKey, JSON.stringify(bookings.slice(0, 20)));
  } catch (error) {
    showToast("Your browser could not save this request. Check storage settings and try again.");
    return;
  }
  bookingForm.hidden = true;
  bookingConfirmation.hidden = false;
  bookingConfirmationTitle.textContent = "Complete your demo payment";
  bookingConfirmationText.textContent = "Your request for " + booking.mentor + " on " + booking.date + " at " + booking.time + " is pending. Demo fee: ₹" + booking.price + ". Complete the demo payment within 20 minutes to keep it in your paid history.";
  completeDemoPaymentButton.hidden = false;
  startPaymentCountdown(booking.id);
  bookingConfirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
let paymentCountdownInterval = null;
let activePendingBookingId = null;

function findPendingBooking(id) {
  return readSavedBookings().find((booking) => booking.id === id && booking.status === "pending");
}

function expirePendingBooking(id) {
  const remaining = readSavedBookings();
  const expired = remaining.find((booking) => booking.id === id && booking.status === "pending");
  if (expired) {
    expired.status = "expired";
    expired.expiredAt = Date.now();
  }
  try { localStorage.setItem(bookingStorageKey, JSON.stringify(remaining)); } catch (error) { /* The expiry is checked again when the page next loads. */ }
  if (paymentCountdownInterval) window.clearInterval(paymentCountdownInterval);
  paymentCountdownInterval = null;
  activePendingBookingId = null;
  paymentCountdown.textContent = "Time expired. This unpaid request is now marked expired in your history.";
  paymentCountdown.classList.remove("is-paid");
  paymentCountdown.classList.add("is-expired");
  bookingConfirmationTitle.textContent = "Payment window expired";
  bookingConfirmationText.textContent = "The 20-minute window ended before the demo payment was completed. The request remains in your history as expired.";
  completeDemoPaymentButton.hidden = true;
  renderSavedBookings();
  renderHistory();
}

function startPaymentCountdown(id) {
  if (paymentCountdownInterval) window.clearInterval(paymentCountdownInterval);
  activePendingBookingId = id;
  paymentCountdown.classList.remove("is-expired", "is-paid");
  function tick() {
    const booking = findPendingBooking(id);
    if (!booking) {
      if (paymentCountdownInterval) window.clearInterval(paymentCountdownInterval);
      paymentCountdownInterval = null;
      return;
    }
    const remainingMs = Number(booking.expiresAt) - Date.now();
    if (remainingMs <= 0) {
      expirePendingBooking(id);
      return;
    }
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    paymentCountdown.textContent = "Time left to complete demo payment: " + minutes + ":" + seconds;
  }
  tick();
  paymentCountdownInterval = window.setInterval(tick, 1000);
}

completeDemoPaymentButton.addEventListener("click", () => {
  // Demo-account users must sign in or create a personal account before continuing to payment.
  let currentSession = null;
  try {
    currentSession = JSON.parse(localStorage.getItem(authSessionKey) || "null");
  } catch (error) {
    currentSession = null;
  }
  if (currentSession && currentSession.demo) {
    try {
      localStorage.setItem(pageReturnStorageKey, "mentors");
      localStorage.setItem(pageStorageKey, "auth");
      localStorage.removeItem(authSessionKey);
    } catch (error) { /* Keep the sign-in gate visible even if storage is unavailable. */ }
    authScreen.hidden = false;
    signoutButton.hidden = true;
    showAuthMode("signin");
    setAuthFeedback(signinFeedback, "To continue with payment, please sign in to your account or create a new account. Demo accounts cannot complete payments.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (!activePendingBookingId) return;
  const bookings = readSavedBookings();
  const booking = bookings.find((saved) => saved.id === activePendingBookingId && saved.status === "pending");
  if (!booking) return;
  if (Date.now() >= Number(booking.expiresAt)) {
    expirePendingBooking(booking.id);
    return;
  }
  booking.status = "paid";
  booking.paidAt = Date.now();
  try {
    localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
  } catch (error) {
    showToast("Could not save the demo payment status. Please try again.");
    return;
  }
  if (paymentCountdownInterval) window.clearInterval(paymentCountdownInterval);
  paymentCountdownInterval = null;
  activePendingBookingId = null;
  paymentCountdown.textContent = "Demo payment completed in time. This request is now kept in your history.";
  paymentCountdown.classList.remove("is-expired");
  paymentCountdown.classList.add("is-paid");
  bookingConfirmationTitle.textContent = "Demo payment successful!";
  bookingConfirmationText.textContent = "Your simulated payment of ₹" + booking.price + " is marked complete. No real money was charged and no real appointment was booked.";
  completeDemoPaymentButton.hidden = true;
  renderSavedBookings();
  renderHistory();
});

document.querySelector("#clear-bookings").addEventListener("click", () => {
  try {
    localStorage.removeItem(bookingStorageKey);
    renderSavedBookings();
    renderHistory();
    showToast("Saved demo requests cleared.");
  } catch (error) {
    showToast("Could not clear saved requests in this browser.");
  }
});

// Mark unpaid requests as expired when their payment window ends; keep them in history.
removeExpiredUnpaidBookings();
// Keep expiry enforcement active even if the user closes the confirmation panel or starts another request.
window.setInterval(removeExpiredUnpaidBookings, 1000);
console.log("MindFull Carrier Step 3 loaded successfully.");


document.querySelector("#history-refresh").addEventListener("click", () => {
  renderHistory();
  showToast("History refreshed.");
});
document.querySelector("#history-find-mentor").addEventListener("click", showMentors);
document.querySelector("#history-clear").addEventListener("click", () => {
  const confirmed = window.confirm("Clear all mentor request history saved in this browser? This cannot be undone.");
  if (!confirmed) return;
  try {
    localStorage.removeItem(bookingStorageKey);
    renderHistory();
    renderSavedBookings();
    showToast("History cleared from this device.");
  } catch (error) {
    showToast("Could not clear history in this browser.");
  }
});

/* Authentication MVP: browser-local demo accounts only, not production security. */
const authScreen = document.querySelector("#auth-screen");
const signinTab = document.querySelector("#signin-tab");
const signupTab = document.querySelector("#signup-tab");
const signinForm = document.querySelector("#signin-form");
const signupForm = document.querySelector("#signup-form");
const authTitle = document.querySelector("#auth-title");
const authSubtitle = document.querySelector("#auth-subtitle");
const signinFeedback = document.querySelector("#signin-feedback");
const signupFeedback = document.querySelector("#signup-feedback");
const demoAccountButton = document.querySelector("#demo-account-button");
const signoutButton = document.querySelector("#signout-button");
const signedInLabel = document.querySelector("#signed-in-label");
const authAccountsKey = "mindfullCarrier.prototypeAccounts";
const authSessionKey = "mindfullCarrier.prototypeSession";

function readAuthAccounts() {
  try {
    const value = JSON.parse(localStorage.getItem(authAccountsKey) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

async function hashAuthPassword(password) {
  if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
    throw new Error("Password hashing is unavailable here. Open the deployed HTTPS site or a modern local server.");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setAuthFeedback(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle("success", success);
}

function showAuthMode(mode) {
  const signup = mode === "signup";
  signinForm.hidden = signup;
  signupForm.hidden = !signup;
  signinTab.classList.toggle("active", !signup);
  signupTab.classList.toggle("active", signup);
  signinTab.setAttribute("aria-selected", String(!signup));
  signupTab.setAttribute("aria-selected", String(signup));
  authTitle.textContent = signup ? "Create your account" : "Welcome back";
  authSubtitle.textContent = signup ? "Start your career journey with MindFull Carrier." : "Sign in to pick up where you left off.";
  setAuthFeedback(signinFeedback, "");
  setAuthFeedback(signupFeedback, "");
}

function enterApplication(user, isDemo = false) {
  const session = {
    name: user.name || "Demo User",
    email: user.email || "demo@mindfullcarrier.local",
    demo: Boolean(isDemo),
    signedInAt: Date.now()
  };
  try {
    localStorage.setItem(authSessionKey, JSON.stringify(session));
  } catch (error) {
    // Keep the current visit usable if storage is disabled.
  }
  authScreen.hidden = true;
  signoutButton.hidden = false;
  signedInLabel.textContent = "Hi, " + session.name.split(" ")[0];
  let nextPage = "home";
  try {
    nextPage = localStorage.getItem(pageStorageKey) || "home";
    if (nextPage === "auth") nextPage = localStorage.getItem(pageReturnStorageKey) || "home";
    localStorage.setItem(pageStorageKey, nextPage);
    localStorage.removeItem(pageReturnStorageKey);
  } catch (error) { /* Default to home if page state cannot be read. */ }
  restoreAppPage(nextPage);
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast(isDemo ? "Welcome! You're exploring with the demo account." : "Welcome back, " + session.name.split(" ")[0] + "!");
}

function restoreAppPage(page) {
  homeScreen.hidden = true;
  guidanceContent.hidden = true;
  partnershipScreen.hidden = true;
  assessmentScreen.hidden = true;
  mentorsScreen.hidden = true;
  historyScreen.hidden = true;

  if (page === "home" || !page) {
    showView("home");
    return;
  }
  if (page === "guidance" || page === "partnership") {
    showView(page);
    return;
  }
  if (page === "mentors") {
    showMentors();
    return;
  }
  if (page === "history") {
    showHistory();
    return;
  }
  if (page === "assessment") {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(assessmentStateKey) || "null"); } catch (error) { saved = null; }
    if (!saved || !questionSets[saved.selectedCategory]) {
      showView("guidance");
      return;
    }
    selectedCategory = saved.selectedCategory;
    answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {};
    currentQuestionIndex = Math.max(0, Math.min(Number(saved.currentQuestionIndex) || 0, questionSets[selectedCategory].length - 1));
    careerCards.forEach((card) => {
      const isSelected = card.dataset.category === selectedCategory;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    });
    assessmentTitle.textContent = "Let's explore " + categoryNames[selectedCategory].toLowerCase() + ".";
    assessmentIntro.textContent = "Answer five short questions about your interests and preferences. There are no right or wrong answers.";
    guidanceContent.hidden = true;
    assessmentScreen.hidden = false;
    if (saved.resultsVisible) {
      renderQuestion();
      showResults();
    } else {
      resultsPanel.hidden = true;
      assessmentForm.hidden = false;
      renderQuestion();
    }
    return;
  }
  showView("home");
}

function restoreAuthSession() {
  try {
    const session = JSON.parse(localStorage.getItem(authSessionKey) || "null");
    const lastPage = localStorage.getItem(pageStorageKey) || "home";
    if (session && session.name && lastPage !== "auth") {
      authScreen.hidden = true;
      signoutButton.hidden = false;
      signedInLabel.textContent = "Hi, " + session.name.split(" ")[0];
      restoreAppPage(lastPage);
    } else {
      authScreen.hidden = false;
      signoutButton.hidden = true;
      if (lastPage !== "auth") restoreAppPage(lastPage);
    }
  } catch (error) {
    authScreen.hidden = false;
    signoutButton.hidden = true;
  }
}

signinTab.addEventListener("click", () => showAuthMode("signin"));
signupTab.addEventListener("click", () => showAuthMode("signup"));

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAuthFeedback(signupFeedback, "");
  const name = document.querySelector("#signup-name").value.trim();
  const email = document.querySelector("#signup-email").value.trim().toLowerCase();
  const password = document.querySelector("#signup-password").value;
  const confirmPassword = document.querySelector("#signup-confirm-password").value;
  if (name.length < 2) {
    setAuthFeedback(signupFeedback, "Please enter your name.");
    return;
  }
  if (password !== confirmPassword) {
    setAuthFeedback(signupFeedback, "The passwords do not match.");
    return;
  }
  const accounts = readAuthAccounts();
  if (accounts.some((account) => account.email === email)) {
    setAuthFeedback(signupFeedback, "An account with this email already exists. Please sign in instead.");
    return;
  }
  try {
    const passwordHash = await hashAuthPassword(password);
    accounts.push({ name, email, passwordHash, createdAt: Date.now() });
    localStorage.setItem(authAccountsKey, JSON.stringify(accounts));
    enterApplication({ name, email });
  } catch (error) {
    setAuthFeedback(signupFeedback, error.message || "We couldn't create the account in this browser.");
  }
});

signinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setAuthFeedback(signinFeedback, "");
  const email = document.querySelector("#signin-email").value.trim().toLowerCase();
  const password = document.querySelector("#signin-password").value;
  const account = readAuthAccounts().find((item) => item.email === email);
  if (!account) {
    setAuthFeedback(signinFeedback, "No local account found for this email. Create an account or use the demo account.");
    return;
  }
  try {
    const passwordHash = await hashAuthPassword(password);
    if (passwordHash !== account.passwordHash) {
      setAuthFeedback(signinFeedback, "That password doesn't match this local account. Please try again.");
      return;
    }
    enterApplication(account);
  } catch (error) {
    setAuthFeedback(signinFeedback, error.message || "We couldn't sign you in in this browser.");
  }
});

demoAccountButton.addEventListener("click", () => {
  enterApplication({ name: "Demo User", email: "demo@mindfullcarrier.local" }, true);
});

signoutButton.addEventListener("click", () => {
  try {
    localStorage.removeItem(authSessionKey);
    localStorage.setItem(pageReturnStorageKey, localStorage.getItem(pageStorageKey) || "home");
    localStorage.setItem(pageStorageKey, "auth");
  } catch (error) { /* Sign-out still hides the app locally. */ }
  authScreen.hidden = false;
  signoutButton.hidden = true;
  showAuthMode("signin");
  document.querySelector("#signin-password").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

restoreAuthSession();
