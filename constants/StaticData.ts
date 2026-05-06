import { Colors } from "./theme";

export const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Odia"];

export const COUNTRIES = [
  "India",
  "USA",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
];

export const GENDERS = ["Male", "Female", "Other"];

export const EXPERIENCE_LEVELS = ["Getting Started", "Some Experience", "Significant Experience"];

export const TONE_OPTIONS = [
  "Warm and Nurturing",
  "Professional",
  "Casual and Friendly",
  "Direct and Straightforward",
  "Motivational",
  "Balanced",
];

export const SUPPORT_OPTIONS = [
  "Stress",
  "Relationship",
  "Anxiety",
  "Work / School",
  "Loneliness",
  "Other",
];

export const THERAPY_TYPES = [
  { id: "1", title: "Cognitive Therapy", color: Colors.therapy.orange },
  {
    id: "2",
    title: "Acceptance and Commitment Therapy",
    color: Colors.therapy.blue,
  },
  {
    id: "3",
    title: "Dialectical Behavior Therapy",
    color: Colors.therapy.purple,
  },
  { id: "4", title: "Mindfulness Based", color: Colors.therapy.orange },
  { id: "5", title: "Psychodynamic", color: Colors.therapy.blue },
  { id: "6", title: "Solution focused", color: Colors.therapy.purple },
];

export const CHAT_PROMPTS = ["I want to talk about my mood", "I wish to talk about my day"];

export type Conversation = {
  id: string;
  title: string;
  timestamp: string;
  subtitle: string;
};

export type QuickAction = {
  id: "human" | "group" | "sos";
  label: string;
  icon: "user" | "users" | "alert-circle";
  color: string;
};

export const CONVERSATIONS_QUICK_ACTIONS: QuickAction[] = [
  { id: "human", label: "Human Therapist", icon: "user", color: "#333" },
  { id: "group", label: "Group Chat", icon: "users", color: "#333" },
  { id: "sos", label: "SOS!", icon: "alert-circle", color: "#FF3B30" },
];

export const TODAY_CONVERSATIONS_SEED: Conversation[] = [
  {
    id: "1",
    title: "Overwhelmed at Work",
    timestamp: "05:12 AM",
    subtitle: "Cognitive Therapy • Managing workplace anxiety",
  },
  {
    id: "2",
    title: "Can't Sleep Again",
    timestamp: "01:29 AM",
    subtitle: "Behavior Therapy • Insomnia and racing thoughts",
  },
];

export const YESTERDAY_CONVERSATIONS_SEED: Conversation[] = [
  {
    id: "3",
    title: "Argument with Alex",
    timestamp: "11:52 PM",
    subtitle: "Acceptance Therapy • Navigating boundaries",
  },
  {
    id: "4",
    title: "Feeling Unmotivated",
    timestamp: "06:12 PM",
    subtitle: "Mindfulness Based • Coping with low energy",
  },
  {
    id: "5",
    title: "Building Better Habits",
    timestamp: "04:23 PM",
    subtitle: "Solution focused • Establishing daily routines",
  },
];

export const MORE_OPTIONS_ITEMS = [
  { id: "human", label: "Human Therapist", icon: "user", color: "#333", route: "/coming-soon" },
  { id: "group", label: "Group Chat", icon: "layers", color: "#333", route: "/coming-soon" },
  {
    id: "conversations",
    label: "Conversations",
    icon: "message-square",
    color: "#333",
    route: "/conversations",
  },
  { id: "sound", label: "Sound Healing", icon: "volume-2", color: "#333", route: "/coming-soon" },
  {
    id: "breathing",
    label: "Breathing Exercise",
    icon: "sun",
    color: "#333",
    route: "/coming-soon",
  },
  { id: "faq", label: "FAQ", icon: "help-circle", color: "#333", route: "/faq" },
  { id: "sos", label: "SOS!", icon: "alert-circle", color: "#FF3B30", route: "/sos" },
];

export const FAQ_DATA = [
  {
    id: "1",
    question: "Is the AI a replacement for a human therapist?",
    answer:
      "No, Soul AI is designed to be a supportive tool and coach to help you manage day-to-day emotional challenges, practice mindfulness, and reflect on your thoughts. It is not a replacement for clinical therapy or professional medical advice.",
  },
  {
    id: "2",
    question: "Are my conversations private and secure?",
    answer:
      "Yes. Your privacy is our top priority. All conversations are encrypted and we do not sell your personal data. You have full control over your chat history and can delete it at any time.",
  },
  {
    id: "3",
    question: "Is the app available 24/7?",
    answer:
      "Absolutely. Soul AI is here for you whenever you need it—whether it's late at night or during a busy workday—providing instant support and guidance.",
  },
  {
    id: "4",
    question: "7 prompts to get the best therapy?",
    answer:
      "1. I feel [emotion]; ask me questions to help find the root cause.\n2. Identify cognitive distortions in this thought: '[thought]' and help me reframe it.\n3. Role-play a conversation where I set a boundary with [person] about [issue].\n4. Help me identify my core values and see if my current routine aligns with them.\n5. Guide me through a grounding exercise and break my tasks into three micro-steps.\n6. Analyze my interaction with [person] and point out potential blind spots.\n7. I can't stick to [habit]; help me identify roadblocks and create a frictionless plan.",
    isPromptList: true,
  },
  {
    id: "5",
    question: "What should I do if I am experiencing a crisis?",
    answer:
      "If you are in immediate danger or experiencing a life-threatening crisis, please contact your local emergency services or a crisis hotline immediately. Soul AI is not an emergency response service.",
  },
];

