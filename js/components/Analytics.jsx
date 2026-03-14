function Analytics({ entries }) {
    const [filterTags, setFilterTags] = React.useState([]);
    const chartRefs = { monthly: React.useRef(null), weekly: React.useRef(null), duration: React.useRef(null) };
    const instanceRefs = { monthly: React.useRef(null), weekly: React.useRef(null), duration: React.useRef(null) };

    const allTriggers = [...new Set(entries.flatMap(e => e.triggers||[]))];
    const filtered = filterTags.length > 0
        ? entries.filter(e => e.triggers?.some(t => filterTags.includes(t)))
        : entries;

    const toggleFilter = tag => setFilterTags(p => p.includes(tag) ? p.filter(t=>t!==tag) : [...p, tag]);

    const timeOfDayData = () => {
        const ranges = {'Ночь 00-06':[0,1,2,3,4,5],'Утро 06-12':[6,7,8,9,10,11],'День 12-18':[12,13,14,15,16,17],'Вечер 18-24':[18,19,20,21,22,23]};
        const hours = {};
        for(let i=0;i<24;i++) hours[i]=0;
        filtered.forEach(e => { const h=parseInt((e.time||'12:00').split(':')[0]); hours[h]=(hours[h]||0)+1; });
        return Object.entries(ranges).map(([label, hs]) => ({ label, value: hs.reduce((s,h)=>s+hours[h],0) }));
    };

    const dayOfWeekData = () => {
        const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
        const counts = [0,0,0,0,0,0,0];
        filtered.forEach(e => {
            const d = parseLocalDate(e.date);
            const dow = d.getDay();
            const idx = dow === 0 ? 6 : dow - 1;
            counts[idx]++;
        });
        return days.map((label, i) => ({ label, value: counts[i] }));
    };

    const triggerStats = () => {
        const counts = {};
        filtered.forEach(e => (e.triggers||[]).forEach(t => { counts[t]=(counts[t]||0)+1; }));
        return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([label,value]) => ({label,value}));
    };

    const moodStats = () => {
        const counts = {};
        filtered.forEach(e => { if(e.mood) counts[e.mood]=(counts[e.mood]||0)+1; });
        return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([label,value]) => ({label,value}));
    };

    const monthlyData = () => {
        const months = {};
        filtered.forEach(e => { const k=e.date.slice(0,7); months[k]=(months[k]||0)+1; });
        const keys = Object.keys(months).sort();
        return {
            labels: keys.map(m => new Date(m+'-01').toLocaleString('ru-RU',{month:'short'})),
            values: keys.map(k => months[k])
        };
    };

    const weeklyTrendData = () => {
        const weeks = {};
        filtered.forEach(e => {
            const d = parseLocalDate(e.date);
            const ws = getWeekStart(d);
            const k = formatLocalDate(ws);
            weeks[k] = (weeks[k]||0)+1;
        });
        const keys = Object.keys(weeks).sort().slice(-8);
        return { labels: keys.map((_,i)=>`Нед ${i+1}`), values: keys.map(k=>weeks[k]) };
    };

    const comparison = (() => {
        const now = new Date();
        const thisStart = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const lastStart = formatLocalDate(new Date(now.getFullYear(), now.getMonth()-1, 1));
        const lastEnd = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 0));
        const thisMonth = entries.filter(e=>e.date>=thisStart).length;
        const lastMonth = entries.filter(e=>e.date>=lastStart&&e.date<=lastEnd).length;
        const diff = thisMonth - lastMonth;
        const percent = lastMonth > 0 ? ((diff/lastMonth)*100).toFixed(0) : 0;
        return { thisMonth, lastMonth, diff, percent };
    })();

    React.useEffect(() => {
        const { labels: mLabels, values: mVals } = monthlyData();
        const { labels: wLabels, values: wVals } = weeklyTrendData();
        const durations = filtered.slice(-20).map(e=>e.duration||0);

        const createChart = (key, type, labels, data, label, color) => {
            const canvas = chartRefs[key].current;
            if (!canvas) return;
            if (instanceRefs[key].current) { instanceRefs[key].current.destroy(); instanceRefs[key].current = null; }
            instanceRefs[key].current = new Chart(canvas.getContext('2d'), {
                type, data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color.replace(')',',0.2)').replace('rgb','rgba'), fill: true, tension: 0.4, borderWidth: 2 }] },
                options: { responsive:true, maintainAspectRatio:false, scales: { y:{beginAtZero:true,grid:{color:'rgba(128,128,128,0.2)'},ticks:{color:'#a0a0a0'}}, x:{grid:{color:'rgba(128,128,128,0.2)'},ticks:{color:'#a0a0a0'}} }, plugins:{legend:{labels:{color:'#ffffff'}}} }
            });
        };

        createChart('monthly', 'line', mLabels, mVals, 'По месяцам', 'rgb(255,107,157)');
        createChart('weekly', 'line', wLabels, wVals, 'Тренд по неделям', 'rgb(107,141,255)');

        if (chartRefs.duration.current) {
            if (instanceRefs.duration.current) { instanceRefs.duration.current.destroy(); instanceRefs.duration.current = null; }
            instanceRefs.duration.current = new Chart(chartRefs.duration.current.getContext('2d'), {
                type: 'bar', data: { labels: durations.map((_,i)=>i+1), datasets:[{label:'Длительность (мин)',data:durations,backgroundColor:'rgba(255,107,157,0.5)',borderColor:'rgb(255,107,157)',borderWidth:1}] },
                options: { responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true,grid:{color:'rgba(128,128,128,0.2)'},ticks:{color:'#a0a0a0'}},x:{grid:{color:'rgba(128,128,128,0.2)'},ticks:{color:'#a0a0a0'}}}, plugins:{legend:{labels:{color:'#ffffff'}}} }
            });
        }

        return () => {
            Object.values(instanceRefs).forEach(r => { if(r.current){r.current.destroy();r.current=null;} });
        };
    }, [filtered]);

    const timeData = timeOfDayData();
    const dayData = dayOfWeekData();
    const triggers = triggerStats();
    const moods = moodStats();
    const maxTime = Math.max(...timeData.map(d=>d.value), 1);
    const maxDay  = Math.max(...dayData.map(d=>d.value), 1);
    const maxTrig = Math.max(...triggers.map(d=>d.value), 1);
    const maxMood = Math.max(...moods.map(d=>d.value), 1);

    const avgDuration = filtered.length > 0 ? Math.round(filtered.reduce((s,e)=>s+(e.duration||0),0)/filtered.length) : 0;
    const orgasmRate = Math.round((filtered.filter(e=>e.orgasm).length/(filtered.length||1))*100);
    const contentRate = Math.round((filtered.filter(e=>e.contentUsed).length/(filtered.length||1))*100);
    const avgArousal = filtered.length > 0 ? filtered.reduce((s,e)=>s+(e.arousalLevel||5),0)/filtered.length : 0;

    return (
        <div className="fade-in">
            <h2 className="section-title">📊 Аналитика</h2>
            {allTriggers.length > 0 && (
                <div style={{marginBottom:'20px'}}>
                    <div className="form-label" style={{marginBottom:'10px'}}>Фильтр по триггерам</div>
                    <div className="filter-tags">
                        {allTriggers.map(t => <button key={t} className={`filter-tag ${filterTags.includes(t)?'active':''}`} onClick={()=>toggleFilter(t)}>{t}</button>)}
                    </div>
                    {filterTags.length > 0 && <div style={{fontSize:'13px',color:'var(--text-tertiary)'}}>Показано: {filtered.length} из {entries.length}</div>}
                </div>
            )}
            <div className="quick-stats">
                <div className="quick-stat"><div className="quick-stat-value">{avgDuration}</div><div className="quick-stat-label">Среднее время (мин)</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{orgasmRate}%</div><div className="quick-stat-label">Оргазм</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{contentRate}%</div><div className="quick-stat-label">С контентом</div></div>
                <div className="quick-stat"><div className="quick-stat-value">{avgArousal.toFixed(1)}</div><div className="quick-stat-label">Ср. возбуждение</div></div>
            </div>

            <div className="comparison-card">
                <h3 className="section-title">Сравнение месяцев</h3>
                <div className="comparison-item"><div className="comparison-label">Этот месяц</div><div className="comparison-value">{comparison.thisMonth}</div></div>
                <div className="comparison-item"><div className="comparison-label">Прошлый месяц</div><div className="comparison-value">{comparison.lastMonth}</div></div>
                <div className="comparison-item">
                    <div className="comparison-label">Изменение</div>
                    <div className={`comparison-value ${comparison.diff<0?'positive':comparison.diff>0?'negative':''}`}>
                        {comparison.diff>0?'+':''}{comparison.diff} ({comparison.percent>0?'+':''}{comparison.percent}%)
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card"><h3>📈 По месяцам</h3><div style={{height:'200px'}}><canvas ref={chartRefs.monthly}/></div></div>
                <div className="analytics-card"><h3>📊 Тренд по неделям (с пн)</h3><div style={{height:'200px'}}><canvas ref={chartRefs.weekly}/></div></div>
            </div>
            <div className="analytics-grid">
                <div className="analytics-card"><h3>⏱️ Длительность последних сессий</h3><div style={{height:'200px'}}><canvas ref={chartRefs.duration}/></div></div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h3>⏰ Время суток</h3>
                    <div className="bar-chart">
                        {timeData.map(item => (
                            <div key={item.label} className="bar-item">
                                <div className="bar-label" style={{minWidth:'120px',fontSize:'12px'}}>{item.label}</div>
                                <div className="bar-visual"><div className="bar-fill" style={{width:`${(item.value/maxTime)*100}%`}}/></div>
                                <div className="bar-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="analytics-card">
                    <h3>📅 Дни недели (Пн–Вс)</h3>
                    <div className="bar-chart">
                        {dayData.map(item => (
                            <div key={item.label} className="bar-item">
                                <div className="bar-label">{item.label}</div>
                                <div className="bar-visual"><div className="bar-fill" style={{width:`${(item.value/maxDay)*100}%`}}/></div>
                                <div className="bar-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {triggers.length > 0 && (
                    <div className="analytics-card">
                        <h3>🎯 Топ триггеров</h3>
                        <div className="bar-chart">
                            {triggers.map(item => (
                                <div key={item.label} className="bar-item">
                                    <div className="bar-label" style={{minWidth:'120px',fontSize:'12px'}}>{item.label}</div>
                                    <div className="bar-visual"><div className="bar-fill" style={{width:`${(item.value/maxTrig)*100}%`}}/></div>
                                    <div className="bar-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {moods.length > 0 && (
                    <div className="analytics-card">
                        <h3>😊 Настроения после</h3>
                        <div className="bar-chart">
                            {moods.map(item => (
                                <div key={item.label} className="bar-item">
                                    <div className="bar-label" style={{minWidth:'120px',fontSize:'12px'}}>{item.label}</div>
                                    <div className="bar-visual"><div className="bar-fill" style={{width:`${(item.value/maxMood)*100}%`}}/></div>
                                    <div className="bar-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
