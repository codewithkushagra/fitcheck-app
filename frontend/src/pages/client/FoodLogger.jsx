import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Trash2, Star, X, ChevronDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { MacroRingChart, FoodTypeChart, MacroBreakdownBar } from '../../components/charts/MacroRing'
import { mockFoodDatabase } from '../../api/mockData'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import useAuthStore from '../../store/authStore'

// ─── Custom food store (localStorage only — not in backend schema) ─────────────
function loadCustomFoods() {
  try { return JSON.parse(localStorage.getItem('fitcheck_custom_foods') || '[]') } catch { return [] }
}
function saveCustomFoods(foods) {
  localStorage.setItem('fitcheck_custom_foods', JSON.stringify(foods))
}

const EMPTY_CUSTOM = { name: '', calories: '', protein: '', carbs: '', fat: '', isJunk: false }
const TABS = { SEARCH: 'search', CUSTOM: 'custom', MY_FOODS: 'my_foods' }

// Default macro targets (used if no profile loaded)
const DEFAULT_TARGETS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export default function FoodLogger() {
  const { user } = useAuthStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [targets, setTargets] = useState(DEFAULT_TARGETS)

  // Modal state
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState(TABS.SEARCH)

  // Search tab
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [qty, setQty] = useState(100)

  // Custom food
  const [customFoods, setCustomFoods] = useState(loadCustomFoods)
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM)
  const [customFormError, setCustomFormError] = useState({})
  const [editingCustomId, setEditingCustomId] = useState(null)
  const [selectedCustom, setSelectedCustom] = useState(null)
  const [customQty, setCustomQty] = useState(1)

  // ── Load food logs for selected date
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/food/logs?date=${selectedDate}`)
      setLog(res.data || [])
    } catch {
      setLog([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // ── Load client profile for macro targets
  useEffect(() => {
    api.get('/clients/profile').then(res => {
      if (res.data?.macroTargets) setTargets(res.data.macroTargets)
    }).catch(() => {})
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // ── Totals
  const totals = log.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.proteinG || item.protein || 0),
    carbs: acc.carbs + (item.carbsG || item.carbs || 0),
    fat: acc.fat + (item.fatG || item.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  const junkCals = log.filter(i => i.isJunk).reduce((a, i) => a + (i.calories || 0), 0)
  const healthyCals = totals.calories - junkCals

  // ── Filtered DB results
  const filteredDB = mockFoodDatabase.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20)
  const filteredCustomInSearch = customFoods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Add from DB
  const addFromDB = async () => {
    if (!selectedFood) return
    const factor = qty / 100
    try {
      await api.post('/food/logs', {
        date: selectedDate,
        foodName: `${selectedFood.name} (${qty}g)`,
        servingSize: qty,
        calories: Math.round(selectedFood.per100g.calories * factor),
        proteinG: Math.round(selectedFood.per100g.protein * factor),
        carbsG: Math.round(selectedFood.per100g.carbs * factor),
        fatG: Math.round(selectedFood.per100g.fat * factor),
        isJunk: false,
      })
      toast.success(`${selectedFood.name} added!`)
      setSelectedFood(null); setQty(100); setSearch('')
      setShowAdd(false)
      fetchLogs()
    } catch { toast.error('Failed to add food') }
  }

  // ── Add custom food from My Foods tab
  const addCustomToLog = async () => {
    if (!selectedCustom) return
    try {
      await api.post('/food/logs', {
        date: selectedDate,
        foodName: `${selectedCustom.name} (${customQty}x)`,
        servingSize: customQty,
        calories: Math.round(selectedCustom.calories * customQty),
        proteinG: Math.round(selectedCustom.protein * customQty),
        carbsG: Math.round(selectedCustom.carbs * customQty),
        fatG: Math.round(selectedCustom.fat * customQty),
        isJunk: selectedCustom.isJunk,
      })
      toast.success(`${selectedCustom.name} added!`)
      setSelectedCustom(null); setCustomQty(1)
      setShowAdd(false)
      fetchLogs()
    } catch { toast.error('Failed to add food') }
  }

  // ── Delete log entry
  const deleteLog = async (id) => {
    try {
      await api.delete(`/food/logs/${id}`)
      setLog(prev => prev.filter(i => i.id !== id))
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  // ── Custom food form validation + save
  const validateCustomForm = () => {
    const errs = {}
    if (!customForm.name.trim()) errs.name = 'Name required'
    if (!customForm.calories || isNaN(Number(customForm.calories)) || Number(customForm.calories) < 0) errs.calories = 'Enter valid calories'
    if (customForm.protein !== '' && isNaN(Number(customForm.protein))) errs.protein = 'Invalid'
    if (customForm.carbs !== '' && isNaN(Number(customForm.carbs))) errs.carbs = 'Invalid'
    if (customForm.fat !== '' && isNaN(Number(customForm.fat))) errs.fat = 'Invalid'
    return errs
  }

  const saveCustomFood = () => {
    const errs = validateCustomForm()
    if (Object.keys(errs).length) { setCustomFormError(errs); return }
    const food = {
      id: editingCustomId || `custom_${Date.now()}`,
      name: customForm.name.trim(),
      calories: Number(customForm.calories),
      protein: Number(customForm.protein) || 0,
      carbs: Number(customForm.carbs) || 0,
      fat: Number(customForm.fat) || 0,
      isJunk: customForm.isJunk,
    }
    const updated = editingCustomId
      ? customFoods.map(f => f.id === editingCustomId ? food : f)
      : [...customFoods, food]
    setCustomFoods(updated)
    saveCustomFoods(updated)
    toast.success(editingCustomId ? 'Food updated' : 'Custom food saved!')
    setCustomForm(EMPTY_CUSTOM); setCustomFormError({}); setEditingCustomId(null)
    setActiveTab(TABS.MY_FOODS)
  }

  const deleteCustomFood = (id) => {
    const updated = customFoods.filter(f => f.id !== id)
    setCustomFoods(updated); saveCustomFoods(updated)
    if (selectedCustom?.id === id) setSelectedCustom(null)
    toast.success('Removed')
  }

  const openEditCustom = (food) => {
    setCustomForm({ name: food.name, calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fat: String(food.fat), isJunk: food.isJunk })
    setEditingCustomId(food.id)
    setActiveTab(TABS.CUSTOM)
  }

  const openAddModal = () => {
    setShowAdd(true); setActiveTab(TABS.SEARCH)
    setSearch(''); setSelectedFood(null); setQty(100)
    setSelectedCustom(null); setCustomQty(1)
    setCustomForm(EMPTY_CUSTOM); setCustomFormError({}); setEditingCustomId(null)
  }

  // ── Macro preview for custom food form
  const previewMacros = {
    cal: Number(customForm.calories) || 0,
    protein: Number(customForm.protein) || 0,
    carbs: Number(customForm.carbs) || 0,
    fat: Number(customForm.fat) || 0,
  }

  return (
    <Layout title="Food Log">
      <div className="space-y-4 animate-fade-in">

        {/* Header + Date */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Food Log</h1>
            <p className="text-xs text-gray-500 mt-0.5">{format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMM d')}</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Macro overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <MacroRingChart calories={totals.calories} target={targets.calories} size={80} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">{Math.round(totals.calories)} kcal</span>
                <span className="text-xs text-gray-400">of {targets.calories}</span>
              </div>
              <MacroBreakdownBar protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
              <div className="flex gap-3 mt-2 text-[10px] font-medium">
                <span className="text-blue-600">P {Math.round(totals.protein)}g</span>
                <span className="text-amber-500">C {Math.round(totals.carbs)}g</span>
                <span className="text-rose-500">F {Math.round(totals.fat)}g</span>
              </div>
            </div>
          </div>
          {totals.calories > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <FoodTypeChart healthy={healthyCals} junk={junkCals} />
            </div>
          )}
        </div>

        {/* Add food button */}
        <button
          onClick={openAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-teal-300 text-teal-600 font-semibold text-sm bg-teal-50/50 active:bg-teal-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Food
          {customFoods.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold">
              {customFoods.length} custom
            </span>
          )}
        </button>

        {/* Log list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Today's Log</h2>
            <span className="text-xs text-gray-400">{log.length} items</span>
          </div>
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 mt-2">Loading...</p>
            </div>
          ) : log.length === 0 ? (
            <div className="py-10 text-center px-4">
              <span className="text-3xl">🥗</span>
              <p className="text-sm font-semibold text-gray-900 mt-2">Nothing logged yet</p>
              <p className="text-xs text-gray-400 mt-1">Tap "Add Food" to start tracking</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {log.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.foodName || item.name}</p>
                      {item.isJunk && <Badge variant="red" className="text-[10px] shrink-0">Junk</Badge>}
                    </div>
                    <div className="flex gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                      <span className="font-semibold text-gray-700">{item.calories} kcal</span>
                      <span>P {item.proteinG ?? item.protein ?? 0}g</span>
                      <span>C {item.carbsG ?? item.carbs ?? 0}g</span>
                      <span>F {item.fatG ?? item.fat ?? 0}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLog(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Food Modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Food">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          {[
            { key: TABS.SEARCH, label: 'Search' },
            { key: TABS.CUSTOM, label: editingCustomId ? 'Edit' : 'Create' },
            { key: TABS.MY_FOODS, label: `My Foods${customFoods.length ? ` (${customFoods.length})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.key ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SEARCH TAB ── */}
        {activeTab === TABS.SEARCH && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                placeholder="Search food…"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedFood(null) }}
                autoFocus
              />
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1 -mx-1 px-1">
              {/* Custom foods in search */}
              {filteredCustomInSearch.map(f => (
                <button key={f.id} onClick={() => { setSelectedFood({ ...f, per100g: { calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat } }); setQty(1) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selectedFood?.id === f.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'}`}>
                  <Star className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-[11px] text-gray-400">Custom · {f.calories} kcal</p>
                  </div>
                </button>
              ))}
              {/* DB foods */}
              {filteredDB.map(f => (
                <button key={f.id} onClick={() => setSelectedFood(f)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${selectedFood?.id === f.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                    <p className="text-[11px] text-gray-400">{f.category} · {f.per100g.calories} kcal/100g</p>
                  </div>
                </button>
              ))}
              {filteredDB.length === 0 && filteredCustomInSearch.length === 0 && search && (
                <p className="text-sm text-gray-400 text-center py-6">No results for "{search}"</p>
              )}
            </div>

            {selectedFood && (
              <div className="bg-teal-50 rounded-xl p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-900">{selectedFood.name}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1" max="2000"
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
                  />
                  <span className="text-xs text-gray-500">g / serving</span>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-bold text-teal-700">{Math.round((selectedFood.per100g?.calories || selectedFood.calories) * qty / 100)} kcal</p>
                    <p className="text-[11px] text-gray-500">P{Math.round((selectedFood.per100g?.protein || selectedFood.protein) * qty / 100)} C{Math.round((selectedFood.per100g?.carbs || selectedFood.carbs) * qty / 100)} F{Math.round((selectedFood.per100g?.fat || selectedFood.fat) * qty / 100)}</p>
                  </div>
                </div>
                <Button onClick={addFromDB} className="w-full" size="sm">Add to Log</Button>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOM FOOD FORM TAB ── */}
        {activeTab === TABS.CUSTOM && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{editingCustomId ? 'Edit your custom food' : 'Create a reusable custom food item'}</p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Food Name *</label>
              <input
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${customFormError.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                placeholder="e.g. Home Roti, Daal Rice"
                value={customForm.name}
                onChange={e => { setCustomForm(p => ({ ...p, name: e.target.value })); setCustomFormError(p => ({ ...p, name: '' })) }}
              />
              {customFormError.name && <p className="text-xs text-red-500 mt-1">{customFormError.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Calories (per serving) *</label>
              <input type="number" min="0"
                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${customFormError.calories ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                placeholder="e.g. 350"
                value={customForm.calories}
                onChange={e => { setCustomForm(p => ({ ...p, calories: e.target.value })); setCustomFormError(p => ({ ...p, calories: '' })) }}
              />
              {customFormError.calories && <p className="text-xs text-red-500 mt-1">{customFormError.calories}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['protein', 'carbs', 'fat'].map(macro => (
                <div key={macro}>
                  <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{macro} (g)</label>
                  <input type="number" min="0"
                    className={`w-full px-2 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-center ${customFormError[macro] ? 'border-red-400' : 'border-gray-200 bg-gray-50'}`}
                    placeholder="0"
                    value={customForm[macro]}
                    onChange={e => { setCustomForm(p => ({ ...p, [macro]: e.target.value })); setCustomFormError(p => ({ ...p, [macro]: '' })) }}
                  />
                </div>
              ))}
            </div>

            {/* Macro preview */}
            {(previewMacros.cal > 0) && (
              <div className="bg-gray-50 rounded-xl p-2.5 flex justify-between text-xs text-gray-600">
                <span className="font-bold text-gray-900">{previewMacros.cal} kcal</span>
                <span className="text-blue-600">P {previewMacros.protein}g</span>
                <span className="text-amber-500">C {previewMacros.carbs}g</span>
                <span className="text-rose-500">F {previewMacros.fat}g</span>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <div
                onClick={() => setCustomForm(p => ({ ...p, isJunk: !p.isJunk }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${customForm.isJunk ? 'bg-red-400' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${customForm.isJunk ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-gray-700">Mark as junk food</span>
            </label>

            <div className="flex gap-2">
              {editingCustomId && (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setCustomForm(EMPTY_CUSTOM); setEditingCustomId(null); setCustomFormError({}) }}>Cancel</Button>
              )}
              <Button onClick={saveCustomFood} size="sm" className="flex-1">
                {editingCustomId ? 'Update Food' : 'Save Food'}
              </Button>
            </div>
          </div>
        )}

        {/* ── MY FOODS TAB ── */}
        {activeTab === TABS.MY_FOODS && (
          <div className="space-y-3">
            {customFoods.length === 0 ? (
              <div className="py-8 text-center">
                <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No custom foods yet</p>
                <p className="text-xs text-gray-400 mt-1">Create one in the "Create" tab</p>
                <button onClick={() => setActiveTab(TABS.CUSTOM)} className="mt-3 text-xs text-teal-600 font-medium underline">Create custom food</button>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto space-y-1 -mx-1 px-1">
                  {customFoods.map(f => (
                    <div key={f.id}
                      onClick={() => setSelectedCustom(selectedCustom?.id === f.id ? null : f)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${selectedCustom?.id === f.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <Star className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                        <p className="text-[11px] text-gray-400">{f.calories} kcal · P{f.protein} C{f.carbs} F{f.fat}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={e => { e.stopPropagation(); openEditCustom(f) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-teal-100 text-teal-600">
                          <span className="text-xs">✏️</span>
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteCustomFood(f.id) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCustom && (
                  <div className="bg-teal-50 rounded-xl p-3 space-y-2 border border-teal-200">
                    <p className="text-xs font-semibold text-teal-700">{selectedCustom.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 shrink-0">Servings:</span>
                      <input type="number" min="0.5" step="0.5"
                        value={customQty}
                        onChange={e => setCustomQty(parseFloat(e.target.value) || 1)}
                        className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="ml-auto text-right">
                        <p className="text-sm font-bold text-teal-700">{Math.round(selectedCustom.calories * customQty)} kcal</p>
                      </div>
                    </div>
                    <Button onClick={addCustomToLog} size="sm" className="w-full">Add to Log</Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
