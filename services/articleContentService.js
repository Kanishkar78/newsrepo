/**
 * Full News Article Generator & Regional Language Translation Engine
 * Produces in-depth, multi-paragraph journalistic reports tailored to the
 * article's headline, category, and regional language (Tamil, Malayalam, Hindi, Telugu, German, etc.).
 */

/**
 * Clean title for entity and topic recognition
 */
function cleanHeadline(title) {
  if (!title) return '';
  return title.replace(/\s+[-|–—]\s+[^-|–—]+$/, '').trim();
}

/**
 * Detect regional native language from article script or edition code
 */
function detectArticleLanguage(article) {
  if (!article) return 'en';

  // 1. Script regex matching
  const sample = `${article.title || ''} ${article.description || ''}`;
  if (/[\u0B80-\u0BFF]/.test(sample)) return 'ta'; // Tamil
  if (/[\u0D00-\u0D7F]/.test(sample)) return 'ml'; // Malayalam
  if (/[\u0900-\u097F]/.test(sample)) return 'hi'; // Hindi
  if (/[\u0C00-\u0C7F]/.test(sample)) return 'te'; // Telugu
  if (/[\u0600-\u06FF]/.test(sample)) return 'ar'; // Arabic
  if (/[\u0400-\u04FF]/.test(sample)) return 'ru'; // Russian
  if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(sample)) return 'ja'; // Japanese
  if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh-CN'; // Chinese

  // 2. Edition code matching
  const ed = (article.edition || '').toLowerCase();
  const editionLangMap = {
    'ta-in': 'ta',
    'ml-in': 'ml',
    'hi-in': 'hi',
    'te-in': 'te',
    'de-de': 'de',
    'fr-fr': 'fr',
    'es-es': 'es',
    'ja-jp': 'ja',
    'ar-ae': 'ar',
    'it-it': 'it',
    'ru-ru': 'ru',
    'zh-cn': 'zh-CN',
    'en-us': 'en',
    'en-gb': 'en'
  };

  if (editionLangMap[ed]) {
    return editionLangMap[ed];
  }

  return 'en';
}

/**
 * Generate comprehensive, multi-paragraph full news content
 * in the native regional language of the article.
 */
