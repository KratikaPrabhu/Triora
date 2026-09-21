export interface Translations {
  // Navigation & General
  navHome: string;
  navDashboard: string;
  navStartConversation: string;
  navProfile: string;
  navSignOut: string;
  navSignIn: string;
  navGetStarted: string;

  // Landing
  heroHeadline: string;
  heroSub: string;
  getStartedBtn: string;
  signInBtn: string;
  processTitle: string;
  benefitsTitle: string;
  privacyNotice: string;

  // Auth
  signupTitle: string;
  loginTitle: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  createAccountBtn: string;
  continueGoogle: string;
  alreadyAccount: string;
  dontAccount: string;

  // Onboarding
  onboardingTitle: string;
  step1Header: string;
  step2Header: string;
  step3Header: string;
  preferredNameLabel: string;
  dobLabel: string;
  languageLabel: string;
  backgroundLabel: string;
  experienceLabel: string;
  goalsLabel: string;
  continueBtn: string;
  backBtn: string;
  completeBtn: string;

  // Dashboard
  welcomeBack: string;
  readyTitle: string;
  startConversationBtn: string;
  previousSessionsTitle: string;
  noSessionsTitle: string;
  viewReportBtn: string;
  resumeConversationBtn: string;

  // Session & Questions
  repeatQuestionBtn: string;
  nextQuestionBtn: string;
  finishBtn: string;
  questionPrefix: string;
  speakingState: string;
  listeningState: string;
  pausedState: string;
  finishSessionBtn: string;
  typeMessagePlaceholder: string;
  sessionDisclaimer: string;

  // Heatmap & GSR
  heatmapTitle: string;
  conductanceLabel: string;
  resistanceLabel: string;
  historicalGraphLabel: string;
  lowLabel: string;
  highLabel: string;

  // Report
  reportTitle: string;
  reportDisclaimer: string;
  summaryHeader: string;
  themesHeader: string;
  concernsHeader: string;
  printReportBtn: string;

  // Questions Flow Array
  questions: string[];
}

