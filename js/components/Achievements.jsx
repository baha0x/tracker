function Achievements({ entries, unlockedAchievements, settings, streak }) {
    const calcProgress = (id) => {
        switch(id) {
            case 'first_entry':        return entries.length >= 1 ? 100 : 0;
            case 'week_streak':        return Math.min((streak/7)*100, 100);
            case 'two_week_streak':    return Math.min((streak/14)*100, 100);
            case 'month_streak':       return Math.min((streak/30)*100, 100);
            case 'three_month_streak': return Math.min((streak/90)*100, 100);
            case 'total_100':          return Math.min((entries.length/100)*100, 100);
            case 'month_control': {
                const m = formatLocalDate(new Date()).slice(0,7);
                const cnt = entries.filter(e=>e.date.startsWith(m)).length;
                return cnt > 0 ? Math.min((cnt/settings.monthlyLimit)*100, 100) : 0;
            }
            case 'low_frequency': {
                const wStart = formatLocalDate(getWeekStart());
                const cnt = entries.filter(e=>e.date>=wStart).length;
                return cnt <= 1 ? 100 : Math.max(0, 100 - cnt*20);
            }
            default: return 0;
        }
    };

    return (
        <div className="fade-in">
            <h2 className="section-title">🏆 Достижения ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h2>
            <div className="achievements-grid">
                {ACHIEVEMENTS.map(a => {
                    const isUnlocked = unlockedAchievements.includes(a.id);
                    const progress = calcProgress(a.id);
                    return (
                        <div key={a.id} className={`achievement-card ${isUnlocked?'unlocked':'locked'}`}>
                            <div className="achievement-icon">{a.icon}</div>
                            <div className="achievement-title">{a.title}</div>
                            <div className="achievement-desc">{a.desc}</div>
                            {!isUnlocked && (
                                <div className="achievement-progress">
                                    <div className="achievement-progress-bar" style={{width:`${progress}%`}}/>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
