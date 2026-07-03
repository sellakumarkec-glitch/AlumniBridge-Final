// Lightweight client-side "AI" engine for AlumniBridge.
// Uses heuristic/rule-based responses to simulate intelligent career guidance
// without requiring an external API key.

const careerKeywords: Record<string, string[]> = {
  resume: ['resume', 'cv', 'ats', 'keywords'],
  interview: ['interview', 'hr', 'technical', 'question'],
  mentor: ['mentor', 'mentoring', 'guidance'],
  job: ['job', 'career', 'role', 'company'],
  skill: ['skill', 'learn', 'roadmap', 'certification'],
  higher: ['higher', 'masters', 'ms', 'phd', 'study'],
  startup: ['startup', 'founder', 'entrepreneur'],
  switch: ['switch', 'transition', 'change career'],
}

const responses: Record<string, string[]> = {
  resume: [
    "For a strong resume, tailor it to each role: mirror the job description's keywords, quantify achievements (e.g. 'reduced latency by 30%'), and keep it to one page for under 5 years of experience. Use the Resume Analyzer tool for an ATS score.",
    "Your resume should follow this structure: Contact → Summary (2 lines) → Experience (bullet points with metrics) → Skills → Education. Use action verbs like 'Built', 'Shipped', 'Led'.",
  ],
  interview: [
    "For interviews, prepare with the STAR method (Situation, Task, Action, Result). Practice aloud — try the Interview Practice tool for AI feedback on your answers.",
    "Common technical interview topics: data structures, system design, and coding patterns. For HR rounds, prepare 'Tell me about yourself', strengths/weaknesses, and behavioral stories.",
  ],
  mentor: [
    "Finding the right mentor: look for shared industry or skills, check their 'open to mentor' badge, and send a specific request — mention your goals and what you'd like help with. Browse the Alumni Directory to find matches.",
    "A great mentorship starts with clear goals. Before reaching out, write down: (1) what you want to learn, (2) your timeline, (3) how often you'd like to meet. Mentors appreciate specificity.",
  ],
  job: [
    "Job hunting tips: (1) Tailor each application, (2) Leverage referrals — they boost your chances 4x, (3) Apply within 7 days of posting, (4) Follow up with the poster. Check the Jobs portal for referral-backed roles.",
    "When evaluating a job offer, look beyond salary: equity, learning budget, growth path, work culture, and team quality matter. Negotiate respectfully — most offers have 10-15% wiggle room.",
  ],
  skill: [
    "Building a learning roadmap: (1) Pick a target role, (2) List required skills from 5 job descriptions, (3) Find the common 80%, (4) Learn by building 2-3 projects, (5) Get certified for credibility.",
    "For software engineering: master DSA, one backend framework (Node/Express or Django), one frontend (React), databases (SQL + Redis), and system design. Build projects > watch tutorials.",
  ],
  higher: [
    "Considering higher studies? Weigh: (1) Career goals — does the role need a Master's? (2) ROI — tuition vs. salary bump, (3) Timing — work experience often strengthens applications, (4) Specialization vs. generalist programs.",
    "For MS applications abroad: GRE (320+ is competitive), 3 strong LORs, an SOP that tells a coherent story, and research/project experience. Apply by October for fall intake.",
  ],
  startup: [
    "Thinking of a startup? Validate your idea before quitting: (1) Talk to 20 potential customers, (2) Build a no-code MVP, (3) Get pre-orders or signups, (4) Only then go full-time. Read 'The Mom Test'.",
    "Startup essentials: a co-founder with complementary skills, a clear problem you understand deeply, and 12-18 months of runway. Most failures come from building something nobody wants — validate first.",
  ],
  switch: [
    "Career switching framework: (1) Identify transferable skills, (2) Fill skill gaps with targeted learning, (3) Build portfolio projects in the new domain, (4) Network with people in target roles, (5) Reframe your story for interviews.",
    "A career switch is a marathon, not a sprint. Give yourself 6-12 months. Start with a side project in the new field while keeping your current role — it reduces risk and builds evidence of capability.",
  ],
  default: [
    "I can help with career guidance, resume reviews, interview prep, learning roadmaps, mentorship, and job/internship search. What would you like to explore?",
    "Great question! Tell me more about your current situation — your role, goals, and what's challenging you — and I'll give you specific, actionable advice.",
    "I'm your AI career assistant. I can help with: career planning, resume optimization, interview preparation, skill development, and finding the right mentor. What's on your mind?",
  ],
}