export const DICTIONARY: Record<string, Translations> = {
  en: {
    navHome: "Home",
    navDashboard: "Dashboard",
    navStartConversation: "Start Conversation",
    navProfile: "Profile & Intake",
    navSignOut: "Sign Out",
    navSignIn: "Sign In",
    navGetStarted: "Get Started",

    heroHeadline: "Have a conversation about how you've been feeling before your first therapy appointment.",
    heroSub: "Triora guides you through an open-ended, spoken intake session in your preferred language.",
    getStartedBtn: "Get Started",
    signInBtn: "Sign In",
    processTitle: "Simple 3-Step Process",
    benefitsTitle: "Designed for Patient Comfort & Peace of Mind",
    privacyNotice: "Triora is a pre-therapy intake tool, not a diagnostic or medical treatment service.",

    signupTitle: "Create your Triora account",
    loginTitle: "Welcome back to Triora",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    createAccountBtn: "Create Account",
    continueGoogle: "Continue with Google",
    alreadyAccount: "Already have an account? Sign in",
    dontAccount: "Don't have an account? Sign up",

    onboardingTitle: "Pre-Therapy Setup",
    step1Header: "Step 1: Basic Information",
    step2Header: "Step 2: Background & Intake Goals",
    step3Header: "Step 3: Preferences & Safety Consents",
    preferredNameLabel: "Preferred Name",
    dobLabel: "Date of Birth",
    languageLabel: "Preferred Spoken Language",
    backgroundLabel: "What brings you to therapy at this time?",
    experienceLabel: "Previous Therapy Experience",
    goalsLabel: "Primary Focus Areas",
    continueBtn: "Continue",
    backBtn: "Back",
    completeBtn: "Complete Onboarding",

    welcomeBack: "Welcome back",
    readyTitle: "Ready to share how you've been feeling?",
    startConversationBtn: "Start a new conversation",
    previousSessionsTitle: "Previous Intake Sessions",
    noSessionsTitle: "No intake sessions yet",
    viewReportBtn: "View Summary Report",
    resumeConversationBtn: "Resume Conversation",

    repeatQuestionBtn: "🔊 Repeat Question",
    nextQuestionBtn: "Next →",
    finishBtn: "Finish →",
    questionPrefix: "Question",
    speakingState: "Triora is speaking...",
    listeningState: "Microphone Active & Listening",
    pausedState: "Microphone Muted / Paused",
    finishSessionBtn: "Finish Session & Generate Summary",
    typeMessagePlaceholder: "Or type a spoken message here...",
    sessionDisclaimer: "Simulated visualization — not a medical measurement.",

    heatmapTitle: "GALVANIC SKIN RESPONSE",
    conductanceLabel: "Conductance",
    resistanceLabel: "Resistance",
    historicalGraphLabel: "Historical Graph",
    lowLabel: "LOW",
    highLabel: "HIGH",

    reportTitle: "Triora Pre-Therapy Intake Summary",
    reportDisclaimer: "Clinical Pre-Intake Disclaimer: This report is an AI-generated summary of self-reported conversation and does NOT constitute a medical diagnosis.",
    summaryHeader: "Session Summary",
    themesHeader: "Key Themes Discussed",
    concernsHeader: "Patient Concerns Expressed",
    printReportBtn: "Print Report for Therapist",

    questions: [
      "What has been on your mind lately?",
      "How have these feelings been affecting your daily routine or work?",
      "Have you noticed any changes in your sleep patterns or energy levels?",
      "When you feel overwhelmed, what usually helps or what have you tried?",
      "Do you have friends, family, or a support system you feel comfortable talking to?",
      "What is the primary goal you hope to achieve through therapy at this time?",
      "How long have you been experiencing these concerns?",
      "Is there anything specific that triggered these feelings recently?",
      "How are your stress levels when dealing with day-to-day tasks?",
      "What steps or activities help you feel more grounded?"
    ]
  },
  kn: {
    navHome: "ಮುಖಪುಟ",
    navDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    navStartConversation: "ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ",
    navProfile: "ಪ್ರೊಫೈಲ್",
    navSignOut: "ಸೈನ್ ಔಟ್",
    navSignIn: "ಸೈನ್ ಇನ್",
    navGetStarted: "ಪ್ರಾರಂಭಿಸಿ",

    heroHeadline: "ನಿಮ್ಮ ಮೊದಲ ಥೆರಪಿ ಭೇಟಿಗೆ ಮುನ್ನ ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬ ಬಗ್ಗೆ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ.",
    heroSub: "ತ್ರಿಓರಾ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಸಂಭಾಷಣೆಯ ಮೂಲಕ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.",
    getStartedBtn: "ಪ್ರಾರಂಭಿಸಿ",
    signInBtn: "ಸೈನ್ ಇನ್",
    processTitle: "ಸರಳ 3-ಹಂತದ ಪ್ರಕ್ರಿಯೆ",
    benefitsTitle: "ರೋಗಿಯ ನೆಮ್ಮದಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ",
    privacyNotice: "ತ್ರಿಓರಾ ಥೆರಪಿ ಪೂರ್ವ ಉಪಕರಣವಾಗಿದೆ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.",

    signupTitle: "ತ್ರಿಓರಾ ಖಾತೆ ತೆರೆಯಿರಿ",
    loginTitle: "ತ್ರಿಓರಾಗೆ ಮತ್ತೆ ಸ್ವಾಗತ",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    createAccountBtn: "ಖಾತೆ ತೆರೆಯಿರಿ",
    continueGoogle: "ಗೂಗಲ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ",
    alreadyAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ",
    dontAccount: "ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ",

    onboardingTitle: "ಪ್ರೊಫೈಲ್ ಸಂರಚನೆ",
    step1Header: "ಹಂತ 1: ಮೂಲಭೂತ ಮಾಹಿತಿ",
    step2Header: "ಹಂತ 2: ಹಿನ್ನೆಲೆ ಮತ್ತು ಗುರಿಗಳು",
    step3Header: "ಹಂತ 3: ಆದ್ಯತೆಗಳು ಮತ್ತು ಸಮ್ಮತಿ",
    preferredNameLabel: "ಆದ್ಯತೆಯ ಹೆಸರು",
    dobLabel: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
    languageLabel: "ಮಾತನಾಡುವ ಭಾಷೆ",
    backgroundLabel: "ಈ ಸಮಯದಲ್ಲಿ ಥೆರಪಿಗೆ ಕಾರಣವೇನು?",
    experienceLabel: "ಹಿಂದಿನ ಥೆರಪಿ ಅನುಭವ",
    goalsLabel: "ಮುಖ್ಯ ಗಮನದ ಕ್ಷೇತ್ರಗಳು",
    continueBtn: "ಮುಂದುವರಿಯಿರಿ",
    backBtn: "ಹಿಂದೆ",
    completeBtn: "ಪೂರ್ಣಗೊಳಿಸಿ",

    welcomeBack: "ಮತ್ತೆ ಸ್ವಾಗತ",
    readyTitle: "ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    startConversationBtn: "ಹೊಸ ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ",
    previousSessionsTitle: "ಹಿಂದಿನ ಸಂಭಾಷಣೆಗಳು",
    noSessionsTitle: "ಇನ್ನೂ ಯಾವುದೇ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ",
    viewReportBtn: "ಸಾರಾಂಶ ವರದಿ ವೀಕ್ಷಿಸಿ",
    resumeConversationBtn: "ಸಂಭಾಷಣೆ ಮುಂದುವರಿಸಿ",

    repeatQuestionBtn: "🔊 ಪ್ರಶ್ನೆಯನ್ನು ಪುನರಾವರ್ತಿಸಿ",
    nextQuestionBtn: "ಮುಂದೆ →",
    finishBtn: "ಮುಕ್ತಾಯ →",
    questionPrefix: "ಪ್ರಶ್ನೆ",
    speakingState: "ಸನಾ ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ...",
    listeningState: "ಮೈಕ್ರೋಫೋನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    pausedState: "ಮೈಕ್ರೋಫೋನ್ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ",
    finishSessionBtn: "ಸೆಷನ್ ಮುಗಿಸಿ ಸಾರಾಂಶ ಪಡೆಯಿರಿ",
    typeMessagePlaceholder: "ಅಥವಾ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    sessionDisclaimer: "ಅನುಕರಿಸಿದ ಗ್ರಾಫಿಕ್ — ವೈದ್ಯಕೀಯ ಅಳತೆಯಲ್ಲ.",

    heatmapTitle: "ಗಾಲ್ವಾನಿಕ್ ಸ್ಕಿನ್ ರೆಸ್ಪಾನ್ಸ್",
    conductanceLabel: "ವಾಹಕತೆ",
    resistanceLabel: "ನಿರೋಧಕತೆ",
    historicalGraphLabel: "ಐತಿಹಾಸಿಕ ನಕ್ಷೆ",
    lowLabel: "ಕಡಿಮೆ",
    highLabel: "ಹೆಚ್ಚು",

    reportTitle: "ತ್ರಿಓರಾ ಥೆರಪಿ ಪೂರ್ವ ಸಾರಾಂಶ ವರದಿ",
    reportDisclaimer: "ವೈದ್ಯಕೀಯ ಪೂರ್ವ ಸೂಚನೆ: ಈ ವರದಿಯು AI-ರಚಿಸಿದ ಸಾರಾಂಶವಾಗಿದೆ ಮತ್ತು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.",
    summaryHeader: "ಸೆಷನ್ ಸಾರಾಂಶ",
    themesHeader: "ಚರ್ಚಿಸಿದ ವಿಷಯಗಳು",
    concernsHeader: "ವ್ಯಕ್ತಪಡಿಸಿದ ಕಳವಳಗಳು",
    printReportBtn: "ವರದಿ ಮುದ್ರಿಸಿ",

    questions: [
      "ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?",
      "ಈ ಭಾವನೆಗಳು ನಿಮ್ಮ ದೈನಂದಿನ ದಿನಚರಿ ಅಥವಾ ಕೆಲಸದ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರಿವೆ?",
      "ನಿಮ್ಮ ನಿದ್ರೆಯ ಮಾದರಿ ಅಥವಾ ಶಕ್ತಿಯ ಮಟ್ಟದಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆಗಳನ್ನು ನೀವು ಗಮನಿಸಿದ್ದೀರಾ?",
      "ನೀವು ಆತಂಕಗೊಂಡಾಗ സാധാരണವಾಗಿ ಏನು ಸಹಾಯ ಮಾಡುತ್ತದೆ ಅಥವಾ ನೀವು ಏನು ಪ್ರಯತ್ನಿಸಿದ್ದೀರಿ?",
      "ನಿಮ್ಮ ಕಷ್ಟಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಸ್ನೇಹಿತರು, ಕುಟುಂಬ ಅಥವಾ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ ಇದೆಯೇ?",
      "ಈ ಸಮಯದಲ್ಲಿ ಥೆರಪಿಯ ಮೂಲಕ ನೀವು ಸಾಧಿಸಲು ಬಯಸುವ ಮುಖ್ಯ ಗುರಿ ಏನು?",
      "ನೀವು ಎಷ್ಟು ಸಮಯದಿಂದ ಈ ಕಳವಳಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
      "ಇತ್ತೀಚೆಗೆ ಈ ಭಾವನೆಗಳನ್ನು ಪ್ರಚೋದಿಸಿದ ನಿರ್ದಿಷ್ಟ ಘಟನೆ ಇದೆಯೇ?",
      "ದೈನಂದಿನ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಹಿಸುವಾಗ ನಿಮ್ಮ ಒತ್ತಡದ ಮಟ್ಟ ಹೇಗಿರುತ್ತದೆ?",
      "ಯಾವ ಚಟುವಟಿಕೆಗಳು ನಿಮಗೆ ನೆಮ್ಮದಿ ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ?"
    ]
  },
  hi: {
    navHome: "मुख्य पृष्ठ",
    navDashboard: "डैशबोर्ड",
    navStartConversation: "सत्र शुरू करें",
    navProfile: "प्रोफाइल",
    navSignOut: "साइन आउट",
    navSignIn: "साइन इन",
    navGetStarted: "शुरू करें",

    heroHeadline: "अपनी पहली थेरेपी नियुक्ति से पहले अपनी भावनाओं के बारे में खुलकर बात करें।",
    heroSub: "त्रियोरा आपकी पसंदीदा भाषा में एक सहज मौखिक बातचीत के माध्यम से आपका मार्गदर्शन करता है।",
    getStartedBtn: "शुरू करें",
    signInBtn: "साइन इन करें",
    processTitle: "सरल 3-चरण प्रक्रिया",
    benefitsTitle: "रोगी की शांति के लिए डिज़ाइन किया गया",
    privacyNotice: "त्रियोरा एक थेरेपी पूर्व उपकरण है, चिकित्सा निदान नहीं।",

    signupTitle: "त्रियोरा अकाउंट बनाएं",
    loginTitle: "त्रियोरा में पुनः स्वागत है",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूरा नाम",
    createAccountBtn: "अकाउंट बनाएं",
    continueGoogle: "गूगल के साथ जारी रखें",
    alreadyAccount: "पहले से अकाउंट है? साइन इन करें",
    dontAccount: "अकाउंट नहीं है? साइन अप करें",

    onboardingTitle: "प्रोफाइल सेटअप",
    step1Header: "चरण 1: बुनियादी जानकारी",
    step2Header: "चरण 2: पृष्ठभूमि और लक्ष्य",
    step3Header: "चरण 3: प्राथमिकताएं और सहमति",
    preferredNameLabel: "पसंदीदा नाम",
    dobLabel: "जन्म तिथि",
    languageLabel: "बोलने की भाषा",
    backgroundLabel: "इस समय थेरेपी का मुख्य कारण क्या है?",
    experienceLabel: "पिछला थेरेपी अनुभव",
    goalsLabel: "मुख्य ध्यान देने योग्य क्षेत्र",
    continueBtn: "जारी रखें",
    backBtn: "पीछे",
    completeBtn: "पूरा करें",

    welcomeBack: "पुनः स्वागत है",
    readyTitle: "अपनी भावनाओं को साझा करने के लिए तैयार हैं?",
    startConversationBtn: "नया सत्र शुरू करें",
    previousSessionsTitle: "पिछली बातचीत",
    noSessionsTitle: "अभी कोई सत्र नहीं है",
    viewReportBtn: "सारांश रिपोर्ट देखें",
    resumeConversationBtn: "बातचीत जारी रखें",

    repeatQuestionBtn: "🔊 प्रश्न दोहराएं",
    nextQuestionBtn: "आगे →",
    finishBtn: "समाप्त करें →",
    questionPrefix: "प्रश्न",
    speakingState: "सना बोल रही हैं...",
    listeningState: "माइक्रोफोन सक्रिय है",
    pausedState: "माइक्रोफोन बंद है",
    finishSessionBtn: "सत्र समाप्त करें और सारांश प्राप्त करें",
    typeMessagePlaceholder: "या यहाँ संदेश टाइप करें...",
    sessionDisclaimer: "अनुमानित ग्राफ़िक — चिकित्सा माप नहीं है।",

    heatmapTitle: "गैल्वेनिक स्किन रिस्पॉन्स",
    conductanceLabel: "चालकता",
    resistanceLabel: "प्रतिरोधकता",
    historicalGraphLabel: "ऐतिहासिक ग्राफ",
    lowLabel: "निम्न",
    highLabel: "उच्च",

    reportTitle: "त्रियोरा थेरेपी पूर्व सारांश रिपोर्ट",
    reportDisclaimer: "चिकित्सा पूर्व सूचना: यह रिपोर्ट एक AI-जनरेटेड सारांश है और चिकित्सीय निदान नहीं है।",
    summaryHeader: "सत्र सारांश",
    themesHeader: "प्रमुख चर्चा के विषय",
    concernsHeader: "व्यक्त की गई चिंताएं",
    printReportBtn: "रिपोर्ट प्रिंट करें",

    questions: [
      "आजकल आपके मन में क्या चल रहा है?",
      "इन भावनाओं का आपकी दिनचर्या या काम पर क्या प्रभाव पड़ रहा है?",
      "क्या आपने अपनी नींद या ऊर्जा के स्तर में कोई बदलाव देखा है?",
      "जब आप परेशान महसूस करते हैं, तो आपको क्या मदद करता है या आपने क्या कोशिश की है?",
      "क्या आपके पास कोई दोस्त, परिवार या सपोर्ट सिस्टम है जिससे आप बात कर सकें?",
      "इस समय थेरेपी से आपकी मुख्य क्या अपेक्षाएं या लक्ष्य हैं?",
      "आप इन चिंताओं को कितने समय से महसूस कर रहे हैं?",
      "क्या हाल ही में किसी विशेष घटना ने इन भावनाओं को बढ़ाया है?",
      "दैनिक कार्यों से निपटते समय आपका तनाव स्तर कैसा रहता है?",
      "कौन से कदम या गतिविधियाँ आपको अधिक शांत महसूस कराने में मदद करती हैं?"
    ]
  },
  ml: {
    navHome: "ഹോം",
    navDashboard: "ഡാഷ്‌ബോർഡ്",
    navStartConversation: "സംഭാഷണം തുടങ്ങുക",
    navProfile: "പ്രൊഫൈൽ",
    navSignOut: "സൈൻ ഔട്ട്",
    navSignIn: "സൈൻ ഇൻ",
    navGetStarted: "ആരംഭിക്കുക",

    heroHeadline: "നിങ്ങളുടെ ആദ്യ തെറാപ്പി അപ്പോയിന്റ്മെന്റിന് മുൻപായി നിങ്ങൾക്ക് എങ്ങനെയുണ്ട് എന്ന് സംസാരിക്കൂ.",
    heroSub: "ത്രിയോറ നിങ്ങളുടെ മാതൃഭാഷയിൽ ഒരു സ്വതന്ത്ര സംഭാഷണത്തിലൂടെ നിങ്ങളെ സഹായിക്കുന്നു.",
    getStartedBtn: "ആരംഭിക്കുക",
    signInBtn: "സൈൻ ഇൻ",
    processTitle: "ലളിതമായ 3 ഘട്ടങ്ങൾ",
    benefitsTitle: "പേഷ്യന്റ് കംഫർട്ടിനായി രൂപകൽപ്പന ചെയ്തത്",
    privacyNotice: "ത്രിയോറ തെറാപ്പി മുൻപുള്ള ഇൻടേക്ക് ടൂൾ ആണ്, രോഗനിർണ്ണയമല്ല.",

    signupTitle: "ത്രിയോറ അക്കൗണ്ട് ഉണ്ടാക്കൂ",
    loginTitle: "വീണ്ടും സ്വാഗതം",
    emailLabel: "ഇമെയിൽ വിലാസം",
    passwordLabel: "പാസ്‌വേഡ്",
    nameLabel: "പൂർണ്ണമായ പേര്",
    createAccountBtn: "അക്കൗണ്ട് ഉണ്ടാക്കൂ",
    continueGoogle: "ഗൂഗിൾ വഴി തുടരുക",
    alreadyAccount: "അക്കൗണ്ട് ഉണ്ടോ? സൈൻ ഇൻ ചെയ്യുക",
    dontAccount: "അക്കൗണ്ട് ഇല്ലേ? സൈൻ അപ്പ് ചെയ്യുക",

    onboardingTitle: "പ്രൊഫൈൽ സജ്ജീകരണം",
    step1Header: "ഘട്ടം 1: അടിസ്ഥാന വിവരങ്ങൾ",
    step2Header: "ഘട്ടം 2: പശ്ചാത്തലവും ലക്ഷ്യങ്ങളും",
    step3Header: "ഘട്ടം 3: സമ്മതപത്രം",
    preferredNameLabel: "വിളിക്കേണ്ട പേര്",
    dobLabel: "ജനനതീയതി",
    languageLabel: "സംസാര ഭാഷ",
    backgroundLabel: "തെറാപ്പിക്ക് കാരണമെന്താണ്?",
    experienceLabel: "മുൻപത്തെ തെറാപ്പി പരിചയം",
    goalsLabel: "പ്രധാന ലക്ഷ്യങ്ങൾ",
    continueBtn: "തുടരുക",
    backBtn: "പിന്നോട്ട്",
    completeBtn: "പൂർത്തിയാക്കുക",

    welcomeBack: "വീണ്ടും സ്വാഗതം",
    readyTitle: "നിങ്ങളുടെ വികാരങ്ങൾ പങ്കുവെക്കാൻ തയ്യാറാണോ?",
    startConversationBtn: "പുതിയ സംഭാഷണം ആരംഭിക്കുക",
    previousSessionsTitle: "മുൻപത്തെ സെഷനുകൾ",
    noSessionsTitle: "സെഷനുകൾ ഒന്നുമില്ല",
    viewReportBtn: "സമ്മറി റിപ്പോർട്ട് കാണുക",
    resumeConversationBtn: "സംഭാഷണം തുടരുക",

    repeatQuestionBtn: "🔊 ചോദ്യം ആവർത്തിക്കുക",
    nextQuestionBtn: "അടുത്തത് →",
    finishBtn: "പൂർത്തിയാക്കുക →",
    questionPrefix: "ചോദ്യം",
    speakingState: "സന സംസാരിക്കുന്നു...",
    listeningState: "മൈക്രോഫോൺ പ്രവർത്തിക്കുന്നു",
    pausedState: "മൈക്രോഫോൺ നിർത്തിവെച്ചിരിക്കുന്നു",
    finishSessionBtn: "സെഷൻ പൂർത്തിയാക്കി സമ്മറി ഉണ്ടാക്കൂ",
    typeMessagePlaceholder: "അല്ലെങ്കിൽ ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    sessionDisclaimer: "സിമുലേറ്റ് ചെയ്ത ഗ്രാഫിക് — മെഡിക്കൽ അളവുകളല്ല.",

    heatmapTitle: "ഗാൽവാനിക് സ്കിൻ റെസ്പോൺസ്",
    conductanceLabel: "കണ്ടക്റ്റൻസ്",
    resistanceLabel: "റെസിസ്റ്റൻസ്",
    historicalGraphLabel: "ഗ്രാഫ് ചാർട്ട്",
    lowLabel: "കുറഞ്ഞത്",
    highLabel: "കൂടിയത്",

    reportTitle: "ത്രിയോറ തെറാപ്പി ഇൻടേക്ക് സമ്മറി",
    reportDisclaimer: "മെഡിക്കൽ മുൻകുറിപ്പ്: ഈ റിപ്പോർട്ട് AI നിർമ്മിത സംഗ്രഹമാണ്, രോഗനിർണ്ണയമല്ല.",
    summaryHeader: "സെഷൻ സമ്മറി",
    themesHeader: "ചർച്ച ചെയ്ത വിഷയങ്ങൾ",
    concernsHeader: "പ്രകടിപ്പിച്ച ആശങ്കകൾ",
    printReportBtn: "പ്രിന്റ് ചെയ്യുക",

    questions: [
      "അടുത്തിടെയായി നിങ്ങളുടെ മനസ്സിൽ എന്താണ് ഉള്ളത്?",
      "ഈ വികാരങ്ങൾ നിങ്ങളുടെ ദിനചര്യയെയോ ജോലിയെയോ എങ്ങനെ ബാധിച്ചിരിക്കുന്നു?",
      "നിങ്ങളുടെ ഉറക്കത്തിലോ ഊർജ്ജ നിലയിലോ എന്തെങ്കിലും മാറ്റങ്ങൾ ശ്രദ്ധിച്ചിട്ടുണ്ടോ?",
      "നിങ്ങൾക്ക് മാനസിക സമ്മർദ്ദം തോന്നുമ്പോൾ സാധാരണയായി എന്താണ് സഹായിക്കുന്നത് അല്ലെങ്കിൽ എന്താണ് ശ്രമിച്ചുനോക്കിയത്?",
      "നിങ്ങൾക്ക് തുറന്നു സംസാരിക്കാൻ സുഹൃത്തുക്കളോ കുടുംബമോ പിന്തുണ സംവിധാനമോ ഉണ്ടോ?",
      "ഈ സമയത്ത് തെറാപ്പിയിലൂടെ നിങ്ങൾ കൈവരിക്കാൻ ആഗ്രഹിക്കുന്ന പ്രധാന ലക്ഷ്യം എന്താണ്?",
      "എത്ര കാലമായി നിങ്ങൾ ഈ ആശങ്കകൾ അനുഭവിക്കുന്നു?",
      "അടുത്തിടെ ഈ വികാരങ്ങൾക്ക് കാരണമായ പ്രത്യേക എന്തെങ്കിലും സംഭവിച്ചിട്ടുണ്ടോ?",
      "ദൈനംദിന കാര്യങ്ങൾ ചെയ്യുമ്പോൾ നിങ്ങളുടെ സമ്മർദ്ദ നില എങ്ങനെയുണ്ട്?",
      "ശാന്തത കൈവരിക്കാൻ ഏതെല്ലാം കാര്യങ്ങളാണ് നിങ്ങളെ സഹായിക്കുന്നത്?"
    ]
  },
  ta: {
    navHome: "முகப்பு",
    navDashboard: "டாஷ்போர்டு",
    navStartConversation: "உரையாடலைத் தொடங்கு",
    navProfile: "சுயவிவரம்",
    navSignOut: "வெளியேறு",
    navSignIn: "உள்நுழை",
    navGetStarted: "தொடங்கவும்",

    heroHeadline: "உங்கள் முதல் சிகிச்சை சந்திப்பிற்கு முன் நீங்கள் எவ்வாறு உணர்கிறீர்கள் என்பதைப் பற்றி பேசுங்கள்.",
    heroSub: "த்ரியோரா உங்கள் விருப்பமான மொழியில் குரல் உரையாடல் மூலம் வழிகாட்டுகிறது.",
    getStartedBtn: "தொடங்கவும்",
    signInBtn: "உள்நுழைக",
    processTitle: "எளிய 3 படிகள்",
    benefitsTitle: "நோயாளியின் அமைதிக்காக வடிவமைக்கப்பட்டது",
    privacyNotice: "த்ரியோரா முன்-சிகிச்சை கருவி, மருத்துவ பரிசோதனை அல்ல.",

    signupTitle: "கணக்கை உருவாக்குங்கள்",
    loginTitle: "மீண்டும் வருக",
    emailLabel: "மின்னஞ்சல் முகவரி",
    passwordLabel: "கடவுச்சொல்",
    nameLabel: "முழு பெயர்",
    createAccountBtn: "கணக்கை உருவாக்கு",
    continueGoogle: "கூகிள் மூலம் தொடரவும்",
    alreadyAccount: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக",
    dontAccount: "கணக்கு இல்லையா? பதிவு செய்க",

    onboardingTitle: "சுயவிவர அமைவு",
    step1Header: "படி 1: அடிப்படை വിവരங்கள்",
    step2Header: "படி 2: பின்னணி மற்றும் இலக்குகள்",
    step3Header: "படி 3: விருப்பங்கள்",
    preferredNameLabel: "விருப்பமான பெயர்",
    dobLabel: "பிறந்த தேதி",
    languageLabel: "பேசும் மொழி",
    backgroundLabel: "சிகிச்சைக்கான காரணம் என்ன?",
    experienceLabel: "முந்தைய சிகிச்சை அனுபவம்",
    goalsLabel: "முக்கிய இலக்குகள்",
    continueBtn: "தொடர்க",
    backBtn: "பின்னால்",
    completeBtn: "நிறைவு செய்க",

    welcomeBack: "மீண்டும் வருக",
    readyTitle: "உங்கள் உணர்வுகளைப் பகிர்ந்து கொள்ளத் தயாரா?",
    startConversationBtn: "புதிய உரையாடலைத் தொடங்குங்கள்",
    previousSessionsTitle: "முந்தைய உரையாடல்கள்",
    noSessionsTitle: "உரையாடல்கள் எதுவும் இல்லை",
    viewReportBtn: "அறிக்கையைப் பார்",
    resumeConversationBtn: "உரையாடலைத் தொடர்",

    repeatQuestionBtn: "🔊 கேள்வியை மீண்டும் செய்",
    nextQuestionBtn: "அடுத்து →",
    finishBtn: "முடிக்கவும் →",
    questionPrefix: "கேள்வி",
    speakingState: "சனா பேசுகிறார்...",
    listeningState: "மைக்ரோஃபோன் இயங்குகிறது",
    pausedState: "மைக்ரோஃபோன் நிறுத்தப்பட்டுள்ளது",
    finishSessionBtn: "அமர்வை முடித்து சுருக்கத்தைப் பெறுங்கள்",
    typeMessagePlaceholder: "அல்லது இங்கு தட்டச்சு செய்யவும்...",
    sessionDisclaimer: "மாதிரி வரைபடம் — மருத்துவ அளவீடு அல்ல.",

    heatmapTitle: "கால்வனிக் ஸ்கின் ரெஸ்பான்ஸ்",
    conductanceLabel: "கடத்துத்திறன்",
    resistanceLabel: "மின்தடை",
    historicalGraphLabel: "வரைபடம்",
    lowLabel: "குறைந்த",
    highLabel: "அதிக",

    reportTitle: "த்ரியோரா சிகிச்சை முன் சுருக்க அறிக்கை",
    reportDisclaimer: "மருத்துவ முன் அறிவிப்பு: இந்த அறிக்கை AI உருவாக்கிய சுருக்கமாகும்.",
    summaryHeader: "அமர்வு சுருக்கம்",
    themesHeader: "விவாதிக்கப்பட்ட தலைப்புகள்",
    concernsHeader: "தெரிவிக்கப்பட்ட கவலைகள்",
    printReportBtn: "அறிக்கையை அச்சிடுக",

    questions: [
      "சமீபகாலமாக உங்கள் மனதில் என்ன ஓடிக்கொண்டிருக்கிறது?",
      "இந்த உணர்வுகள் உங்கள் அன்றாட வாழ்க்கை அல்லது வேலையை எவ்வாறு பாதித்துள்ளன?",
      "உங்கள் தூக்கம் அல்லது ஆற்றல் மட்டத்தில் ஏதேனும் மாற்றங்களை கவனித்துள்ளீர்களா?",
      "நீங்கள் மன அழுத்தமாக உணரும்போது, உங்களுக்கு என்ன உதவுகிறது அல்லது என்ன முயற்சி செய்துள்ளீர்கள்?",
      "உங்களிடம் பேசக்கூடிய நண்பர்கள், குடும்பத்தினர் அல்லது ஆதரவு அமைப்பு உள்ளதா?",
      "இந்த நேரத்தில் சிகிச்சை மூலம் நீங்கள் அடைய விரும்பும் முதன்மை இலக்கு என்ன?",
      "எவ்வளவு காலமாக இந்த கவலைகளை அனுபவித்து வருகிறீர்கள்?",
      "சமீபத்தில் இந்த உணர்வுகளைத் தூண்டிய குறிப்பிட்ட விஷயம் ஏதேனும் உள்ளதா?",
      "அன்றாடப் பணிகளைக் கையாளும் போது உங்கள் மன அழுத்த நிலை எவ்வாறு உள்ளது?",
      "எந்த நடவடிக்கைகள் உங்களுக்கு அமைதியைத் தர உதவுகின்றன?"
    ]
  },
  te: {
    navHome: "హోమ్",
    navDashboard: "డాష్‌బోర్డ్",
    navStartConversation: "సంభాషణ ప్రారంభించండి",
    navProfile: "ప్రొఫైల్",
    navSignOut: "సైన్ అవుట్",
    navSignIn: "సైన్ ఇన్",
    navGetStarted: "ప్రారంభించండి",

    heroHeadline: "మీ మొదటి థెరపీ నియామకానికి ముందు మీరు ఎలా భావిస్తున్నారో స్వేచ్ఛగా మాట్లాడండి.",
    heroSub: "త్రియోరా మీ ఇష్టమైన భాషలో వాయిస్ సంభాషణ ద్వారా మార్గనిర్దేశం చేస్తుంది.",
    getStartedBtn: "ప్రారంభించండి",
    signInBtn: "సైన్ ఇన్",
    processTitle: "సులభమైన 3 దశలు",
    benefitsTitle: "పేషెంట్ కంఫర్ట్ కోసం రూపొందించబడింది",
    privacyNotice: "త్రియోరా థెరపీ పూర్వ సాధనం, వైద్య పరీక్ష కాదు.",

    signupTitle: "ఖాతాను సృష్టించండి",
    loginTitle: "తిరిగి స్వాగతం",
    emailLabel: "ఈమెయిల్ చిరునామా",
    passwordLabel: "పాస్‌వర్డ్",
    nameLabel: "పూర్తి పేరు",
    createAccountBtn: "ఖాతాను సృష్టించండి",
    continueGoogle: "గూగుల్‌తో కొనసాగించండి",
    alreadyAccount: "ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి",
    dontAccount: "ఖాతా లేదా? సైన్ అప్ చేయండి",

    onboardingTitle: "ప్రొఫైల్ సెటప్",
    step1Header: "దశ 1: ప్రాథమిక సమాచారం",
    step2Header: "దశ 2: నేపథ్యం మరియు లక్ష్యాలు",
    step3Header: "దశ 3: అంగీకారం",
    preferredNameLabel: "ప్రియమైన పేరు",
    dobLabel: "పుట్టిన తేదీ",
    languageLabel: "మాట్లాడే భాష",
    backgroundLabel: "థెరపీకి ప్రధాన కారణం ఏంటి?",
    experienceLabel: "గత థెరపీ అనుభవం",
    goalsLabel: "ప్రధాన లక్ష్యాలు",
    continueBtn: "కొనసాగించండి",
    backBtn: "వెనుకకు",
    completeBtn: "పూర్తి చేయండి",

    welcomeBack: "తిరిగి స్వాగతం",
    readyTitle: "మీ భావాలను పంచుకోవడానికి సిద్ధంగా ఉన్నారా?",
    startConversationBtn: "కొత్త సంభాషణ ప్రారంభించండి",
    previousSessionsTitle: "గత సంభాషణలు",
    noSessionsTitle: "సంభాషణలు ఏవీ లేవు",
    viewReportBtn: "నివేదిక చూడండి",
    resumeConversationBtn: "సంభాషణ కొనసాగించండి",

    repeatQuestionBtn: "🔊 ప్రశ్నను పునరావృతం చేయండి",
    nextQuestionBtn: "తరువాత →",
    finishBtn: "పూర్తి చేయి →",
    questionPrefix: "ప్రశ్న",
    speakingState: "సనా మాట్లాడుతున్నారు...",
    listeningState: "మైక్రోఫోన్ ప్రారంభంలో ఉంది",
    pausedState: "మైక్రోఫోన్ ఆపివేయబడింది",
    finishSessionBtn: "సెషన్ ముగించి సారాంశం పొందండి",
    typeMessagePlaceholder: "లేదా ఇక్కడ టైప్ చేయండి...",
    sessionDisclaimer: "సిమ్యులేటెడ్ గ్రాఫిక్ — వైద్య కొలత కాదు.",

    heatmapTitle: "గాల్వానిక్ స్కిన్ రెస్పాన్స్",
    conductanceLabel: "కండక్టెన్స్",
    resistanceLabel: "రెసిస్టెన్స్",
    historicalGraphLabel: "చారిత్రక గ్రాఫ్",
    lowLabel: "తక్కువ",
    highLabel: "ఎక్కువ",

    reportTitle: "త్రియోరా థెరపీ పూర్వ సారాంశ నివేదిక",
    reportDisclaimer: "వైద్య పూర్వ నివేదిక: ఇది AI రూపొందించిన సారాంశం.",
    summaryHeader: "సెషన్ సారాంశం",
    themesHeader: "చర్చించిన అంశాలు",
    concernsHeader: "వ్యక్తపరిచిన ఆందోళనలు",
    printReportBtn: "నివేదికను ప్రింట్ చేయండి",

    questions: [
      "ఇటీవల మీ మనస్సులో ఏమి నడుస్తోంది?",
      "ఈ భావాలు మీ దినచర్య లేదా పనిపై ఎలాంటి ప్రభావం చూపుతున్నాయి?",
      "మీ నిద్ర లేదా శక్తి స్థాయిలలో ఏవైనా మార్పులను గమనించారా?",
      "మీరు ఒత్తిడికి గురైనప్పుడు, సాధారణంగా మీకు ఏమి సహాయపడుతుంది లేదా మీరు ఏమి ప్రయత్నించారు?",
      "మీరు మాట్లాడటానికి స్నేహితులు, కుటుంబం లేదా మద్దతు వ్యవస్థ ఉందా?",
      "ఈ సమయంలో థెరపీ ద్వారా మీరు సాధించాలనుకుంటున్న ముఖ్యమైన లక్ష్యం ఏమిటి?",
      "ఎంతకాలంగా మీరు ఈ ఆందోళనలను అనుభవిస్తున్నారు?",
      "ఇటీవల ఈ భావాలను రేకెత్తించిన నిర్దిష్ట సంఘటన ఏదైనా ఉందా?",
      "రోజువారీ పనులను నిర్వహించేటప్పుడు మీ ఒత్తిడి స్థాయి ఎలా ఉంటుంది?",
      "ఏ కార్యకలాపాలు మిమ్మల్ని ప్రశాంతంగా ఉంచడానికి సహాయపడతాయి?"
    ]
  },
  mr: {
    navHome: "मुख्यपृष्ठ",
    navDashboard: "डॅशबोर्ड",
    navStartConversation: "संभाषण सुरू करा",
    navProfile: "प्रोफाइल",
    navSignOut: "साइन आउट",
    navSignIn: "साइन इन",
    navGetStarted: "शुरू करा",

    heroHeadline: "तुमच्या पहिल्या थेरपी भेटीपूर्वी तुम्हाला कसे वाटत आहे याबद्दल मोकळेपणाने बोला.",
    heroSub: "त्रियोरा तुमच्या पसंतीच्या भाषेत व्हॉइस संभाषणाद्वारे मार्गदर्शन करते.",
    getStartedBtn: "शुरू करा",
    signInBtn: "साइन इन करा",
    processTitle: "सोप्या ३ पायऱ्या",
    benefitsTitle: "रुग्णाच्या सोयीसाठी डिझाइन केलेले",
    privacyNotice: "त्रियोरा हे थेरपी पूर्व साधन आहे, वैद्यकीय निदान नाही.",

    signupTitle: "खाते तयार करा",
    loginTitle: "पुन्हा स्वागत आहे",
    emailLabel: "ईमेल पत्ता",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूर्ण नाव",
    createAccountBtn: "खाते तयार करा",
    continueGoogle: "गूगलसह सुरू ठेवा",
    alreadyAccount: "आधीच खाते आहे? साइन इन करा",
    dontAccount: "खाते नाही? साइन अप करा",

    onboardingTitle: "प्रोफाइल सेटअप",
    step1Header: "पायरी १: मूलभूत माहिती",
    step2Header: "पायरी २: पार्श्वभूमी आणि उद्दिष्टे",
    step3Header: "पायरी ३: सहमती",
    preferredNameLabel: "पसंतीचे नाव",
    dobLabel: "जन्म तारीख",
    languageLabel: "बोलण्याची भाषा",
    backgroundLabel: "थेरपीचे मुख्य कारण काय आहे?",
    experienceLabel: "पूर्वीचा थेरपी अनुभव",
    goalsLabel: "मुख्य उद्दिष्टे",
    continueBtn: "पुढे चला",
    backBtn: "मागे",
    completeBtn: "पूर्ण करा",

    welcomeBack: "पुन्हा स्वागत आहे",
    readyTitle: "तुमच्या भावना शेअर करण्यास तयार आहात का?",
    startConversationBtn: "नवीन संभाषण सुरू करा",
    previousSessionsTitle: "मागील सत्रे",
    noSessionsTitle: "अजून कोणतेही सत्र नाही",
    viewReportBtn: "अहवाल पहा",
    resumeConversationBtn: "संभाषण सुरू ठेवा",

    repeatQuestionBtn: "🔊 प्रश्न पुन्हा सांगा",
    nextQuestionBtn: "पुढे →",
    finishBtn: "पूर्ण करा →",
    questionPrefix: "प्रश्न",
    speakingState: "सना बोलत आहेत...",
    listeningState: "मायक्रोफोन चालू आहे",
    pausedState: "मायक्रोफोन बंद आहे",
    finishSessionBtn: "सत्र पूर्ण करा आणि सारांश मिळवा",
    typeMessagePlaceholder: "किंवा येथे टाईप करा...",
    sessionDisclaimer: "सिम्युलेटेड ग्राफिक्स — वैद्यकीय मोजमाप नाही.",

    heatmapTitle: "गॅल्व्हॅनिक स्किन रिस्पॉन्स",
    conductanceLabel: "कंडक्टन्स",
    resistanceLabel: "रेझिस्टन्स",
    historicalGraphLabel: "ग्राफ चार्ट",
    lowLabel: "कमी",
    highLabel: "जास्त",

    reportTitle: "त्रियोरा थेरपी पूर्व सारांश अहवाल",
    reportDisclaimer: "वैद्यकीय पूर्व सूचना: हा अहवाल AI-जनरेट केलेला सारांश आहे.",
    summaryHeader: "सत्र सारांश",
    themesHeader: "चर्चेचे विषय",
    concernsHeader: "व्यक्त केलेल्या चिंता",
    printReportBtn: "अहवाल प्रिंट करा",

    questions: [
      "सध्या तुमच्या मनात काय चालले आहे?",
      "या भावनांचा तुमच्या दैनंदिन दिनचर्येवर किंवा कामावर कसा परिणाम होत आहे?",
      "तुमच्या झोपेच्या पद्धतीत किंवा ऊर्जेच्या पातळीत काही बदल जाणवले आहेत का?",
      "जेव्हा तुम्हाला तणाव जाणवतो, तेव्हा सहसा कशाने मदत होते किंवा तुम्ही काय प्रयत्न केले आहेत?",
      "तुमच्याकडे बोलायला मित्र, कुटुंब किंवा आधार देणारी यंत्रणा आहे का?",
      "या वेळी थेरपीद्वारे तुमचे मुख्य ध्येय काय आहे?",
      "तुम्ही किती काळापासून या चिंता अनुभवत आहात?",
      "नुकतीच अशी कोणती विशिष्ट घटना घडली आहे ज्यामुळे या भावना वाढल्या?",
      "दैनंदिन कामे करताना तुमच्या तणावाची पातळी कशी असते?",
      "कोणत्या गोष्टी किंवा उपक्रम तुम्हाला अधिक शांत राहण्यास मदत करतात?"
    ]
  },
  bn: {
    navHome: "হোম",
    navDashboard: "ড্যাশবোর্ড",
    navStartConversation: "কথোপকথন শুরু করুন",
    navProfile: "প্রোফাইল",
    navSignOut: "সাইন আউট",
    navSignIn: "সাইন ইন",
    navGetStarted: "শুরু করুন",

    heroHeadline: "আপনার প্রথম থেরাপি অ্যাপয়েন্টমেন্টের আগে আপনি কেমন অনুভব করছেন তা নিয়ে কথা বলুন।",
    heroSub: "ত্রিওরা আপনার পছন্দের ভাষায় একটি ভয়েস কথোপকথনের মাধ্যমে আপনাকে সহায়তা করে।",
    getStartedBtn: "শুরু করুন",
    signInBtn: "সাইন ইন করুন",
    processTitle: "সহজ ৩টি ধাপ",
    benefitsTitle: "রোগীর স্বাচ্ছন্দ্যের জন্য ডিজাইন করা",
    privacyNotice: "ত্রিওরা থেরাপি পূর্ববর্তী একটি হাতিয়ার, চিকিৎসা নির্ণয় নয়।",

    signupTitle: "অ্যাকাউন্ট তৈরি করুন",
    loginTitle: "পুনরায় স্বাগতম",
    emailLabel: "ইমেল ঠিকানা",
    passwordLabel: "পাসওয়ার্ড",
    nameLabel: "সম্পূর্ণ নাম",
    createAccountBtn: "অ্যাকাউন্ট তৈরি করুন",
    continueGoogle: "গুগল দিয়ে এগিয়ে যান",
    alreadyAccount: "অ্যাকাউন্ট আছে? সাইন ইন করুন",
    dontAccount: "অ্যাকাউন্ট নেই? সাইন আপ করুন",

    onboardingTitle: "প্রোফাইল সেটআপ",
    step1Header: "ধাপ ১: মৌলিক তথ্য",
    step2Header: "ধাপ ২: পটভূমি এবং লক্ষ্য",
    step3Header: "ধাপ ৩: সম্মতি",
    preferredNameLabel: "পছন্দের নাম",
    dobLabel: "জন্ম তারিখ",
    languageLabel: "কথোপকথনের ভাষা",
    backgroundLabel: "থেরাপির প্রধান কারণ কি?",
    experienceLabel: "পূর্ববর্তী থেরাপির অভিজ্ঞতা",
    goalsLabel: "প্রধান লক্ষ্যসমূহ",
    continueBtn: "এগিয়ে যান",
    backBtn: "পিছনে",
    completeBtn: "সম্পন্ন করুন",

    welcomeBack: "পুনরায় স্বাগতম",
    readyTitle: "আপনার অনুভূতি শেয়ার করতে প্রস্তুত?",
    startConversationBtn: "নতুন কথোপকথন শুরু করুন",
    previousSessionsTitle: "পূর্ববর্তী সেশনসমূহ",
    noSessionsTitle: "কোনো সেশন নেই",
    viewReportBtn: "রিপোর্ট দেখুন",
    resumeConversationBtn: "কথোপকথন চালিয়ে যান",

    repeatQuestionBtn: "🔊 প্রশ্ন পুনরায় বলুন",
    nextQuestionBtn: "পরবর্তী →",
    finishBtn: "সম্পন্ন করুন →",
    questionPrefix: "প্রশ্ন",
    speakingState: "সানা কথা বলছেন...",
    listeningState: "মাইক্রোফোন সক্রিয় আছে",
    pausedState: "মাইক্রোফোন বন্ধ আছে",
    finishSessionBtn: "সেশন শেষ করুন এবং সারাংশ পান",
    typeMessagePlaceholder: "অথবা এখানে টাইপ করুন...",
    sessionDisclaimer: "সিমুলেটেড গ্রাফিক — কোনো চিকিৎসা পরিমাপ নয়।",

    heatmapTitle: "গ্যালভানিক স্কিন রেসপন্স",
    conductanceLabel: "কন্ডাকট্যান্স",
    resistanceLabel: "রেজিস্ট্যান্স",
    historicalGraphLabel: "গ্রাফ চার্ট",
    lowLabel: "কম",
    highLabel: "বেশি",

    reportTitle: "ত্রিওরা থেরাপি পূর্ব সারাংশ রিপোর্ট",
    reportDisclaimer: "চিকিৎসা পূর্ব নোটিশ: এই রিপোর্টটি AI দ্বারা তৈরি সারাংশ।",
    summaryHeader: "সেশন সারাংশ",
    themesHeader: "আলোচিত বিষয়বস্তু",
    concernsHeader: "প্রকাশিত উদ্বেগসমূহ",
    printReportBtn: "রিপোর্ট প্রিন্ট করুন",

    questions: [
      "সাম্প্রতিক সময়ে আপনার মনে কি চলছে?",
      "এই অনুভূতিগুলি আপনার দৈনন্দিন রুটিন বা কাজকে কীভাবে প্রভাবিত করছে?",
      "আপনি কি আপনার ঘুমের ধরণ বা শক্তির মাত্রায় কোনো পরিবর্তন লক্ষ্য করেছেন?",
      "যখন আপনি মানসিক চাপে থাকেন, তখন কী আপনাকে সাহায্য করে বা আপনি কী চেষ্টা করেছেন?",
      "কথা বলার জন্য আপনার কি কোনো বন্ধু, পরিবার বা সহায়ক ব্যবস্থা আছে?",
      "এই মুহূর্তে থেরাপির মাধ্যমে আপনার অর্জনের প্রধান লক্ষ্য কী?",
      "কত দিন ধরে আপনি এই উদ্বেগগুলি অনুভব করছেন?",
      "সম্প্রতি কি এমন কোনো ঘটনা ঘটেছে যা এই অনুভূতিগুলিকে বাড়িয়ে তুলেছে?",
      "দৈনন্দিন কাজ পরিচালনার সময় আপনার মানসিক চাপের মাত্রা কেমন থাকে?",
      "কোন পদক্ষেপ বা কাজগুলি আপনাকে আরও শান্ত অনুভব করতে সাহায্য করে?"
    ]
  }
};

export const getTranslation = (langCode: string = 'en'): Translations => {
  const code = (langCode || 'en').toLowerCase();
  return (
    DICTIONARY[code] ||
    DICTIONARY.en
  );
};
