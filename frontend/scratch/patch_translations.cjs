const fs = require('fs');

const file = 'src/context/LanguageContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const translations = {
  hi: {
    overview: 'अवलोकन', conversations: 'बातचीत', reports: 'रिपोर्ट', goodMorning: 'सुप्रभात', goodAfternoon: 'शुभ दोपहर', goodEvening: 'शुभ संध्या',
    takeAMoment: 'थोड़ा समय लें। यहाँ कोई जल्दी नहीं है।', privateSpaceToTalk: 'बात करने के लिए एक निजी जगह', whatsOnYourMind: 'आपके मन में क्या है?',
    speakFreely1015: '10-15 मिनट तक खुलकर बोलें। ट्रियोरा सुनेगा और जो आप अपने थेरेपिस्ट को समझाना चाहते हैं उसे व्यवस्थित करने में मदद करेगा।', nothingSharedWithoutYou: 'आपकी अनुमति के बिना कुछ भी साझा नहीं किया जाएगा',
    recentConversations: 'हाल की बातचीत', viewAll: 'सभी देखें', noConversationsYet: 'अभी तक कोई बातचीत रिकॉर्ड नहीं की गई है',
    whenYouStartSession: 'जब आप कोई सत्र शुरू करते हैं, तो आपके निजी सारांश यहाँ दिखाई देंगे।', reportReady: 'रिपोर्ट तैयार', inProgress: 'प्रगति पर',
    viewReport: 'रिपोर्ट देखें', nextAppointment: 'आपकी अगली अपॉइंटमेंट', noAppointmentAdded: 'कोई अपॉइंटमेंट नहीं जोड़ी गई',
    addDateToKeepPrep: 'अपनी तैयारी को एक जगह रखने के लिए एक तारीख जोड़ें।', addAppointment: '+ अपॉइंटमेंट जोड़ें',
    crisisNotice: 'तत्काल सहायता चाहिए? ट्रियोरा क्राइसिस सर्विस नहीं है। यदि आप आपातकालीन संकट में हैं, तो कृपया तुरंत स्थानीय क्राइसिस नंबर या स्वास्थ्य पेशेवरों से संपर्क करें।',
    sessionTimer: 'बातचीत सत्र', sessionHeadline: 'अपना समय लें। जब आप तैयार हों तब बोलें।', speakPlaceholder: 'आपके बोले गए शब्द यहाँ वास्तविक समय में दिखाई देंगे...',
    typePlaceholder: 'या यदि आप बोलना नहीं चाहते तो अपने विचार यहाँ टाइप करें...', sendConversation: 'प्रतिक्रिया भेजें', finishAndSummary: 'समाप्त करें और सारांश बनाएँ',
    synthesizingSummary: 'आपकी बातचीत को एक संरचित रिपोर्ट में संश्लेषित किया जा रहा है...', reportSummaryTitle: 'बातचीत का सारांश', privateIntakeDoc: 'निजी इंटेक दस्तावेज़',
    reportNotice: 'यह सारांश आपकी बातचीत से तैयार किया गया है। अपने थेरेपिस्ट के साथ साझा करने से पहले इसकी समीक्षा और संपादन करें।', inYourWords: 'आपके शब्दों में',
    summaryOverview: 'सारांश अवलोकन', print: 'प्रिंट करें', shareWithTherapist: 'थेरेपिस्ट के साथ साझा करें', linkCopied: 'लिंक कॉपी किया गया!', returnToDashboard: 'डैशबोर्ड पर लौटें'
  },
  te: {
    overview: 'అవలోకనం', conversations: 'సంభాషణలు', reports: 'నివేదికలు', goodMorning: 'శుభోదయం', goodAfternoon: 'శుభ మధ్యాహ్నం', goodEvening: 'శుభ సాయంత్రం',
    takeAMoment: 'కాస్త సమయం తీసుకోండి. ఇక్కడ తొందర లేదు.', privateSpaceToTalk: 'మాట్లాడటానికి ఒక ప్రైవేట్ స్థలం', whatsOnYourMind: 'మీ మనసులో ఏముంది?',
    speakFreely1015: '10–15 నిమిషాలు స్వేచ్ఛగా మాట్లాడండి. ట్రియోరా వింటుంది.', nothingSharedWithoutYou: 'మీ అనుమతి లేకుండా ఏమీ షేర్ చేయబడదు',
    recentConversations: 'ఇటీవలి సంభాషణలు', viewAll: 'అన్నీ చూడండి', noConversationsYet: 'సంభాషణలు ఏవీ రికార్డ్ కాలేదు',
    whenYouStartSession: 'మీరు సెషన్‌ను ప్రారంభించినప్పుడు, మీ సారాంశాలు ఇక్కడ కనిపిస్తాయి.', reportReady: 'రిపోర్ట్ సిద్ధంగా ఉంది', inProgress: 'ప్రగతిలో ఉంది',
    viewReport: 'రిపోర్ట్ చూడండి', nextAppointment: 'మీ తదుపరి అపాయింట్‌మెంట్', noAppointmentAdded: 'అపాయింట్‌మెంట్ జోడించబడలేదు',
    addDateToKeepPrep: 'తేదీని జోడించండి.', addAppointment: '+ అపాయింట్‌మెంట్ జోడించండి',
    crisisNotice: 'తక్షణ మద్దతు కావాలా? ట్రియోరా ఒక క్రైసిస్ సర్వీస్ కాదు. దయచేసి స్థానిక వైద్యులను సంప్రదించండి.',
    sessionTimer: 'సంభాషణ సెషన్', sessionHeadline: 'సమయం తీసుకోండి. సిద్ధంగా ఉన్నప్పుడు మాట్లాడండి.', speakPlaceholder: 'మీ పదాలు ఇక్కడ కనిపిస్తాయి...',
    typePlaceholder: 'లేదా మీ ఆలోచనలను ఇక్కడ టైప్ చేయండి...', sendConversation: 'పంపండి', finishAndSummary: 'ముగించండి & సారాంశం రూపొందించండి',
    synthesizingSummary: 'సారాంశాన్ని సిద్ధం చేస్తోంది...', reportSummaryTitle: 'సంభాషణ సారాంశం', privateIntakeDoc: 'ప్రైవేట్ డాక్యుమెంట్',
    reportNotice: 'దీన్ని మీ థెరపిస్ట్‌తో పంచుకునే ముందు సమీక్షించండి.', inYourWords: 'మీ మాటల్లో',
    summaryOverview: 'సారాంశం అవలోకనం', print: 'ప్రింట్ చేయండి', shareWithTherapist: 'థెరపిస్ట్‌తో షేర్ చేయండి', linkCopied: 'లింక్ కాపీ చేయబడింది!', returnToDashboard: 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి'
  },
  kn: {
    overview: 'ಅವಲೋಕನ', conversations: 'ಸಂಭಾಷಣೆಗಳು', reports: 'ವರದಿಗಳು', goodMorning: 'ಶುಭೋದಯ', goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ', goodEvening: 'ಶುಭ ಸಂಜೆ',
    takeAMoment: 'ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ. ಇಲ್ಲಿ ಆತುರವಿಲ್ಲ.', privateSpaceToTalk: 'ಮಾತನಾಡಲು ಖಾಸಗಿ ಸ್ಥಳ', whatsOnYourMind: 'ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?',
    speakFreely1015: '10-15 ನಿಮಿಷ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ.', nothingSharedWithoutYou: 'ನಿಮ್ಮ ಅನುಮತಿಯಿಲ್ಲದೆ ಏನನ್ನೂ ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ',
    recentConversations: 'ಇತ್ತೀಚಿನ ಸಂಭಾಷಣೆಗಳು', viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ', noConversationsYet: 'ಇನ್ನೂ ಯಾವುದೇ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ',
    whenYouStartSession: 'ನೀವು ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿದಾಗ ಸಾರಾಂಶಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.', reportReady: 'ವರದಿ ಸಿದ್ಧವಾಗಿದೆ', inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    viewReport: 'ವರದಿ ವೀಕ್ಷಿಸಿ', nextAppointment: 'ನಿಮ್ಮ ಮುಂದಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್', noAppointmentAdded: 'ಯಾವುದೇ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಸೇರಿಸಿಲ್ಲ',
    addDateToKeepPrep: 'ದಿನಾಂಕವನ್ನು ಸೇರಿಸಿ.', addAppointment: '+ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಸೇರಿಸಿ',
    crisisNotice: 'ತಕ್ಷಣದ ಬೆಂಬಲ ಬೇಕೇ? ಟ್ರಿಯೋರಾ ಬಿಕ್ಕಟ್ಟು ಸೇವೆಯಲ್ಲ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    sessionTimer: 'ಸಂಭಾಷಣೆ ಸೆಷನ್', sessionHeadline: 'ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ. ಸಿದ್ಧವಾದಾಗ ಮಾತನಾಡಿ.', speakPlaceholder: 'ನಿಮ್ಮ ಮಾತುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ...',
    typePlaceholder: 'ಅಥವಾ ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...', sendConversation: 'ಕಳುಹಿಸಿ', finishAndSummary: 'ಮುಕ್ತಾಯಗೊಳಿಸಿ & ಸಾರಾಂಶ ರಚಿಸಿ',
    synthesizingSummary: 'ಸಾರಾಂಶವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...', reportSummaryTitle: 'ಸಂಭಾಷಣೆ ಸಾರಾಂಶ', privateIntakeDoc: 'ಖಾಸಗಿ ದಾಖಲೆ',
    reportNotice: 'ಥೆರಪಿಸ್ಟ್ ಜೊತೆ ಹಂಚಿಕೊಳ್ಳುವ ಮುನ್ನ ಪರಿಶೀಲಿಸಿ.', inYourWords: 'ನಿಮ್ಮ ಮಾತುಗಳಲ್ಲಿ',
    summaryOverview: 'ಸಾರಾಂಶ ಅವಲೋಕನ', print: 'ಮುದ್ರಿಸಿ', shareWithTherapist: 'ಥೆರಪಿಸ್ಟ್ ಜೊತೆ ಹಂಚಿಕೊಳ್ಳಿ', linkCopied: 'ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!', returnToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ'
  },
  ta: {
    overview: 'கண்ணோட்டம்', conversations: 'உரையாடல்கள்', reports: 'அறிக்கைகள்', goodMorning: 'காலை வணக்கம்', goodAfternoon: 'மதிய வணக்கம்', goodEvening: 'மாலை வணக்கம்',
    takeAMoment: 'சிறிது நேரம் எடுத்துக்கொள்ளுங்கள். அவசரம் இல்லை.', privateSpaceToTalk: 'பேசுவதற்கு ஒரு தனிப்பட்ட இடம்', whatsOnYourMind: 'உங்கள் மனதில் என்ன இருக்கிறது?',
    speakFreely1015: '10-15 நிமிடங்கள் சுதந்திரமாக பேசுங்கள்.', nothingSharedWithoutYou: 'உங்கள் அனுமதியின்றி எதுவும் பகிரப்படாது',
    recentConversations: 'சமீபத்திய உரையாடல்கள்', viewAll: 'அனைத்தையும் காண்க', noConversationsYet: 'இன்னும் உரையாடல்கள் இல்லை',
    whenYouStartSession: 'நீங்கள் அமர்வைத் தொடங்கும்போது சுருக்கங்கள் இங்கே தோன்றும்.', reportReady: 'அறிக்கை தயார்', inProgress: 'செயல்பாட்டில் உள்ளது',
    viewReport: 'அறிக்கையைக் காண்க', nextAppointment: 'உங்கள் அடுத்த சந்திப்பு', noAppointmentAdded: 'சந்திப்பு எதுவும் சேர்க்கப்படவில்லை',
    addDateToKeepPrep: 'தேதியைச் சேர்க்கவும்.', addAppointment: '+ சந்திப்பைச் சேர்',
    crisisNotice: 'உடனடி ஆதரவு தேவையா? தயவுசெய்து மருத்துவர்களைத் தொடர்பு கொள்ளவும்.',
    sessionTimer: 'உரையாடல் அமர்வு', sessionHeadline: 'நேரம் எடுத்துக் கொள்ளுங்கள். தயாரானதும் பேசுங்கள்.', speakPlaceholder: 'உங்கள் வார்த்தைகள் இங்கே தோன்றும்...',
    typePlaceholder: 'அல்லது உங்கள் எண்ணங்களை இங்கே தட்டச்சு செய்க...', sendConversation: 'அனுப்பு', finishAndSummary: 'முடித்து சுருக்கத்தை உருவாக்கு',
    synthesizingSummary: 'சுருக்கத்தை தயார் செய்கிறது...', reportSummaryTitle: 'உரையாடல் சுருக்கம்', privateIntakeDoc: 'தனிப்பட்ட ஆவணம்',
    reportNotice: 'பகிர்வதற்கு முன் மதிப்பாய்வு செய்யவும்.', inYourWords: 'உங்கள் வார்த்தைகளில்',
    summaryOverview: 'சுருக்கமான கண்ணோட்டம்', print: 'அச்சிடு', shareWithTherapist: 'பகிர்', linkCopied: 'இணைப்பு நகலெடுக்கப்பட்டது!', returnToDashboard: 'முகப்புப்பக்கத்திற்குத் திரும்பு'
  },
  ml: {
    overview: 'അവലോകനം', conversations: 'സംഭാഷണങ്ങൾ', reports: 'റിപ്പോർട്ടുകൾ', goodMorning: 'സുപ്രഭാതം', goodAfternoon: 'ശുഭ ഉച്ചതിരിഞ്ഞ്', goodEvening: 'ശുഭ സായാഹ്നം',
    takeAMoment: 'കുറച്ചു സമയം എടുക്കുക. ധൃതിയില്ല.', privateSpaceToTalk: 'സംസാരിക്കാൻ ഒരു സ്വകാര്യ ഇടം', whatsOnYourMind: 'നിങ്ങളുടെ മനസ്സിലെന്താണ്?',
    speakFreely1015: '10-15 മിനിറ്റ് സ്വതന്ത്രമായി സംസാരിക്കുക.', nothingSharedWithoutYou: 'നിങ്ങളുടെ അനുമതിയില്ലാതെ ഒന്നും പങ്കിടില്ല',
    recentConversations: 'സമീപകാല സംഭാഷണങ്ങൾ', viewAll: 'എല്ലാം കാണുക', noConversationsYet: 'ഇതുവരെ സംഭാഷണങ്ങളൊന്നുമില്ല',
    whenYouStartSession: 'നിങ്ങൾ ഒരു സെഷൻ ആരംഭിക്കുമ്പോൾ സംഗ്രഹങ്ങൾ ഇവിടെ കാണാം.', reportReady: 'റിപ്പോർട്ട് തയ്യാറാണ്', inProgress: 'പുരോഗമിക്കുന്നു',
    viewReport: 'റിപ്പോർട്ട് കാണുക', nextAppointment: 'അടുത്ത അപ്പോയിന്റ്മെന്റ്', noAppointmentAdded: 'അപ്പോയിന്റ്മെന്റ് ചേർത്തിട്ടില്ല',
    addDateToKeepPrep: 'തീയതി ചേർക്കുക.', addAppointment: '+ അപ്പോയിന്റ്മെന്റ് ചേർക്കുക',
    crisisNotice: 'അടിയന്തര പിന്തുണ വേണോ? ദയവായി ഡോക്ടർമാരുമായി ബന്ധപ്പെടുക.',
    sessionTimer: 'സംഭാഷണ സെഷൻ', sessionHeadline: 'സമയം എടുക്കുക. തയ്യാറാകുമ്പോൾ സംസാരിക്കുക.', speakPlaceholder: 'നിങ്ങളുടെ വാക്കുകൾ ഇവിടെ കാണാം...',
    typePlaceholder: 'അല്ലെങ്കിൽ നിങ്ങളുടെ ചിന്തകൾ ഇവിടെ ടൈപ്പ് ചെയ്യുക...', sendConversation: 'അയക്കുക', finishAndSummary: 'പൂർത്തിയാക്കി സംഗ്രഹം സൃഷ്ടിക്കുക',
    synthesizingSummary: 'സംഗ്രഹം തയ്യാറാക്കുന്നു...', reportSummaryTitle: 'സംഭാഷണ സംഗ്രഹം', privateIntakeDoc: 'സ്വകാര്യ രേഖ',
    reportNotice: 'പങ്കിടുന്നതിന് മുമ്പ് പരിശോധിക്കുക.', inYourWords: 'നിങ്ങളുടെ വാക്കുകളിൽ',
    summaryOverview: 'സംഗ്രഹ അവലോകനം', print: 'പ്രിന്റ് ചെയ്യുക', shareWithTherapist: 'പങ്കിടുക', linkCopied: 'ലിങ്ക് പകർത്തി!', returnToDashboard: 'ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങുക'
  },
  mr: {
    overview: 'आढावा', conversations: 'संभाषणे', reports: 'अहवाल', goodMorning: 'शुभ प्रभात', goodAfternoon: 'शुभ दुपार', goodEvening: 'शुभ संध्याकाळ',
    takeAMoment: 'थोडा वेळ घ्या. इथे कोणतीही घाई नाही.', privateSpaceToTalk: 'बोलण्यासाठी एक खाजगी जागा', whatsOnYourMind: 'तुमच्या मनात काय आहे?',
    speakFreely1015: '10-15 मिनिटे मोकळेपणाने बोला.', nothingSharedWithoutYou: 'तुमच्या परवानगीशिवाय काहीही शेअर केले जाणार नाही',
    recentConversations: 'अलीकडील संभाषणे', viewAll: 'सर्व पहा', noConversationsYet: 'अद्याप कोणतेही संभाषण नाही',
    whenYouStartSession: 'जेव्हा तुम्ही सत्र सुरू करता तेव्हा सारांश येथे दिसतील.', reportReady: 'अहवाल तयार आहे', inProgress: 'प्रगतीपथावर आहे',
    viewReport: 'अहवाल पहा', nextAppointment: 'तुमची पुढची अपॉइंटमेंट', noAppointmentAdded: 'कोणतीही अपॉइंटमेंट जोडली नाही',
    addDateToKeepPrep: 'तारीख जोडा.', addAppointment: '+ अपॉइंटमेंट जोडा',
    crisisNotice: 'तातडीची मदत हवी आहे का? कृपया डॉक्टरांशी संपर्क साधा.',
    sessionTimer: 'संभाषण सत्र', sessionHeadline: 'वेळ घ्या. तयार झाल्यावर बोला.', speakPlaceholder: 'तुमचे शब्द येथे दिसतील...',
    typePlaceholder: 'किंवा तुमचे विचार येथे टाईप करा...', sendConversation: 'पाठवा', finishAndSummary: 'पूर्ण करा आणि सारांश तयार करा',
    synthesizingSummary: 'सारांश तयार करत आहे...', reportSummaryTitle: 'संभाषणाचा सारांश', privateIntakeDoc: 'खाजगी दस्तऐवज',
    reportNotice: 'शेअर करण्यापूर्वी तपासा.', inYourWords: 'तुमच्या शब्दात',
    summaryOverview: 'सारांश आढावा', print: 'प्रिंट करा', shareWithTherapist: 'शेअर करा', linkCopied: 'लिंक कॉपी केली!', returnToDashboard: 'डॅशबोर्डवर परत जा'
  },
  bn: {
    overview: 'ওভারভিউ', conversations: 'কথোপকথন', reports: 'রিপোর্ট', goodMorning: 'সুপ্রভাত', goodAfternoon: 'শুভ অপরাহ্ন', goodEvening: 'শুভ সন্ধ্যা',
    takeAMoment: 'একটু সময় নিন। এখানে কোন তাড়া নেই।', privateSpaceToTalk: 'কথা বলার জন্য একটি ব্যক্তিগত জায়গা', whatsOnYourMind: 'আপনার মনে কি আছে?',
    speakFreely1015: '10-15 মিনিটের জন্য অবাধে কথা বলুন।', nothingSharedWithoutYou: 'আপনার অনুমতি ছাড়া কিছুই শেয়ার করা হবে না',
    recentConversations: 'সাম্প্রতিক কথোপকথন', viewAll: 'সব দেখুন', noConversationsYet: 'এখনও কোনো কথোপকথন নেই',
    whenYouStartSession: 'সেশন শুরু করলে সারাংশগুলি এখানে দেখা যাবে।', reportReady: 'রিপোর্ট প্রস্তুত', inProgress: 'চলছে',
    viewReport: 'রিপোর্ট দেখুন', nextAppointment: 'আপনার পরবর্তী অ্যাপয়েন্টমেন্ট', noAppointmentAdded: 'কোন অ্যাপয়েন্টমেন্ট যোগ করা হয়নি',
    addDateToKeepPrep: 'তারিখ যোগ করুন।', addAppointment: '+ অ্যাপয়েন্টমেন্ট যোগ করুন',
    crisisNotice: 'জরুরী সহায়তা প্রয়োজন? ডাক্তারদের সাথে যোগাযোগ করুন।',
    sessionTimer: 'কথোপকথন সেশন', sessionHeadline: 'সময় নিন। প্রস্তুত হলে কথা বলুন।', speakPlaceholder: 'আপনার কথা এখানে দেখা যাবে...',
    typePlaceholder: 'বা আপনার চিন্তা এখানে টাইপ করুন...', sendConversation: 'পাঠান', finishAndSummary: 'শেষ করুন এবং সারাংশ তৈরি করুন',
    synthesizingSummary: 'সারাংশ প্রস্তুত করা হচ্ছে...', reportSummaryTitle: 'কথোপকথনের সারাংশ', privateIntakeDoc: 'ব্যক্তিগত নথি',
    reportNotice: 'শেয়ার করার আগে পর্যালোচনা করুন।', inYourWords: 'আপনার কথায়',
    summaryOverview: 'সারাংশের ওভারভিউ', print: 'প্রিন্ট করুন', shareWithTherapist: 'শেয়ার করুন', linkCopied: 'লিঙ্ক কপি করা হয়েছে!', returnToDashboard: 'ড্যাশবোর্ডে ফিরে যান'
  }
};

for (const lang of ['hi', 'te', 'kn', 'ta', 'ml', 'mr', 'bn']) {
  const langKey = `${lang}: {`;
  const blockStart = content.indexOf(langKey);
  if (blockStart === -1) {
    console.log(`Could not find ${langKey}`);
    continue;
  }
  
  // Find the end of this object
  let bracketCount = 0;
  let blockEnd = -1;
  for (let i = blockStart + langKey.length - 1; i < content.length; i++) {
    if (content[i] === '{') bracketCount++;
    if (content[i] === '}') bracketCount--;
    if (bracketCount === 0) {
      blockEnd = i;
      break;
    }
  }
  
  if (blockEnd === -1) {
    console.log(`Could not find end for ${langKey}`);
    continue;
  }
  
  const insertContent = Object.entries(translations[lang])
    .map(([k, v]) => `    ${k}: '${v}',`)
    .join('\n');
    
  // insert before the closing bracket
  content = content.substring(0, blockEnd) + insertContent + '\n  ' + content.substring(blockEnd);
}

fs.writeFileSync(file, content);
console.log('Done!');
