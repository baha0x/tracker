function EditEntryModal({ entry, onSave, onCancel }) {
    const [mood, setMood] = React.useState(entry.mood || '');
    const [arousalLevel, setArousalLevel] = React.useState(entry.arousalLevel || 5);
    const [location, setLocation] = React.useState(entry.location || '');
    const [duration, setDuration] = React.useState(entry.duration || 0);
    const [contentUsed, setContentUsed] = React.useState(entry.contentUsed || false);
    const [orgasm, setOrgasm] = React.useState(entry.orgasm || false);
    const [selectedTriggers, setSelectedTriggers] = React.useState(entry.triggers || []);
    const [customTrigger, setCustomTrigger] = React.useState('');
    const [note, setNote] = React.useState(entry.note || '');

    const toggleTrigger = t => setSelectedTriggers(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
    const addCustomTrigger = () => { const v=customTrigger.trim(); if(v&&!selectedTriggers.includes(v)){setSelectedTriggers(p=>[...p,v]);setCustomTrigger('');} };

    return (
        <>
            <div className="modal-overlay" onClick={onCancel}/>
            <div className="day-detail-modal">
                <div className="modal-header">
                    <div className="modal-title">✏️ Редактировать запись</div>
                    <button className="modal-close" onClick={onCancel}>×</button>
                </div>
                <div className="form-group">
                    <label className="form-label">Настроение</label>
                    <div className="tags-container">
                        {PREDEFINED_MOODS.map(m => <button key={m} className={`tag-btn ${mood===m?'active':''}`} onClick={()=>setMood(p=>p===m?'':m)}>{m}</button>)}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Возбуждение: {arousalLevel}/10</label>
                    <input type="range" min="1" max="10" value={arousalLevel} onChange={e=>setArousalLevel(+e.target.value)} className="slider"/>
                </div>
                <div className="form-group">
                    <label className="form-label">Место</label>
                    <input className="form-input" value={location} onChange={e=>setLocation(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label className="form-label">Длительность (мин)</label>
                    <input type="number" className="form-input" value={duration} onChange={e=>setDuration(+e.target.value||0)}/>
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
                        {PREDEFINED_TRIGGERS.map(t => <button key={t} className={`tag-btn ${selectedTriggers.includes(t)?'active':''}`} onClick={()=>toggleTrigger(t)}>{t}</button>)}
                    </div>
                    <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                        <input className="form-input" value={customTrigger} onChange={e=>setCustomTrigger(e.target.value)} onKeyPress={e=>e.key==='Enter'&&addCustomTrigger()} placeholder="Добавить триггер..."/>
                        <button className="nav-btn" onClick={addCustomTrigger}>Добавить</button>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Заметки</label>
                    <textarea className="form-textarea" value={note} onChange={e=>setNote(e.target.value)}/>
                </div>
                <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                    <button className="action-btn" onClick={() => onSave({...entry,mood,arousalLevel,location,duration,contentUsed,orgasm,triggers:selectedTriggers,note})}>💾 Сохранить</button>
                    <button className="nav-btn" onClick={onCancel}>❌ Отмена</button>
                </div>
            </div>
        </>
    );
}