export function generateAIResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [topic, keywords] of Object.entries(careerKeywords)) {
    if (keywords.some((k) => lower.includes(k))) {
      const opts = responses[topic] ?? responses.default
      return opts[Math.floor(Math.random() * opts.length)]
    }
  }
  return responses.default[Math.floor(Math.random() * responses.default.length)]
}

export function analyzeResume(text: string) {
  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  const lower = text.toLowerCase()

  const atsKeywords = ['experience', 'project', 'team', 'led', 'built', 'shipped', 'improved', 'reduced', 'increased', 'developed', 'designed', 'implemented', 'optimized', 'collaborated', 'delivered']
  const found = atsKeywords.filter((k) => lower.includes(k))
  const missing = atsKeywords.filter((k) => !lower.includes(k))

  const hasMetrics = /\d+%|\$\d+|\d+x|\d+ users|\d+ projects/i.test(text)
  const hasEducation = /b\.?tech|bachelor|master|b\.?e\.?|m\.?tech|diploma|degree/i.test(text)
  const hasSkills = /react|node|python|java|sql|javascript|typescript|aws|docker|kubernetes|git/i.test(text)
  const hasLinks = /linkedin|github|portfolio|http/i.test(text)

  let score = 40
  if (found.length >= 5) score += 20
  else if (found.length >= 3) score += 12
  if (hasMetrics) score += 15
  if (hasEducation) score += 10
  if (hasSkills) score += 10
  if (hasLinks) score += 5
  score = Math.min(score, 95)

  const tips: string[] = []
  if (!hasMetrics) tips.push('Add quantifiable achievements — e.g. "Reduced API latency by 40%" instead of "Improved performance".')
  if (missing.length > 5) tips.push(`Include more action verbs: ${missing.slice(0, 5).join(', ')}.`)
  if (!hasLinks) tips.push('Add LinkedIn, GitHub, or portfolio links — recruiters look for these.')
  if (wordCount < 200) tips.push('Your resume seems short. Aim for 300-600 words with concrete project details.')
  if (wordCount > 800) tips.push('Your resume may be too long. Keep it to one page (under 600 words) for <5 years experience.')
  if (!hasSkills) tips.push('Add a dedicated Skills section with relevant technologies.')
  if (tips.length === 0) tips.push('Strong resume! Consider tailoring keywords to each specific job description.')

  return { score, found, missing, tips, hasMetrics, hasEducation, hasSkills, hasLinks, wordCount }
}

