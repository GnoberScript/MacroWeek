import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Apple, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  Flame, Heart, LayoutDashboard, LayoutGrid, List, Moon, Pencil, Plus, Search, Sun,
  Sparkles, Trash2, UtensilsCrossed, X, Zap,
} from 'lucide-react'
import { presetFoods } from './data/presetFoods'

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', hint: 'Start your day', icon: '☀' },
  { id: 'lunch', label: 'Lunch', hint: 'Midday fuel', icon: '◒' },
  { id: 'dinner', label: 'Dinner', hint: 'Wind down', icon: '☾' },
  { id: 'snacks', label: 'Snacks', hint: 'In between', icon: '✦' },
]
const STORAGE_KEY = 'macroweek-v1'

const iso = (date) => {
  const d = new Date(date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}
const startOfWeek = (date) => {
  const d = new Date(date); const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1); d.setHours(12, 0, 0, 0); return d
}
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d }
const round = (n, digits = 0) => Number(n.toFixed(digits))
const loadState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

function App() {
  const initial = useMemo(loadState, [])
  const [profile, setProfile] = useState(initial.profile || null)
  const [entries, setEntries] = useState(initial.entries || {})
  const [customFoods, setCustomFoods] = useState(initial.customFoods || [])
  const [favorites, setFavorites] = useState(initial.favorites || ['preset-chicken', 'preset-rice'])
  const [recentIds, setRecentIds] = useState(initial.recentIds || ['preset-whey', 'preset-chicken', 'preset-rice'])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekOffset, setWeekOffset] = useState(0)
  const [foodModal, setFoodModal] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get('view') === 'foods' ? 'foods' : 'diary')
  const [darkMode, setDarkMode] = useState(initial.darkMode || false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, entries, customFoods, favorites, recentIds, darkMode }))
  }, [profile, entries, customFoods, favorites, recentIds, darkMode])

  if (!profile) return <Onboarding onComplete={setProfile} />

  const dateKey = iso(selectedDate)
  const dayEntries = entries[dateKey] || []
  const totals = dayEntries.reduce((a, e) => ({
    calories: a.calories + e.calories, protein: a.protein + e.protein,
    carbs: a.carbs + e.carbs, fat: a.fat + e.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const addFood = (food, multiplier, meal) => {
    const entry = {
      entryId: crypto.randomUUID(), foodId: food.id, meal, name: food.name,
      serving: `${multiplier} × ${food.servingDescription}`, multiplier,
      calories: round(food.calories * multiplier), protein: round(food.protein * multiplier, 1),
      carbs: round(food.carbs * multiplier, 1), fat: round(food.fat * multiplier, 1),
    }
    setEntries(old => ({ ...old, [dateKey]: [...(old[dateKey] || []), entry] }))
    setRecentIds(old => [food.id, ...old.filter(id => id !== food.id)].slice(0, 8))
    setFoodModal(null)
  }
  const deleteEntry = (entryId) => setEntries(old => ({
    ...old, [dateKey]: (old[dateKey] || []).filter(e => e.entryId !== entryId),
  }))

  const saveCustomFood = food => {
    if (food.id) setCustomFoods(old => old.map(f => f.id === food.id ? { ...food, preset: false } : f))
    else setCustomFoods(old => [...old, { ...food, id: crypto.randomUUID(), preset: false }])
  }

  return <div className={`app-shell ${darkMode ? 'dark' : ''}`}>
    <Header profile={profile} view={view} setView={setView} darkMode={darkMode} setDarkMode={setDarkMode} onProfile={() => setProfileOpen(true)} />
    {view === 'diary' ? <main>
      <WeekStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} weekOffset={weekOffset} setWeekOffset={setWeekOffset} entries={entries} />
      <div className="content-grid">
        <section className="diary-column">
          <div className="section-heading">
            <div><span className="eyebrow">Daily diary</span><h1>{isToday(selectedDate) ? 'Today' : formatFullDate(selectedDate)}</h1></div>
          </div>
          <MacroSummary totals={totals} profile={profile} />
          <div className="meal-list">
            {MEALS.map(meal => <MealCard key={meal.id} meal={meal} entries={dayEntries.filter(e => e.meal === meal.id)} onAdd={() => setFoodModal({ meal: meal.id })} onDelete={deleteEntry} />)}
          </div>
        </section>
        <aside className="side-column">
          <GoalCard totals={totals} profile={profile} />
          <InsightCard totals={totals} profile={profile} />
        </aside>
      </div>
    </main> : <FoodLibrary foods={[...presetFoods, ...customFoods]} customFoods={customFoods} favorites={favorites} onFavorite={id => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])} onSave={saveCustomFood} onDelete={id => setCustomFoods(old => old.filter(f => f.id !== id))} />}
    <footer className="app-footer"><span>MacroWeek</span><span>Made with care by <strong>Gohan R.</strong></span></footer>
    {foodModal && <FoodModal
      meal={foodModal.meal} foods={[...presetFoods, ...customFoods]} customFoods={customFoods}
      favorites={favorites} recentIds={recentIds} onClose={() => setFoodModal(null)} onAdd={addFood}
      onFavorite={id => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])}
      onSaveCustom={saveCustomFood}
      onDeleteCustom={id => setCustomFoods(old => old.filter(f => f.id !== id))}
    />}
    {profileOpen && <ProfileModal profile={profile} onClose={() => setProfileOpen(false)} onSave={p => { setProfile(p); setProfileOpen(false) }} />}
  </div>
}

