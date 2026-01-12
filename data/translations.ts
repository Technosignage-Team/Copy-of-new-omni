
export const translations = {
  en: {
    // Navigation
    home: "Home",
    tickets: "Tickets",
    users: "Users",
    settings: "Settings",
    analytics: "Analytics",
    notifications: "Notifications",
    account: "My Account",
    logout: "Sign Out",
    
    // Dashboard
    welcome_agent: "Hello, Agent",
    happening_today: "Here's what's happening today.",
    create_new_ticket: "Create New Ticket",
    total_tickets: "Total Tickets",
    open_now: "Open Now",
    in_progress: "In Progress",
    closed: "Closed",
    recent_updates: "Recent Updates",
    
    // Ticket General
    ticket_id: "Ticket ID",
    status: "Status",
    priority: "Priority",
    assignee: "Assignee",
    creator: "Submitted by",
    type: "Type",
    description: "Description",
    save_changes: "Save Changes",
    cancel: "Cancel",
    search_placeholder: "Search tickets or #ref...",
    
    // Priorities
    p_low: "Low",
    p_medium: "Medium",
    p_high: "High",
    p_critical: "Critical",
    
    // Statuses
    s_open: "Open",
    s_pending: "Pending",
    s_resolved: "Resolved",
    s_closed: "Closed",
    
    // AI
    omnibot_title: "Omnibot Assistant",
    ai_summary: "AI Summary",
    generate_summary: "Generate AI Summary",
    ask_omnibot: "Ask Omnibot...",
    voice_mode: "Live Voice",
    chat_mode: "Chat",
    
    // Users
    team_members: "Team Members",
    new_user: "New User",
    role: "Role",
    active: "Active",
    inactive: "Inactive"
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    tickets: "التذاكر",
    users: "المستخدمين",
    settings: "الإعدادات",
    analytics: "التحليلات",
    notifications: "التنبيهات",
    account: "حسابي",
    logout: "تسجيل الخروج",
    
    // Dashboard
    welcome_agent: "مرحباً، أيها العميل",
    happening_today: "إليك ما يحدث اليوم.",
    create_new_ticket: "إنشاء تذكرة جديدة",
    total_tickets: "إجمالي التذاكر",
    open_now: "مفتوحة الآن",
    in_progress: "قيد التنفيذ",
    closed: "مغلقة",
    recent_updates: "آخر التحديثات",
    
    // Ticket General
    ticket_id: "رقم التذكرة",
    status: "الحالة",
    priority: "الأولوية",
    assignee: "المسؤول",
    creator: "تم الإرسال بواسطة",
    type: "النوع",
    description: "الوصف",
    save_changes: "حفظ التغييرات",
    cancel: "إلغاء",
    search_placeholder: "البحث في التذاكر أو المرجع...",
    
    // Priorities
    p_low: "منخفضة",
    p_medium: "متوسطة",
    p_high: "عالية",
    p_critical: "حرجة",
    
    // Statuses
    s_open: "مفتوحة",
    s_pending: "قيد الانتظار",
    s_resolved: "تم الحل",
    s_closed: "مغلقة",
    
    // AI
    omnibot_title: "مساعد أومني بوت",
    ai_summary: "ملخص الذكاء الاصطناعي",
    generate_summary: "توليد ملخص",
    ask_omnibot: "اسأل أومني بوت...",
    voice_mode: "صوت مباشر",
    chat_mode: "دردشة",
    
    // Users
    team_members: "أعضاء الفريق",
    new_user: "مستخدم جديد",
    role: "الدور",
    active: "نشط",
    inactive: "غير نشط"
  }
};

export type TranslationKey = keyof typeof translations.en;
