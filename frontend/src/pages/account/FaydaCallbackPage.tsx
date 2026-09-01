import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FaydaCallbackPage() {
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const isVerified = searchParams.get('faydaVerified') === 'true'
    const error = searchParams.get('error')

    async function handleResult() {
      if (isVerified) {
        setStatus('success')
        await refreshUser()
        toast.success('Fayda identity verification successful! Your profile is now verified.')
        setTimeout(() => {
          navigate('/account/verification', { replace: true })
        }, 2000)
      } else {
        setStatus('error')
        const msg = error ? decodeURIComponent(error) : 'Fayda verification was not completed.'
        setErrorMessage(msg)
        toast.error(msg)
        setTimeout(() => {
          navigate('/account/verification', { replace: true })
        }, 3000)
      }
    }

    handleResult()
  }, [searchParams, refreshUser, navigate])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Processing Fayda Verification</h2>
            <p className="text-sm text-stone-500">
              Connecting with National ID provider and securing your profile status...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Fayda Verification Complete!</h2>
            <p className="text-sm text-stone-600">
              Your Ethiopian National Digital ID has been successfully verified. Redirecting to your verification center...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Verification Could Not Be Completed</h2>
            <p className="text-sm text-stone-600">
              {errorMessage || 'Unable to complete identity verification with Fayda.'}
            </p>
            <p className="text-xs text-stone-400">
              Redirecting back to verification center...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