export const SOS_CONTACTS = [
  { id: "1", name: "Contact Name", phone: "+91 XXXXX XXXXX" },
  { id: "2", name: "Contact Name", phone: "+91 XXXXX XXXXX" },
  { id: "3", name: "Contact Name", phone: "+91 XXXXX XXXXX" },
];

export const EMERGENCY_SERVICES = [
  { id: "1", name: "Police", number: "100", color: "#4CAF50" },
  { id: "2", name: "Ambulance", number: "108", color: "#FFC107" },
  { id: "3", name: "Fire Department", number: "101", color: "#F44336" },
];

export const PERSONALITY_RESULTS = [
  "Anxiety & Stress Management",
  "Mindfulness & Well-being",
  "Life Transitions",
];

export const SAVED_PAYMENT_METHODS = [
  { id: "1", type: "Visa", last4: "1280" },
  { id: "2", type: "MasterCard", last4: "4481" },
  { id: "3", type: "UPI", last4: "1258" },
];

export const PAST_THERAPY_SESSIONS = [
  {
    id: "1",
    doctor: "Dr. ABC",
    amount: "10000",
    date: "11 Nov, 2027",
    duration: "30 minutes session",
  },
  {
    id: "2",
    doctor: "Dr. XYZ",
    amount: "10000",
    date: "11 Nov, 2027",
    duration: "90 minutes session",
  },
];
export const ASSESSMENT_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several Days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly everyday", value: 3 },
];

export const DIFFICULTY_OPTIONS = [
  { label: "Not difficult at all", value: 0 },
  { label: "Somewhat difficult", value: 1 },
  { label: "Very Difficult", value: 2 },
  { label: "Extremely Difficult", value: 3 },
];

export const ASSESSMENT_QUESTIONS = [
  // PHQ-9
  {
    id: "phq1",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Interest or Pleasure?",
    question: "Little interest or pleasure in doing things.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq2",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Feeling Down?",
    question: "Feeling down, depressed, or hopeless.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq3",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Sleep Problems?",
    question: "Trouble falling or staying asleep, or sleeping too much.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq4",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Tired or Low Energy?",
    question: "Feeling tired or having little energy.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq5",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Appetite Issues?",
    question: "Poor appetite or overeating.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq6",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Self Perception?",
    question:
      "Feeling bad about yourself – or that you are a failure or have let yourself or your family down.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq7",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Trouble Concentrating?",
    question:
      "Trouble concentrating on things, such as reading the newspaper or watching television.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq8",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Psychomotor Changes?",
    question:
      "Moving or speaking so slowly that other people could have noticed? Or the opposite – being so fidgety or restless that you have been moving around a lot more than usual?",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq9",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Harmful Thoughts?",
    question: "Thoughts that you would be better off dead, or of hurting yourself in some way.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "phq_diff",
    section: "Patient Health Questionnaire (PHQ-9)",
    title: "Daily Difficulty",
    question:
      "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
    subtitle: "Overall impact on your daily life",
    type: "difficulty",
  },
  // GAD-7
  {
    id: "gad1",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Nervous or Anxious?",
    question: "Feeling nervous, anxious, or on edge.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad2",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Unable to Stop Worrying?",
    question: "Not being able to stop or control worrying.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad3",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Worrying Too Much?",
    question: "Worrying too much about different things.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad4",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Trouble Relaxing?",
    question: "Trouble relaxing.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad5",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Restless?",
    question: "Being so restless that it's hard to sit still.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad6",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Easily Irritable?",
    question: "Becoming easily annoyed or irritable.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad7",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Feeling Afraid?",
    question: "Feeling afraid as if something awful might happen.",
    subtitle: "Over the last 2 weeks, how often have you been bothered by this?",
    type: "rating",
  },
  {
    id: "gad_diff",
    section: "General Anxiety Disorder Questionnaire (GAD-7)",
    title: "Daily Difficulty",
    question:
      "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
    subtitle: "Overall impact on your daily life",
    type: "difficulty",
  },
];
