function History({ entries, onDeleteEntry, onEditEntry, setEditingEntry }) {
    const [filterTags, setFilterTags] = React.useState([]);
    const allTriggers = [...new Set(entries.flatMap(e=>e.triggers||[]))];
    const filtered = filterTags.length > 0 ? entries.filter(e=>e.triggers?.some(t=>filterTags.includes(t))) : entries;
    const sorted = [...filtered].sort((a,b) => {
        const da = a.date+'T'+a.time, db_ = b.date+'T'+b.time;
        return da < db_ ? 1 : da > db_ ? -1 : 0;
    });
    const toggleFilter = t => setFilterTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p, t]);

    return (
        <div className="fade-in">
            <h2 className="section-title">📝 История ({filtered.length} записей)</h2>
            {allTriggers.length > 0 && (
                <div style={{marginBottom:'20px'}}>
                    <div className="form-label" style={{marginBottom:'10px'}}>Фильтр по триггерам</div>
                    <div className="filter-tags">
                        {allTriggers.map(t => <button key={t} className={`filter-tag ${filterTags.includes(t)?'active':''}`} onClick={()=>toggleFilter(t)}>{t}</button>)}
                    </div>
                </div>
            )}
            {sorted.length === 0 && (
                <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-tertiary)'}}>
                    {filterTags.length > 0 ? 'Нет записей с выбранными триггерами' : 'Записей пока нет'}
                </div>
            )}
            {sorted.map(entry => (
                <div key={entry.id} className="history-item" onClick={()=>setEditingEntry(entry)}>
                    <div className="history-header">
                        <div className="history-date">{parseLocalDate(entry.date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
                        <div className="history-time">⏰ {entry.time}</div>
                    </div>
                    <div className="history-details">
                        <span className="history-badge">Мастурбация</span>
                        {(entry.triggers||[]).map(t=><span key={t} className="history-badge">{t}</span>)}
                    </div>
                    {entry.mood && <div className="history-field">Настроение: {entry.mood}</div>}
                    <div className="history-field">Возбуждение: {entry.arousalLevel}/10 | Место: {entry.location} | Длительность: {entry.duration} мин</div>
                    <div className="history-field">Контент: {entry.contentUsed?'Да':'Нет'} | Оргазм: {entry.orgasm?'Да':'Нет'}</div>
                    {entry.note && <div className="history-field">Заметки: {entry.note}</div>}
                    <div style={{marginTop:'10px',display:'flex',gap:'10px'}}>
                        <button className="edit-btn" onClick={e=>{e.stopPropagation();setEditingEntry(entry);}}>✏️ Редактировать</button>
                        <button className="delete-btn" style={{padding:'8px 16px',fontSize:'12px'}} onClick={e=>{e.stopPropagation();if(confirm('Удалить эту запись?'))onDeleteEntry(entry.id);}}>🗑️ Удалить</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