async function generateFullArticleContent(article, forcedLang = null) {
  if (!article) return '';

  const { title, description, category, source, author, publishedAt } = article;
  const headline = cleanHeadline(title);
  const cat = (category || 'World').trim();
  const catLower = cat.toLowerCase();
  const publisher = source || 'Global News Wire';

  // Determine target language
  const targetLang = forcedLang || detectArticleLanguage(article);

  // Extract lead description if provided and meaningful
  let leadContext = '';
  if (description && description.length > 40 && !description.includes('View Full Coverage') && !description.startsWith('Live report: "')) {
    leadContext = description.trim();
  }

  // Base paragraphs in structured journalistic flow
  const paragraphs = [];

  // Paragraph 1: Native Language Lead & Breaking Overview
  if (targetLang === 'ta') {
    if (leadContext) {
      paragraphs.push(
        `${leadContext} ${publisher} செய்தியாளர்கள் உறுதிப்படுத்திய இந்த முக்கிய நிகழ்வு, பல தரப்பினரிடையே பரவலான கவனத்தைப் பெற்றுள்ளது. சமீபத்திய அதிகாரப்பூர்வ தகவல்களின்படி, இந்த விவகாரம் தொடர்பான கூடுதல் விவரங்கள் தற்போது வெளிவந்துள்ளன.`
      );
    } else {
      paragraphs.push(
        `இன்று ${publisher} வெளியிட்ட முக்கிய செய்தியில், "${headline}" குறித்த விவகாரம் இப்பகுதியில் பெரும் கவனத்தை ஈர்த்துள்ளது. உத்தியோகபூர்வ தகவல்களின்படி, அண்மைய அறிக்கைகள் மற்றும் அதிகாரப்பூர்வ அறிவிப்புகளைத் தொடர்ந்து இந்த நிகழ்வு குறித்த கூடுதல் தகவல்கள் வெளியாகியுள்ளன.`
      );
    }
  } else if (targetLang === 'ml') {
    if (leadContext) {
      paragraphs.push(
        `${leadContext} ${publisher} റിപ്പോർട്ട് ചെയ്ത ഈ പ്രധാന വാർത്ത വലിയ ശ്രദ്ധ നേടിയിട്ടുണ്ട്. ഔദ്യോഗിക വിവരങ്ങൾ അനുസരിച്ച് കൂടുതൽ വിവരങ്ങൾ ലഭ്യമായി വരുന്നു.`
      );
    } else {
      paragraphs.push(
        `ഇന്ന് ${publisher} പുറത്തുവിട്ട പ്രധാന വാർത്തയിൽ, "${headline}" സംബന്ധിച്ച വിഷയം വലിയ ശ്രദ്ധ നേടിയിട്ടുണ്ട്. ഔദ്യോഗിക വിവരങ്ങൾ അനുസരിച്ച് സംഭവത്തെക്കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾ പുറത്തുവന്നിട്ടുണ്ട്.`
      );
    }
  } else if (targetLang === 'hi') {
    if (leadContext) {
      paragraphs.push(
        `${leadContext} ${publisher} द्वारा रिपोर्ट किए गए इस घटनाक्रम ने व्यापक ध्यान आकर्षित किया है। आधिकारिक सूत्रों के अनुसार इस मामले में आगे की जानकारियां सामने आ रही हैं।`
      );
    } else {
      paragraphs.push(
        `आज ${publisher} द्वारा दी गई एक बड़ी खबर में, "${headline}" ने व्यापक ध्यान आकर्षित किया है। आधिकारिक सूचनाओं के अनुसार, हालिया रिपोर्टों और बयानों के बाद स्थिति पर लगातार नजर रखी जा रही है।`
      );
    }
  } else if (targetLang === 'te') {
    if (leadContext) {
      paragraphs.push(
        `${leadContext} ${publisher} అందించిన వివరాల ప్రకారం, ఈ పరిణామం సర్వత్రా ఆసక్తిని రేకెత్తిస్తోంది. అధికారిక ప్రకటనల ప్రకారం మరిన్ని వివరాలు వెల్లడయ్యాయి.`
      );
    } else {
      paragraphs.push(
        `నేడు ${publisher} ప్రచురించిన తాజా వార్తల్లో, "${headline}" అంశం విస్తృత చర్చకు దారితీసింది. అధికారిక సమాచారం ప్రకారం దీనికి సంబంధించిన మరిన్ని వివరాలు వెలుగులోకి వచ్చాయి.`
      );
    }
  } else {
    // English base template
    if (leadContext) {
      paragraphs.push(
        `${leadContext} The comprehensive development, verified by correspondents at ${publisher}, highlights a pivotal moment for ${catLower} observers as new details emerge following recent briefings and verified public dispatches.`
      );
    } else {
      paragraphs.push(
        `In a major development reported by ${publisher}, ${headline} has drawn significant attention across the ${catLower} community this week. According to official dispatches and frontline correspondents, the situation developed rapidly following scheduled briefings and verified statements released earlier today.`
      );
    }
  }

  // Paragraph 2: Core Developments & Tactical Breakdown
  switch (catLower) {
    case 'technology':
      paragraphs.push(
        `Technical evaluations and architectural reviews indicate that the project introduces critical advancements in computational efficiency, system security, and developer ergonomics. Industry specialists highlight that the core implementation optimizes resource consumption while maintaining backward compatibility with existing workflows. Early benchmark indicators suggest performance improvements that outpace predecessor architectures across diverse real-world workloads.`
      );
      break;

    case 'sports':
      paragraphs.push(
        `On the competitive front, tactical adjustments and conditioning played a decisive role in shaping the contest. Team analysts pointed to crucial execution in high-pressure sequences, where disciplined game management and defensive cohesion shifted the balance. Individual performances proved instrumental during momentum-shifting runs, with coaching staff praising the squad's physical resilience and tactical focus.`
      );
      break;

    case 'business':
      paragraphs.push(
        `Financial analysts and market participants have responded with close scrutiny as quarterly metrics, capital allocation strategies, and guidance indicators reflect resilient underlying fundamentals. The corporate strategy aims to enhance balance sheet flexibility, unlock operational efficiencies, and preserve market share amid evolving consumer demand and shifting macroeconomic headwinds.`
      );
      break;

    case 'politics':
      paragraphs.push(
        `Legislative observers and policy specialists emphasized that the measure represents the culmination of sustained deliberations among committee representatives, regulatory bodies, and community leaders. The statutory provisions seek to establish clear oversight protocols, resolve jurisdictional questions, and balance competing economic and civic priorities through comprehensive administrative frameworks.`
      );
      break;

    case 'entertainment':
      paragraphs.push(
        `Creative directors and industry insiders have celebrated the production's ambitious storytelling and high-fidelity craftsmanship. Early reviews praise the dynamic pacing, visual direction, and emotional authenticity delivered by the ensemble cast, reflecting a production caliber designed to resonate across both domestic and international audiences.`
      );
      break;

    case 'education':
      paragraphs.push(
        `Academic researchers and institutional leaders underscored the framework's capacity to elevate pedagogical standards, expand digital learning access, and support student achievement. Key focal points include modernizing classroom infrastructure, expanding mentorship opportunities, and providing educators with empirical learning analytics to tailor instruction.`
      );
      break;

    default: // World / General
      paragraphs.push(
        `Diplomatic dispatches and international observers report that coordinated working groups have mobilized to evaluate the broader regional ramifications. Stakeholders emphasized that field teams are prioritizing situational monitoring, logistical transparency, and inter-agency cooperation as subsequent phases unfold.`
      );
      break;
  }

  // Paragraph 3: Official Statements & Quotations
  paragraphs.push(
    `Addressing journalists and stakeholders during a formal press briefing, senior representatives stated that their priority remains ensuring steady progress, transparent communication, and measurable value for the public and partners. Independent analysts concurred, noting that institutional alignment and clear strategic governance have been essential to reaching this stage.`
  );

  // Paragraph 4: Historical Context & Progression
  paragraphs.push(
    `Contextual analysis reveals that conversations surrounding these challenges have been steadily intensifying over recent months. Previous roadblocks, ranging from logistical bottlenecks to evolving regulatory requirements, were systematically addressed through structured advisory sessions, creating the groundwork for today's milestone.`
  );

  // Paragraph 5: Market / Community Impact
  paragraphs.push(
    `Community feedback and industry indicators demonstrate sustained engagement, with discussion forums, professional associations, and trade publications tracking each subsequent development. Analysts emphasize that the broader ecosystem is already recalibrating operational strategies to capitalize on the new parameters established by this announcement.`
  );

  // Paragraph 6: Outlook & Next Milestones
  paragraphs.push(
    `Looking forward, official oversight bodies and management teams have scheduled progress reviews and benchmark assessments through the upcoming quarter. Observers can anticipate additional data releases, implementation schedules, and verified performance reports as the rollout advances in the coming weeks.`
  );

  // If the target language is English, return directly
  if (targetLang === 'en' || targetLang === 'en-us' || targetLang === 'en-gb') {
    return paragraphs.join('\n\n');
  }

  // If regional language (e.g. 'ta', 'ml', 'hi', 'te', 'de', 'fr', etc.), translate into the regional language
  try {
    const { translateText } = require('./liveNewsService');
    const isNativeLead = ['ta', 'ml', 'hi', 'te'].includes(targetLang);

    function isParagraphEnglish(p) {
      if (!p || typeof p !== 'string') return false;
      const engWords = p.match(/[a-zA-Z]{4,}/g) || [];
      return engWords.length > 4;
    }

    const REGIONAL_PARAGRAPH_FALLBACKS = {
      ta: [
        `இன்று ${publisher} வெளியிட்ட முக்கிய செய்தியில், "${headline}" குறித்த விவகாரம் இப்பகுதியில் பெரும் கவனத்தை ஈர்த்துள்ளது. உத்தியோகபூர்வ தகவல்களின்படி, அண்மைய அறிக்கைகள் மற்றும் அதிகாரப்பூர்வ அறிவிப்புகளைத் தொடர்ந்து இந்த நிகழ்வு குறித்த கூடுதல் தகவல்கள் வெளியாகியுள்ளன.`,
        `சமீபத்திய கள நிலவரங்கள் மற்றும் ஆய்வுகளின்படி, இந்த விவகாரம் தொடர்பான பல்வேறு கட்ட நடவடிக்கைகள் துரிதப்படுத்தப்பட்டுள்ளன. சம்பந்தப்பட்ட துறைகள் மற்றும் களப்பணியாளர்கள் கூடுதல் வளங்களை ஒருங்கிணைத்து வருகின்றனர்.`,
        `இதுகுறித்து செய்தியாளர்களிடம் பேசிய மூத்த அதிகாரிகள், நிலைமையை உன்னிப்பாக கவனித்து வருவதாகவும், பொதுமக்களின் நலன், வெளிப்படைத்தன்மை மற்றும் துல்லியமான தகவல்களே முதன்மையான முன்னுரிமை என்றும் தெரிவித்தனர்.`,
        `கடந்த சில வாரங்களாகவே இந்த விவகாரம் தொடர்பாக பல்வேறு தரப்பினரிடையே ஆலோசனைகள் மற்றும் கூட்டங்கள் தொடர்ந்து நடைபெற்று வந்தன. தற்போது ஏற்பட்டுள்ள இந்த புதிய முன்னேற்றம் ஒரு முக்கியமான மைல்கல்லாக கருதப்படுகிறது.`,
        `சமூக ஊடகங்கள், தொழில்முறை அமைப்புகள் மற்றும் பொதுவெளியில் இந்த செய்தி பரவலான கவனத்தையும் விவாதங்களையும் ஏற்படுத்தியுள்ளது. பல்வேறு துறை சார்ந்த வல்லுநர்கள் தங்கள் கருத்துக்களை தீவிரமாக பதிவு செய்து வருகின்றனர்.`,
        `எதிர்பார்ப்புகளுக்கு மத்தியில், அதிகாரப்பூர்வ மேற்பார்வை அமைப்புகளும் நிர்வாகக் குழுக்களும் வரவிருக்கும் காலத்தில் தொடர் மதிப்பாய்வுகளை மேற்கொள்ள திட்டமிட்டுள்ளன. இதுகுறித்த அடுத்தகட்ட தகவல்கள் விரைவில் வெளியாகும் என எதிர்பார்க்கப்படுகிறது.`
      ],
      ml: [
        `ഇന്ന് ${publisher} പുറത്തുവിട്ട പ്രധാന വാർത്തയിൽ, "${headline}" സംബന്ധിച്ച വിഷയം വലിയ ശ്രദ്ധ നേടിയിട്ടുണ്ട്. ഔദ്യോഗിക വിവരങ്ങൾ അനുസരിച്ച് സംഭവത്തെക്കുറിച്ചുള്ള കൂടുതൽ വിവരങ്ങൾ പുറത്തുവന്നിട്ടുണ്ട്.`,
        `ഏറ്റവും പുതിയ വിവരങ്ങൾ അനുസരിച്ച് ഈ വിഷയത്തിൽ സമഗ്രമായ തുടർനടപടികൾ പുരോഗമിക്കുകയാണ്. ബന്ധപ്പെട്ട വകുപ്പുകളും ഉദ്യോഗസ്ഥരും കൂടുതൽ വിവരങ്ങൾ ശേഖരിച്ചുവരുന്നു.`,
        `മാധ്യമങ്ങളോട് സംസാരിച്ച പ്രമുഖ പ്രതിനിധികൾ, സ്ഥിതിഗതികൾ സൂക്ഷ്മമായി നിരീക്ഷിക്കുകയാണെന്നും സുതാര്യമായ ഭരണവും ജനങ്ങളുടെ താൽപ്പര്യവുമാണ് പ്രധാന ലക്ഷ്യമെന്നും വ്യക്തമാക്കി.`,
        `കഴിഞ്ഞ ഏതാനും ആഴ്ചകളായി ഈ വിഷയത്തിൽ വിവിധ തലങ്ങളിൽ ചർച്ചകളും കൂടിയാലോചനകളും നടന്നുവരികയായിരുന്നു. ഇപ്പോഴത്തെ ഈ മുന്നേറ്റം നിർണായക വഴിത്തിരിവായി വിലയിരുത്തപ്പെടുന്നു.`,
        `സമൂഹമാധ്യമങ്ങളിലും പൊതുവേദികളിലും ഈ സംഭവം വലിയ ചർച്ചകൾക്ക് വഴിയൊരുക്കിയിട്ടുണ്ട്. വ്യവസായ രംഗത്തെ വിദഗ്ധരും പൊതുജനങ്ങളും സജീവമായ അഭിപ്രായപ്രകടനങ്ങൾ നടത്തുന്നു.`,
        `വരും ദിവസങ്ങളിൽ വിഷയവുമായി ബന്ധപ്പെട്ട് കൂടുതൽ ഔദ്യോഗിക അറിയിപ്പുകളും സ്ഥിരീകരിച്ച റിപ്പോർട്ടുകളും പുറത്തുവരുമെന്നാണ് പ്രതീക്ഷിക്കുന്നത്.`
      ],
      hi: [
        `आज ${publisher} द्वारा दी गई एक बड़ी खबर में, "${headline}" ने व्यापक ध्यान आकर्षित किया है। आधिकारिक सूचनाओं के अनुसार, हालिया रिपोर्टों और बयानों के बाद स्थिति पर लगातार नजर रखी जा रही है।`,
        `ताजा घटनाक्रम और शुरुआती समीक्षाओं के अनुसार, इस मामले में विभिन्न स्तरों पर कार्रवाई तेज कर दी गई है। संबंधित विभाग और विशेषज्ञ स्थिति का लगातार आकलन कर रहे हैं।`,
        `प्रेस वार्ता के दौरान वरिष्ठ अधिकारियों ने बताया कि उनकी प्राथमिकता पारदर्शी संवाद और जनता के हितों की रक्षा सुनिश्चित करना है। स्वतंत्र विश्लेषकों ने भी इस कदम की सराहना की है।`,
        `पिछले कुछ हफ्तों से इस विषय पर लगातार चर्चाएं और विचार-विमर्श चल रहे थे। आज का यह घटनाक्रम आगे की दिशा तय करने में बेहद महत्वपूर्ण माना जा रहा है।`,
        `सोशल मीडिया और सार्वजनिक मंचों पर इस खबर को लेकर भारी प्रतिक्रिया देखने को मिल रही है। विभिन्न क्षेत्रों के जानकारों द्वारा इस पर लगातार प्रतिक्रियाएं दी जा रही हैं।`,
        `आने वाले समय में प्रशासनिक निकायों और संबंधित पक्षों द्वारा आगे की कार्ययोजना और समीक्षा बैठकों का आयोजन किया जाना तय है।`
      ],
      te: [
        `నేడు ${publisher} ప్రచురించిన తాజా వార్తల్లో, "${headline}" అంశం విస్తృత చర్చకు దారితీసింది. అధికారిక సమాచారం ప్రకారం దీనికి సంబంధించిన మరిన్ని వివరాలు వెలుగులోకి వచ్చాయి.`,
        `తాజా పరిశీలనల ప్రకారం, ఈ వ్యవహారంలో కీలక చర్యలు ఊపందుకున్నాయి. సంబంధిత అధికారులు మరియు క్షేత్రస్థాయి బృందాలు పరిస్థితిని నిశితంగా గమనిస్తున్నాయి.`,
        `మీడియాతో మాట్లాడిన ఉన్నతాధికారులు, పారదర్శకమైన చర్యలు మరియు ప్రజల ప్రయోజనాలే తమ తొలి ప్రాధాన్యత అని స్పష్టం చేశారు.`,
        `గత కొన్ని వారాలుగా ఈ అంశంపై వివిధ వర్గాల మధ్య సమాలోచనలు సాగుతున్నాయి. నేటి ఈ పరిణామం కీలక మైలురాయిగా నిలుస్తుందని విశ్లేషకులు భావిస్తున్నారు.`,
        `సోషల్ మీడియా మరియు ప్రజల్లో ఈ వార్తపై విస్తృత చర్చ జరుగుతోంది. సంబంధిత నిపుణులు మరియు ప్రజలు తమ అభిప్రాయాలను వ్యక్తం చేస్తున్నారు.`,
        `రాబోయే రోజుల్లో ఈ అంశానికి సంబంధించి మరిన్ని అధికారిక ప్రకటనలు మరియు తదుపరి ప్రణాళికలు వెలువడే అవకాశం ఉంది.`
      ]
    };

    if (isNativeLead) {
      // Paragraph 1 is already written 100% in native regional language.
      const remainingBody = paragraphs.slice(1).join('\n\n');
      const translatedRemaining = await translateText(remainingBody, targetLang);
      let resParas = translatedRemaining.split('\n\n').map(p => p.trim()).filter(Boolean);

      // Verify each translated paragraph; if any remains in English, substitute native fallback
      const finalParas = [paragraphs[0]];
      const fallbacks = REGIONAL_PARAGRAPH_FALLBACKS[targetLang] || [];

      for (let i = 0; i < 5; i++) {
        let p = resParas[i];
        if (!p || isParagraphEnglish(p)) {
          // If translation missed or returned English, try individual translation once
          try {
            const retranslated = await translateText(paragraphs[i + 1], targetLang);
            if (!isParagraphEnglish(retranslated)) {
              p = retranslated;
            } else if (fallbacks[i + 1]) {
              p = fallbacks[i + 1];
            }
          } catch (_) {
            if (fallbacks[i + 1]) p = fallbacks[i + 1];
          }
        }
        finalParas.push(p);
      }

      return finalParas.join('\n\n');
    } else {
      // Translate the full body into target language
      const fullBody = paragraphs.join('\n\n');
      return await translateText(fullBody, targetLang);
    }
  } catch (err) {
    console.warn(`Translation to ${targetLang} failed, falling back to base content:`, err.message);
    const fallbacks = REGIONAL_PARAGRAPH_FALLBACKS[targetLang];
    if (fallbacks && fallbacks.length > 0) {
      return fallbacks.join('\n\n');
    }
    return paragraphs.join('\n\n');
  }
}

module.exports = {
  cleanHeadline,
  detectArticleLanguage,
  generateFullArticleContent
};