export function skillGapAnalysis(userSkills: string[], targetRole: string) {
  const roleSkills: Record<string, string[]> = {
    'frontend developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Redux', 'Testing', 'Webpack', 'Accessibility'],
    'backend developer': ['Node.js', 'Python', 'SQL', 'REST APIs', 'Docker', 'AWS', 'Microservices', 'Redis', 'Kafka'],
    'full stack developer': ['React', 'Node.js', 'TypeScript', 'SQL', 'Docker', 'AWS', 'REST APIs', 'GraphQL'],
    'data scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Statistics', 'ML', 'Visualization'],
    'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Bash', 'Prometheus', 'Grafana'],
    'product manager': ['Roadmapping', 'Analytics', 'User Research', 'A/B Testing', 'SQL', 'Stakeholder Management', 'Agile'],
  }
  const target = roleSkills[targetRole.toLowerCase()] ?? roleSkills['frontend developer']
  const have = target.filter((s) => userSkills.some((u) => u.toLowerCase().includes(s.toLowerCase())))
  const gap = target.filter((s) => !userSkills.some((u) => u.toLowerCase().includes(s.toLowerCase())))
  const matchPercent = Math.round((have.length / target.length) * 100)
  const recommendations = gap.map((s) => {
    const recs: Record<string, string> = {
      React: 'Build 2-3 projects with hooks, context, and routing. FreeCodeCamp + official docs.',
      TypeScript: 'Migrate a JS project to TS. Read "Effective TypeScript" by Dan Vanderkam.',
      'Node.js': 'Build a REST API with Express + PostgreSQL. Deploy on Render/Railway.',
      Python: 'Automate a real task (scraping, data cleaning). LeetCode in Python for DSA.',
      SQL: 'Complete "SQL for Data Science" on Coursera. Practice on LeetCode/HackerRank.',
      Docker: 'Containerize an existing project. Read "Docker Deep Dive" by Nigel Poulton.',
      AWS: 'Get the AWS Cloud Practitioner cert. Deploy a project on EC2 + RDS.',
      Testing: 'Add Jest + React Testing Library to a project. Aim for 70% coverage.',
      Kubernetes: 'Run a local cluster with minikube. Complete K8s official tutorials.',
      'CI/CD': 'Set up GitHub Actions for an existing project. Add lint, test, deploy stages.',
    }
    return { skill: s, recommendation: recs[s] ?? `Take an online course and build a project using ${s}.` }
  })
  return { target, have, gap, matchPercent, recommendations }
}

export const interviewQuestions = {
  hr: [
    'Tell me about yourself.',
    'Why do you want to work at this company?',
    'What are your greatest strengths?',
    'What is your biggest weakness?',
    'Where do you see yourself in 5 years?',
    'Describe a challenge you faced and how you overcame it.',
    'Why are you leaving your current role?',
    'What are your salary expectations?',
  ],
  technical: [
    'Explain the difference between SQL and NoSQL databases.',
    'How would you design a URL shortener like bit.ly?',
    'What happens when you type a URL into a browser and hit enter?',
    'Explain the difference between REST and GraphQL.',
    'How would you optimize a slow-loading web page?',
    'Describe how HTTPS works.',
    'What is the CAP theorem?',
    'How do you handle errors in a distributed system?',
  ],
  behavioral: [
    'Tell me about a time you led a team project.',
    'Describe a conflict with a coworker and how you resolved it.',
    'When did you fail and what did you learn?',
    'Tell me about a time you went above and beyond.',
    'How do you handle tight deadlines?',
  ],
}

export function evaluateAnswer(question: string, answer: string) {
  const words = answer.trim().split(/\s+/).length
  const hasStructure = /situation|task|action|result|first|then|finally|because/i.test(answer)
  const hasMetrics = /\d+%|\d+ x|\d+ people|\d+ projects|\d+ months/i.test(answer)
  const isSpecific = !/(always|everyone|usually|sometimes|stuff|things|good|bad)\b/i.test(answer) && answer.length > 100

  let confidence = 40
  if (words >= 80) confidence += 20
  else if (words >= 50) confidence += 12
  else if (words < 20) confidence -= 10
  if (hasStructure) confidence += 20
  if (hasMetrics) confidence += 15
  if (isSpecific) confidence += 10
  confidence = Math.max(10, Math.min(98, confidence))

  const tips: string[] = []
  if (words < 50) tips.push('Your answer is brief. Aim for 60-120 seconds spoken (~100-180 words). Use the STAR method.')
  if (!hasStructure) tips.push('Structure your answer with STAR: Situation, Task, Action, Result. This makes it memorable.')
  if (!hasMetrics) tips.push('Add quantifiable results — "reduced by 30%", "led a team of 5", "shipped in 2 weeks".')
  if (!isSpecific) tips.push('Be more specific. Avoid generic words like "good", "stuff", "things". Name technologies, numbers, and outcomes.')
  if (tips.length === 0) tips.push('Strong answer! Practice delivering it confidently and concisely.')

  return { confidence, tips, wordCount: words }
}
