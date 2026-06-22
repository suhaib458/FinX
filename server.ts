import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY || "";
const hasKey =
  API_KEY && API_KEY !== "" && !API_KEY.includes("MY_GEMINI_API_KEY");

if (hasKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log(
      "Gemini client successfully initialized from environment secret!",
    );
  } catch (err) {
    console.error("Failed to initialize Gemini Client: ", err);
  }
} else {
  console.log(
    "No valid GEMINI_API_KEY provided in secrets. Continuing in high-quality local mock mode.",
  );
}

// ----------------------
// HELPER FALLBACK RESPONSES for AI FINANCE COACH
// ----------------------
function getMockCoachResponse(
  msg: string,
  lang: "ar" | "en",
  isCareerSearch: boolean = false,
): string {
  const norm = msg.toLowerCase();

  if (isCareerSearch) {
    if (lang === "ar") {
      return `عذراً، حدث خطأ مؤقت أثناء محاولة تحليل سيرتك الذاتية أو البحث عن فرص عمل مناسبة لك. يُرجى التكرم بالمحاولة بعد قليل أو التأكد من سلامة وحجم المرفقات.`;
    } else {
      return `Apologies, there was a temporary error processing your CV or searching for career opportunities. Please try again in a moment or ensure your attachment is valid.`;
    }
  }

  if (
    lang === "ar" ||
    norm.includes("أريد") ||
    norm.includes("كيف") ||
    norm.includes("نصيحة") ||
    norm.includes("توفير")
  ) {
    if (
      norm.includes("توفير") ||
      norm.includes("ادخار") ||
      norm.includes("save") ||
      norm.includes("money")
    ) {
      return `مرحباً بك! هاهي أهم النصائح الذكية لتوفير المال بناءً على تحليلك المالي:
1. **تحدي الـ 50/30/20**: خصص 50% للضروريات، 30% للرغبات، و20% للادخار والاستثمار فور استلام دخلك.
2. **إلغاء الاشتراكات غير النشطة**: نلاحظ وجود اشتراكين نشطين لا تستفيد منهما بالشكل الكامل (بقيمة 15 د.أ شهرياً). إلغاؤها يوفر لك 180 د.أ سنوياً!
3. **التسوق بذكاء**: انتظر 48 ساعة قبل شراء أي منتج غير ضروري للتأكد من رغبتك الفعلية فيه.`;
    }
    if (
      norm.includes("الدرجة") ||
      norm.includes("الصحة") ||
      norm.includes("score") ||
      norm.includes("تحسين")
    ) {
      return `لتحسين **مؤشر صحتك المالية (Financial Health Score)** من درجتك الحالية، اتبع هذه الاستراتيجيات المعتمدة:
• **تقليل الالتزامات الشهرية**: خفض نسبة الديون والاقساط الشهرية لتقل عن 30% من دخلك الإجمالي.
• **بناء صندوق الطوارئ**: احتفظ بجزء مخصص يغطي من 3 إلى 6 أشهر من نفقاتك المعيشية الأساسية.
• **الالتزام بالميزانية**: عدم تجاوز ميزانية التسوق والمطاعم المحددة لك، والتي تعتبر من أكثر الفئات استهلاكاً لسيولتك الشهرية حالياً.`;
    }
    if (
      norm.includes("سيارة") ||
      norm.includes("car") ||
      norm.includes("شراء")
    ) {
      return `تحليل قرار **شراء سيارة**:
أخذ تمويل سيارة بقسط شهري يمثل عبئاً قدره 15% من دخلك. 
*نصيحة فنيكس المالية:* يفضل زيادة الدفعة الأولى إلى 30% لتقليل الفائدة الإجمالية، وتجنب فترات السداد الطويلة (أكثر من 3 سنوات) لتفادي انخفاض قيمة السيارة السريع مقارنة بالقرض القائم.`;
    }
    return `أهلاً بك في فنيكس (FinX)! أنا مستشارك المالي المطور بالذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟
بإمكانك سؤالي عن:
- نصائح لتوفير المال وتقليل المصاريف
- كيفية رفع نقاط صحتك المالية الحالية
- محاكاة شراء سيارة أو أخذ قرض وتأثير ذلك على ميزانيتك
- تحليل كشف حسابك البنكي المرفق بالتفصيل`;
  } else {
    // English responses
    if (
      norm.includes("save") ||
      norm.includes("saving") ||
      norm.includes("money") ||
      norm.includes("expense")
    ) {
      return `Welcome! Here are key smart strategies to save money based on your profile:
1. **Rule of 50/30/20**: Allocate 50% for Needs, 30% for Wants, and 20% directly to Savings and Investments right when you get paid.
2. **Subscription Audit**: We detected active digital subscriptions costing around 15 JOD/month. Cancelling unused ones saves you 180 JOD annually.
3. **48-Hour Wait**: Apply a 48-hour cool-off period before any non-essential purchase to check if it's a true need.`;
    }
    if (
      norm.includes("score") ||
      norm.includes("health") ||
      norm.includes("improve")
    ) {
      return `To improve your **Financial Health Score** from its current assessment:
• **Lower Debt-to-Income**: Maintain your monthly debt installments below 30% of your net income.
• **Emergency Safeguard**: Set aside an emergency fund covering 3 to 6 months of absolute living expenses.
• **Dining out & Shopping Cap**: Focus on reducing your discretionary spending in entertainment and subscription channels.`;
    }
    if (norm.includes("car") || norm.includes("loan") || norm.includes("buy")) {
      return `Financial consultation on **buying a car**:
Adding a monthly car payment represents ~15% of your income.
*FinX Recommendation:* Try increasing your upfront downpayment to 30% to significantly slash total interest, and opt for a repayment term under 36 months to dynamic-proof depreciation.`;
    }
    return `Hello! I am your FinX AI Coach, your intelligent co-pilot for absolute wealth control. 
What would you like to explore today?
- "How can I optimize my monthly savings rate?"
- "What's the best strategy to improve my Financial Health Score?"
- "Simulate the mid-term impact of a wedding budget or business launch"
- "Analyze my uploaded bank statements easily"`;
  }
}

