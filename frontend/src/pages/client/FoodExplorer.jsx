import { useState } from 'react'
import { Search, ChevronRight, Info, Minus, Plus } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { mockFoodDatabase, mockClientProfile } from '../../api/mockData'

const categories = ['All', 'Fruits', 'Proteins', 'Carbohydrates', 'Vegetables', 'Fats']

export default function FoodExplorer() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(100)

  const goal = mockClientProfile.goal

  const filtered = mockFoodDatabase.filter(f => {
    const matchCat = category === 'All' || f.category === category
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const getTagVariant = (tag) => {
    if (tag === 'eat') return 'green'
    if (tag === 'avoid') return 'red'
    return 'yellow'
  }

  const getTagLabel = (tag) => {
    if (tag === 'eat') return '✓ Recommended'
    if (tag === 'avoid') return '✗ Avoid'
    return '~ Limit'
  }

  const calcMacro = (val) => Math.round(val * qty / 100)

  return (
    <Layout title="Food Explorer">
      <div className="space-y-5 animate-fade-in">
        <div>
          <h1 className="page-title">Food Explorer</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse benefits and calculate macros for any food.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-xl border transition-all ${
                category === cat ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Input
          placeholder="Search foods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          leftIcon={Search}
          className="max-w-md"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Food list */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(food => {
                const tag = food.goalTags[goal] || 'eat'
                const isSelected = selected?.id === food.id
                return (
                  <button
                    key={food.id}
                    onClick={() => { setSelected(food); setQty(100) }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all hover:shadow-sm ${
                      isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-400">{food.category}</p>
                      </div>
                      <Badge variant={getTagVariant(tag)}>{getTagLabel(tag)}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">{food.benefits}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="font-semibold text-orange-600">{food.per100g.calories} kcal</span>
                      <span>P: {food.per100g.protein}g</span>
                      <span>C: {food.per100g.carbs}g</span>
                      <span>F: {food.per100g.fat}g</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">No foods found matching "{search}"</p>
              </div>
            )}
          </div>

          {/* Calculator panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" />
                Macro Calculator
              </h2>
              {selected ? (
                <div>
                  <div className="p-3 bg-gray-50 rounded-xl mb-4">
                    <p className="font-semibold text-gray-900">{selected.name}</p>
                    <Badge variant={getTagVariant(selected.goalTags[goal])} className="mt-1">
                      {getTagLabel(selected.goalTags[goal])}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">{selected.benefits}</p>
                  </div>

                  <div className="mb-4">
                    <label className="label">Serving size (g)</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty(q => Math.max(10, q - 10))}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={qty}
                        onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="input text-center w-20"
                      />
                      <button
                        onClick={() => setQty(q => q + 10)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[25, 50, 100, 150, 200].map(q => (
                        <button
                          key={q}
                          onClick={() => setQty(q)}
                          className={`px-2 py-1 text-xs rounded-lg border ${qty === q ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}
                        >
                          {q}g
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: 'Calories', value: calcMacro(selected.per100g.calories), unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Protein', value: calcMacro(selected.per100g.protein), unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Carbs', value: calcMacro(selected.per100g.carbs), unit: 'g', color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Fat', value: calcMacro(selected.per100g.fat), unit: 'g', color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'Fibre', value: calcMacro(selected.per100g.fiber || 0), unit: 'g', color: 'text-green-600', bg: 'bg-green-50' },
                    ].map(m => (
                      <div key={m.label} className={`flex items-center justify-between px-3 py-2 rounded-xl ${m.bg}`}>
                        <span className="text-xs font-medium text-gray-600">{m.label}</span>
                        <span className={`text-sm font-bold ${m.color}`}>{m.value}{m.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">Select a food to calculate macros.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