function Header({ profile, view, setView, darkMode, setDarkMode, onProfile }) {
  return <header className="topbar">
    <div className="brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>MacroWeek</span></div>
    <nav className="main-nav">
      <button className={view === 'diary' ? 'active' : ''} onClick={() => setView('diary')}><LayoutDashboard size={16} /> Diary</button>
      <button className={view === 'foods' ? 'active' : ''} onClick={() => setView('foods')}><BookOpen size={16} /> Foods</button>
    </nav>
    <div className="header-actions">
      <button className="today-pill"><span className="live-dot" /> Tracking today</button>
      <button className="theme-toggle" onClick={() => setDarkMode(v => !v)} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
      <button className="avatar-button" onClick={onProfile} aria-label="Edit profile"><span>{(profile.name || 'M')[0].toUpperCase()}</span><ChevronDown size={15} /></button>
    </div>
  </header>
}

function FoodLibrary({ foods, customFoods, favorites, onFavorite, onSave, onDelete }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editor, setEditor] = useState(null)
  const [layout, setLayout] = useState(() => localStorage.getItem('macroweek-food-layout') || 'tiles')
  useEffect(() => localStorage.setItem('macroweek-food-layout', layout), [layout])
  const visible = foods.filter(food => {
    const matches = `${food.name} ${food.description}`.toLowerCase().includes(search.toLowerCase())
    const filterMatch = filter === 'all' || (filter === 'favorites' && favorites.includes(food.id)) ||
      (filter === 'custom' && !food.preset) || (filter === 'staples' && food.brand === 'Staples') ||
      (filter === 'burger-king' && food.brand === 'Burger King') || (filter === 'mcdo' && food.brand === 'McDo') ||
      (filter === 'starbucks' && food.brand === 'Starbucks') || (filter === 'highlands' && food.brand === 'Highlands Coffee')
    return matches && filterMatch
  })
  const save = food => { onSave(food); setEditor(null); setFilter('all'); setSearch('') }
  return <main className="library-page">
    <div className="library-hero">
      <div><span className="eyebrow">Food library</span><h1>Your foods, your numbers.</h1><p>Create and maintain the foods you actually eat. New foods are automatically included in All Foods.</p></div>
      <button className="primary-button compact" onClick={() => setEditor({})}><Plus size={18} /> Create food</button>
    </div>
    <div className="library-toolbar">
      <div className="search-box"><Search size={18} /><input placeholder="Search all foods..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="library-filters">{[['all','All foods'],['staples','Staples'],['burger-king','Burger King'],['mcdo','McDo'],['starbucks','Starbucks'],['highlands','Highlands'],['custom','My foods'],['favorites','Favorites']].map(([id,label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    </div>
    <div className="library-count"><span>{visible.length} {visible.length === 1 ? 'food' : 'foods'}</span><div className="library-count-actions"><span><i /> Values are estimates unless entered from your own label</span><div className="layout-toggle"><button className={layout === 'tiles' ? 'active' : ''} onClick={() => setLayout('tiles')} aria-label="Tile view" title="Tile view"><LayoutGrid size={15} /></button><button className={layout === 'list' ? 'active' : ''} onClick={() => setLayout('list')} aria-label="List view" title="List view"><List size={16} /></button></div></div></div>
    <div className={`library-grid ${layout === 'list' ? 'list-view' : ''}`}>
      {visible.map(food => <article className="library-food-card" key={food.id}>
        <div className="library-card-top"><div className="food-symbol">{food.name[0]}</div><div className="food-badges"><span>{food.preset ? (food.brand === 'Staples' ? 'Starter preset' : food.brand) : 'My food'}</span><button className={`favorite-button ${favorites.includes(food.id) ? 'active' : ''}`} onClick={() => onFavorite(food.id)}><Heart size={17} fill={favorites.includes(food.id) ? 'currentColor' : 'none'} /></button></div></div>
        <h3>{food.name}</h3><p>{food.description || 'Custom food'} · {food.servingDescription}</p>
        <div className="library-calories"><strong>{food.calories}</strong><span>kcal / serving</span></div>
        <div className="library-macros"><span><b>{food.protein}g</b>Protein</span><span><b>{food.carbs}g</b>Carbs</span><span><b>{food.fat}g</b>Fat</span></div>
        <div className="library-card-actions">
          {food.preset ? <span className="preset-note">Read-only starter estimate</span> : <><button onClick={() => setEditor(food)}><Pencil size={15} /> Edit</button><button className="delete" onClick={() => onDelete(food.id)}><Trash2 size={15} /> Delete</button></>}
        </div>
      </article>)}
      {!visible.length && <div className="library-empty"><UtensilsCrossed size={32} /><h3>No foods here yet</h3><p>Create a food and it will appear in All Foods immediately.</p><button className="primary-button compact" onClick={() => setEditor({})}><Plus size={17} /> Create food</button></div>}
    </div>
    {editor && <div className="modal-backdrop"><FoodEditor food={editor} onClose={() => setEditor(null)} onSave={save} /></div>}
  </main>
}

