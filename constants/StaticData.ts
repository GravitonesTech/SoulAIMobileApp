import { Colors } from "./theme";

export const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Odia"];

export const GENDERS = ["Male", "Female", "Other"];

export const THERAPY_COLORS = [Colors.therapy.orange, Colors.therapy.blue, Colors.therapy.purple];

export const CHAT_PROMPTS = ["I want to talk about my mood", "I wish to talk about my day"];

export type Conversation = {
  id: string;
  title: string;
  timestamp: string;
  subtitle: string;
  therapyType?: string;
};

export type QuickAction = {
  id: "human" | "group" | "sos";
  label: string;
  icon: "user" | "users" | "alert-circle";
  color: string;
  route?: string;
};

export const CONVERSATIONS_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "human",
    label: "Human Therapist",
    icon: "user",
    color: "#333",
    route: "/human-therapists",
  },
  { id: "group", label: "Group Chat", icon: "users", color: "#333", route: "/group-chat" },
  { id: "sos", label: "SOS!", icon: "alert-circle", color: "#FF3B30", route: "/sos" },
];

export const MORE_OPTIONS_ITEMS = [
  {
    id: "human",
    label: "Human Therapist",
    icon: "user",
    color: "#333",
    route: "/human-therapists",
  },
  { id: "group", label: "Group Chat", icon: "layers", color: "#333", route: "/group-chat" },
  {
    id: "conversations",
    label: "Conversations",
    icon: "message-square",
    color: "#333",
    route: "/conversations",
  },
  {
    id: "sound",
    label: "Sound Healing",
    icon: "volume-2",
    color: "#333",
    route: "/sound-healing-flow",
  },
  // {
  //   id: "downloads",
  //   label: "Downloads",
  //   icon: "download",
  //   color: "#333",
  //   route: "/downloads",
  // },
  {
    id: "breathing",
    label: "Breathing Exercise",
    icon: "sun",
    color: "#333",
    route: "/breathing",
  },
  // {
  //   id: "demo",
  //   label: "Interactive Demo",
  //   icon: "play-circle",
  //   color: "#3C61DD",
  //   route: "/demo",
  // },
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

export const AVAILABLE_TIMES = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];
