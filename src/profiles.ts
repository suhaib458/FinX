import { FinancialAnalysis } from "./types";

export const perfectProfile: FinancialAnalysis = {
  monthlyIncome: 1500,
  monthlyExpenses: 480,
  savingsRate: 68.0,
  healthScore: 92,
  scoreExplanation: "صحتك المالية استثنائية! لديك معدل فائق للادخار يبلغ 68% ومصدات ممتازة تحميك وتغطي نفقاتك لأكثر من 12 شهراً، مع انعدام الديون ذات الفوائد التراكمية.",
  insights: [
    {
      type: "success",
      title: "معدل ادخار استثنائي",
      desc: "أنت تدخر وتستثمر أكثر من 60% من دخلك شهرياً بانتظام."
    },
    {
      type: "success",
      title: "صفر ديون استهلاكية",
      desc: "لا توجد مديونيات بفائدة عالية، مما يرفع مؤشر أمانك كلياً."
    },
    {
      type: "neutral",
      title: "تحسين رصيدك المالي",
      desc: "سيولتك النقدية الحرة عالية؛ ننصح بجدولة 20% نحو صناديق استثمار متوسطة المخاطر."
    }
  ],
  categories: [
    { name: "السكن والفواتير", value: 180, color: "#1E3B8A" },
    { name: "المطاعم والغذائيات", value: 110, color: "#008080" },
    { name: "المواصلات والسيارة", value: 60, color: "#0E7490" },
    { name: "مصاريف الجامعة والتعلم", value: 90, color: "#F59E0B" },
    { name: "الاشتراكات والاتصالات", value: 40, color: "#8B5CF6" }
  ],
  transactions: [
    { date: "2026-06-01", desc: "راتب أساسي شركة التقنية المتقدمة", amount: 1500, type: "income", category: "الراتب" },
    { date: "2026-06-02", desc: "دفعة إيجار الاستوديو الشهري", amount: -120, type: "expense", category: "السكن والفواتير" },
    { date: "2026-06-04", desc: "الجمعية الاستهلاكية - تموين شهري", amount: -55, type: "expense", category: "المطاعم والغذائيات" },
    { date: "2026-06-06", desc: "فاتورة شبكة 5G والخدمات المشتركة", amount: -25, type: "expense", category: "السكن والفواتير" },
    { date: "2026-06-08", desc: "فاتورة شحن السيارة الكهربائية", amount: -15, type: "expense", category: "المواصلات والسيارة" },
    { date: "2026-06-10", desc: "شراء كتب ورقية - جرير", amount: -12, type: "expense", category: "التسوق والترفيه" },
    { date: "2026-06-12", desc: "طلب عشاء صحي جاهز", amount: -8.5, type: "expense", category: "المطاعم والغذائيات" },
    { date: "2026-06-14", desc: "سداد خدمات تخزين جوجل كلاود", amount: -1.5, type: "expense", category: "الاشتراكات والاتصالات" }
  ]
};

export const perfectProfileEnglish: FinancialAnalysis = {
  monthlyIncome: 1500,
  monthlyExpenses: 480,
  savingsRate: 68.0,
  healthScore: 92,
  scoreExplanation: "Your financial health is outstanding! You have an elite 68% savings rate, exceptional reserves covering over 12 months, and zero high-interest consumer debts.",
  insights: [
    {
      type: "success",
      title: "Stellar Savings Rate",
      desc: "You consistently allocate and save over 60% of your net streams."
    },
    {
      type: "success",
      title: "Debt-Free Freedom",
      desc: "No high-interest balances detected; this fuels your total financial security."
    },
    {
      type: "neutral",
      title: "Optimize Capital Efficiency",
      desc: "Your bank balance has idle cash drag. Consider shifting 20% to low-cost mutual portfolios."
    }
  ],
  categories: [
    { name: "Housing & Bills", value: 180, color: "#1E3B8A" },
    { name: "Food & Dining", value: 110, color: "#008080" },
    { name: "Transport & Car", value: 60, color: "#0E7490" },
    { name: "University & Learning", value: 90, color: "#F59E0B" },
    { name: "Subscriptions", value: 40, color: "#8B5CF6" }
  ],
  transactions: [
    { date: "2026-06-01", desc: "Main Tech Salary Corporate", amount: 1500, type: "income", category: "Salary" },
    { date: "2026-06-02", desc: "Monthly Studio Apartment Rental", amount: -120, type: "expense", category: "Housing & Bills" },
    { date: "2026-06-04", desc: "Hypermarket Grocery Purchases", amount: -55, type: "expense", category: "Food & Dining" },
    { date: "2026-06-06", desc: "Highspeed 5G internet subscription", amount: -25, type: "expense", category: "Housing & Bills" },
    { date: "2026-06-08", desc: "EV Supercharging Session", amount: -15, type: "expense", category: "Transport & Car" },
    { date: "2026-06-10", desc: "Educational bookstore items", amount: -12, type: "expense", category: "Shopping & Leisure" },
    { date: "2026-06-12", desc: "Fresh organic meals delivery", amount: -8.5, type: "expense", category: "Food & Dining" },
    { date: "2026-06-14", desc: "Google Cloud storage fee", amount: -1.5, type: "expense", category: "Subscriptions" }
  ]
};

