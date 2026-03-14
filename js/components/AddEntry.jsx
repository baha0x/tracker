function AddEntryPage({ onAddEntry }) {
    const [mood, setMood] = React.useState('');
    const [arousalLevel, setArousalLevel] = React.useState(5);
    const [location, setLocation] = React.useState('');
    const [duration, setDuration] = React.useState(0);
    const [contentUsed, setContentUsed] = React.useState(false);
    const [orgasm, setOrgasm] = React.useState(false);
    const [selectedTriggers, setSelectedTriggers] = React.useState([]);
    const [customTrigger, setCustomTrigger] = React.useState('');
    const [customMood, setCustomMood] = React.useState('');
    const [note, setNote] = React.useState('');
    const [showAllMoods, setShowAllMoods] = React.useState(false);
    const [showAllTriggers, setShowAllTriggers] = React.useState(false);

    const toggleTrigger = t => setSelectedTriggers(p => p.includes(t) ? p.filter(x=>x!==t) : [...p, t]);
    const addCustomTrigger = () => { const v = customTrigger.trim(); if(v && !selectedTriggers.includes(v)){setSelectedTriggers(p=>[...p,v]); setCustomTrigger('');} };
    const toggleMood = m => setMood(p => p === m ? '' : m);
    const addCustomMood = () => { const v = customMood.trim(); if(v){setMood(v); setCustomMood('');} };

    const handleSubmit = () => {
        const now = new Date();
        onAddEntry({
            date: formatLocalDate(now),
            time: now.toTimeString().slice(0,5),
            type: 'Мастурбация',
            mood, arousalLevel,
            location: location || 'Не указано',
            duration, contentUsed, orgasm,
            triggers: selectedTriggers, note,
            timestamp: now.toISOString()
        });
    };

    const TOP_MOODS = PREDEFINED_MOODS.slice(0, 4);
    const MORE_MOODS = PREDEFINED_MOODS.slice(4);
    const TOP_TRIGGERS = PREDEFINED_TRIGGERS.slice(0, 4);
    const MORE_TRIGGERS = PREDEFINED_TRIGGERS.slice(4);

    return (
        <div className="fade-in">
            <div className="entry-form">
                <h2 className="section-title">✍️ Добавить запись</h2>
                <div className="form-group">
                    <label className="form-label">Настроение после</label>
                    <div className="tags-container">
                        {TOP_MOODS.map(m => <button key={m} className={`tag-btn ${mood===m?'active':''}`} onClick={() => toggleMood(m)}>{m}</button>)}
                        {showAllMoods && MORE_MOODS.map(m => <button key={m} className={`tag-btn ${mood===m?'active':''}`} onClick={() => toggleMood(m)}>{m}</button>)}
                    </div>
                    <div style={{display:'flex',gap:'10px',marginTop:'10px',flexWrap:'wrap'}}>
                        {MORE_MOODS.length > 0 && <button className="nav-btn" onClick={() => setShowAllMoods(v=>!v)}>{showAllMoods?'Скрыть':'Ещё'}</button>}
                        <div style={{display:'flex',gap:'10px',flex:1,minWidth:'240px'}}>
                            <input className="form-input" value={customMood} onChange={e=>setCustomMood(e.target.value)} onKeyPress={e=>e.key==='Enter'&&addCustomMood()} placeholder="Своё настроение..." />
                            <button className="nav-btn" onClick={addCustomMood}>Добавить</button>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Уровень возбуждения: {arousalLevel}/10</label>
                    <input type="range" min="1" max="10" value={arousalLevel} onChange={e=>setArousalLevel(+e.target.value)} className="slider"/>
                    <div className="slider-value">{arousalLevel}/10</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Место (необязательно)</label>
                    <input className="form-input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="дом, ванная, работа..."/>
                </div>
                <div className="form-group">
                    <label className="form-label">Длительность (минуты)</label>
                    <input type="number" className="form-input" min="0" max="180" value={duration} onChange={e=>setDuration(+e.target.value||0)} placeholder="0"/>
                </div>
                <div className="form-group">
                    <label className="checkbox-label"><input type="checkbox" className="checkbox" checked={contentUsed} onChange={e=>setContentUsed(e.target.checked)}/> Использовался контент</label>
                </div>
                <div className="form-group">
                    <label className="checkbox-label"><input type="checkbox" className="checkbox" checked={orgasm} onChange={e=>setOrgasm(e.target.checked)}/> Достигнут оргазм</label>
                </div>
                <div className="form-group">
                    <label className="form-label">Триггеры</label>
                    <div className="tags-container">
                        {TOP_TRIGGERS.map(t => <button key={t} className={`tag-btn ${selectedTriggers.includes(t)?'active':''}`} onClick={()=>toggleTrigger(t)}>{t}</button>)}
                        {showAllTriggers && MORE_TRIGGERS.map(t => <button key={t} className={`tag-btn ${selectedTriggers.includes(t)?'active':''}`} onClick={()=>toggleTrigger(t)}>{t}</button>)}
                    </div>
                    <div style={{display:'flex',gap:'10px',marginTop:'10px',flexWrap:'wrap'}}>
                        {MORE_TRIGGERS.length > 0 && <button className="nav-btn" onClick={() => setShowAllTriggers(v=>!v)}>{showAllTriggers?'Скрыть':'Ещё'}</button>}
                        <div style={{display:'flex',gap:'10px',flex:1,minWidth:'240px'}}>
                            <input className="form-input" value={customTrigger} onChange={e=>setCustomTrigger(e.target.value)} onKeyPress={e=>e.key==='Enter'&&addCustomTrigger()} placeholder="Свой триггер..."/>
                            <button className="nav-btn" onClick={addCustomTrigger}>Добавить</button>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Заметка</label>
                    <textarea className="form-textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="мысли, что почувствовал..."/>
                </div>
                <button className="action-btn" style={{width:'100%'}} onClick={handleSubmit}>✅ Сохранить запись</button>
            </div>
        </div>
    );
}
