function BottomNav({ activeTab, setActiveTab }) {
    return (
        <div className="bottom-nav">
            {[['dashboard','home','Главная'],['analytics','chart','Статистика']].map(([tab, icon, label]) => (
                <button key={tab} className={`bottom-nav-item ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                    <Icon name={icon} size={24}/><span className="bottom-nav-label">{label}</span>
                </button>
            ))}
            <button className={`bottom-nav-item add ${activeTab==='addEntry'?'active':''}`} onClick={() => setActiveTab('addEntry')}>
                <Icon name="plus" size={26} strokeWidth={2.5}/><span className="bottom-nav-label">Добавить</span>
            </button>
            {[['history','history','История'],['calendar','calendar','Календарь']].map(([tab, icon, label]) => (
                <button key={tab} className={`bottom-nav-item ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                    <Icon name={icon} size={24}/><span className="bottom-nav-label">{label}</span>
                </button>
            ))}
        </div>
    );
}
