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
const hasKey = API_KEY && API_KEY !== "" && !API_KEY.includes("MY_GEMINI_API_KEY");

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
    console.log("Gemini client successfully initialized from environment secret!");
  } catch (err) {
    console.error("Failed to initialize Gemini Client: ", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY provided in secrets. Continuing in high-quality local mock mode.");
}

// ----------------------
// HELPER FALLBACK RESPONSES for AI FINANCE COACH
// ----------------------
function getMockCoachResponse(msg: string, lang: "ar" | "en"): string {
  const norm = msg.toLowerCase();
  if (lang === "ar" || norm.includes("أريد") || norm.includes("كيف") || norm.includes("نصيحة") || norm.includes("توفير")) {
    if (norm.includes("توفير") || norm.includes("ادخار") || norm.includes("save") || norm.includes("money")) {
      return `مرحباً بك! هاهي أهم النصائح الذكية لتوفير المال بناءً على تحليلك المالي:
1. **تحدي الـ 50/30/20**: خصص 50% للضروريات، 30% للرغبات، و20% للادخار والاستثمار فور استلام دخلك.
2. **إلغاء الاشتراكات غير النشطة**: نلاحظ وجود اشتراكين نشطين لا تستفيد منهما بالشكل الكامل (بقيمة 15 د.أ شهرياً). إلغاؤها يوفر لك 180 د.أ سنوياً!
3. **التسوق بذكاء**: انتظر 48 ساعة قبل شراء أي منتج غير ضروري للتأكد من رغبتك الفعلية فيه.`;
    }
    if (norm.includes("الدرجة") || norm.includes("الصحة") || norm.includes("score") || norm.includes("تحسين")) {
      return `لتحسين **مؤشر صحتك المالية (Financial Health Score)** من درجتك الحالية، اتبع هذه الاستراتيجيات المعتمدة:
• **تقليل الالتزامات الشهرية**: خفض نسبة الديون والاقساط الشهرية لتقل عن 30% من دخلك الإجمالي.
• **بناء صندوق الطوارئ**: احتفظ بجزء مخصص يغطي من 3 إلى 6 أشهر من نفقاتك المعيشية الأساسية.
• **الالتزام بالميزانية**: عدم تجاوز ميزانية التسوق والمطاعم المحددة لك، والتي تعتبر من أكثر الفئات استهلاكاً لسيولتك الشهرية حالياً.`;
    }
    if (norm.includes("سيارة") || norm.includes("car") || norm.includes("شراء")) {
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
    if (norm.includes("save") || norm.includes("saving") || norm.includes("money") || norm.includes("expense")) {
      return `Welcome! Here are key smart strategies to save money based on your profile:
1. **Rule of 50/30/20**: Allocate 50% for Needs, 30% for Wants, and 20% directly to Savings and Investments right when you get paid.
2. **Subscription Audit**: We detected active digital subscriptions costing around 15 JOD/month. Cancelling unused ones saves you 180 JOD annually.
3. **48-Hour Wait**: Apply a 48-hour cool-off period before any non-essential purchase to check if it's a true need.`;
    }
    if (norm.includes("score") || norm.includes("health") || norm.includes("improve")) {
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
    const reply = getMockCoachResponse(userText, lang);
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
        parts: [{ text: m.content }]
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

    const systemPromptString = lang === "ar"
      ? "أنت 'FinX AI Coach' مستشار مالي مبسط وفعال. ساعد المستخدمين بنصائح قصيرة جداً ومباشرة (حد أقصى 3 نقاط). تجنب الشرح الطويل. ركز فقط على الإجراءات العملية الواضحة. يمكنك قراءة وفهم الصور والمستندات المرفقة (مثل الفواتير، الإيصالات، أو الكشوف البنكية) لاستخراج المعلومات بذكاء." + profileContext
      : "You are 'FinX AI Coach', a highly concise and actionable financial assistant. Give extremely short, direct answers (max 3 bullet points). Avoid long paragraphs or generic advice. Focus only on clear, practical steps. You can read and analyze uploaded images and documents (receipts, bills, bank statements) to extract structural components and financial items smartly." + profileContext;

    // Attachments Processing
    const partsArray: any[] = [{ text: userText }];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.data) {
          const rawBase64 = att.data.includes("base64,") ? att.data.split("base64,")[1] : att.data;
          partsArray.push({
            inlineData: {
              data: rawBase64,
              mimeType: att.mimeType || "application/octet-stream",
            }
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: partsArray },
      ],
      config: {
        systemInstruction: systemPromptString,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.warn("Gemini AI Coach Error (fallback used):", error?.message || "Unknown error");
    const reply = getMockCoachResponse(userText, lang);
    res.json({ reply, notice: "Served using FinX Local Intelligence Engine due to connectivity parameters." });
  }
});

// 2. Parse Statement Endpoint
app.post("/api/parse-statement", async (req, res) => {
  const { fileContent, fileName, language } = req.body;
  const lang = language === "ar" ? "ar" : "en";

  // Provide high quality mock default database insights
  const mockAnalysis = {
    monthlyIncome: 1250,
    monthlyExpenses: 843,
    savingsRate: 32.5,
    healthScore: 78,
    scoreExplanation: lang === "ar"
      ? "صحتك المالية جيدة جداً بسبب معدل الادخار المرتفع (32%) واستقرار إيداعات الراتب شهرياً، إلا أن مصاريف الاشتراكات الشهرية وتناول الطعام بالخارج تفوق التوقعات بحوالي 12%."
      : "Your financial health is very strong due to a robust savings rate (32%) and steady salary inflows. Discretionary dining and digital subscriptions represent your primary optimization opportunities.",
    insights: [
      {
        type: "warning",
        title: lang === "ar" ? "اشتراكات مكررة" : "Duplicate Subscriptions",
        desc: lang === "ar"
          ? "تم رصد اشتراكات مكررة في خدمات ترفيهية بقيمة 15 د.أ شهرياً."
          : "Detected multiple overlapping streaming services costing 15 JOD/mo.",
      },
      {
        type: "success",
        title: lang === "ar" ? "نمو الادخار" : "Savings Growth",
        desc: lang === "ar"
          ? "أنت تنفق أقل مما تجني باستمرار طوال الأشهر الثلاثة الماضية."
          : "You consistently spent less than your monthly earnings over 3 months.",
      },
      {
        type: "neutral",
        title: lang === "ar" ? "مشتريات عشوائية" : "Impulse shopping",
        desc: lang === "ar"
          ? "هناك قفزة بنسبة 18% في فئة التسوق يومي الخميس والجمعة."
          : "Spikes in fashion categories are concentrated on weekends (18% up).",
      },
    ],
    categories: [
      { name: lang === "ar" ? "السكن والفواتير" : "Housing & Bills", value: 340, color: "#1E3A8A" },
      { name: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining", value: 215, color: "#3B82F6" },
      { name: lang === "ar" ? "المواصلات والسيارة" : "Transport & Car", value: 110, color: "#06B6D4" },
      { name: lang === "ar" ? "التسوق والترفيه" : "Shopping & Leisure", value: 130, color: "#F59E0B" },
      { name: lang === "ar" ? "الاشتراكات والاتصالات" : "Subscriptions", value: 48, color: "#8B5CF6" },
    ],
    transactions: [
      { date: "2026-06-01", desc: lang === "ar" ? "إيداع راتب شركة سين" : "Salary Deposit Inc.", amount: 1250, type: "income", category: lang === "ar" ? "الراتب" : "Salary" },
      { date: "2026-06-02", desc: lang === "ar" ? "سوبرماركت العثيم" : "Panda Supermarket", amount: -45.0, type: "expense", category: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining" },
      { date: "2026-06-04", desc: lang === "ar" ? "فاتورة كهرباء ومياه" : "Electricity & Water Bill", amount: -68.0, type: "expense", category: lang === "ar" ? "السكن والفواتير" : "Housing & Bills" },
      { date: "2026-06-06", desc: lang === "ar" ? "اشتراك نتفليكس مميز" : "Netflix Subscription", amount: -19.0, type: "expense", category: lang === "ar" ? "الاشتراكات والاتصالات" : "Subscriptions" },
      { date: "2026-06-08", desc: lang === "ar" ? "محطة الوقود الدائرية" : "Petrol Station", amount: -12.0, type: "expense", category: lang === "ar" ? "المواصِلات والسيارة" : "Transport & Car" },
      { date: "2026-06-11", desc: lang === "ar" ? "نون للتسوق الإلكتروني" : "Noon E-commerce", amount: -58.0, type: "expense", category: lang === "ar" ? "التسوق والترفيه" : "Shopping & Leisure" },
      { date: "2026-06-12", desc: lang === "ar" ? "مقهى ستاربكس" : "Starbucks Coffee", amount: -3.5, type: "expense", category: lang === "ar" ? "المطاعم والغذائيات" : "Food & Dining" },
    ],
  };

  if (!ai) {
    return res.json({ analysis: mockAnalysis, success: true, mode: "local-simulation" });
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
      const cleanData = isBase64 ? fileContent.split("base64,")[1] : Buffer.from(fileContent).toString("base64");
      parts.push({
        inlineData: {
          mimeType: "text/plain",
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
          required: ["monthlyIncome", "monthlyExpenses", "savingsRate", "healthScore", "scoreExplanation", "insights", "categories", "transactions"],
        },
        temperature: 0.2,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      res.json({ analysis: parsed, success: true, mode: "gemini-api" });
    } else {
      res.json({ analysis: mockAnalysis, success: true, mode: "fallback-error" });
    }
  } catch (error: any) {
    console.warn("Gemini Parse Statement Error (fallback used):", error?.message || "Unknown error");
    res.json({ analysis: mockAnalysis, success: true, mode: "fallback-catch" });
  }
});

// 3. Career AI Chat Endpoint
app.post("/api/career-chat", async (req, res) => {
  const { messages, language, portfolioDetails, attachments } = req.body;
  const lang = language === "ar" ? "ar" : "en";
  if (!ai) return res.status(500).json({ reply: "Gemini API key missing. Running in local mode. Please set GEMINI_API_KEY to test the AI functionality." });
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
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
        parts: [{ text: m.content }]
      });
      lastRole = role;
    }

    const latestMessageObj = messages[messages.length - 1];
    const userText = latestMessageObj.content || "";
    
    // Fallback info if portfolioDetails absent
    const pHealthScore = portfolioDetails?.healthScore || 50;
    const pIncome = portfolioDetails?.income || 0;
    const pSavingsRate = portfolioDetails?.savingsRate || 0;
    const statusNote = pHealthScore > 70 ? "Stable, seeking growth" : "Needs supplemental income";

    const systemPromptString = lang === "ar"
      ? `أنت مستشار مهني وخبير توظيف ذكي (Career AI Assistant) مخصص لمساعدة المستخدمين في تحليل سيرتهم الذاتية والمستندات المهنية واقتراح الوظائف المناسبة.
قم بتحليل الصور والنصوص المرفقة بعمق (السيرة الذاتية، الشهادات، الوصف الوظيفي). 
حدد تفاصيل مثل: نقاط القوة، نقاط الضعف، اقتراحات التحسين، المهارات الناقصة، والمسار المهني، ونصائح للمقابلة.
تتضمن مهامك البحث الذكي عبر منصات التوظيف (مثل LinkedIn)، إذا طلب منك البحث عن وظيفة أو تمت مشاركة ملف صوتي أو نصي لهامش وظيفة، قدم قائمة بالوظائف الوهمية أو المتوافقة التي تجدها كما لو كنت متصلاً بـ LinkedIn (أظهر نسبة التوافق لكل وظيفة واشرح لماذا تتوافق).
تذكر أن صحة المستخدم المالية هي ${pHealthScore}/100، دخله ${pIncome} ومعدل مدخراته ${pSavingsRate}%. وضعه: "${statusNote}". اربط بين تحسين الدخل وخطته المهنية.`
      : `You are an intelligent Career AI Assistant and Employment Expert. 
Help users analyze their resumes, certificates, job descriptions, portfolio screenshots, and other career documents.
If they upload files/images, extract the text using OCR and structurally analyze it. 
Provide professional insights like: Summary, Strengths, Weaknesses, Recommendations, Missing Skills, Career Opportunities, and an Action Plan. 
Your capabilities include simulating job board integration (like LinkedIn). If the user asks you to find a job or searches via voice/text, generate realistic job matches as if querying LinkedIn, and provide a match percentage with an explanation for each.
Consider their financial health score is ${pHealthScore}/100, monthly income is ${pIncome}, saving rate ${pSavingsRate}% and their status is: "${statusNote}". Suggest roles and plans that maximize their income and fit their profile. Use professional, clear markdown formatting.`;

    const partsArray: any[] = [{ text: userText }];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.data) {
          const rawBase64 = att.data.includes("base64,") ? att.data.split("base64,")[1] : att.data;
          partsArray.push({
            inlineData: {
              data: rawBase64,
              mimeType: att.mimeType || "application/octet-stream",
            }
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: partsArray },
      ],
      config: {
        systemInstruction: systemPromptString,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Career API error:", err.message || err);
    let replyMsg = lang === "ar" 
      ? "عذراً، أواجه ضغطاً كبيراً في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً." 
      : "I am currently experiencing high demand. Please try again a bit later.";
      
    if (err.status !== 503 && !err.message?.includes('503')) {
       replyMsg = lang === "ar" 
         ? "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."
         : "Sorry, a server error occurred. Please try again.";
    }
    
    // Instead of 500 error, return a friendly chat message so the UI can show it.
    res.json({ reply: replyMsg });
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
    const rawChat = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    
    const prompt = lang === "ar" 
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
      }
    });

    const reportJson = JSON.parse(response.text || "{}");
    res.json(reportJson);
  } catch (err: any) {
    console.error("Coach summary error:", err.message);
    res.status(500).json({ error: "Failed to generate summary" });
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
  } catch(err) {
    console.error("SMS parser err", err);
    res.status(500).json({ error: "Failed to parse SMS" });
  }
});

// ----------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------
async function setupViteAndStatic() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in Development mode with Vite live assets middleware");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { overlay: false }
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
    console.log(`=============================================================`);
    console.log(`🚀 FinX Full-Stack Server running securely on port http://localhost:${PORT}`);
    console.log(`🌍 Defaulting routing of framework-agnostic client assets...`);
    console.log(`=============================================================`);
  });
}

setupViteAndStatic();
