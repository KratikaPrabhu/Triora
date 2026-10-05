const fs = require('fs');
const path = require('path');

const languageContextPath = 'src/context/LanguageContext.tsx';
let langContent = fs.readFileSync(languageContextPath, 'utf8');

const newTranslations = {
  en: {
    logoName: 'triora',
    footerSlogan: 'Voice-first preparation for a more human beginning to therapy.',
    terms: 'Terms',
    contact: 'Contact',
    footerDisclaimer: '© 2026 Triora. Triora is not a crisis service or a substitute for medical care.'
  },
  hi: {
    logoName: 'त्रियोरा',
    footerSlogan: 'थेरेपी की अधिक मानवीय शुरुआत के लिए आवाज-आधारित तैयारी।',
    terms: 'शर्तें',
    contact: 'संपर्क',
    footerDisclaimer: '© 2026 त्रियोरा। त्रियोरा कोई क्राइसिस सेवा या चिकित्सा देखभाल का विकल्प नहीं है।'
  },
  te: {
    logoName: 'ట్రియోరా',
    footerSlogan: 'థెరపీ ప్రారంభానికి మరింత మానవీయమైన వాయిస్-ఫస్ట్ తయారీ.',
    terms: 'నిబంధనలు',
    contact: 'సంప్రదించండి',
    footerDisclaimer: '© 2026 ట్రియోరా. ట్రియోరా అనేది క్రైసిస్ సర్వీస్ లేదా వైద్య సంరక్షణకు ప్రత్యామ్నాయం కాదు.'
  },
  kn: {
    logoName: 'ಟ್ರಿಯೋರಾ',
    footerSlogan: 'ಥೆರಪಿಯ ಮಾನವೀಯ ಆರಂಭಕ್ಕಾಗಿ ಧ್ವನಿ-ಮೊದಲ ತಯಾರಿ.',
    terms: 'ನಿಯಮಗಳು',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
    footerDisclaimer: '© 2026 ಟ್ರಿಯೋರಾ. ಟ್ರಿಯೋರಾ ಬಿಕ್ಕಟ್ಟು ಸೇವೆಯಲ್ಲ ಅಥವಾ ವೈದ್ಯಕೀಯ ಆರೈಕೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.'
  },
  ta: {
    logoName: 'ட்ரியோரா',
    footerSlogan: 'சிகிச்சையின் மனிதாபிமான தொடக்கத்திற்கான குரல்-முதல் தயாரிப்பு.',
    terms: 'விதிமுறைகள்',
    contact: 'தொடர்பு',
    footerDisclaimer: '© 2026 ட்ரியோரா. ட்ரியோரா நெருக்கடி சேவை அல்லது மருத்துவ பராமரிப்புக்கு மாற்றாக இல்லை.'
  },
  ml: {
    logoName: 'ട്രിയോറ',
    footerSlogan: 'തെറാപ്പിയുടെ കൂടുതൽ മാനുഷികമായ തുടക്കത്തിനായി വോയ്‌സ്-ഫസ്റ്റ് തയ്യാറെടുപ്പ്.',
    terms: 'നിബന്ധനകൾ',
    contact: 'ബന്ധപ്പെടുക',
    footerDisclaimer: '© 2026 ട്രിയോറ. ട്രിയോറ പ്രതിസന്ധി സേവനം അല്ലെങ്കിൽ വൈദ്യ പരിചരണത്തിന് പകരമല്ല.'
  },
  mr: {
    logoName: 'त्रियोरा',
    footerSlogan: 'थेरपीच्या अधिक मानवी सुरुवातीसाठी व्हॉइस-फर्स्ट तयारी.',
    terms: 'अटी',
    contact: 'संपर्क',
    footerDisclaimer: '© 2026 त्रियोरा. त्रियोरा ही आपत्कालीन सेवा किंवा वैद्यकीय उपचारांना पर्याय नाही.'
  },
  bn: {
    logoName: 'ট্রিওরা',
    footerSlogan: 'থেরাপির আরও মানবিক শুরুর জন্য ভয়েস-ফার্স্ট প্রস্তুতি।',
    terms: 'শর্তাবলী',
    contact: 'যোগাযোগ',
    footerDisclaimer: '© 2026 ট্রিওরা। ট্রিওরা কোনো সংকটকালীন পরিষেবা বা চিকিৎসার বিকল্প নয়।'
  }
};

for (const lang of Object.keys(newTranslations)) {
  const langKey = lang + ': {';
  const blockStart = langContent.indexOf(langKey);
  if (blockStart === -1) continue;
  
  let bracketCount = 0;
  let blockEnd = -1;
  for (let i = blockStart + langKey.length - 1; i < langContent.length; i++) {
    if (langContent[i] === '{') bracketCount++;
    if (langContent[i] === '}') bracketCount--;
    if (bracketCount === 0) {
      blockEnd = i;
      break;
    }
  }
  
  const insertContent = Object.entries(newTranslations[lang])
    .map(([k, v]) => '    ' + k + ': ' + JSON.stringify(v) + ',')
    .join('\n');
    
  langContent = langContent.substring(0, blockEnd) + insertContent + '\n  ' + langContent.substring(blockEnd);
}
fs.writeFileSync(languageContextPath, langContent);
