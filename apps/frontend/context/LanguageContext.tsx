"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "kk" | "ru" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const dictionary: Record<
  Language,
  Record<string, string>
> = {
  en: {
    app: "AI Sana Challenge Hub",
    marketplace: "Marketplace",
    dashboard: "Dashboard",
    create: "Create challenge",
    login: "Sign in",
    logout: "Sign out",
    business: "Business",
    student: "Student Team",

    homeSubtitle: "Business problems → real challenges",
    how: "How it works",
    challenges: "Challenges",
    openDashboard: "Open dashboard",
    powered: "Powered by AI",

    hero1: "Turn vague business problems into",
    hero2: "solvable challenges.",
    heroText:
      "AI helps companies clarify their problem and transforms an initial idea into a structured challenge students can actually solve.",
    startChallenge: "Create challenge",
    explore: "Explore challenges",

    createTitle:
      "What problem does your organization want to solve?",
    createText:
      "Describe the problem in your own words. AI will help clarify it and turn it into a structured challenge.",
    describeProblem: "Describe your problem",
    shortEnough: "A short description is enough to start.",
    specific: "Be as specific as you can.",
    chars: "characters",
    analyze: "Analyze with AI",
    analyzing: "Analyzing problem...",

    analysisComplete: "AI analysis complete",
    goodStart: "Good start. We need a little more detail.",
    answerQuestions:
      "Answer these questions so AI can turn your idea into a complete challenge.",
    readiness: "Challenge readiness",
    clarification: "Needs clarification",
    answerPlaceholder: "Enter your answer...",
    generate: "Generate challenge",
    generating: "Generating challenge...",

    challengeReady: "Challenge ready",
    readyPublish: "Your challenge is ready to publish.",
    readyText:
      "AI transformed your initial problem into a structured challenge students can understand and solve.",
    publish: "Publish challenge",
    publishing: "Publishing...",
    edit: "Edit challenge",

    problem: "Problem",
    goal: "Goal",
    targetUsers: "Target users",
    expectedResult: "Expected result",
    successMetrics: "Success metrics",
    constraints: "Constraints",
    skills: "Recommended skills",
    notSpecified: "Not specified",

    challengeMarketplace: "Challenge Marketplace",
    marketplaceTitle:
      "Find a real business problem worth solving.",
    marketplaceText:
      "Explore structured challenges published by organizations and find the right project for your team.",
    activeChallenges: "active challenges",
    search: "Search by challenge, skill or technology...",
    showing: "Showing",
    published: "Published",
    openApplications: "Open for applications",
    view: "View",
    noChallenges: "No challenges found",
    noChallengesText: "Try another search.",

    backChallenges: "Back to challenges",
    challengeDetails: "Challenge details",
    teamsApplied: "teams applied",
    openChallenge: "Open challenge",
    qualityReview: "AI Quality Review",
    qualityText:
      "This challenge has been refined using AI and includes structured information for student teams.",

    interested: "Interested in this challenge?",
    applyTeamTitle: "Apply with your team.",
    applyTeamText:
      "Tell the business about your team and why you are a good fit for this challenge.",
    apply: "Apply as a team",
    challengeStatus: "Challenge status",

    teamApplication: "Team application",
    applyChallenge: "Apply to this challenge",
    teamName: "Team name",
    teamDescription: "Team description",
    contact: "Contact",
    whyFit: "Why is your team a good fit?",
    submit: "Submit application",
    submitting: "Submitting...",
    submitted: "Application submitted",
    submittedText:
      "Your application was saved. The business can now review your team.",
    done: "Done",
    completeFields: "Please complete all fields.",

    businessWorkspace: "Business workspace",
    yourChallenges: "Your challenges",
    dashboardText:
      "Track published challenges and review student team applications.",
    active: "Active challenges",
    applications: "Applications",
    averageReadiness: "Average readiness",
    teamApplications: "Team applications",
    compareTeams:
      "Review teams that applied to this challenge.",
    noApplications: "No applications yet",
    selectTeam: "Select team",
    selected: "Selected",
    contactTeam: "Contact",

    welcome: "Welcome",
    chooseRole: "Choose your role to continue.",
    organizationName: "Organization name",
    teamNameLogin: "Team name",
    continue: "Continue",
    createManage: "Create and manage business challenges",
    exploreApply: "Explore challenges and apply as a team",
  },

  ru: {
    app: "AI Sana Challenge Hub",
    marketplace: "Каталог",
    dashboard: "Панель",
    create: "Создать задачу",
    login: "Войти",
    logout: "Выйти",
    business: "Бизнес",
    student: "Студенческая команда",

    homeSubtitle: "Бизнес-проблемы → реальные задачи",
    how: "Как это работает",
    challenges: "Задачи",
    openDashboard: "Открыть панель",
    powered: "Работает на базе AI",

    hero1: "Превращайте размытые бизнес-проблемы в",
    hero2: "решаемые задачи.",
    heroText:
      "AI помогает компаниям уточнить проблему и превращает первоначальную идею в структурированную задачу, которую студенты могут реально решить.",
    startChallenge: "Создать задачу",
    explore: "Смотреть задачи",

    createTitle:
      "Какую проблему хочет решить ваша организация?",
    createText:
      "Опишите проблему своими словами. AI поможет уточнить её и превратить в структурированную задачу.",
    describeProblem: "Опишите проблему",
    shortEnough: "Для начала достаточно краткого описания.",
    specific: "Постарайтесь быть максимально конкретными.",
    chars: "символов",
    analyze: "Проанализировать с AI",
    analyzing: "Анализируем проблему...",

    analysisComplete: "AI-анализ завершён",
    goodStart: "Хорошее начало. Нужно немного больше деталей.",
    answerQuestions:
      "Ответьте на вопросы, чтобы AI смог сформировать полноценную задачу.",
    readiness: "Готовность задачи",
    clarification: "Нужно уточнение",
    answerPlaceholder: "Введите ответ...",
    generate: "Сформировать задачу",
    generating: "Формируем задачу...",

    challengeReady: "Задача готова",
    readyPublish: "Задача готова к публикации.",
    readyText:
      "AI превратил исходную проблему в структурированную задачу, понятную студенческим командам.",
    publish: "Опубликовать",
    publishing: "Публикуем...",
    edit: "Редактировать",

    problem: "Проблема",
    goal: "Цель",
    targetUsers: "Целевые пользователи",
    expectedResult: "Ожидаемый результат",
    successMetrics: "Метрики успеха",
    constraints: "Ограничения",
    skills: "Рекомендуемые навыки",
    notSpecified: "Не указано",

    challengeMarketplace: "Каталог задач",
    marketplaceTitle:
      "Найдите реальную бизнес-задачу, которую стоит решить.",
    marketplaceText:
      "Изучайте структурированные задачи компаний и находите подходящие проекты для своей команды.",
    activeChallenges: "активных задач",
    search: "Поиск по задаче, навыкам или технологии...",
    showing: "Показано",
    published: "Опубликовано",
    openApplications: "Приём заявок открыт",
    view: "Открыть",
    noChallenges: "Задачи не найдены",
    noChallengesText: "Попробуйте изменить поиск.",

    backChallenges: "Назад к задачам",
    challengeDetails: "Детали задачи",
    teamsApplied: "команд подали заявку",
    openChallenge: "Открытая задача",
    qualityReview: "AI-проверка качества",
    qualityText:
      "Задача была структурирована с помощью AI и содержит необходимую информацию для студенческих команд.",

    interested: "Интересна эта задача?",
    applyTeamTitle: "Подайте заявку командой.",
    applyTeamText:
      "Расскажите бизнесу о своей команде и почему вы подходите для этой задачи.",
    apply: "Подать заявку",
    challengeStatus: "Статус задачи",

    teamApplication: "Заявка команды",
    applyChallenge: "Подать заявку на задачу",
    teamName: "Название команды",
    teamDescription: "Описание команды",
    contact: "Контакт",
    whyFit: "Почему ваша команда подходит?",
    submit: "Отправить заявку",
    submitting: "Отправляем...",
    submitted: "Заявка отправлена",
    submittedText:
      "Заявка сохранена. Бизнес теперь может рассмотреть вашу команду.",
    done: "Готово",
    completeFields: "Заполните все поля.",

    businessWorkspace: "Рабочее пространство бизнеса",
    yourChallenges: "Ваши задачи",
    dashboardText:
      "Следите за опубликованными задачами и заявками студенческих команд.",
    active: "Активные задачи",
    applications: "Заявки",
    averageReadiness: "Средняя готовность",
    teamApplications: "Заявки команд",
    compareTeams: "Посмотрите команды, подавшие заявку.",
    noApplications: "Заявок пока нет",
    selectTeam: "Выбрать команду",
    selected: "Выбрано",
    contactTeam: "Контакт",

    welcome: "Добро пожаловать",
    chooseRole: "Выберите роль для продолжения.",
    organizationName: "Название организации",
    teamNameLogin: "Название команды",
    continue: "Продолжить",
    createManage: "Создавайте и управляйте бизнес-задачами",
    exploreApply: "Ищите задачи и подавайте заявки",
  },

  kk: {
    app: "AI Sana Challenge Hub",
    marketplace: "Каталог",
    dashboard: "Басқару",
    create: "Тапсырма құру",
    login: "Кіру",
    logout: "Шығу",
    business: "Бизнес",
    student: "Студенттік команда",

    homeSubtitle: "Бизнес мәселелері → нақты тапсырмалар",
    how: "Қалай жұмыс істейді",
    challenges: "Тапсырмалар",
    openDashboard: "Басқару панелі",
    powered: "AI көмегімен",

    hero1: "Бизнес мәселелерін",
    hero2: "шешілетін тапсырмаларға айналдырыңыз.",
    heroText:
      "AI компанияларға мәселені нақтылауға және бастапқы идеяны студенттер шеше алатын құрылымдалған тапсырмаға айналдыруға көмектеседі.",
    startChallenge: "Тапсырма құру",
    explore: "Тапсырмаларды көру",

    createTitle: "Ұйымыңыз қандай мәселені шешкісі келеді?",
    createText:
      "Мәселені өз сөзіңізбен сипаттаңыз. AI оны нақтылап, құрылымдалған тапсырмаға айналдыруға көмектеседі.",
    describeProblem: "Мәселені сипаттаңыз",
    shortEnough: "Бастау үшін қысқаша сипаттама жеткілікті.",
    specific: "Мүмкіндігінше нақты жазыңыз.",
    chars: "таңба",
    analyze: "AI арқылы талдау",
    analyzing: "Мәселе талдануда...",

    analysisComplete: "AI талдауы аяқталды",
    goodStart: "Жақсы бастама. Тағы біраз ақпарат қажет.",
    answerQuestions:
      "AI толық тапсырма құра алуы үшін сұрақтарға жауап беріңіз.",
    readiness: "Тапсырманың дайындық деңгейі",
    clarification: "Нақтылау қажет",
    answerPlaceholder: "Жауабыңызды енгізіңіз...",
    generate: "Тапсырманы құру",
    generating: "Тапсырма құрылуда...",

    challengeReady: "Тапсырма дайын",
    readyPublish: "Тапсырма жариялауға дайын.",
    readyText:
      "AI бастапқы мәселені студенттер түсініп, шеше алатын құрылымдалған тапсырмаға айналдырды.",
    publish: "Жариялау",
    publishing: "Жариялануда...",
    edit: "Өңдеу",

    problem: "Мәселе",
    goal: "Мақсат",
    targetUsers: "Мақсатты пайдаланушылар",
    expectedResult: "Күтілетін нәтиже",
    successMetrics: "Табыс көрсеткіштері",
    constraints: "Шектеулер",
    skills: "Ұсынылатын дағдылар",
    notSpecified: "Көрсетілмеген",

    challengeMarketplace: "Тапсырмалар каталогы",
    marketplaceTitle:
      "Шешуге тұрарлық нақты бизнес мәселесін табыңыз.",
    marketplaceText:
      "Ұйымдар жариялаған тапсырмаларды қарап, командаңызға сәйкес жобаны табыңыз.",
    activeChallenges: "белсенді тапсырма",
    search: "Тапсырма, дағды немесе технология бойынша іздеу...",
    showing: "Көрсетілді",
    published: "Жарияланды",
    openApplications: "Өтінім қабылдануда",
    view: "Ашу",
    noChallenges: "Тапсырмалар табылмады",
    noChallengesText: "Іздеуді өзгертіп көріңіз.",

    backChallenges: "Тапсырмаларға оралу",
    challengeDetails: "Тапсырма мәліметтері",
    teamsApplied: "команда өтінім берді",
    openChallenge: "Ашық тапсырма",
    qualityReview: "AI сапа тексеруі",
    qualityText:
      "Бұл тапсырма AI көмегімен нақтыланып, студенттік командаларға қажетті ақпаратпен толықтырылды.",

    interested: "Бұл тапсырма қызық па?",
    applyTeamTitle: "Командамен өтінім беріңіз.",
    applyTeamText:
      "Бизнеске командаңыз туралы және неге осы тапсырмаға сәйкес келетініңізді айтыңыз.",
    apply: "Өтінім беру",
    challengeStatus: "Тапсырма мәртебесі",

    teamApplication: "Команда өтінімі",
    applyChallenge: "Тапсырмаға өтінім беру",
    teamName: "Команда атауы",
    teamDescription: "Команда сипаттамасы",
    contact: "Байланыс",
    whyFit: "Командаңыз неге сәйкес келеді?",
    submit: "Өтінімді жіберу",
    submitting: "Жіберілуде...",
    submitted: "Өтінім жіберілді",
    submittedText:
      "Өтінім сақталды. Бизнес командаңызды қарай алады.",
    done: "Дайын",
    completeFields: "Барлық өрісті толтырыңыз.",

    businessWorkspace: "Бизнес жұмыс кеңістігі",
    yourChallenges: "Сіздің тапсырмаларыңыз",
    dashboardText:
      "Жарияланған тапсырмалар мен студенттік командалардың өтінімдерін бақылаңыз.",
    active: "Белсенді тапсырмалар",
    applications: "Өтінімдер",
    averageReadiness: "Орташа дайындық",
    teamApplications: "Команда өтінімдері",
    compareTeams: "Өтінім берген командаларды қараңыз.",
    noApplications: "Әзірге өтінім жоқ",
    selectTeam: "Команданы таңдау",
    selected: "Таңдалды",
    contactTeam: "Байланыс",

    welcome: "Қош келдіңіз",
    chooseRole: "Жалғастыру үшін рөліңізді таңдаңыз.",
    organizationName: "Ұйым атауы",
    teamNameLogin: "Команда атауы",
    continue: "Жалғастыру",
    createManage: "Бизнес тапсырмаларын құру және басқару",
    exploreApply: "Тапсырмаларды қарап, өтінім беру",
  },
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

useEffect(() => {
  const timer = window.setTimeout(() => {
    const saved = localStorage.getItem("language");

    if (
      saved === "kk" ||
      saved === "ru" ||
      saved === "en"
    ) {
      setLanguageState(saved);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  function setLanguage(newLanguage: Language) {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  }

  function t(key: string) {
    return dictionary[language][key] ?? key;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}