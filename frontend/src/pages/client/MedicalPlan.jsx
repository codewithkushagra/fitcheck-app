import { Shield, AlertTriangle, CheckCircle, XCircle, Stethoscope, Lock, Zap } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const medicalData = {
  diabetes: {
    condition: 'Type 2 Diabetes',
    exercises: [
      { name: 'Brisk Walking', benefit: 'Improves insulin sensitivity, lowers blood sugar' },
      { name: 'Resistance Training', benefit: 'Increases glucose uptake by muscles' },
      { name: 'Swimming', benefit: 'Low-impact cardio, safe for diabetics' },
      { name: 'Yoga', benefit: 'Reduces stress hormones that spike blood sugar' },
    ],
    eatFoods: [
      { name: 'Leafy greens', reason: 'Low glycemic, high in magnesium' },
      { name: 'Whole grains (oats, quinoa)', reason: 'Slow-release carbs' },
      { name: 'Beans & Lentils', reason: 'High fiber, low GI protein' },
      { name: 'Fatty fish', reason: 'Omega-3s improve insulin resistance' },
      { name: 'Greek yogurt', reason: 'Probiotic benefits for blood sugar' },
    ],
    avoidFoods: [
      { name: 'White bread & white rice', reason: 'High GI — rapid blood sugar spike' },
      { name: 'Sugary beverages', reason: 'Immediate glucose spike' },
      { name: 'Processed snacks', reason: 'Trans fats worsen insulin resistance' },
      { name: 'Full-fat dairy', reason: 'Saturated fat can impair glucose metabolism' },
    ],
  },
}

export default function MedicalPlan() {
  const { user } = useAuthStore()
  const isPremium = user?.subscription === 'premium'
  const data = medicalData.diabetes // Demo: show diabetes plan

  if (!isPremium) {
    return (
      <Layout title="Medical Plan">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            Your personalised medical condition plan is a Premium feature.
            Upgrade to unlock condition-specific exercise and nutrition guidance.
          </p>
          <Button onClick={() => toast.success('Upgrade flow coming soon!')}>
            <Zap className="w-4 h-4" />
            Upgrade to Premium
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Medical Plan">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Medical Plan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Condition-specific guidance for your fitness journey.</p>
          </div>
          <Badge variant="teal">⚡ Premium</Badge>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Medical Disclaimer</p>
            <p className="text-sm text-amber-700 mt-0.5">
              This plan provides general fitness guidance based on your reported condition. It is not a medical prescription.
              Always consult your doctor or a registered healthcare professional before making changes to your exercise or diet programme.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Condition card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{data.condition}</p>
                <p className="text-xs text-gray-500">Your reported condition</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => toast.success('Condition settings coming soon!')}>
              Update conditions
            </Button>
          </div>

          {/* Approved exercises */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Approved Exercises
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {data.exercises.map(ex => (
                <div key={ex.name} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{ex.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Foods to eat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Recommended Foods
            </h2>
            <div className="space-y-3">
              {data.eatFoods.map(food => (
                <div key={food.name} className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                    <p className="text-xs text-gray-500">{food.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Foods to avoid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Foods to Avoid
            </h2>
            <div className="space-y-3">
              {data.avoidFoods.map(food => (
                <div key={food.name} className="flex items-start gap-3">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                    <p className="text-xs text-gray-500">{food.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