export const debtProfile: FinancialAnalysis = {
  monthlyIncome: 950,
  monthlyExpenses: 890,
  savingsRate: 6.3,
  healthScore: 36,
  scoreExplanation: "مؤشر صحتك المالية منخفض وجزء عريض من سيولتك مهدد. نفقاتك تلتهم 93% من دخلك، مع التزامات أقساط قروض عالية جداً (33%) وضغط مشتريات ترفيهية يعوق نمو مدخراتك.",
  insights: [
    {
      type: "warning",
      title: "إنذار عبء القروض",
      desc: "تمثل مدفوعات الأقساط الشهرية 33% من إجمالي دخلك، وهو قريب للحد الحرج."
    },
    {
      type: "warning",
      title: "تسوق استهلاكي مفرط",
      desc: "تنفق أكثر من 190 د.أ شهرياً على سلع غير جوهرية بصفة عشوائية."
    },
    {
      type: "neutral",
      title: "نزيف اشتراكات رقمية",
      desc: "هناك 5 اشتراكات نشطة مكررة يستحسن إلغاؤها لتوفير 30 د.أ فوري."
    }
  ],
  categories: [
    { name: "السكن والفواتير (والقرض)", value: 430, color: "#1E3B8A" },
    { name: "المطاعم والغذائيات", value: 230, color: "#008080" },
    { name: "المواصلات والسيارة", value: 120, color: "#0E7490" },
    { name: "التسوق والترفيه", value: 190, color: "#F59E0B" },
    { name: "الاشتراكات والاتصالات", value: 65, color: "#8B5CF6" }
  ],
  transactions: [
    { date: "2026-06-01", desc: "الراتب الشهري الأساسي", amount: 950, type: "income", category: "الراتب" },
    { date: "2026-06-02", desc: "قسط القرض الشخصي لدى البنك", amount: -310, type: "expense", category: "السكن والفواتير (والقرض)" },
    { date: "2026-06-03", desc: "إيجار السكن والمستحقات المائية", amount: -120, type: "expense", category: "السكن والفواتير (والقرض)" },
    { date: "2026-06-05", desc: "شراء ملابس ترفيهية مستجدة", amount: -85, type: "expense", category: "التسوق والترفيه" },
    { date: "2026-06-06", desc: "عشاء فاخر في مطعم سياحي", amount: -48, type: "expense", category: "المطاعم والغذائيات" },
    { date: "2026-06-08", desc: "أقساط تمويل سيارة هجينة", amount: -120, type: "expense", category: "المواصلات والسيارة" },
    { date: "2026-06-10", desc: "مشتريات عشوائية عبر الإنترنت", amount: -105, type: "expense", category: "التسوق والترفيه" },
    { date: "2026-06-11", desc: "سوبرماركت وطلبات بقالة سريعة", amount: -182, type: "expense", category: "المطاعم والغذائيات" },
    { date: "2026-06-13", desc: "فاتورة 4 اشتراكات مكررة", amount: -35, type: "expense", category: "الاشتراكات والاتصالات" }
  ]
};

export const debtProfileEnglish: FinancialAnalysis = {
  monthlyIncome: 950,
  monthlyExpenses: 890,
  savingsRate: 6.3,
  healthScore: 36,
  scoreExplanation: "Your financial health index is low and critical. Your expenses consumer 93% of your income, with heavy loan payments (33%) and massive discretionary food delivery habits.",
  insights: [
    {
      type: "warning",
      title: "Heavy Loan Repayments",
      desc: "Monthly debt installments consume 33% of your gross earnings, close to the critical threshold."
    },
    {
      type: "warning",
      title: "Extravagant Shopper Mode",
      desc: "Over 190 JOD was parsed under impulse shopping channels this month."
    },
    {
      type: "neutral",
      title: "Leaking Digital Subscriptions",
      desc: "Detected 5 redundant applications. Cancel unused ones to easily save 30 JOD immediately."
    }
  ],
  categories: [
    { name: "Housing, Bills & Loan", value: 430, color: "#1E3B8A" },
    { name: "Food & Dining", value: 230, color: "#008080" },
    { name: "Transport & Car", value: 120, color: "#0E7490" },
    { name: "Shopping & Leisure", value: 190, color: "#F59E0B" },
    { name: "Subscriptions", value: 65, color: "#8B5CF6" }
  ],
  transactions: [
    { date: "2026-06-01", desc: "Monthly Corporate Salary Credited", amount: 950, type: "income", category: "Salary" },
    { date: "2026-06-02", desc: "Bank Personal Loan Installment", amount: -310, type: "expense", category: "Housing, Bills & Loan" },
    { date: "2026-06-03", desc: "Flat rent and water bill utilities", amount: -120, type: "expense", category: "Housing, Bills & Loan" },
    { date: "2026-06-05", desc: "Weekend luxury boutique outfit", amount: -85, type: "expense", category: "Shopping & Leisure" },
    { date: "2026-06-06", desc: "Fine Dining sushi lounge", amount: -48, type: "expense", category: "Food & Dining" },
    { date: "2026-06-08", desc: "Sedan Car Loan installment", amount: -120, type: "expense", category: "Transport & Car" },
    { date: "2026-06-10", desc: "E-Commerce miscellaneous shopping", amount: -105, type: "expense", category: "Shopping & Leisure" },
    { date: "2026-06-11", desc: "Gourmet grocery delivery orders", amount: -182, type: "expense", category: "Food & Dining" },
    { date: "2026-06-13", desc: "Consolidated media platforms bill", amount: -35, type: "expense", category: "Subscriptions" }
  ]
};

