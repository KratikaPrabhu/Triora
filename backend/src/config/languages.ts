/**
 * The languages Triora can hold a conversation in.
 *
 * Every entry is verified against the voice list Azure actually returns for the
 * configured region — a voice name that does not exist there fails silently at
 * synthesis time and the patient simply gets no sound, so these are not written
 * from memory.
 */

export interface Language {
  /** Stored on the account and the session. */
  code: string;
  /** Azure STT/TTS locale. */
  locale: string;
  /** Azure neural voice used for Triora's turns. */
  voice: string;
  /** Shown in the picker, in the language itself. */
  nativeName: string;
  /** Used in prompts and in the report, where an English name is clearer. */
  englishName: string;
}

export const LANGUAGES: Language[] = [
  {
    code: "en",
    locale: "en-US",
    voice: "en-US-AvaMultilingualNeural",
    nativeName: "English",
    englishName: "English",
  },
  {
    code: "hi",
    locale: "hi-IN",
    voice: "hi-IN-AnanyaNeural",
    nativeName: "हिन्दी",
    englishName: "Hindi",
  },
  {
    code: "kn",
    locale: "kn-IN",
    voice: "kn-IN-SapnaNeural",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
  },
  {
    code: "ta",
    locale: "ta-IN",
    voice: "ta-IN-PallaviNeural",
    nativeName: "தமிழ்",
    englishName: "Tamil",
  },
  {
    code: "te",
    locale: "te-IN",
    voice: "te-IN-ShrutiNeural",
    nativeName: "తెలుగు",
    englishName: "Telugu",
  },
  {
    code: "ml",
    locale: "ml-IN",
    voice: "ml-IN-SobhanaNeural",
    nativeName: "മലയാളം",
    englishName: "Malayalam",
  },
  {
    code: "mr",
    locale: "mr-IN",
    voice: "mr-IN-AarohiNeural",
    nativeName: "मराठी",
    englishName: "Marathi",
  },
  {
    code: "bn",
    locale: "bn-IN",
    voice: "bn-IN-TanishaaNeural",
    nativeName: "বাংলা",
    englishName: "Bengali",
  },
];

export const DEFAULT_LANGUAGE = "en";

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code);

export function languageFor(code: string | undefined | null): Language {
  return (
    LANGUAGES.find((language) => language.code === code) ??
    LANGUAGES.find((language) => language.code === DEFAULT_LANGUAGE)!
  );
}

/**
 * Locales offered to Azure's speech recogniser for one session.
 *
 * Always the chosen language *and* English, never the chosen language alone.
 * People do not switch cleanly between languages — someone answering in Kannada
 * says "office", "tension", "interview" in English mid-sentence, because that is
 * how the words are actually used. Recognition pinned to a single locale turns
 * those into the nearest native-sounding nonsense and the transcript stops being
 * what the patient said. Continuous identification across the pair keeps
 * code-mixed speech intact.
 *
 * Azure allows at most four candidates for continuous identification; a pair
 * stays well inside that and keeps identification accurate, which a long list
 * would not.
 */
export function recognitionLocales(code: string): string[] {
  const language = languageFor(code);
  if (language.locale === "en-US") return ["en-US"];
  return [language.locale, "en-US"];
}

export default LANGUAGES;
