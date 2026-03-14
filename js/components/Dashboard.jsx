function Dashboard({ entries, settings, streak, nofapMode, nofapDays, nofapRecord, startNofap, resetNofap, stopNofap, goalProgress, weeklyStats, motivationQuote, currentMilestone }) {
    const today = formatLocalDate(new Date());
    const todayEntries = entries.filter(e => e.date === today);
    const totalDuration = entries.reduce((s, e) => s + (e.duration || 0), 0);
    const avgDuration = entries.length > 0 ? Math.round(totalDuration / entries.length) : 0;

    const todayOver = todayEntries.length >= settings.dailyLimit;
    const weekOver = weeklyStats.count >= settings.weeklyLimit;
    const advice = settings.adviceEnabled
        ? (todayOver ? '⚠️ Превышен дневной лимит!' : weekOver ? '⚠️ Превышен недельный лимит!' : '✅ Всё в норме 👌')
        : '';

    return (
        <div className="fade-in">
            <div className="motivation-quote">💭 {motivationQuote}</div>

            {nofapMode && (
                <div className="nofap-container">
                    <div className="nofap-day-count">День {nofapDays}</div>
                    <div className="nofap-label">NoFap Challenge</div>
                    {currentMilestone && (
                        <div className="nofap-milestone">
                            <div className="nofap-milestone-title">{currentMilestone.emoji} {currentMilestone.title}</div>
                            <div className="nofap-milestone-desc">{currentMilestone.desc}</div>
                        </div>
                    )}
                    <div className="goal-progress">
                        <div className="progress-circle" style={{background:`conic-gradient(var(--accent) 0% ${goalProgress}%, var(--bg-tertiary) ${goalProgress}% 100%)`}}>
                            <div className="progress-text">{Math.round(goalProgress)}%</div>
                        </div>
                        <div>
                            <div className="nofap-record">🏆 Цель: {settings.goalDays} дней</div>
                            <div className="nofap-record">📈 Рекорд: {nofapRecord} дней</div>
                            <div className="nofap-record">💪 Сейчас: {nofapDays} дней</div>
                        </div>
                    </div>
                    <div className="nofap-buttons">
                        <button className="nofap-reset-btn" onClick={() => resetNofap(false)}>🔄 Сбросить стрик</button>
                        <button className="nav-btn" onClick={stopNofap}>🚪 Выйти</button>
                    </div>
                </div>
            )}

            {!nofapMode && (
                <div style={{marginBottom:'30px',textAlign:'center'}}>
                    <button className="action-btn" onClick={startNofap}>🔥 Начать NoFap Challenge</button>
                </div>
            )}

            <div className="quick-stats">
                <div className="quick-stat"><div className="quick-stat-value">{streak}</div><div className="quick-stat-label">Дней без</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{todayEntries.length}/{settings.dailyLimit}</div><div className="quick-stat-label">Сегодня / лимит</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{weeklyStats.count}/{settings.weeklyLimit}</div><div className="quick-stat-label">Неделя / лимит</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{avgDuration} мин</div><div className="quick-stat-label">Среднее время</div></div>
            </div>

            {advice && (
                <div style={{marginBottom:'20px',padding:'15px',background:advice.includes('Превышен')?'var(--danger)':'var(--success)',borderRadius:'10px',color:'white',fontWeight:'600'}}>
                    {advice}
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Эта неделя (с пн)</div>
                    <div className="stat-value">{weeklyStats.count}</div>
                    <div className="stat-sublabel">С контентом: {weeklyStats.withContent}</div>
                    <div className="stat-sublabel">Общее время: {weeklyStats.totalDuration} мин</div>
                    <div className="stat-sublabel">Ср. возбуждение: {weeklyStats.avgArousal.toFixed(1)}/10</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Всего записей</div>
                    <div className="stat-value">{entries.length}</div>
                    <div className="stat-sublabel">Общее время: {Math.round(totalDuration / 60)} ч</div>
                    <div className="stat-sublabel">Среднее: {avgDuration} мин/сессию</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Лимиты</div>
                    <div className="stat-value">{settings.dailyLimit}/{settings.weeklyLimit}</div>
                    <div className="stat-sublabel">День / неделя</div>
                    <div className="stat-sublabel">Месяц: {settings.monthlyLimit}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Эффективность</div>
                    <div className="stat-value">{Math.round((entries.filter(e=>e.orgasm).length / (entries.length||1))*100)}%</div>
                    <div className="stat-sublabel">Достижение оргазма</div>
                    <div className="stat-sublabel">С контентом: {Math.round((entries.filter(e=>e.contentUsed).length/(entries.length||1))*100)}%</div>
                </div>
            </div>
        </div>
    );
}