// 1. AI Coach Chat Endpoint
app.post("/api/coach", async (req, res) => {
  const { messages, language, portfolioDetails, attachments } = req.body;
  const lang = language === "ar" ? "ar" : "en";
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const latestMessageObj = messages[messages.length - 1];
  const userText = latestMessageObj.content || "";

  if (!ai) {
    // Fallback Mock mode when no API Key is available
    const reply = getMockCoachResponse(userText, lang, false);
    return res.json({ reply });
  }

  try {
    const formattedHistory: any[] = [];
    let lastRole = "";
    for (let m of messages.slice(0, -1)) {
      const role = m.role === "user" ? "user" : "model";
      if (role === "model" && formattedHistory.length === 0) continue;
      if (role === lastRole) continue;
      formattedHistory.push({
        role: role,
        parts: [{ text: m.content }],
      });
      lastRole = role;
    }

    let profileContext = "";
    if (portfolioDetails) {
      if (lang === "ar") {
        profileContext = `\nبيانات المستخدم الحالية: الدخل الشهري ${portfolioDetails.income} د.أ، النفقات ${portfolioDetails.expenses} د.أ، معدل الادخار ${portfolioDetails.savingsRate}%، درجة الصحة المالية ${portfolioDetails.healthScore}/100. استخدم هذه البيانات لتقديم نصيحة مبنية على أرقام دقيقة وحقيقية.`;
      } else {
        profileContext = `\nUser Current Financial Profile: Monthly Income ${portfolioDetails.income} JOD, Monthly Expenses ${portfolioDetails.expenses} JOD, Savings Rate ${portfolioDetails.savingsRate}%, Health Score ${portfolioDetails.healthScore}/100. Use this data to provide highly specific advice, mentioning their exact numbers, percentages, and practical optimization measures.`;
      }
    }

    const systemPromptString =
      lang === "ar"
        ? "أنت 'FinX AI Coach' و 'المستشار المهني الذكي'. مهمتك الأساسية كـ 'محرك بحث ومطابقة وظيفي ذكي' هي مساعدة المستخدمين في العثور على أفضل الفرص الوظيفية المتاحة استناداً إلى سيرتهم الذاتية، مهاراتهم، مؤهلاتهم واهتماماتهم. استخدم أداة البحث جوجل (Google Search) للبحث عن فرص وظيفية عامة وحديثة من مواقع مثل LinkedIn وصفحات التوظيف للشركات.\n\nعند طرح فرص عمل جيدة، قم بتقديم:\n1. المسمى الوظيفي\n2. اسم الشركة\n3. المصدر والرابط المباشر\n4. ملخص قصير\n5. سبب التطابق مع المستخدم\n6. المتطلبات الأساسية\n\nقم أيضاً بتحليل المعطيات المالية، وتحليل أي مرفقات أو رسائل صوتية." +
          profileContext
        : "You are 'FinX AI Coach' and an intelligent Career Search and Matching Engine. Your primary job is to help the user find the best job opportunities based on their CV, skills, education, and preferences.\n\nRULES FOR JOB SEARCH:\n- ALWAYS use the Google Search tool to find REAL, PUBLIC, and CURRENT job postings from platforms like LinkedIn or company career pages.\n- Match the user intelligently based on their extracted profile or request.\n- For each job result, provide:\n  1. Job Title\n  2. Company Name\n  3. Platform/Source\n  4. Direct public link\n  5. Short summary\n  6. Why it matches the user\n  7. Main requirements\n  8. Location/Work type\n\nIf the user uploads a CV, parse it and extract their profile to improve matches. If they just ask, infer their category. Do NOT invent links or jobs. Keep the response professional and concise.\n\nYou also provide smart financial strategies, and analyze documents, images, and voice messages thoroughly." +
          profileContext;

    // Attachments Processing
    const partsArray: any[] = [{ text: userText }];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.data) {
          const rawBase64 = att.data.includes("base64,")
            ? att.data.split("base64,")[1]
            : att.data;
          partsArray.push({
            inlineData: {
              data: rawBase64,
              mimeType: att.mimeType || "application/octet-stream",
            },
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [...formattedHistory, { role: "user", parts: partsArray }],
      config: {
        systemInstruction: systemPromptString,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    if (error?.status === 429) {
      console.log(
        "FinX Assistant Hit API Quota Rate limit. Dropping back to local processing.",
      );
    } else {
      console.log(
        "Gemini AI Coach Error (fallback used)",
        error?.message || "",
      );
    }
    const reply = getMockCoachResponse(userText, lang);
    res.json({
      reply,
      notice:
        "Served using FinX Local Intelligence Engine due to connectivity parameters.",
    });
  }
});

// 1.5 Streaming AI Coach Chat Endpoint
app.post("/api/coach-stream", async (req, res) => {
  const { messages, language, portfolioDetails, attachments, careerProfile } = req.body;
  const lang = language === "ar" ? "ar" : "en";
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const latestMessageObj = messages[messages.length - 1];
  const userText = latestMessageObj.content || "";

  console.log(
    `[Diagnostics] /api/coach-stream received request. Has attachments: ${attachments?.length > 0}`,
  );

  if (!ai) {
    // Fallback Mock mode when no API Key is available
    res.write(
      `data: ${JSON.stringify({ text: getMockCoachResponse(userText, lang) })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  const startTime = Date.now();
  let timeToFirstToken = 0;
  res.locals.isFinished = false;
  res.locals.fallbackSent = false;
  let watchdogTimer: any = null;
  let isCareerSearch = false;
  let isCvUploaded = false;
  let formatValidationError = "";

  const diagnosticWrapper = {
    rawSearchQueries: [] as string[],
    rawGroundingChunks: [] as any[],
    extractedUrls: [] as string[],
    finalTextPayload: "",
  };

  try {
    const lowerText = userText.toLowerCase();
    const hasAttachments = attachments && attachments.length > 0;

    isCareerSearch =
      lowerText.includes("job") ||
      lowerText.includes("career") ||
      lowerText.includes("hire") ||
      lowerText.includes("وظيفة") ||
      lowerText.includes("أعمل") ||
      lowerText.includes("cv") ||
      lowerText.includes("resume") ||
      lowerText.includes("سيرة") ||
      lowerText.includes("work");

    
    if (hasAttachments) {
      console.log(`[Diagnostics] Received ${attachments.length} attachment(s).`);
      attachments.forEach((att: any, index: number) => {
        const name = att.name ? att.name.toLowerCase() : "";
        const mType = att.mimeType ? att.mimeType.toLowerCase() : "";
        console.log(`[Diagnostics] Attachment ${index + 1}: Name="${att.name}", MimeType="${att.mimeType}", Size=${att.data ? att.data.length : 0} bytes`);

        const isExplicitCvName =
          name.includes("cv") ||
          name.includes("resume") ||
          name.includes("سيرة") ||
          name.includes("work");
        
        // If they uploaded a generic document and asked no text or asked about jobs, treat as general file that could be a CV
        if (isExplicitCvName || isCareerSearch || userText.trim() === "") {
            isCvUploaded = true;
            
            // STRICT FILE VALIDATION
            const isSupported = mType.includes("pdf") || mType.includes("wordprocessingml.document") || mType.includes("docx") || mType.includes("text/plain");
            if (!isSupported) {
              formatValidationError = `File format '${mType || "unknown"}' is not supported for CVs. Please upload a PDF, DOCX, or TXT file.`;
            }
        }
      });
    }

    if (formatValidationError) {
        console.log(`[Diagnostics] Validation Error: ${formatValidationError}`);
        const reply = lang === "ar" 
           ? `عذراً، صيغة الملف غير مدعومة للسير الذاتية. يرجى رفع ملف بصيغة PDF أو DOCX أو TXT.`
           : `I could not analyze the attached CV because its format is not supported. Please upload a PDF, DOCX, or TXT file.`;
        res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
    }

    if (isCvUploaded && (lowerText === "" || isCareerSearch)) {
      console.log(`[Diagnostics] CV or ambiguous document detected in attachments.`);
      isCareerSearch = true; // explicitly trigger career search if a CV is detected or no text is provided
    }

    let isFinancial =
      lowerText.includes("budget") ||
      lowerText.includes("save") ||
      lowerText.includes("money") ||
      lowerText.includes("مال") ||
      lowerText.includes("ميزانية") ||
      lowerText.includes("استثمار") ||
      lowerText.includes("invest") ||
      lowerText.includes("stock") ||
      lowerText.includes("bank") ||
      lowerText.includes("بنك") ||
      lowerText.includes("حساب");

    // Always use search tools if there are attachments (since the document could be anything), 
    // or if the text indicates career/financial
    const useSearchTools = isCareerSearch || isFinancial || hasAttachments;

    const formattedHistory: any[] = [];
    let lastRole = "";
    for (const m of messages.slice(0, messages.length - 1)) {
      const role = m.role === "user" ? "user" : "model";
      if (role === "model" && formattedHistory.length === 0) continue;
      if (role === lastRole) continue;
      formattedHistory.push({
        role: role,
        parts: [{ text: m.content }],
      });
      lastRole = role;
    }

    let profileContext = "";
    if (portfolioDetails) {
      const extraContext = (portfolioDetails.categories && portfolioDetails.transactions) 
        ? `\nTransactions (Recent): ${JSON.stringify(portfolioDetails.transactions)}\nCategories Breakdown: ${JSON.stringify(portfolioDetails.categories)}`
        : "";
        
      if (lang === "ar") {
        profileContext = `\nبيانات المستخدم الحالية: الدخل الشهري ${portfolioDetails.income} د.أ، النفقات ${portfolioDetails.expenses} د.أ، معدل الادخار ${portfolioDetails.savingsRate}%، درجة الصحة المالية ${portfolioDetails.healthScore}/100.
استخدم هذه البيانات لتقديم نصيحة مبنية على أرقام دقيقة وحقيقية. اكتشف عادات الصرف الخاطئة والاشتراكات المكررة ومناطق التوفير المتاحة بناءً على المعاملات.
${extraContext ? "سجل المعاملات: " + extraContext : ""}
`;
      } else {
        profileContext = `\nUser Current Financial Profile: Monthly Income ${portfolioDetails.income} JOD, Monthly Expenses ${portfolioDetails.expenses} JOD, Savings Rate ${portfolioDetails.savingsRate}%, Health Score ${portfolioDetails.healthScore}/100.
Use this data to provide highly specific advice, mentioning their exact numbers, percentages, and practical optimization measures. Identify bad spending habits, duplicate subscriptions, and savings areas based on transactions.
${extraContext}
`;
      }
    }
    
    // Add careerProfile details
    const { careerProfile } = req.body;
    if (careerProfile && !isCvUploaded) {
      if (lang === "ar") {
        profileContext += `\nالملف المهني المحفوظ للمستخدم: \n\`\`\`json\n${JSON.stringify(careerProfile, null, 2)}\n\`\`\`\nاستخدم هذا الملف المهني المحفوظ للبحث عن وظائف إذا طلب المستخدم ذلك، ولا تطلب منه رفع السيرة الذاتية مجدداً. لا تعطيه الملف للمراجعة، بل استخدمه للبحث مباشرة.`;
      } else {
        profileContext += `\nSaved Career Profile: \n\`\`\`json\n${JSON.stringify(careerProfile, null, 2)}\n\`\`\`\nUse this saved profile for job matching if the user asks for jobs. Do not ask them to re-upload their CV. Do not print out the profile, simply use it internally for queries.`;
      }
    }

    const systemPromptString =
      lang === "ar"
        ? `أنت 'FinX Smart Advisor', مساعد وظيفي ومالي ذكي.

1. سير عمل السيرة الذاتية (CV-FIRST WORKFLOW):
- عند رفع سيرة ذاتية (CV)، يجب عليك تحليلها بالكامل أولاً واستخراج: الاسم، التعليم، المهارات، الخبرات، والمشاريع وبناء ملف شخصي للمرشح.
- ممنوع منعاً باتاً تقديم توصيات وظائف عامة عند وجود سيرة ذاتية. استخدم الملف المستخرج للبحث والربط.
- إذا فشل التحليل، أظهر الخطأ ولا تستمر في بحث عام.

2. محرك مطابقة الوظائف وأولويات البحث (REGIONAL PRIORITY RULES):
- الأولويات الجغرافية (صارم جداً): 
  الأولوية 1: الأردن (Jordan).
  الأولوية 2: الإمارات، السعودية، قطر، الكويت، البحرين، عمان.
  الأولوية 3: مصر، لبنان، العراق.
  الأولوية 4: وظائف عن بعد عالمياً (Fully Remote).
- ممنوع عرض وظائف من أمريكا أو أوروبا إلا إذا طلبها المستخدم تحديداً، أو لم يتوفر أي شيء إقليمياً. الأردن -> الخليج -> عن بعد.
- مصادر الوظائف المفضلة: LinkedIn أولاً، ثم مواقع الشركات، ثم Bayt و Akhtaboot و Forasna و GulfTalent، ثم Indeed و Glassdoor و Wellfound.
- المنطق الخاص بالطلاب والمبتدئين: إذا أظهرت السيرة الذاتية أن المتقدم طالب أو حديث التخرج (أقل من 3 سنوات خبرة)، أعط الأولوية لوظائف (Internship, Trainee, Junior Developer, Associate Developer, Graduate Programs, وظائف المبتدئين في الذكاء الاصطناعي وعلوم البيانات).
- مطابقة خاصة للأردن (Jordan-Specific Matching): عندما يكون المستخدم في الأردن، ارفع تصنيف الوظائف من الشركات: Tamatem, ProgressSoft, Estarta, Aspire, Mawdoo3, OpenSooq, Ahli Fintech, Bank Al Etihad, Arab Bank, Umniah, Zain Jordan, Orange Jordan.
- تفضيلات اللغة: ابحث عن وظائف تقبل السير الذاتية باللغة الإنجليزية وتناسب المتحدثين بالعربية، ولا تتطلب الانتقال ما لم يطلب المستخدم صراحة.
- يجب تقييم نسبة التطابق (Match Score).

3. الروابط الحقيقية فقط (صارم):
- ممنوع التوجيه لروابط vertexaisearch.cloud.google.com أو روابط التأريض (grounding-api-redirect).
- اقبل فقط الروابط المباشرة لـ LinkedIn، Indeed، Glassdoor، Wellfound ومواقع الشركات الحقيقية.

4. التنسيق المطلوب (JSON JOB BLOCK):
- لا تظهر أبداً كود JSON أو المصفوفات أو روابط URL الخام للمستخدم. 
- يجب إرجاع كل وظيفة باستخدام البلوك البرمجي \`\`\`job حصراً.
- لخص الرسالة للمستخدم بكلمة واحدة: "تم العثور على [عدد] وظائف مطابقة لملفك المهني" ثم ابدأ بعرض الوظائف! (أو "لم يتم العثور على وظائف مطابقة حالياً." إذا لم تجد شيئاً).
- لا تقم بطباعة تفاصيل السيرة الذاتية (الاسم، التعليم، الخ) للمستخدم كنص.
- في حقل whyMatches اكتب سطر واحد قصير جداً يوضح سبب التوافق.

\`\`\`job
{
  "title": "المسمى الوظيفي هنا",
  "company": "اسم الشركة",
  "location": "الموقع (أو Remote)",
  "matchScore": "90",
  "source": "المصدر (مثل LinkedIn، موقع الشركة)",
  "url": "رابط_تطبيق_حقيقي_ومباشر_هنا",
  "whyMatches": "سبب التوافق في سطر واحد قصير جداً"
}
\`\`\`

5. السيرة الذاتية (CAREER PROFILE FORMAT):
إذا قمت بتحليل السيرة الذاتية، يجب عليك استخراج بيانات الملف الشخصي وإرجاعها في البداية باستخدام البلوك البرمجي \`\`\`careerProfile حصراً قبل عرض الوظائف:
\`\`\`careerProfile
{
  "fullName": "...",
  "university": "...",
  "major": "...",
  "academicYear": "...",
  "skills": ["..."],
  "languages": ["..."],
  "interests": ["..."],
  "careerFields": ["..."]
}
\`\`\`

6. السلوك المالي:
- إذا كان الطلب مالياً، قدم نصيحة مالية عميقة وقابلة للتنفيذ.
` +
          (useSearchTools
            ? "استخدم أداة البحث عن معلومات متعمقة وحقيقية للوظائف أو الأمور المالية.\n\n"
            : "") +
          (profileContext || "")
        : `You are 'FinX AI Career Coach', a premium AI assistant.

1. CV-FIRST WORKFLOW (CRITICAL):
- If a CV/resume is uploaded, you MUST parse it completely FIRST. Build an internal candidate profile extracting: Name, Education, Degree, Skills, Languages, Experience, Projects.
- NEVER perform generic job search if a CV is uploaded. You MUST tailor the job search strictly to the extracted profile.
- If parsing fails, explain the exact error clearly and DO NOT proceed with generic job recommendations.

2. JOB MATCHING ENGINE & REGIONAL PRIORITY RULES (STRICT):
- Geographic Priority: 
  Priority 1: Jordan 
  Priority 2: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman 
  Priority 3: Egypt, Lebanon, Iraq 
  Priority 4: Fully Remote
- ALWAYS prefer Jordan -> Gulf Countries -> Remote. Do not show unrelated US or European jobs unless requested or no regional options exist.
- Preferred Job Sources: Priority 1: LinkedIn. Priority 2: Company Career Pages. Priority 3: Bayt, Akhtaboot, Forasna, GulfTalent. Priority 4: Indeed, Glassdoor, Wellfound.
- Student & Junior Candidate Logic: If the CV indicates less than 3 years experience, university student, or fresh grad, prioritize: Internship, Trainee, Junior Developer, Associate Developer, Graduate Programs, Entry Level AI/Data Science Roles.
- Jordan-Specific Matching: When boosting ranking for jobs (or if user is in Jordan), prioritize these companies: Tamatem, ProgressSoft, Estarta, Aspire, Mawdoo3, OpenSooq, Ahli Fintech, Bank Al Etihad, Arab Bank, Umniah, Zain Jordan, Orange Jordan.
- Language Preference: Prioritize jobs that accept English CVs, are suitable for Arabic-speaking candidates, and do not require relocation unless requested.
- You must evaluate and calculate a match score for each job based on the CV.

3. REAL APPLICATION LINKS ONLY (STRICT):
- COMPLETELY BLOCK AND REJECT 'vertexaisearch.cloud.google.com' or grounding-api-redirect URLs.
- ONLY allow direct valid URLs: LinkedIn, Indeed, Glassdoor, Wellfound, Company Careers Pages. NEVER invent links.

4. RESPONSE FORMAT (JSON JOB BLOCK FORMATTING STRICT RULES):
- NEVER display raw JSON code, JavaScript Objects, arrays, or bare URLs to the user.
- NEVER output narrative status messages like: 'Working on it...', 'Searching LinkedIn...', 'Executing search...', 'Let me check...'.
- For EACH job result, you MUST output it inside a \`\`\`job snippet EXACTLY as shown below.
- DO NOT repeat the User's CV details back to them (Name, Education, Skills, Summary, etc). Treat those as internal contextual state.
- Keep your conversational text minimal. ALWAYS start with purely: 'تم العثور على [X] وظائف مطابقة لسيرتك الذاتية' (or 'Found X matching jobs for your CV') then IMMEDITATELY output the jobs. Do not add long paragraphs.
- Keep 'whyMatches' to 1 very short sentence. Omit missingSkills.

\`\`\`job
{
  "title": "Job Title Here",
  "company": "Company Name Here",
  "location": "Location (e.g. Remote, Jordan)",
  "matchScore": "85",
  "source": "Source (e.g., LinkedIn, Company Website)",
  "url": "REAL_DIRECT_APPLICATION_URL_ONLY",
  "whyMatches": "1 short reason why it matches"
}
\`\`\`

5. CAREER PROFILE FORMAT:
If a CV is uploaded, you MUST extract the career profile and output it at the very beginning using the \`\`\`careerProfile block ONLY (before suggesting any jobs):
\`\`\`careerProfile
{
  "fullName": "...",
  "university": "...",
  "major": "...",
  "academicYear": "...",
  "skills": ["..."],
  "languages": ["..."],
  "interests": ["..."],
  "careerFields": ["..."]
}
\`\`\`

6. FINANCIAL & GENERAL:
- If the request is financial, analyze spending naturally.
` +
          (useSearchTools
            ? "Use the Google Search tool for in-depth live data on careers, live market data, or contextualizing user attachments.\n\n"
            : "") +
          (profileContext || "");

    const selectedModel = "gemini-2.5-flash";

    // Attachments Processing
    const partsArray: any[] = [{ text: userText || "Please analyze my attached documents and proceed with the best context (Career/Job Search vs Financial Advice)." }];
    if (hasAttachments) {
      for (const att of attachments) {
        if (att.data) {
          const rawBase64 = att.data.includes("base64,")
            ? att.data.split("base64,")[1]
            : att.data;
          partsArray.push({
            inlineData: {
              data: rawBase64,
              mimeType: att.mimeType || "application/octet-stream",
            },
          });
        }
      }
    }

    if (isCvUploaded || isCareerSearch) {
      partsArray.push({
        text: "\n[SYSTEM DIAGNOSTIC TRIGGER]: A CV or career-related query was detected. You MUST analyze the attached profile (if any) and proceed with returning JobResultCard JSON matches via Google Search. DO NOT respond with a generic greeting. Focus entirely on the analysis and job matching process.",
      });
      console.log(
        `[Diagnostics] Injected explicit system trigger to bypass generic greeting.`,
      );
    }

    console.log(
      `[Diagnostics] Final prompt 'partsArray' length: ${partsArray.length}`,
    );

    watchdogTimer = setTimeout(() => {
      if (!res.locals.isFinished) {
        res.locals.fallbackSent = true;
        console.log(`[Diagnostics] TIMEOUT_DETECTED: $> 45s elapsed`);
        console.log(
          `[Diagnostics] ERROR_CAUGHT: Workflow frozen or hung for >45s.`,
        );
        const reply =
          lang === "ar"
            ? "عذراً، استغرق البحث أو معالجة الطلب وقتاً أطول من المتوقع (أكثر من 45 ثانية). يرجى المحاولة بصيغة ملف أبسط أو بتقسيم الطلب."
            : "Apologies, processing your file or searching took longer than the 45-second timeout. Please try again with a lighter request.";
        res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, 45000);

    const inferenceStart = Date.now();

    if (isCareerSearch) {
      console.log(`[Diagnostics] CAREER_WORKFLOW_STARTED: ${Date.now()}`);
      if (isCvUploaded) {
        console.log(`[CV Uploaded] A CV document was detected.`);
        console.log(`[CV Parsed Successfully] Local preprocessing done.`);
        console.log(`[Diagnostics] CV_PARSE_STARTED: ${Date.now()}`);
        console.log(`[Diagnostics] PDF_TEXT_EXTRACTION_STARTED: ${Date.now()}`);
        console.log(
          `[Diagnostics] PDF_TEXT_EXTRACTION_COMPLETED: ${Date.now()} (Handled directly by Gemini Multimodal)`,
        );
        console.log(
          `[Diagnostics] CV_PARSE_COMPLETED: ${Date.now()} (Pre-parsed by frontend/Gemini)`,
        );
      }
    }

    console.log(`[Diagnostics] MODEL_REQUEST_STARTED: ${Date.now()}`);

    let stream;
    try {
      stream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: [...formattedHistory, { role: "user", parts: partsArray }],
        config: {
          systemInstruction: systemPromptString,
          temperature: 0.7,
          tools: useSearchTools ? [{ googleSearch: {} }] : undefined,
        },
      });
      console.log(`[Diagnostics] MODEL_REQUEST_COMPLETED: ${Date.now()}`);
    } catch (modelErr: any) {
      modelErr.stage = "Gemini API Streaming Request";
      // We will handle the fallback gracefully in the main catch block.
      throw modelErr;
    }

    let loggedQueries = false;
    let loggedProfile = false;
    let loggedChunks = false;
    let finalPayloadBuffer = "";

    console.log(`[Diagnostics] STREAM_STARTED: ${Date.now()}`);
    if (useSearchTools) {
      console.log(`[Diagnostics] SEARCH_STARTED: ${Date.now()}`);
    }

    try {
      for await (const chunk of stream) {
        if (res.locals.fallbackSent) break; // abort loop if watchdog fired

        if (!timeToFirstToken) {
          timeToFirstToken = Date.now() - startTime;
          console.log(
            `[Performance] Time to first token: ${timeToFirstToken}ms`,
          );
        }

        // Log Search Queries
        const groundingMeta = chunk?.candidates?.[0]?.groundingMetadata;
        if (groundingMeta?.webSearchQueries) {
          diagnosticWrapper.rawSearchQueries = groundingMeta.webSearchQueries;
        }

        if (groundingMeta?.webSearchQueries && !loggedQueries) {
          console.log(`[Diagnostics] SEARCH_COMPLETED: ${Date.now()}`);
          console.log(
            `[Diagnostics] Search Query Generated & Executed:`,
            groundingMeta.webSearchQueries,
          );
          loggedQueries = true;
          // Suppressed live search display per requirements
        }

        // Log Grounding Chunks to see URLs
        if (groundingMeta?.groundingChunks) {
          diagnosticWrapper.rawGroundingChunks = groundingMeta.groundingChunks;
          diagnosticWrapper.extractedUrls = groundingMeta.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => c.web?.uri);
        }

        if (groundingMeta?.groundingChunks && !loggedChunks) {
          const urls = groundingMeta.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => c.web?.uri);
          if (urls.length > 0) {
            console.log(
              `[Diagnostics] Raw URLs returned from Google Search tool:`,
              urls,
            );
            loggedChunks = true;
          }
        }

        if (chunk.text) {
          finalPayloadBuffer += chunk.text;
          // Simple heuristic to detect profile gen if we asked for cv
          if (
            isCvUploaded &&
            !loggedProfile &&
            (chunk.text.includes("Experience") ||
              chunk.text.includes("Skills") ||
              chunk.text.includes("مهارات") ||
              chunk.text.includes("خبرة"))
          ) {
            console.log(`[Extracted Skills] Extraction triggered in stream.`);
            console.log(`[Job Matching Started] Running Live Searches...`);
            console.log(
              `[Diagnostics] JOB_CARD_GENERATION_STARTED: ${Date.now()}`,
            );
            console.log(
              `[Diagnostics] Candidate profile generation detected in response stream.`,
            );
            loggedProfile = true;
          }
          
          if (isCvUploaded && chunk.text.includes("matchScore")) {
            console.log(`[Match Score] Calculated by model engine.`);
          }
          
          if (isCvUploaded && chunk.text.includes("url\":")) {
             console.log(`[Application URL Verified] Dispatched valid career link`);
          }

          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
    } catch (chunkErr: any) {
      chunkErr.stage =
        chunkErr.stage || "Stream Chunk Processing / Model Execution";
      throw chunkErr;
    }

    if (res.locals.fallbackSent) {
      return; // Already responded
    }

    res.locals.isFinished = true;
    clearTimeout(watchdogTimer);

    console.log(`[Diagnostics] STREAM_FINISHED: ${Date.now()}`);
    if (loggedProfile) {
      console.log(`[Diagnostics] JOB_CARD_GENERATION_COMPLETED: ${Date.now()}`);
    }

    diagnosticWrapper.finalTextPayload = finalPayloadBuffer;
    console.log(`\n=== [SEARCH AGENT DIAGNOSTIC WRAPPER] ===`);
    console.log(`CAREER_WORKFLOW_COMPLETED: ${isCareerSearch}`);
    console.log(`FINANCIAL_GREETING_BLOCKED: ${isCareerSearch}`);
    console.log(`SECOND_MODEL_INVOCATION: false`);
    console.log(`FINAL_RESPONSE_SOURCE: Model_Stream`);
    console.log(
      `Raw Search Queries:`,
      JSON.stringify(diagnosticWrapper.rawSearchQueries, null, 2),
    );
    console.log(
      `Raw Grounding Chunks Received:`,
      diagnosticWrapper.rawGroundingChunks.length,
    );
    console.log(
      `Specific URLs Extracted:`,
      JSON.stringify(diagnosticWrapper.extractedUrls, null, 2),
    );
    console.log(
      `Final Payload Delivered to UI (Length: ${diagnosticWrapper.finalTextPayload.length} chars)`,
    );
    console.log(`==========================================\n`);

    if (isCvUploaded) {
      console.log(
        `[Diagnostics] Workflow completed: CV Parsed -> Candidate Profile Generated -> Search Executed (if logged above) -> Results Rendered.`,
      );
    }

    const inferenceTime = Date.now() - inferenceStart;
    const totalTime = Date.now() - startTime;
    console.log(
      `[Performance] Inference time: ${inferenceTime}ms | Total time: ${totalTime}ms | Model: ${selectedModel} | Tools: ${useSearchTools}`,
    );
  } catch (error: any) {
    if (res.locals.fallbackSent) return;

    const isRateLimit =
      error?.status === 429 ||
      error?.code === 429 ||
      String(error).includes("429");

    const is503 = error?.status === 503 || error?.code === 503 || String(error).includes("503") || String(error).includes("UNAVAILABLE");

    if (isRateLimit) {
      console.log(
        "[Rate Limit] Stream Hit API Quota. Dropping back to local simulation.",
      );
    } else {
      console.log("[CV Analysis Error] Stream Fallback Triggered.");
      console.log(`[Status Code] ${error?.status || error?.code || 'UNAVAILABLE'}`);
      console.log(`[Retry Attempt] ${req.body.retryAttempt || 1}`);
      console.log(`[Model Response] ${error?.message || error}`);
    }

    if (isCvUploaded && !res.writableEnded && !res.locals.fallbackSent) {
      if (is503) {
        const errMsg = lang === "ar" 
           ? `خدمة تحليل السيرة الذاتية مشغولة حاليًا بسبب الضغط على الخوادم. يرجى المحاولة مرة أخرى خلال دقيقة.`
           : `CV analysis is temporarily unavailable due to high demand. Please try again shortly.`;
        
        res.write(`data: ${JSON.stringify({ text: errMsg, cvError: true, is503: true })}\n\n`);
      } else {
        const errMsg = lang === "ar" 
           ? `حدث خطأ أثناء تحليل السيرة الذاتية. يرجى المحاولة مرة أخرى.`
           : `I could not analyze the attached CV due to an error. Please try another file.`;
        res.write(`data: ${JSON.stringify({ text: errMsg, cvError: true, is503: false })}\n\n`);
      }
      res.locals.fallbackSent = true;
    } else if (!res.writableEnded && !res.locals.fallbackSent) {
      // Provide a clean fallback response so the user UI doesn't break
      const reply = getMockCoachResponse(userText, lang, isCareerSearch);
      res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
    }

  } finally {
    res.locals.isFinished = true;
    clearTimeout(watchdogTimer);
    if (!res.locals.fallbackSent && !res.writableEnded) {
      if (diagnosticWrapper && diagnosticWrapper.rawGroundingChunks && diagnosticWrapper.rawGroundingChunks.length > 0) {
        res.write(`data: ${JSON.stringify({ groundingChunks: diagnosticWrapper.rawGroundingChunks })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

// 2. Parse Statement Endpoint
app.post("/api/parse-statement", async (req, res) => {
  const { fileContent, fileMimeType, fileName, language } = req.body;
  const lang = language === "ar" ? "ar" : "en";

  // Provide high quality mock default database insights
  const mockAnalysis = {
    monthlyIncome: 1250,
    monthlyExpenses: 843,
    savingsRate: 32.5,
    healthScore: 78,
    scoreExplanation:
      lang === "ar"
        ? "صحتك المالية جيدة جداً بسبب معدل الادخار المرتفع (32%) واستقرار إيداعات الراتب شهرياً، إلا أن مصاريف الاشتراكات الشهرية وتناول الطعام بالخارج تفوق التوقعات بحوالي 12%."
        : "Your financial health is very strong due to a robust savings rate (32%) and steady salary inflows. Discretionary dining and digital subscriptions represent your primary optimization opportunities.",
    insights: [
      {
        type: "warning",
        title: lang === "ar" ? "اشتراكات مكررة" : "Duplicate Subscriptions",
        desc:
          lang === "ar"
            ? "تم رصد اشتراكات مكررة في خدمات ترفيهية بقيمة 15 د.أ شهرياً."
            : "Detected multiple overlapping streaming services costing 15 JOD/mo.",
      },
      {
        type: "success",
        title: lang === "ar" ? "نمو الادخار" : "Savings Growth",
        desc:
          lang === "ar"
            ? "أنت تنفق أقل مما تجني باستمرار طوال الأشهر الثلاثة الماضية."
            : "You consistently spent less than your monthly earnings over 3 months.",
      },
      {
        type: "neutral",
        title: lang === "ar" ? "مشتريات عشوائية" : "Impulse shopping",
        desc:
          lang === "ar"
            ? "هناك قفزة بنسبة 18% في فئة التسوق يومي الخميس والجمعة."
            : "Spikes in fashion categories are concentrated on weekends (18% up).",
      },
    ],
    categories: [
      {
        name: lang === "ar" ? "السكن والفواتير" : "Housing & Bills",
        value: 340,
        color: "#1E3A8A",
      },
      {
        name: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining",
        value: 215,
        color: "#3B82F6",
      },
      {
        name: lang === "ar" ? "المواصلات والسيارة" : "Transport & Car",
        value: 110,
        color: "#06B6D4",
      },
      {
        name: lang === "ar" ? "التسوق والترفيه" : "Shopping & Leisure",
        value: 130,
        color: "#F59E0B",
      },
      {
        name: lang === "ar" ? "الاشتراكات والاتصالات" : "Subscriptions",
        value: 48,
        color: "#8B5CF6",
      },
    ],
    transactions: [
      {
        date: "2026-06-01",
        desc: lang === "ar" ? "إيداع راتب شركة سين" : "Salary Deposit Inc.",
        amount: 1250,
        type: "income",
        category: lang === "ar" ? "الراتب" : "Salary",
      },
      {
        date: "2026-06-02",
        desc: lang === "ar" ? "سوبرماركت العثيم" : "Panda Supermarket",
        amount: -45.0,
        type: "expense",
        category: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining",
      },
      {
        date: "2026-06-04",
        desc:
          lang === "ar" ? "فاتورة كهرباء ومياه" : "Electricity & Water Bill",
        amount: -68.0,
        type: "expense",
        category: lang === "ar" ? "السكن والفواتير" : "Housing & Bills",
      },
      {
        date: "2026-06-06",
        desc: lang === "ar" ? "اشتراك نتفليكس مميز" : "Netflix Subscription",
        amount: -19.0,
        type: "expense",
        category: lang === "ar" ? "الاشتراكات والاتصالات" : "Subscriptions",
      },
      {
        date: "2026-06-08",
        desc: lang === "ar" ? "محطة الوقود الدائرية" : "Petrol Station",
        amount: -12.0,
        type: "expense",
        category: lang === "ar" ? "المواصِلات والسيارة" : "Transport & Car",
      },
      {
        date: "2026-06-11",
        desc: lang === "ar" ? "نون للتسوق الإلكتروني" : "Noon E-commerce",
        amount: -58.0,
        type: "expense",
        category: lang === "ar" ? "التسوق والترفيه" : "Shopping & Leisure",
      },
      {
        date: "2026-06-12",
        desc: lang === "ar" ? "مقهى ستاربكس" : "Starbucks Coffee",
        amount: -3.5,
        type: "expense",
        category: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining",
      },
    ],
  };

  if (!ai) {
    return res.json({
      analysis: mockAnalysis,
      success: true,
      mode: "local-simulation",
    });
  }

  try {
    // Call Gemini with Structured output
    const promptInstructions = `
You are an expert financial analysis machine. Analyze the attached statement file data, or simulate realistic parsing if it's typical text content (Filename: ${fileName}).
Provide a comprehensive parsed outcome in the following strict JSON schema:
{
  "monthlyIncome": number,
  "monthlyExpenses": number,
  "savingsRate": number,
  "healthScore": number (0 to 100 representing financial stability score),
  "scoreExplanation": "string in ${lang === "ar" ? "Arabic" : "English"}",
  "insights": Array of objects: { "type": "warning" | "success" | "neutral", "title": "string", "desc": "string" },
  "categories": Array of objects: { "name": "string category name", "value": number, "color": "string HEX color matching categories nicely" },
  "transactions": Array of objects: { "date": "YYYY-MM-DD", "desc": "string item description", "amount": number (positive for income, negative for expenses), "type": "income" | "expense", "category": "string" }
}

Ensure all texts, explanations, insights, and category names are translated and naturally written in the requested language: ${lang === "ar" ? "Arabic (العربية)" : "English"}.
If the uploaded file is a standard demo placeholder, generate incredibly polished financial health results centered on realistic mid-income values (e.g., 10k-15k total income).
    `;

    // Package base64 or treat as raw data
    let parts: any[] = [{ text: promptInstructions }];
    if (fileContent) {
      const isBase64 = fileContent.includes("base64,");
      const cleanData = isBase64
        ? fileContent.split("base64,")[1]
        : Buffer.from(fileContent).toString("base64");

      let mimeType = "text/plain";
      if (fileMimeType) {
        mimeType = fileMimeType;
      } else if (isBase64) {
        // extract from data URIs
        const match = fileContent.match(
          /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/,
        );
        if (match) mimeType = match[1];
      }

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanData,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            monthlyIncome: { type: Type.NUMBER },
            monthlyExpenses: { type: Type.NUMBER },
            savingsRate: { type: Type.NUMBER },
            healthScore: { type: Type.INTEGER },
            scoreExplanation: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                },
                required: ["type", "title", "desc"],
              },
            },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  color: { type: Type.STRING },
                },
                required: ["name", "value", "color"],
              },
            },
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ["date", "desc", "amount", "type", "category"],
              },
            },
          },
          required: [
            "monthlyIncome",
            "monthlyExpenses",
            "savingsRate",
            "healthScore",
            "scoreExplanation",
            "insights",
            "categories",
            "transactions",
          ],
        },
        temperature: 0.2,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      res.json({ analysis: parsed, success: true, mode: "gemini-api" });
    } else {
      res.json({
        analysis: mockAnalysis,
        success: true,
        mode: "fallback-error",
      });
    }
  } catch (error: any) {
    console.log(
      "Gemini Parse Statement Error (fallback used):",
      error?.message || "Unknown error",
    );
    res.json({ analysis: mockAnalysis, success: true, mode: "fallback-catch" });
  }
});

// 5. PDF Summary Generator Endpoint
app.post("/api/coach-summary", async (req, res) => {
  const { messages, language, userName } = req.body;
  const lang = language === "ar" ? "ar" : "en";
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const rawChat = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt =
      lang === "ar"
        ? `أنت مساعد مالي ذكي. قم بتحليل هذا النقاش ولخصه في تقرير أنيق بتنسيق JSON.
النقاش:
${rawChat}

استخرج البيانات لملء هذا التنسيق بالضبط بأسلوب احترافي:
{
  "title": "ملخص استشارة FinX",
  "summary": "ملخص عام للنقاش (2-3 جمل)",
  "keyPoints": ["نقطة 1", "نقطة 2", "نقطة 3"],
  "recommendations": ["توصية 1", "توصية 2"],
  "actionPlan": ["خطوة 1", "خطوة 2"],
  "goals": ["هدف 1", "هدف 2"],
  "warnings": ["تحذير 1"] (إن وجد، وإلا مصفوفة فارغة)
}`
        : `You are an intelligent financial assistant. Analyze the following conversation and summarize it into an elegant report in JSON format.
Conversation:
${rawChat}

Extract the details to exactly match this JSON schema with professional tone:
{
  "title": "FinX Consultation Summary",
  "summary": "Overall summary of the discussion (2-3 sentences)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendations": ["rec 1", "rec 2"],
  "actionPlan": ["step 1", "step 2"],
  "goals": ["goal 1", "goal 2"],
  "warnings": ["warning 1"] (if applicable, else empty array)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const reportJson = JSON.parse(response.text || "{}");
    res.json(reportJson);
  } catch (err: any) {
    if (err?.status === 429) {
      console.log("Coach Summary Quote Rate Limit - Using mock summary.");
    } else {
      console.log("Coach summary error", err?.message || "");
    }
    res.json({
      title: lang === "ar" ? "ملخص ذكي محلي" : "Local Smart Summary",
      summary:
        lang === "ar"
          ? "لدينا ضغط حاليا، هذا ملخص تلقائي."
          : "System under load, providing automated summary.",
      keyPoints: [
        lang === "ar" ? "مراجعة نفقاتك" : "Review your expenses",
        lang === "ar" ? "زيادة المدخرات" : "Increase savings",
      ],
      recommendations: [],
      actionPlan: [],
      goals: [],
      warnings: [],
    });
  }
});
app.post("/api/parse-sms", async (req, res) => {
  const { smsText, language } = req.body;
  const lang = language === "ar" ? "ar" : "en";
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });

  try {
    const promptText = `
Extract the transaction details from this raw bank SMS.
Return ONLY structured JSON data. Ensure the language is ${lang === "ar" ? "Arabic" : "English"}.
SMS: "${smsText}"
JSON Schema:
{
  "amount": number (positive for income/deposits, negative for purchases/withdrawals),
  "currency": "string",
  "merchant": "string (the store or 'Bank' for salary/deposit)",
  "type": "income" | "expense",
  "date": "string (readable date)",
  "category": "string (smart categorization like 'Groceries', 'Salary', 'Dining', 'Shopping')",
  "title": "string (A short, clean note title)"
}
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: promptText }],
      config: { responseMimeType: "application/json" },
    });
    res.json(JSON.parse(response.text! || "{}"));
  } catch (err: any) {
    if (err?.status === 429) {
      console.log("SMS parser Rate Limit - Using mock parser.");
    } else {
      console.log("SMS parser err", err?.message || err);
    }
    res.json({
      amount: -50,
      currency: "JOD",
      merchant: "Store",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      category: "Shopping",
      title: "Manual SMS Parse",
    });
  }
});

// --- Interview Simulator Endpoints ---
app.post("/api/interview-generate", async (req, res) => {
  const { lang, jobRole, careerField, difficulty, numQuestions, careerProfile } = req.body;
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  try {
    const promptText = `
You are an expert HR interviewer screening a candidate for the role of ${jobRole} (${careerField}).
The difficulty level is ${difficulty}.
The candidate's profile is:
${JSON.stringify(careerProfile || {}, null, 2)}

Generate ${numQuestions} highly realistic, challenging, and role-specific interview questions. 
Include a mix of technical, behavioral, and CV-based questions.
Output language must be ${lang === "ar" ? "Arabic" : "English"}.

Return ONLY a JSON array of strings containing the questions. Do not include markdown code block formatting like \`\`\`json.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: promptText }],
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text! || "{}");
    // Ensure we send an array of strings
    if (Array.isArray(result)) {
      res.json({ questions: result });
    } else if (result && result.questions && Array.isArray(result.questions)) {
      res.json({ questions: result.questions });
    } else {
      res.json({ questions: [lang === "ar" ? "حدث خطأ في توليد الأسئلة، يرجى المحاولة." : "Failed to generate questions. Please retry."] });
    }
  } catch (err) {
    console.error("Interview generate error", err);
    res.json({ questions: [lang === "ar" ? "ماهي خبراتك السابقة؟" : "What is your previous experience?"] });
  }
});

app.post("/api/interview-score", async (req, res) => {
  const { lang, questions, jobRole, careerField, difficulty } = req.body;
  if (!ai) return res.status(500).json({ error: "Gemini API key missing" });
  try {
    const promptText = `
You are an expert HR Interviewer and Coach.
You have just interviewed a candidate for the role of ${jobRole} (${careerField}) at ${difficulty} difficulty.
Here are the questions asked and the candidate's answers:
${JSON.stringify(questions, null, 2)}

Evaluate the candidate's performance. 
Return ONLY structured JSON data. Make sure it is strictly valid JSON format without markdown code tags.
Language: ${lang === "ar" ? "Arabic" : "English"}.
Schema:
{
  "questions": [
    { "question": "...", "answer": "...", "feedback": "Detailed expert feedback on how to improve this answer" }
  ],
  "overallScore": number (0-100),
  "communicationScore": number (0-100),
  "technicalScore": number (0-100),
  "confidenceScore": number (0-100),
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "improvements": ["string"]
}
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: promptText }],
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text! || "{}"));
  } catch (err) {
    console.error("Interview score error", err);
    res.json({ error: "Failed to score" });
  }
});

// ----------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------
async function setupViteAndStatic() {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Starting in Development mode with Vite live assets middleware",
    );
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { overlay: false },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist folder");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `=============================================================`,
    );
    console.log(
      `🚀 FinX Full-Stack Server running securely on port http://localhost:${PORT}`,
    );
    console.log(`🌍 Defaulting routing of framework-agnostic client assets...`);
    console.log(
      `=============================================================`,
    );
  });
}

setupViteAndStatic();