function WeekStrip({ selectedDate, setSelectedDate, weekOffset, setWeekOffset, entries }) {
  const base = addDays(startOfWeek(new Date()), weekOffset * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(base, i))
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(base.getFullYear())
  const jumpToMonth = monthIndex => {
    const maxDay = new Date(pickerYear, monthIndex + 1, 0).getDate()
    const target = new Date(pickerYear, monthIndex, Math.min(selectedDate.getDate(), maxDay), 12)
    const weeksFromNow = Math.round((startOfWeek(target) - startOfWeek(new Date())) / (7 * 24 * 60 * 60 * 1000))
    setSelectedDate(target); setWeekOffset(weeksFromNow); setMonthPickerOpen(false)
  }
  return <section className="week-section">
    <div className="week-topline">
      <div className="month-picker-wrap"><span className="eyebrow">Your week</span><button className="month-trigger" onClick={() => { setPickerYear(base.getFullYear()); setMonthPickerOpen(v => !v) }}><h2>{base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><CalendarDays size={16} /></button>
        {monthPickerOpen && <div className="month-popover">
          <div className="month-popover-head"><button onClick={() => setPickerYear(y => y - 1)} aria-label="Previous year"><ChevronLeft size={17} /></button><strong>{pickerYear}</strong><button onClick={() => setPickerYear(y => y + 1)} aria-label="Next year"><ChevronRight size={17} /></button></div>
          <div className="month-grid">{Array.from({ length: 12 }, (_, month) => <button key={month} className={month === base.getMonth() && pickerYear === base.getFullYear() ? 'active' : ''} onClick={() => jumpToMonth(month)}>{new Date(2020, month, 1).toLocaleDateString('en-US', { month: 'short' })}</button>)}</div>
        </div>}
      </div>
      <div className="week-nav">
        {weekOffset !== 0 && <button className="text-button" onClick={() => { setWeekOffset(0); setSelectedDate(new Date()) }}>This week</button>}
        <button onClick={() => { setWeekOffset(v => v - 1); setSelectedDate(d => addDays(d, -7)) }} aria-label="Previous week"><ChevronLeft size={19} /></button>
        <button onClick={() => { setWeekOffset(v => v + 1); setSelectedDate(d => addDays(d, 7)) }} aria-label="Next week"><ChevronRight size={19} /></button>
      </div>
    </div>
    <div className="day-row">
      {days.map(day => {
        const selected = iso(day) === iso(selectedDate); const today = isToday(day)
        const dayTotals = (entries[iso(day)] || []).reduce((s, x) => s + x.calories, 0)
        return <button key={iso(day)} className={`day-tile ${selected ? 'selected' : ''}`} onClick={() => setSelectedDate(day)}>
          <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <strong>{day.getDate()}</strong>
          <span className={`day-status ${dayTotals ? 'logged' : ''}`}>{today && !dayTotals ? 'Today' : dayTotals ? `${Math.round(dayTotals)} kcal` : '—'}</span>
        </button>
      })}
    </div>
  </section>
}

function MacroSummary({ totals, profile }) {
  const rawCaloriePct = totals.calories / profile.calorieTarget * 100
  const caloriePct = Math.min(100, rawCaloriePct)
  const calorieOver = totals.calories > profile.calorieTarget
  const stats = [
    { label: 'Protein', value: totals.protein, target: profile.proteinTarget, unit: 'g', color: '#d8633a' },
    { label: 'Carbs', value: totals.carbs, target: profile.carbTarget, unit: 'g', color: '#d49f43' },
    { label: 'Fat', value: totals.fat, target: profile.fatTarget, unit: 'g', color: '#708f70' },
  ]
  const exceeded = [
    calorieOver && `${Math.round(totals.calories - profile.calorieTarget).toLocaleString()} kcal`,
    totals.protein > profile.proteinTarget && `${round(totals.protein - profile.proteinTarget, 1)}g protein`,
    totals.carbs > profile.carbTarget && `${round(totals.carbs - profile.carbTarget, 1)}g carbs`,
    totals.fat > profile.fatTarget && `${round(totals.fat - profile.fatTarget, 1)}g fat`,
  ].filter(Boolean)
  return <div className="macro-card">
    {exceeded.length > 0 && <div className="over-target-warning"><span><AlertTriangle size={17} /></span><div><strong>Daily target exceeded</strong><p>You’re over by {exceeded.join(' · ')}. Your log is saved—adjust only if that fits your plan.</p></div></div>}
    <div className="calorie-overview">
      <div className={`ring ${calorieOver ? 'over' : ''}`} style={{ '--progress': `${caloriePct * 3.6}deg` }}>
        <div><Flame size={18} /><strong>{Math.round(totals.calories).toLocaleString()}</strong><span>of {profile.calorieTarget.toLocaleString()} kcal</span></div>
      </div>
      <div className="calorie-copy"><span className="eyebrow">{calorieOver ? 'Calories over' : 'Calories left'}</span><h3>{Math.abs(profile.calorieTarget - Math.round(totals.calories)).toLocaleString()}</h3><p>{totals.calories ? `${Math.round(rawCaloriePct)}% of your daily target` : 'Ready when you are — add your first meal.'}</p></div>
    </div>
    <div className="macro-stats">
      {stats.map(stat => { const over = stat.value > stat.target; return <div className={`macro-stat ${over ? 'over' : ''}`} key={stat.label}>
        <div><span>{stat.label}</span><strong>{round(stat.value, 1)}<small>{stat.unit}</small></strong></div>
        <div className="progress-track"><i style={{ width: `${Math.min(100, stat.value / stat.target * 100)}%`, background: over ? '#b6363c' : stat.color }} /></div>
        <small>{over ? `${round(stat.value - stat.target, 1)}${stat.unit} over target` : `${round(stat.target - stat.value, 1)}${stat.unit} remaining`}</small>
      </div>})}
    </div>
  </div>
}

function MealCard({ meal, entries, onAdd, onDelete }) {
  const cals = entries.reduce((s, e) => s + e.calories, 0)
  return <article className="meal-card">
    <div className="meal-header">
      <div className="meal-title"><span className="meal-icon">{meal.icon}</span><div><h3>{meal.label}</h3><span>{entries.length ? `${entries.length} ${entries.length === 1 ? 'item' : 'items'} · ${Math.round(cals)} kcal` : meal.hint}</span></div></div>
      <button className="add-button" onClick={onAdd}><Plus size={17} /> Add food</button>
    </div>
    {entries.length > 0 && <div className="food-entries">
      {entries.map(entry => <div className="food-entry" key={entry.entryId}>
        <div className="food-symbol">{entry.name[0]}</div>
        <div className="food-entry-name"><strong>{entry.name}</strong><span>{entry.serving}</span></div>
        <div className="entry-macros"><strong>{entry.calories}</strong><span>kcal</span></div>
        <div className="entry-macro-detail"><span>P {entry.protein}g</span><span>C {entry.carbs}g</span><span>F {entry.fat}g</span></div>
        <button className="icon-only danger" onClick={() => onDelete(entry.entryId)} aria-label={`Delete ${entry.name}`}><Trash2 size={16} /></button>
      </div>)}
    </div>}
    {!entries.length && <button className="empty-meal" onClick={onAdd}><span><Plus size={15} /></span>Log something for {meal.label.toLowerCase()}</button>}
  </article>
}

function GoalCard({ totals, profile }) {
  const proteinPct = Math.min(100, totals.protein / profile.proteinTarget * 100)
  const over = totals.protein > profile.proteinTarget
  return <div className={`aside-card goal-card ${over ? 'over' : ''}`}>
    <div className="aside-heading"><span className="mini-icon"><Sparkles size={16} /></span><div><span className="eyebrow">Priority goal</span><h3>Daily protein</h3></div></div>
    <div className="goal-value"><strong>{round(totals.protein, 1)}g</strong><span>/ {profile.proteinTarget}g</span></div>
    <div className="progress-track large"><i style={{ width: `${proteinPct}%` }} /></div>
    <p>{over ? `${round(totals.protein - profile.proteinTarget, 1)}g over your target` : `${round(profile.proteinTarget - totals.protein, 1)}g left to hit your target`}</p>
  </div>
}

function InsightCard({ totals, profile }) {
  const remaining = profile.calorieTarget - totals.calories
  return <div className="aside-card insight-card">
    <span className="eyebrow">Daily note</span>
    <div className="insight-art"><Apple size={42} strokeWidth={1.4} /></div>
    <h3>{totals.calories ? (remaining > 0 ? 'You have room left' : 'Target reached') : 'Small logs add up'}</h3>
    <p>{totals.calories ? (remaining > 0 ? `About ${Math.round(remaining)} calories remain in today's plan.` : 'You’ve met your calorie target for today.') : 'Build the habit first. Precision can come later.'}</p>
  </div>
}

function Onboarding({ onComplete }) {
  const [form, setForm] = useState({ name: '', weight: 72, height: 175, calorieTarget: 2200, proteinTarget: 150 })
  const submit = e => {
    e.preventDefault()
    onComplete({ ...form, weight: +form.weight, height: +form.height, calorieTarget: +form.calorieTarget, proteinTarget: +form.proteinTarget, carbTarget: Math.round(form.calorieTarget * .45 / 4), fatTarget: Math.round(form.calorieTarget * .25 / 9) })
  }
  return <div className="onboarding">
    <div className="onboarding-panel">
      <div className="brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>MacroWeek</span></div>
      <div className="onboarding-copy"><span className="step-pill">SET UP IN 60 SECONDS</span><h1>A clearer week starts with <em>one day.</em></h1><p>Set your daily targets. You can fine-tune them anytime as your routine changes.</p></div>
      <div className="preview-stack">
        <div className="preview-card pc-1"><span>MON</span><strong>2,146</strong><small>kcal logged</small></div>
        <div className="preview-card pc-2"><span>PROTEIN</span><strong>148g</strong><small>98% of goal</small></div>
        <div className="preview-card pc-3"><Check size={20} /><strong>Day complete</strong></div>
      </div>
      <p className="onboarding-foot">Private by design · Stored on this device</p>
    </div>
    <form className="setup-form" onSubmit={submit}>
      <span className="eyebrow">Your starting point</span><h2>Let’s set your baseline</h2><p className="form-intro">These numbers personalize the progress bars in your diary. They are goals, not medical advice.</p>
      <label>Your first name <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What should we call you?" required /></label>
      <div className="form-row">
        <label>Weight <div className="input-unit"><input type="number" min="30" max="300" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /><span>kg</span></div></label>
        <label>Height <div className="input-unit"><input type="number" min="100" max="250" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /><span>cm</span></div></label>
      </div>
      <div className="target-divider"><span>Daily targets</span></div>
      <div className="form-row">
        <label>Calories <div className="input-unit"><input type="number" min="800" max="6000" step="50" value={form.calorieTarget} onChange={e => setForm({ ...form, calorieTarget: e.target.value })} /><span>kcal</span></div></label>
        <label>Protein <div className="input-unit"><input type="number" min="20" max="500" step="5" value={form.proteinTarget} onChange={e => setForm({ ...form, proteinTarget: e.target.value })} /><span>g</span></div></label>
      </div>
      <button className="primary-button" type="submit">Start tracking <ChevronRight size={19} /></button>
      <p className="fine-print">MacroWeek provides tracking tools, not nutritional or medical advice.</p>
    </form>
  </div>
}

function FoodModal({ meal, foods, customFoods, favorites, recentIds, onClose, onAdd, onFavorite, onSaveCustom, onDeleteCustom }) {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [multiplier, setMultiplier] = useState(1)
  const [editor, setEditor] = useState(null)
  const filtered = foods.filter(food => {
    const matches = food.name.toLowerCase().includes(search.toLowerCase())
    return matches && (tab === 'all' || (tab === 'recent' && recentIds.includes(food.id)) ||
      (tab === 'favorites' && favorites.includes(food.id)) || (tab === 'custom' && !food.preset) ||
      (tab === 'burger-king' && food.brand === 'Burger King') || (tab === 'mcdo' && food.brand === 'McDo') ||
      (tab === 'starbucks' && food.brand === 'Starbucks') || (tab === 'highlands' && food.brand === 'Highlands Coffee'))
  }).sort((a, b) => {
    if (tab === 'recent') return recentIds.indexOf(a.id) - recentIds.indexOf(b.id)
    const brandOrder = { Staples: 0, 'Burger King': 1, McDo: 2, Starbucks: 3, 'Highlands Coffee': 4, 'My foods': 5 }
    const brandDifference = (brandOrder[a.brand] ?? 4) - (brandOrder[b.brand] ?? 4)
    return brandDifference || (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name)
  })
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="food-modal">
      <div className="modal-header"><div><span className="eyebrow">Add to {meal}</span><h2>Choose a food</h2></div><button className="modal-close" onClick={onClose}><X size={20} /></button></div>
      <div className="search-row"><div className="search-box"><Search size={18} /><input autoFocus placeholder="Search your foods..." value={search} onChange={e => setSearch(e.target.value)} /></div><button className="new-food-button" onClick={() => setEditor({})}><Plus size={17} /> Create food</button></div>
      <div className="food-tabs">
        {[['all','All foods'],['recent','Recent'],['favorites','Favorites'],['custom','My foods'],['burger-king','Burger King'],['mcdo','McDo'],['starbucks','Starbucks'],['highlands','Highlands']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}
      </div>
      <div className="estimate-note"><span>i</span> Nutrition values are editable estimates. Check packaging for the best match.</div>
      <div className="food-list">
        {filtered.map(food => <div className={`food-option ${selected?.id === food.id ? 'selected' : ''}`} key={food.id} onClick={() => { setSelected(food); setMultiplier(1) }}>
          <div className="food-symbol">{food.name[0]}</div><div className="option-info"><strong>{food.name}</strong><span>{food.description} · {food.servingDescription}</span></div>
          <div className="option-nutrition">
            <div className="option-cals"><strong>{food.calories}</strong><span>kcal</span></div>
            <div className="option-macros"><span><b>P</b> {food.protein}g</span><span><b>C</b> {food.carbs}g</span><span><b>F</b> {food.fat}g</span></div>
          </div>
          <button className={`favorite-button ${favorites.includes(food.id) ? 'active' : ''}`} onClick={e => { e.stopPropagation(); onFavorite(food.id) }}><Heart size={17} fill={favorites.includes(food.id) ? 'currentColor' : 'none'} /></button>
          {!food.preset && <><button className="icon-only" onClick={e => { e.stopPropagation(); setEditor(food) }}><Pencil size={15} /></button><button className="icon-only danger" onClick={e => { e.stopPropagation(); onDeleteCustom(food.id); if (selected?.id === food.id) setSelected(null) }}><Trash2 size={15} /></button></>}
        </div>)}
        {!filtered.length && <div className="no-results"><UtensilsCrossed size={28} /><strong>No foods found</strong><span>Try another search or create your own food.</span></div>}
      </div>
      <div className="modal-footer">
        {selected ? <>
          <div className="serving-control"><span>Servings</span><div><button onClick={() => setMultiplier(v => Math.max(.25, round(v - .25, 2)))}>−</button><input type="number" min=".25" step=".25" value={multiplier} onChange={e => setMultiplier(Math.max(.25, +e.target.value))} /><button onClick={() => setMultiplier(v => round(v + .25, 2))}>+</button></div></div>
          <div className="selection-total"><strong>{Math.round(selected.calories * multiplier)} kcal</strong><div><span><b>P</b> {round(selected.protein * multiplier, 1)}g</span><span><b>C</b> {round(selected.carbs * multiplier, 1)}g</span><span><b>F</b> {round(selected.fat * multiplier, 1)}g</span></div></div>
          <button className="primary-button compact" onClick={() => onAdd(selected, multiplier, meal)}>Add to {meal} <Plus size={18} /></button>
        </> : <p>Select a food to adjust its serving and add it.</p>}
      </div>
      {editor && <FoodEditor food={editor} onClose={() => setEditor(null)} onSave={food => { onSaveCustom(food); setEditor(null); setTab('all'); setSearch('') }} />}
    </div>
  </div>
}

function FoodEditor({ food, onClose, onSave }) {
  const [f, setF] = useState({ name: '', description: '', servingDescription: '', quantity: 1, unit: 'serving', calories: '', protein: '', carbs: '', fat: '', ...food })
  const change = (key, val) => setF(old => ({ ...old, [key]: val }))
  const submit = e => { e.preventDefault(); onSave({ ...f, calories: +f.calories, protein: +f.protein, carbs: +f.carbs, fat: +f.fat, quantity: +f.quantity, brand: f.brand || 'My foods', category: f.category || 'Custom', source: 'User entered', preset: false }) }
  return <div className="editor-layer"><form className="food-editor" onSubmit={submit}>
    <div className="modal-header"><div><span className="eyebrow">Your food library</span><h2>{food.id ? 'Edit food' : 'Create a food'}</h2></div><button type="button" className="modal-close" onClick={onClose}><X size={20} /></button></div>
    <label>Food name<input required value={f.name} onChange={e => change('name', e.target.value)} placeholder="e.g. Mom's chicken adobo" /></label>
    <label>Description<input value={f.description} onChange={e => change('description', e.target.value)} placeholder="Optional preparation or brand" /></label>
    <div className="form-row"><label>Serving description<input required value={f.servingDescription} onChange={e => change('servingDescription', e.target.value)} placeholder="e.g. 1 bowl (250 g)" /></label><label>Unit<input required value={f.unit} onChange={e => change('unit', e.target.value)} /></label></div>
    <div className="nutrient-grid">
      {[['calories','Calories','kcal'],['protein','Protein','g'],['carbs','Carbs','g'],['fat','Fat','g']].map(([key,label,unit]) => <label key={key}>{label}<div className="input-unit"><input required min="0" step="0.1" type="number" value={f[key]} onChange={e => change(key, e.target.value)} /><span>{unit}</span></div></label>)}
    </div>
    <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button compact" type="submit">Save food <Check size={17} /></button></div>
  </form></div>
}

function ProfileModal({ profile, onClose, onSave }) {
  const [f, setF] = useState(profile)
  return <div className="modal-backdrop"><form className="profile-modal" onSubmit={e => { e.preventDefault(); onSave({ ...f, weight: +f.weight, height: +f.height, calorieTarget: +f.calorieTarget, proteinTarget: +f.proteinTarget, carbTarget: +f.carbTarget, fatTarget: +f.fatTarget }) }}>
    <div className="modal-header"><div><span className="eyebrow">Settings</span><h2>Your profile & targets</h2></div><button type="button" className="modal-close" onClick={onClose}><X size={20} /></button></div>
    <label>Name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
    <div className="nutrient-grid">{[['weight','Weight','kg'],['height','Height','cm'],['calorieTarget','Calories','kcal'],['proteinTarget','Protein','g'],['carbTarget','Carbs','g'],['fatTarget','Fat','g']].map(([k,l,u]) => <label key={k}>{l}<div className="input-unit"><input type="number" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /><span>{u}</span></div></label>)}</div>
    <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button compact">Save changes</button></div>
  </form></div>
}

function isToday(date) { return iso(date) === iso(new Date()) }
function formatFullDate(date) { return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }

export default App
