import { useState } from 'react'
import { Search, Plus, Trash2, ChevronRight, BookOpen, Pencil, Star, StarOff } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { MacroRingChart, FoodTypeChart, MacroBreakdownBar } from '../../components/charts/MacroRing'
import { mockFoodLog, mockFoodDatabase, mockClientProfile } from '../../api/mockData'
import toast from 'react-hot-toast'

// ─── Custom food store (persisted to localStorage) ───────────────────────────
function loadCustomFoods() {
  try { return JSON.parse(localStorage.getItem('fitdeck_custom_foods') || '[]') } catch { return [] }
}
function saveCustomFoods(foods) {
  localStorage.setItem('fitdeck_custom_foods', JSON.stringify(foods))
}

const EMPTY_CUSTOM = { name: '', calories: '', protein: '', carbs: '', fat: '', isJunk: false }

// ─── Tab type ─────────────────────────────────────────────────────────────────
const TABS = { SEARCH: 'search', CUSTOM: 'custom', MY_FOODS: 'my_foods' }

export default function FoodLogger() {
  const [log, setLog] = useState(mockFoodLog)
  const [selectedDate, setSelectedDate] = useState('today')

  // Modal state
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState(TABS.SEARCH)

  // Search-from-DB state
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [qty, setQty] = useState(100)

  // Custom food form state
  const [customFoods, setCustomFoods] = useState(loadCustomFoods)
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM)
  const [customFormError, setCustomFormError] = useState({})
  const [editingCustomId, setEditingCustomId] = useState(null)
  const [selectedCustom, setSelectedCustom] = useState(null)
  const [customQty, setCustomQty] = useState(1)      // servings for custom food
  const [showManageCustom, setShowManageCustom] = useState(false)

  // ── Totals
  const targets = mockClientProfile.macroTargets
  const totals = log.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  const junkCals = log.filter(i => i.isJunk).reduce((a, i) => a + i.calories, 0)
  const healthyCals = totals.calories - junkCals

  // ── Filtered DB results
  const filteredDB = mockFoodDatabase.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  )
  // Also include matching custom foods in search
  const filteredCustomInSearch = customFoods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Handlers: add from DB
  const addFromDB = () => {
    if (!selectedFood) return
    const factor = qty / 100
    setLog(prev => [...prev, {
      id: Date.now(),
      name: `${selectedFood.name} (${qty}g)`,
      calories: Math.round(selectedFood.per100g.calories * factor),
      protein: Math.round(selectedFood.per100g.protein * factor),
      carbs: Math.round(selectedFood.per100g.carbs * factor),
      fat: Math.round(selectedFood.per100g.fat * factor),
      isJunk: false,
      source: 'db',
      time: new Date().toTimeString().slice(0, 5),
    }])
    closeModal()
    toast.success(`${selectedFood.name} added to log`)
  }

  // ── Handlers: add from custom food
  const addFromCustom = () => {
    if (!selectedCustom) return
    const n = customQty
    setLog(prev => [...prev, {
      id: Date.now(),
      name: `${selectedCustom.name}${n !== 1 ? ` ×${n}` : ''}`,
      calories: Math.round(selectedCustom.calories * n),
      protein: Math.round((selectedCustom.protein || 0) * n),
      carbs: Math.round((selectedCustom.carbs || 0) * n),
      fat: Math.round((selectedCustom.fat || 0) * n),
      isJunk: selectedCustom.isJunk,
      source: 'custom',
      time: new Date().toTimeString().slice(0, 5),
    }])
    closeModal()
    toast.success(`${selectedCustom.name} added`)
  }

  // ── Handlers: save custom food definition
  const validateCustom = () => {
    const errs = {}
    if (!customForm.name.trim()) errs.name = 'Name is required'
    if (!customForm.calories || isNaN(customForm.calories) || Number(customForm.calories) <= 0)
      errs.calories = 'Enter a valid calorie amount'
    return errs
  }

  const saveCustomFood = () => {
    const errs = validateCustom()
    if (Object.keys(errs).length) { setCustomFormError(errs); return }
    const food = {
      id: editingCustomId || `custom_${Date.now()}`,
      name: customForm.name.trim(),
      calories: Number(customForm.calories),
      protein: Number(customForm.protein) || 0,
      carbs: Number(customForm.carbs) || 0,
      fat: Number(customForm.fat) || 0,
      isJunk: customForm.isJunk,
      servingLabel: customForm.servingLabel?.trim() || '1 serving',
      createdAt: editingCustomId
        ? customFoods.find(f => f.id === editingCustomId)?.createdAt
        : new Date().toISOString(),
    }
    const updated = editingCustomId
      ? customFoods.map(f => f.id === editingCustomId ? food : f)
      : [food, ...customFoods]
    setCustomFoods(updated)
    saveCustomFoods(updated)
    toast.success(editingCustomId ? 'Food updated' : `"${food.name}" saved to My Foods`)
    resetCustomForm()
    // Switch to My Foods tab after saving
    setActiveTab(TABS.MY_FOODS)
  }

  const deleteCustomFood = (id) => {
    const updated = customFoods.filter(f => f.id !== id)
    setCustomFoods(updated)
    saveCustomFoods(updated)
    if (selectedCustom?.id === id) setSelectedCustom(null)
    toast.success('Custom food removed')
  }

  const startEditCustom = (food) => {
    setEditingCustomId(food.id)
    setCustomForm({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      isJunk: food.isJunk,
      servingLabel: food.servingLabel,
    })
    setActiveTab(TABS.CUSTOM)
    setShowManageCustom(false)
  }

  const resetCustomForm = () => {
    setCustomForm(EMPTY_CUSTOM)
    setCustomFormError({})
    setEditingCustomId(null)
  }

  const removeItem = (id) => { setLog(prev => prev.filter(i => i.id !== id)); toast.success('Removed') }

  const closeModal = () => {
    setShowAdd(false)
    setSelectedFood(null)
    setSearch('')
    setQty(100)
    setSelectedCustom(null)
    setCustomQty(1)
    resetCustomForm()
    setActiveTab(TABS.SEARCH)
  }

  const upd = (k, v) => { setCustomForm(f => ({ ...f, [k]: v })); setCustomFormError(e => ({ ...e, [k]: undefined })) }

  return (
    <Layout title="Food Log">
      <div className="space-y-4 animate-fade-in">
        {/* Date + add button */}
        <div className="flex items-center gap-2">
          {['yesterday', 'today'].map(d => (
            <button key={d} onClick={() => setSelectedDate(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border capitalize transition-colors ${selectedDate === d ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600'}`}>
              {d}
            </button>
          ))}
          <button onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl active:bg-teal-700">
            <Plus className="w-3.5 h-3.5" /> Add Food
          </button>
        </div>

        {/* Calorie ring summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">Today's Summary</p>
          <div className="flex items-center gap-4 mb-4">
            <MacroRingChart consumed={totals.calories} target={targets.calories} />
            <div>
              <p className="text-3xl font-bold text-gray-900">{totals.calories}</p>
              <p className="text-xs text-gray-500">of {targets.calories} kcal</p>
              <p className={`text-xs font-semibold mt-1 ${targets.calories - totals.calories >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                {Math.abs(targets.calories - totals.calories)} kcal {targets.calories - totals.calories >= 0 ? 'remaining' : 'over target'}
              </p>
            </div>
          </div>
          <MacroBreakdownBar
            protein={totals.protein} carbs={totals.carbs} fat={totals.fat}
            targetProtein={targets.protein} targetCarbs={targets.carbs} targetFat={targets.fat}
          />
        </div>

        {/* Macro pills */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Cal', value: totals.calories, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Protein', value: totals.protein, unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Carbs', value: totals.carbs, unit: 'g', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Fat', value: totals.fat, unit: 'g', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(m => (
            <div key={m.label} className={`${m.bg} rounded-xl p-2.5 text-center`}>
              <p className={`text-base font-bold ${m.color}`}>{Math.round(m.value)}<span className="text-xs">{m.unit || ''}</span></p>
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Junk food banner */}
        {junkCals > 0 && (
          <div className="bg-orange-50 rounded-xl border border-orange-100 px-4 py-3 flex items-center gap-3">
            <FoodTypeChart junk={junkCals} healthy={healthyCals} />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {Math.round((junkCals / totals.calories) * 100)}% from junk food
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{junkCals} of {totals.calories} kcal</p>
            </div>
          </div>
        )}

        {/* Logged items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Logged ({log.length})</p>
            {customFoods.length > 0 && (
              <button onClick={() => setShowManageCustom(true)}
                className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> My Foods ({customFoods.length})
              </button>
            )}
          </div>
          {log.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl mb-2">🍽️</p>
              <p className="text-sm font-medium text-gray-500">Nothing logged yet. Start adding meals.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {log.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm
                    bg-gray-100">
                    {item.source === 'custom' ? '⭐' : '🥗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.isJunk && <Badge variant="orange">Junk</Badge>}
                      {item.source === 'custom' && <Badge variant="purple">Custom</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.time} · P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g
                    </p>
                  </div>
                  <p className="text-sm font-bold text-orange-600 shrink-0">{item.calories}</p>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 active:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Food Modal ────────────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        onClose={closeModal}
        title="Add Food"
        size="lg"
      >
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
          {[
            { id: TABS.SEARCH, label: '🔍 Search DB' },
            { id: TABS.CUSTOM, label: editingCustomId ? '✏️ Edit Food' : '➕ Custom Food' },
            { id: TABS.MY_FOODS, label: `⭐ My Foods${customFoods.length ? ` (${customFoods.length})` : ''}` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetCustomForm() }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Search database ── */}
        {activeTab === TABS.SEARCH && (
          <div className="space-y-3">
            <Input placeholder="Search food database..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={Search} />

            <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
              {/* Custom foods that match search */}
              {search && filteredCustomInSearch.map(food => (
                <button key={food.id} onClick={() => { setSelectedCustom(food); setActiveTab(TABS.MY_FOODS) }}
                  className="w-full text-left p-3 rounded-xl border border-purple-200 bg-purple-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">⭐</span>
                      <p className="text-sm font-medium text-gray-900">{food.name}</p>
                      <Badge variant="purple">Custom</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{food.servingLabel}</p>
                  </div>
                  <p className="text-sm font-bold text-orange-600">{food.calories} kcal</p>
                </button>
              ))}

              {/* DB results */}
              {filteredDB.slice(0, search ? 8 : 10).map(food => (
                <button key={food.id} onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedFood?.id === food.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">{food.per100g.calories}</p>
                      <p className="text-xs text-gray-400">kcal/100g</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredDB.length === 0 && !filteredCustomInSearch.length && search && (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">"{search}" not in database.</p>
                  <button onClick={() => { setCustomForm(f => ({ ...f, name: search })); setActiveTab(TABS.CUSTOM) }}
                    className="text-sm font-semibold text-teal-600 flex items-center gap-1.5 mx-auto">
                    <Plus className="w-4 h-4" /> Add "{search}" as custom food
                  </button>
                </div>
              )}
            </div>

            {selectedFood && (
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div>
                  <label className="label">Serving size (g)</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} className="input w-20" />
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                      {[50, 100, 150, 200, 300].map(q => (
                        <button key={q} onClick={() => setQty(q)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border shrink-0 ${qty === q ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}>
                          {q}g
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <MacroPreview
                  calories={Math.round(selectedFood.per100g.calories * qty / 100)}
                  protein={Math.round(selectedFood.per100g.protein * qty / 100)}
                  carbs={Math.round(selectedFood.per100g.carbs * qty / 100)}
                  fat={Math.round(selectedFood.per100g.fat * qty / 100)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
              <Button className="flex-1" onClick={addFromDB} disabled={!selectedFood}>Add to log</Button>
            </div>
          </div>
        )}

        {/* ── TAB: Custom food form ── */}
        {activeTab === TABS.CUSTOM && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-700 font-medium">
                {editingCustomId
                  ? 'Edit this custom food. Changes apply to future log entries.'
                  : 'Create a custom food for items not in the database — like home-cooked meals, branded products, or restaurant dishes.'}
              </p>
            </div>

            <Input
              label="Food name *"
              placeholder="e.g. Mum's Dal Tadka, Protein Bar XYZ"
              value={customForm.name}
              onChange={e => upd('name', e.target.value)}
              error={customFormError.name}
            />

            <Input
              label="Serving label"
              placeholder="e.g. 1 bowl, 1 bar, 200ml"
              value={customForm.servingLabel || ''}
              onChange={e => upd('servingLabel', e.target.value)}
              helperText="Describe what one serving is"
            />

            {/* Calories — prominent */}
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
              <label className="block text-sm font-bold text-orange-700 mb-2">
                Calories per serving *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0"
                  value={customForm.calories}
                  onChange={e => upd('calories', e.target.value)}
                  className={`input text-xl font-bold text-orange-700 bg-white w-28 ${customFormError.calories ? 'border-red-400' : ''}`}
                />
                <span className="text-sm font-semibold text-orange-600">kcal</span>
              </div>
              {customFormError.calories && (
                <p className="text-xs text-red-600 mt-1">{customFormError.calories}</p>
              )}
            </div>

            {/* Macros — optional */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Macros per serving <span className="text-xs font-normal text-gray-400">(optional)</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-blue-600">Protein (g)</label>
                  <input type="number" placeholder="0" value={customForm.protein}
                    onChange={e => upd('protein', e.target.value)} className="input" min={0} />
                </div>
                <div>
                  <label className="label text-amber-600">Carbs (g)</label>
                  <input type="number" placeholder="0" value={customForm.carbs}
                    onChange={e => upd('carbs', e.target.value)} className="input" min={0} />
                </div>
                <div>
                  <label className="label text-purple-600">Fat (g)</label>
                  <input type="number" placeholder="0" value={customForm.fat}
                    onChange={e => upd('fat', e.target.value)} className="input" min={0} />
                </div>
              </div>
            </div>

            {/* Junk toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">Mark as junk food</p>
                <p className="text-xs text-gray-500">Shows in junk food % breakdown</p>
              </div>
              <button
                onClick={() => upd('isJunk', !customForm.isJunk)}
                className={`relative w-11 h-6 rounded-full transition-colors ${customForm.isJunk ? 'bg-orange-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${customForm.isJunk ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Live preview */}
            {customForm.calories > 0 && (
              <MacroPreview
                calories={Number(customForm.calories) || 0}
                protein={Number(customForm.protein) || 0}
                carbs={Number(customForm.carbs) || 0}
                fat={Number(customForm.fat) || 0}
                label={customForm.name || 'Custom food'}
                servingLabel={customForm.servingLabel}
              />
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => { resetCustomForm(); setActiveTab(TABS.SEARCH) }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveCustomFood}>
                {editingCustomId ? 'Save changes' : 'Save to My Foods'}
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB: My saved foods ── */}
        {activeTab === TABS.MY_FOODS && (
          <div className="space-y-3">
            {customFoods.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-3">⭐</p>
                <p className="text-sm font-semibold text-gray-900">No custom foods yet</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Save home meals, branded products, or anything not in the database.</p>
                <button onClick={() => setActiveTab(TABS.CUSTOM)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl mx-auto">
                  <Plus className="w-4 h-4" /> Create custom food
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { resetCustomForm(); setActiveTab(TABS.CUSTOM) }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-teal-300 text-teal-600 text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors">
                  <Plus className="w-4 h-4" /> Add another custom food
                </button>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {customFoods.map(food => (
                    <div
                      key={food.id}
                      onClick={() => setSelectedCustom(selectedCustom?.id === food.id ? null : food)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedCustom?.id === food.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{food.servingLabel || '1 serving'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="font-bold text-orange-600">{food.calories} kcal</span>
                            {food.protein > 0 && <span className="text-blue-600">P:{food.protein}g</span>}
                            {food.carbs > 0 && <span className="text-amber-600">C:{food.carbs}g</span>}
                            {food.fat > 0 && <span className="text-purple-600">F:{food.fat}g</span>}
                            {food.isJunk && <Badge variant="orange">Junk</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={e => { e.stopPropagation(); startEditCustom(food) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteCustomFood(food.id) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCustom && (
                  <div className="border-t border-gray-100 pt-3 space-y-3">
                    <div>
                      <label className="label">Number of servings</label>
                      <div className="flex gap-2 items-center">
                        <input type="number" value={customQty} min={0.5} step={0.5}
                          onChange={e => setCustomQty(Math.max(0.5, Number(e.target.value)))}
                          className="input w-20" />
                        <div className="flex gap-1.5">
                          {[0.5, 1, 1.5, 2, 3].map(q => (
                            <button key={q} onClick={() => setCustomQty(q)}
                              className={`px-2 py-1.5 text-xs font-semibold rounded-lg border shrink-0 ${customQty === q ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}>
                              ×{q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <MacroPreview
                      calories={Math.round(selectedCustom.calories * customQty)}
                      protein={Math.round((selectedCustom.protein || 0) * customQty)}
                      carbs={Math.round((selectedCustom.carbs || 0) * customQty)}
                      fat={Math.round((selectedCustom.fat || 0) * customQty)}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button variant="secondary" className="flex-1" onClick={closeModal}>Cancel</Button>
                  <Button className="flex-1" onClick={addFromCustom} disabled={!selectedCustom}>
                    Add to log
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ── Manage custom foods sheet ───────────────────────────────── */}
      <Modal open={showManageCustom} onClose={() => setShowManageCustom(false)} title="My Custom Foods">
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {customFoods.map(food => (
            <div key={food.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{food.name}</p>
                <p className="text-xs text-gray-400">{food.servingLabel} · {food.calories} kcal</p>
              </div>
              <button onClick={() => startEditCustom(food)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCustomFood(food.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" onClick={() => { setShowManageCustom(false); setShowAdd(true); setActiveTab(TABS.CUSTOM) }}>
          <Plus className="w-4 h-4" /> Add new custom food
        </Button>
      </Modal>
    </Layout>
  )
}

// ── Shared macro preview strip ────────────────────────────────────────────────
function MacroPreview({ calories, protein, carbs, fat, label, servingLabel }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      {label && (
        <p className="text-xs font-semibold text-gray-600 mb-2">
          {label}{servingLabel ? ` · ${servingLabel}` : ''}
        </p>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: 'Calories', v: calories, c: 'text-orange-600' },
          { l: 'Protein', v: `${protein}g`, c: 'text-blue-600' },
          { l: 'Carbs', v: `${carbs}g`, c: 'text-amber-600' },
          { l: 'Fat', v: `${fat}g`, c: 'text-purple-600' },
        ].map(m => (
          <div key={m.l}>
            <p className={`text-base font-bold ${m.c}`}>{m.v}</p>
            <p className="text-xs text-gray-400">{m.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
