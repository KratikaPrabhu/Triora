/**
 * Triora Crisis & Risk Detection Protocol
 * Active keyword, intent, and distress detection for clinical safety net.
 * Provides immediate grounding protocols, crisis helpline contacts, and safety alerts.
 */

export interface CrisisRiskAssessment {
  isCrisis: boolean;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'imminent';
  detectedTriggers: string[];
  crisisType?: 'self_harm' | 'suicidal_ideation' | 'acute_panic_trauma' | 'violence' | 'general_distress';
  groundingMessage: string;
  safetyResources: Array<{
    name: string;
    contact: string;
    description: string;
    available: string;
  }>;
}

// Regex trigger patterns for acute risk detection
const IMMINENT_SUICIDE_TRIGGERS = [
  /\b(kill|end)\s+(my\s*self|it\s*all|my\s*life)\b/i,
  /\bcommit\s+suicide\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|exist|wake\s+up)\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bsuicide\s+(attempt|plan|note)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bending\s+my\s+life\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
  // Multilingual triggers (Hindi, etc.)
  /आत्महत्या/i,
  /मरना\s*चाहता/i,
  /जीना\s*नहीं\s*चाहता/i,
  /साव\s*चाहता/i
];

const SELF_HARM_TRIGGERS = [
  /\b(cut|cutting|burn|hurting)\s+myself\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt\s+myself\b/i,
  /\bcut\s+my\s+wrists?\b/i,
  /\boverdose\b/i,
  /\bharming\s+myself\b/i
];

const ACUTE_PANIC_TRAUMA_TRIGGERS = [
  /\bcan'?t\s+breathe\b/i,
  /\bhaving\s+a\s+panic\s+attack\b/i,
  /\bchest\s+is\s+pounding\b/i,
  /\blosing\s+my\s+mind\b/i,
  /\beverything\s+is\s+spinning\b/i,
  /\bterror\s+attack\b/i,
  /\bflashback\b/i,
  /\bfeel\s+like\s+dying\b/i
];

export const CRISIS_HELPLINES = [
  {
    name: 'National Suicide & Crisis Lifeline (US & Canada)',
    contact: '988 (Call or Text) | 988lifeline.org',
    description: 'Free, confidential, 24/7 support for people in suicidal crisis or emotional distress.',
    available: '24/7 Toll-Free'
  },
  {
    name: 'Tele-MANAS (Govt of India Mental Health Helpline)',
    contact: '14416 or 1800-891-4416',
    description: '24/7 multi-lingual psychiatric & psychological emergency assistance across all states in India.',
    available: '24/7 Toll-Free'
  },
  {
    name: 'KIRAN National Mental Health Helpline (India)',
    contact: '1800-599-0019',
    description: 'Free psychological first aid and crisis management support.',
    available: '24/7 Toll-Free'
  },
  {
    name: 'The Trevor Project (LGBTQ+ Youth Crisis Support)',
    contact: '1-866-488-7386 | Text START to 678-678',
    description: 'Dedicated 24/7 crisis intervention and suicide prevention for LGBTQ young people.',
    available: '24/7 Toll-Free'
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    description: 'Connect with a volunteer crisis counselor 24/7 via SMS in US/UK/Canada.',
    available: '24/7 Free'
  }
];

export class CrisisDetector {
  /**
   * Evaluates text for immediate self-harm, suicidal ideation, or acute panic trauma triggers.
   */
  static assessRisk(text: string, language = 'en'): CrisisRiskAssessment {
    if (!text || typeof text !== 'string') {
      return {
        isCrisis: false,
        severity: 'none',
        detectedTriggers: [],
        groundingMessage: '',
        safetyResources: []
      };
    }

    const cleanText = text.trim();
    const detectedTriggers: string[] = [];

    // 1. Check imminent suicide triggers
    for (const pattern of IMMINENT_SUICIDE_TRIGGERS) {
      const match = cleanText.match(pattern);
      if (match) {
        detectedTriggers.push(match[0]);
      }
    }

    if (detectedTriggers.length > 0) {
      return {
        isCrisis: true,
        severity: 'imminent',
        crisisType: 'suicidal_ideation',
        detectedTriggers,
        groundingMessage:
          'I hear how much pain you are going through right now, and your life is deeply important. Please pause with me: take a deep breath. You do not have to carry this alone. Please connect with emergency services or a crisis counselor immediately.',
        safetyResources: CRISIS_HELPLINES
      };
    }

    // 2. Check self-harm triggers
    for (const pattern of SELF_HARM_TRIGGERS) {
      const match = cleanText.match(pattern);
      if (match) {
        detectedTriggers.push(match[0]);
      }
    }

    if (detectedTriggers.length > 0) {
      return {
        isCrisis: true,
        severity: 'high',
        crisisType: 'self_harm',
        detectedTriggers,
        groundingMessage:
          'I hear that you are hurting intensely. Please keep yourself safe right now. Let us pause: place both feet flat on the floor, unclench your shoulders, and exhale slowly. Professional crisis counselors are available right now to support you without judgment.',
        safetyResources: CRISIS_HELPLINES
      };
    }

    // 3. Check acute panic / trauma overwhelm triggers
    for (const pattern of ACUTE_PANIC_TRAUMA_TRIGGERS) {
      const match = cleanText.match(pattern);
      if (match) {
        detectedTriggers.push(match[0]);
      }
    }

    if (detectedTriggers.length > 0) {
      return {
        isCrisis: true,
        severity: 'moderate',
        crisisType: 'acute_panic_trauma',
        detectedTriggers,
        groundingMessage:
          'You are safe right here in this moment. Let us do a quick grounding technique (5-4-3-2-1): Look around you and name 5 things you can see, 4 things you can physically touch, 3 sounds you can hear, 2 scents you can smell, and 1 slow breath you can take in. We can pause whenever you need.',
        safetyResources: CRISIS_HELPLINES
      };
    }

    return {
      isCrisis: false,
      severity: 'none',
      detectedTriggers: [],
      groundingMessage: '',
      safetyResources: []
    };
  }
}

export default CrisisDetector;
