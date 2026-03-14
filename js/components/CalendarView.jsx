function CalendarView({ entries }) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [showModal, setShowModal] = React.useState(false);
    const [selectedDay, setSelectedDay] = React.useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const weekDays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) calendarDays.push({ isEmpty: true, key: `e${i}` });

    const todayStr = formatLocalDate(new Date());
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatLocalDate(new Date(year, month, day));
        const dayEntries = entries.filter(e => e.date === dateStr);
        calendarDays.push({
            day, dateStr, entries: dayEntries, isEmpty: false, key: `d${day}`,
            isToday: dateStr === todayStr,
            activityLevel: dayEntries.length === 0 ? '' : dayEntries.length === 1 ? 'low' : dayEntries.length === 2 ? 'medium' : 'high'
        });
    }

    const heatmapWeeks = [];
    const heatmapEnd = new Date(); heatmapEnd.setHours(23,59,59,999);
    const heatmapStart = new Date(heatmapEnd);
    heatmapStart.setDate(heatmapStart.getDate() - 364);
    const startAdj = getWeekStart(heatmapStart);
    let cur = new Date(startAdj);
    let week = [];
    while (cur <= heatmapEnd) {
        const dateStr = formatLocalDate(cur);
        const count = entries.filter(e => e.date === dateStr).length;
        week.push({ dateStr, count, date: new Date(cur) });
        if (week.length === 7) { heatmapWeeks.push(week); week = []; }
        cur.setDate(cur.getDate() + 1);
    }
    if (week.length) { while(week.length<7) week.push(null); heatmapWeeks.push(week); }

    return (
        <div className="fade-in">
            <h2 className="section-title">📅 Календарь</h2>

            <div className="heatmap-container">
                <h3 style={{marginBottom:'15px',fontSize:'16px',fontWeight:'600'}}>🔥 Карта активности</h3>
                <div className="heatmap-scroll">
                    {heatmapWeeks.map((wk, wi) => (
                        <div key={wi} className="heatmap-week">
                            {wk.map((day, di) => day === null
                                ? <div key={di} className="heatmap-cell" style={{opacity:0}}/>
                                : <div key={di}
                                    className={`heatmap-cell ${day.count===0?'':day.count===1?'level-1':day.count===2?'level-2':day.count===3?'level-3':'level-4'}`}
                                    title={`${day.dateStr}: ${day.count} сессий`}
                                  />
                            )}
                        </div>
                    ))}
                </div>
                <div style={{marginTop:'10px',display:'flex',gap:'6px',alignItems:'center',fontSize:'12px',color:'var(--text-tertiary)'}}>
                    <span>Мало</span>
                    {['','level-1','level-2','level-3','level-4'].map(l=><div key={l} className={`heatmap-cell ${l}`} style={{flexShrink:0}}/>)}
                    <span>Много</span>
                </div>
            </div>

            <div className="calendar-container">
                <div className="calendar-header">
                    <div className="calendar-month">{monthName}</div>
                    <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                        <button className="calendar-nav-btn" onClick={()=>setCurrentDate(new Date(year,month-1,1))}>← Назад</button>
                        <button className="calendar-nav-btn" onClick={()=>setCurrentDate(new Date())}>Сегодня</button>
                        <button className="calendar-nav-btn" onClick={()=>setCurrentDate(new Date(year,month+1,1))}>Вперёд →</button>
                    </div>
                </div>
                <div className="calendar-grid">
                    {weekDays.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
                </div>
                <div className="calendar-grid">
                    {calendarDays.map(info => info.isEmpty
                        ? <div key={info.key} className="calendar-day empty"/>
                        : (
                            <div key={info.key} className={`calendar-day ${info.activityLevel} ${info.isToday?'today':''}`}
                                onClick={() => { if(info.entries.length>0){setSelectedDay(info);setShowModal(true);} }}>
                                <div className="calendar-day-number">{info.day}</div>
                                {info.entries.length > 0 && <div className="calendar-day-count">{info.entries.length}</div>}
                            </div>
                        )
                    )}
                </div>
            </div>

            {showModal && selectedDay && (
                <>
                    <div className="modal-overlay" onClick={()=>setShowModal(false)}/>
                    <div className="day-detail-modal">
                        <div className="modal-header">
                            <div className="modal-title">{parseLocalDate(selectedDay.dateStr).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
                            <button className="modal-close" onClick={()=>setShowModal(false)}>×</button>
                        </div>
                        <div style={{marginBottom:'15px',color:'var(--text-secondary)'}}>Сессий: {selectedDay.entries.length}</div>
                        {selectedDay.entries.map(e => (
                            <div key={e.id} className="modal-entry">
                                <div className="modal-entry-time">⏰ {e.time}</div>
                                <div className="history-details">
                                    <span className="history-badge">Мастурбация</span>
                                    {(e.triggers||[]).map(t=><span key={t} className="history-badge">{t}</span>)}
                                </div>
                                {e.mood && <div className="history-field">Настроение: {e.mood}</div>}
                                <div className="history-field">Возбуждение: {e.arousalLevel}/10</div>
                                <div className="history-field">Место: {e.location}</div>
                                <div className="history-field">Длительность: {e.duration} мин</div>
                                <div className="history-field">Контент: {e.contentUsed?'Да':'Нет'} | Оргазм: {e.orgasm?'Да':'Нет'}</div>
                                {e.note && <div className="history-field">Заметки: {e.note}</div>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
