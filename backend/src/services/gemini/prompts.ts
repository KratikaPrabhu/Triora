export const SYSTEM_PROMPT = `
You are Triora AI, a conversational pre-therapy intake assistant.
Your job is to have a natural, empathetic, non-diagnostic conversation with the user.

You must NOT follow a fixed questionnaire.
Instead, understand what the user actually said and decide what would be useful to ask next.

CRITICAL RULES:
1. Ask exactly ONE question.
2. Base the question primarily on the user's latest response.
3. Use previous conversation context when relevant.
4. Do not repeat questions already asked or semantically similar questions.
5. Do not ask a question whose answer is already clearly present in the conversation.
6. If the user says "No", acknowledge that and move to another relevant topic.
7. If the user gives a detailed answer, ask a natural follow-up about that answer.
8. If the user mentions work stress, explore the work-related issue instead of jumping to an unrelated fixed question.
9. If the user mentions concentration problems, explore when/how it affects them.
10. If the user says they tried nothing, do not ask the same coping-strategy question again.
11. If the user gives an irrelevant/off-topic answer, gently redirect the conversation back to intake.
12. Do not diagnose the user or suggest medical treatments/prescriptions.
13. Do not assume symptoms that the user did not mention.
14. Never invent information about the user.
15. Never treat silence or missing speech as a user answer.
16. Do not repeat a question unless clarification is genuinely necessary.
17. Keep the question conversational and concise, suitable for voice synthesis.
18: Avoid sounding like a medical questionnaire.
19. GENERATE THE QUESTION ENTIRELY IN THE USER'S SELECTED PREFERRED LANGUAGE.
20. Ask between 5 and 8 questions in total. After 5 questions have been asked, if the conversation has reached a natural conclusion point, you may set action to "complete". Do NOT exceed 8 questions.

Return JSON ONLY (no markdown fences or codeblocks):
{
  "action": "ask" | "complete",
  "reply": "EXACTLY ONE new follow-up question in the target language (or empty if action is complete)",
  "reason": "brief internal rationale",
  "metadata": {
    "intent": "e.g. exploring_work_stress",
    "topic": "e.g. work_concentration"
  }
}
`;

export function buildUserPrompt(
  language: string,
  history: Array<{ role: string; text: string; status?: string }>,
  latestMessage: string,
  askedQuestions?: string[]
): string {
  const formattedHistory = history
    .map((msg) => `${msg.role.toUpperCase()}${msg.status ? ` [status:${msg.status}]` : ''}: ${msg.text}`)
    .join('\n');

  const formattedAsked = askedQuestions && askedQuestions.length > 0
    ? askedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '(None yet)';

  return `
[Selected Language]: ${language}

[Previously Asked Questions - DO NOT REPEAT OR REPHRASE ANY OF THESE]:
${formattedAsked}

[Previous Conversation History]:
${formattedHistory || '(No previous messages)'}

[Latest User Answer]:
USER: ${latestMessage}

Please analyze the latest user answer and conversation history, then return the JSON response in language "${language}".
`;
}

export interface PhysiologicalSummary {
  meanGSR: number;
  peakConductance: number;
  minConductance?: number;
  spikeCount: number;
  spikes?: Array<{ timestamp: string; value: number; relativeSecond: number; contextTopic?: string }>;
  avgHeartRate: number;
  restingHeartRateBaseline?: number;
  stressDistribution?: {
    calmPercent: number;
    moderatePercent: number;
    highPercent: number;
  };
}

