const { useState, useEffect, useRef, useCallback } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [entries, setEntries] = useState([]);
    const [settings, setSettings] = useState({
        dailyLimit: 1, weeklyLimit: 5, monthlyLimit: 15,
        adviceEnabled: true, theme: 'dark', goalDays: 30
    });
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const unlockedRef = useRef([]);
    const [nofapMode, setNofapMode] = useState(false);
    const [nofapStartDate, setNofapStartDate] = useState(null);
    const [nofapHistory, setNofapHistory] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);
    const [motivationQuote] = useState(() => MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);

    useEffect(() => {
        try {
            const s = localStorage.getItem('userSettings');
            if (s) {
                const parsed = JSON.parse(s);
                setSettings(parsed);
                applyTheme(parsed.theme || 'dark');
            } else {
                applyTheme('dark');
            }
            const ach = localStorage.getItem('achievements');
            if (ach) {
                const parsed = JSON.parse(ach);
                setUnlockedAchievements(parsed);
                unlockedRef.current = parsed;
            }
            if (localStorage.getItem('nofapMode') === 'true') setNofapMode(true);
            const ns = localStorage.getItem('nofapStartDate');
            if (ns) setNofapStartDate(new Date(ns));
            const nh = localStorage.getItem('nofapHistory');
            if (nh) setNofapHistory(JSON.parse(nh));
        } catch(e) { console.error(e); }
        loadEntries();
    }, []);

    useEffect(() => {
        if (entries.length > 0) checkAchievements(entries, settings);
    }, [entries, settings]);

    function applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    const loadEntries = async () => {
        const data = await dbGetAll();
        const migrated = data.map(e => {
            if (!e.timestamp) return e;
            const corrected = formatLocalDate(new Date(e.timestamp));
            return corrected !== e.date ? { ...e, date: corrected } : e;
        });
        setEntries(migrated);
    };

    const handleAddEntry = async (entry) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        await dbAdd({ ...entry, id });
        await loadEntries();
        showNotification('✅ Запись добавлена');
        if (nofapMode) resetNofapStreak(true);
        setActiveTab('dashboard');
    };

    const handleEditEntry = async (updated) => {
        await dbUpdate(updated);
        await loadEntries();
        setEditingEntry(null);
        showNotification('✏️ Запись обновлена');
    };

    const handleDeleteEntry = async (id) => {
        await dbDelete(id);
        await loadEntries();
        showNotification('🗑️ Запись удалена', 'var(--danger)');
    };

    const getNoFapStreak = useCallback((entriesArr = entries) => {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = formatLocalDate(d);
            const hasEntry = entriesArr.some(e => e.date === dateStr);
            if (hasEntry) break;
            streak++;
        }
        return streak;
    }, [entries]);

    const checkAchievements = (entriesArr, cfg) => {
        const streak = getNoFapStreak(entriesArr);
        const newUnlocked = [];

        ACHIEVEMENTS.forEach(a => {
            if (unlockedRef.current.includes(a.id)) return;
            let unlocked = false;
            switch(a.id) {
                case 'first_entry':     unlocked = entriesArr.length >= 1; break;
                case 'week_streak':     unlocked = streak >= 7; break;
                case 'two_week_streak': unlocked = streak >= 14; break;
                case 'month_streak':    unlocked = streak >= 30; break;
                case 'three_month_streak': unlocked = streak >= 90; break;
                case 'total_100':       unlocked = entriesArr.length >= 100; break;
                case 'month_control': {
                    const thisMonth = formatLocalDate(new Date()).slice(0, 7);
                    const cnt = entriesArr.filter(e => e.date.startsWith(thisMonth)).length;
                    unlocked = cnt > 0 && cnt < cfg.monthlyLimit;
                    break;
                }
                case 'low_frequency': {
                    const wStart = getWeekStart();
                    const wEnd = formatLocalDate(new Date());
                    const wStartStr = formatLocalDate(wStart);
                    const cnt = entriesArr.filter(e => e.date >= wStartStr && e.date <= wEnd).length;
                    unlocked = cnt <= 1;
                    break;
                }
                case 'early_bird': {
                    const wStart = formatLocalDate(getWeekStart());
                    const morning = entriesArr.filter(e => {
                        const h = parseInt((e.time||'12:00').split(':')[0]);
                        return e.date >= wStart && h >= 5 && h < 12;
                    });
                    unlocked = morning.length === 0 && entriesArr.some(e => e.date >= wStart);
                    break;
                }
                case 'night_owl': {
                    const wStart = formatLocalDate(getWeekStart());
                    const night = entriesArr.filter(e => {
                        const h = parseInt((e.time||'12:00').split(':')[0]);
                        return e.date >= wStart && (h >= 22 || h < 5);
                    });
                    unlocked = night.length === 0 && entriesArr.some(e => e.date >= wStart);
                    break;
                }
                case 'no_content_week': {
                    const wStart = formatLocalDate(getWeekStart());
                    const weekEntries = entriesArr.filter(e => e.date >= wStart);
                    unlocked = weekEntries.length >= 5 && weekEntries.every(e => !e.contentUsed);
                    break;
                }
            }
            if (unlocked) newUnlocked.push(a.id);
        });

        if (newUnlocked.length > 0) {
            const updated = [...unlockedRef.current, ...newUnlocked];
            unlockedRef.current = updated;
            setUnlockedAchievements(updated);
            localStorage.setItem('achievements', JSON.stringify(updated));
            showNotification('🏆 Новое достижение разблокировано!');
            if (typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    };

    const getNofapDays = () => {
        if (!nofapStartDate) return 0;
        return Math.floor((Date.now() - new Date(nofapStartDate).getTime()) / 86400000);
    };

    const getNofapRecord = () => {
        const cur = getNofapDays();
        if (nofapHistory.length === 0) return cur;
        return Math.max(cur, ...nofapHistory.map(h => h.days));
    };

    const getCurrentMilestone = () => {
        const days = getNofapDays();
        return [...NOFAP_MILESTONES].reverse().find(m => days >= m.days) || null;
    };

    const startNofap = () => {
        const now = new Date();
        setNofapMode(true); setNofapStartDate(now);
        localStorage.setItem('nofapMode', 'true');
        localStorage.setItem('nofapStartDate', now.toISOString());
        if (typeof confetti !== 'undefined') confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        showNotification('🔥 NoFap Challenge начался!');
    };

    const resetNofapStreak = (auto = false) => {
        if (!auto && !confirm('Сбросить текущий стрик?')) return;
        const days = getNofapDays();
        if (days > 0) {
            const h = [...nofapHistory, { days, date: new Date().toISOString() }];
            setNofapHistory(h);
            localStorage.setItem('nofapHistory', JSON.stringify(h));
        }
        const now = new Date();
        setNofapStartDate(now);
        localStorage.setItem('nofapStartDate', now.toISOString());
    };

    const stopNofap = () => {
        if (!confirm('Выйти из режима NoFap?')) return;
        setNofapMode(false);
        localStorage.removeItem('nofapMode');
        showNotification('👋 Режим NoFap завершён');
    };

    const toggleTheme = () => {
        const next = settings.theme === 'dark' ? 'light' : 'dark';
        const updated = { ...settings, theme: next };
        setSettings(updated);
        localStorage.setItem('userSettings', JSON.stringify(updated));
        applyTheme(next);
    };

    const getWeeklyStats = () => {
        const wStartStr = formatLocalDate(getWeekStart());
        const today = formatLocalDate(new Date());
        const weekEntries = entries.filter(e => e.date >= wStartStr && e.date <= today);
        return {
            count: weekEntries.length,
            totalDuration: weekEntries.reduce((s, e) => s + (e.duration || 0), 0),
            avgArousal: weekEntries.length > 0 ? weekEntries.reduce((s, e) => s + (e.arousalLevel || 5), 0) / weekEntries.length : 0,
            withContent: weekEntries.filter(e => e.contentUsed).length,
        };
    };

    const goalProgress = Math.min((getNofapDays() / settings.goalDays) * 100, 100);
    const weeklyStats = getWeeklyStats();
    const streak = getNoFapStreak();

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-bar">
                    <div className="header-left">
                        <button className="theme-toggle" onClick={toggleTheme}>{settings.theme === 'dark' ? '☀️' : '🌙'}</button>
                    </div>
                    <div className="logo">MASTURBATION TRACKER</div>
                    <div className="header-actions">
                        <button className="icon-btn" onClick={() => setActiveTab('achievements')}><Icon name="trophy" size={22}/></button>
                        <button className="icon-btn" onClick={() => setActiveTab('settings')}><Icon name="settings" size={22}/></button>
                    </div>
                </div>
                <nav className="nav top-nav">
                    {[['dashboard','📊 Дашборд'],['analytics','📈 Аналитика'],['calendar','📅 Календарь'],['history','📝 История'],['addEntry','➕ Добавить']].map(([tab, label]) => (
                        <button key={tab} className={`nav-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{label}</button>
                    ))}
                </nav>
            </header>

            {activeTab === 'dashboard' && (
                <Dashboard entries={entries} settings={settings} streak={streak}
                    nofapMode={nofapMode} nofapDays={getNofapDays()} nofapRecord={getNofapRecord()}
                    startNofap={startNofap} resetNofap={resetNofapStreak} stopNofap={stopNofap}
                    goalProgress={goalProgress} weeklyStats={weeklyStats}
                    motivationQuote={motivationQuote} currentMilestone={getCurrentMilestone()} />
            )}
            {activeTab === 'addEntry' && <AddEntryPage onAddEntry={handleAddEntry} />}
            {activeTab === 'analytics' && <Analytics entries={entries} />}
            {activeTab === 'calendar' && <CalendarView entries={entries} />}
            {activeTab === 'history' && (
                <History entries={entries} onDeleteEntry={handleDeleteEntry}
                    onEditEntry={handleEditEntry} setEditingEntry={setEditingEntry} />
            )}
            {activeTab === 'achievements' && (
                <Achievements entries={entries} unlockedAchievements={unlockedAchievements}
                    settings={settings} streak={streak} />
            )}
            {activeTab === 'settings' && (
                <Settings settings={settings} setSettings={setSettings} entries={entries} applyTheme={applyTheme} />
            )}

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

            {editingEntry && (
                <EditEntryModal entry={editingEntry}
                    onSave={handleEditEntry}
                    onCancel={() => setEditingEntry(null)} />
            )}
        </div>
    );
}

ReactDOM.render(<App/>, document.getElementById('root'));
