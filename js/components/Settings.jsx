function Settings({ settings, setSettings, entries, applyTheme }) {
    const [local, setLocal] = React.useState(settings);

    const handleSave = () => {
        localStorage.setItem('userSettings', JSON.stringify(local));
        setSettings(local);
        applyTheme(local.theme);
        showNotification('💾 Настройки сохранены!');
    };

    const handleExport = () => {
        const headers = 'id,date,time,type,mood,arousalLevel,location,duration,contentUsed,orgasm,triggers,note\n';
        const rows = entries.map(e => [
            e.id, e.date, e.time, e.type, e.mood||'', e.arousalLevel, e.location, e.duration,
            e.contentUsed?'Да':'Нет', e.orgasm?'Да':'Нет',
            `"${(e.triggers||[]).join('; ')}"`,
            `"${(e.note||'').replace(/"/g,'""')}"`
        ].join(',')).join('\n');
        const blob = new Blob([headers+rows], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), {href:url,download:`tracker-${formatLocalDate(new Date())}.csv`}).click();
        showNotification('📥 Данные экспортированы');
    };

    const handleReset = () => {
        if (!confirm('ВНИМАНИЕ: Удалить ВСЕ данные? Это нельзя отменить!')) return;
        if (!confirm('Ты абсолютно уверен? Все записи будут удалены навсегда.')) return;
        localStorage.clear();
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => window.location.reload();
        req.onerror = () => { showNotification('Ошибка удаления базы', 'var(--danger)'); };
        req.onblocked = () => { showNotification('Закрой другие вкладки с трекером и попробуй снова', 'var(--warning)'); };
    };

    const handleBackup = () => {
        const backup = { entries, settings, achievements: JSON.parse(localStorage.getItem('achievements')||'[]'), timestamp: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(backup,null,2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), {href:url,download:`tracker-backup-${formatLocalDate(new Date())}.json`}).click();
        showNotification('💾 Резервная копия создана');
    };

    return (
        <div className="fade-in">
            <h2 className="section-title">⚙️ Настройки</h2>
            <div className="entry-form">
                <h3 style={{marginBottom:'20px',fontSize:'18px'}}>Лимиты и цели</h3>
                {[['dailyLimit','Лимит в день',0,5],['weeklyLimit','Лимит в неделю',0,20],['monthlyLimit','Лимит в месяц',0,60],['goalDays','Цель NoFap (дней)',1,365]].map(([key,label,min,max]) => (
                    <div key={key} className="form-group">
                        <label className="form-label">{label}: {local[key]}</label>
                        <input type="range" min={min} max={max} value={local[key]} className="slider"
                            onChange={e=>setLocal({...local,[key]:+e.target.value})}/>
                    </div>
                ))}
                <div className="form-group">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox" checked={local.adviceEnabled} onChange={e=>setLocal({...local,adviceEnabled:e.target.checked})}/>
                        Показывать советы и предупреждения
                    </label>
                </div>
                <button className="action-btn" onClick={handleSave}>💾 Сохранить</button>
            </div>
            <div className="entry-form" style={{marginTop:'20px'}}>
                <h3 style={{marginBottom:'20px',fontSize:'18px'}}>Управление данными</h3>
                <div style={{display:'flex',gap:'15px',flexWrap:'wrap'}}>
                    <button className="nav-btn" onClick={handleExport}>📥 Экспорт CSV</button>
                    <button className="nav-btn" onClick={handleBackup}>💾 Резервная копия</button>
                    <button className="delete-btn" onClick={handleReset}>🗑️ Удалить все данные</button>
                </div>
            </div>
            <div style={{marginTop:'30px',padding:'20px',background:'var(--bg-secondary)',borderRadius:'12px',fontSize:'14px',color:'var(--text-secondary)'}}>
                <p><strong>🔒 О приватности:</strong> Все данные хранятся только в браузере. Ничего не отправляется на сервер.</p>
            </div>
        </div>
    );
}