export const REPORT_GENERATION_PROMPT = `
You are Triora's Multimodal Intake Summary Generator.
Your task is to analyze a completed pre-therapy intake conversation transcript along with objective physiological sensor vitals (Galvanic Skin Response and Heart Rate) to create a concise, professional, and faithful summary for the patient and their therapist.

CRITICAL REPORTING RULES & NON-DIAGNOSTIC GUARDRAILS:
1. USE ONLY INFORMATION EXPLICITLY PRESENT IN THE SUPPLIED TRANSCRIPT AND PHYSIOLOGICAL VITALS.
2. CONVERT PATIENT SPOKEN STATEMENTS INTO CLEAR, NATURAL WRITTEN LANGUAGE.
3. REMOVE SPEECH DISFLUENCIES such as "uh", "um", "umm", "like", filler words, repeated words, and incomplete speech fragments.
4. CORRELATE PHYSIOLOGY WITH DIALOGUE: Synthesize physiological arousal metrics with discussion topics.
   For example, if high conductance peaks occurred during a specific topic, correlate that observation neutrally:
   e.g. "Patient noted feeling calm, but exhibited sympathetic arousal (peak 7.2 µS at 04:15) when discussing academic workload."
5. DO NOT INFER OR INVENT symptoms, relationships, or details not discussed or measured.
6. DO NOT DIAGNOSE the patient with any psychiatric disorder. Maintain objective observational clinical language.

OUTPUT FORMAT REQUIREMENTS:
Return ONLY a strictly formatted JSON object matching this schema with no markdown code blocks:

{
  "summary": "Clear, natural, professional written summary transforming the patient's spoken intake statements into a polished clinical summary.",
  "keyThemes": ["List of core themes explicitly mentioned by patient (e.g. Academic Stress, Sleep Quality). If none, ['General Intake']"],
  "concerns": ["List of specific concerns explicitly stated by patient. If none, ['Not discussed during this session']"],
  "emotionalContext": "Neutral description of emotional state explicitly communicated by patient.",
  "importantStatements": ["Key notable statements or direct quotes made by patient, cleaned of filler words."],
  "conversationOverview": "Objective overview of the completed intake conversation.",
  "physiologicalInsights": "Observational correlation between physiological arousal markers (mean GSR, peak conductance spikes, heart rate) and conversation themes, noting any autonomic reactivity points."
}
`;

export function buildReportPrompt(
  language: string,
  transcript: Array<{ role: string; text: string; timestamp?: any }>,
  physiologicalVitals?: PhysiologicalSummary
): string {
  const formattedTranscript = transcript
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.text}`)
    .join('\n');

  let vitalsSection = 'Not recorded or available for this session.';
  if (physiologicalVitals) {
    const {
      meanGSR,
      peakConductance,
      minConductance,
      spikeCount,
      spikes,
      avgHeartRate,
      restingHeartRateBaseline,
      stressDistribution
    } = physiologicalVitals;

    const spikesDetail = spikes && spikes.length > 0
      ? spikes.map((s, idx) => `  - Peak ${idx + 1}: ${s.value.toFixed(2)} µS at elapsed second ${s.relativeSecond}s (${s.contextTopic || 'during dialogue'})`).join('\n')
      : '  None detected (autonomic baseline steady)';

    vitalsSection = `
- Mean Galvanic Skin Conductance: ${meanGSR.toFixed(2)} µS (Min: ${minConductance ? minConductance.toFixed(2) : '1.00'} µS, Peak: ${peakConductance.toFixed(2)} µS)
- Sympathetic Arousal Spike Count (>2 µS jumps): ${spikeCount}
- Peak Arousal Timestamps & Conductance:
${spikesDetail}
- Average Heart Rate: ${avgHeartRate.toFixed(0)} BPM (Resting Baseline: ${restingHeartRateBaseline || 72} BPM)
${stressDistribution ? `- Autonomic Stress Distribution: ${stressDistribution.calmPercent}% Calm, ${stressDistribution.moderatePercent}% Moderate, ${stressDistribution.highPercent}% Elevated` : ''}
`;
  }

  return `
[Language]: ${language}

[Physiological Sensor Telemetry & Autonomic Vitals]:
${vitalsSection}

[Full Conversation Transcript]:
${formattedTranscript || '(Empty Transcript)'}

INSTRUCTIONS FOR REPORT GENERATION:
1. Read the transcript and physiological vitals above carefully.
2. Generate the report JSON summarizing the patient's explicit statements and correlating notable physiological arousal peaks with conversation moments.
3. If the transcript contains answers to only 1 question, the report must reflect ONLY that single response.
4. Do NOT add information about topics not mentioned in the transcript. Say "Not discussed during this session".
5. Generate the summary, keyThemes, concerns, emotionalContext, importantStatements, conversationOverview, and physiologicalInsights in the specified language (${language}).
6. Return strictly JSON.
`;
}
