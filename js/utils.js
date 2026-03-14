function pad2(n) { return String(n).padStart(2, '0'); }

function formatLocalDate(d = new Date()) {
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

function parseLocalDate(dateStr) { return new Date(`${dateStr}T00:00:00`); }

function getWeekStart(d = new Date()) {
    const date = new Date(d);
    date.setHours(0,0,0,0);
    const day = date.getDay();
    const diff = (day === 0) ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
}

function showNotification(msg, color = 'var(--success)') {
    const el = document.createElement('div');
    el.className = 'success-notification';
    el.style.background = color;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

const PREDEFINED_TRIGGERS = [
    '💤 Стресс','😴 Скука','😔 Одиночество','🍺 Алкоголь','📱 Соцсети',
    '🌙 Поздно ночью','💪 После тренировки','🎮 После игр','📺 Просмотр контента',
    '🛌 Перед сном','🌅 Утром','😰 Тревога','🎵 Под музыку','🏠 Дома один',
    '💼 После работы','🎉 Выходные','😤 Раздражение','🌃 Бессонница'
];

const PREDEFINED_MOODS = [
    '😊 Расслабленный','😢 Грустный','😠 Раздраженный','😴 Усталый',
    '😎 Возбужденный','😌 Удовлетворенный','😳 Виновный','😄 Радостный',
    '😐 Нейтральный','😔 Разочарованный','💪 Энергичный','😰 Тревожный'
];

const ACHIEVEMENTS = [
    { id: 'first_entry',        icon: '🌟', title: 'Начало пути',       desc: 'Первая запись в трекере' },
    { id: 'week_streak',        icon: '🔥', title: 'Неделя контроля',   desc: '7 дней без мастурбации' },
    { id: 'month_control',      icon: '💎', title: 'Месяц дисциплины',  desc: 'Меньше лимита весь месяц' },
    { id: 'two_week_streak',    icon: '⚡', title: 'Две недели силы',   desc: '14 дней без мастурбации' },
    { id: 'month_streak',       icon: '🏆', title: 'Месяц силы',        desc: '30 дней без мастурбации' },
    { id: 'total_100',          icon: '📊', title: 'Ветеран трекера',   desc: '100+ записей в истории' },
    { id: 'low_frequency',      icon: '🎯', title: 'Контроль частоты',  desc: 'Неделя с 0-1 записью' },
    { id: 'no_content_week',    icon: '🧠', title: 'Сила воображения',  desc: 'Неделя без контента' },
    { id: 'three_month_streak', icon: '💫', title: 'Квартал чемпиона',  desc: '90 дней без мастурбации' },
    { id: 'early_bird',         icon: '🌅', title: 'Утренний контроль', desc: 'Неделя без утренних сессий' },
    { id: 'night_owl',          icon: '🌙', title: 'Ночной контроль',   desc: 'Неделя без ночных сессий' },
];

const MOTIVATION_QUOTES = [
    "Контроль над собой — высшая форма силы.",
    "Каждый день без — шаг к лучшей версии себя.",
    "Сила воли как мышца: чем больше тренируешь, тем сильнее.",
    "Твоя энергия — твой самый ценный ресурс.",
    "Маленькие победы каждый день приводят к большим изменениям.",
    "Самоконтроль — это свобода от зависимостей.",
    "Каждый раз, когда говоришь «нет» импульсу, становишься сильнее.",
    "Дисциплина — выбор между тем, что хочешь сейчас, и тем, что хочешь больше всего.",
    "Ты сильнее своих импульсов.",
    "Каждый день без — инвестиция в себя.",
    "Контроль начинается с осознанности.",
    "Настоящая сила — в управлении собой."
];

const NOFAP_MILESTONES = [
    { days: 1,   title: 'Первый день',  desc: 'Отличное начало! Ты принял решение измениться.',   emoji: '🎯' },
    { days: 3,   title: '3 дня',        desc: 'Первые дни самые сложные. Ты справляешься!',       emoji: '💪' },
    { days: 7,   title: 'Неделя',       desc: 'Неделя позади! Твоя сила воли впечатляет.',         emoji: '🔥' },
    { days: 14,  title: '2 недели',     desc: 'Две недели! Привычки начинают меняться.',            emoji: '⚡' },
    { days: 21,  title: '3 недели',     desc: 'Новая привычка формируется! Продолжай.',             emoji: '🌟' },
    { days: 30,  title: 'Месяц',        desc: 'Целый месяц! Невероятное достижение.',               emoji: '🏆' },
    { days: 60,  title: '2 месяца',     desc: 'Два месяца силы воли. Ты герой!',                   emoji: '💎' },
    { days: 90,  title: '3 месяца',     desc: 'Квартал без срывов. Легендарно!',                    emoji: '👑' },
    { days: 180, title: 'Полгода',      desc: 'Полгода контроля. Ты изменил себя!',                 emoji: '🎖️' },
    { days: 365, title: 'Год',          desc: 'Целый год! Ты достиг невероятного!',                 emoji: '🌈' },
];

function Icon({ name, size = 24, strokeWidth = 2 }) {
    const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
    if (name === 'home')     return <svg {...p}><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/><path d="M21 22H3"/></svg>;
    if (name === 'chart')    return <svg {...p}><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 6-8"/></svg>;
    if (name === 'history')  return <svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/><path d="M12 7v5l3 3"/></svg>;
    if (name === 'calendar') return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>;
    if (name === 'trophy')   return <svg {...p}><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M5 6h2v3a4 4 0 0 1-2-3z"/><path d="M19 6h-2v3a4 4 0 0 0 2-3z"/></svg>;
    if (name === 'settings') return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    if (name === 'plus')     return <svg {...p}><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
    return null;
}
