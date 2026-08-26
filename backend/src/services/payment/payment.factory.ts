import { env } from '../../config/env'
import type { PaymentProviderName } from '../../types/monetization.types'
import type { PaymentProvider } from './PaymentProvider'
import { ChapaPaymentProvider } from './ChapaPaymentProvider'
import { MockPaymentProvider } from './MockPaymentProvider'

export function getPaymentProvider(providerName?: PaymentProviderName): PaymentProvider {
  // Chapa is the official payment provider for Vintage Marketplace
  if (providerName === 'CHAPA' || !providerName) {
    if (env.CHAPA_SECRET_KEY) {
      return new ChapaPaymentProvider()
    }
    if (env.isDevelopment) {
      console.warn('⚠️ [Payment] CHAPA_SECRET_KEY not set in dev. Using MockPaymentProvider fallback.')
      return new MockPaymentProvider()
    }
    return new ChapaPaymentProvider()
  }

  // Developer sandbox mode only
  if (providerName === 'MOCK' && env.isDevelopment) {
    return new MockPaymentProvider()
  }

  return new ChapaPaymentProvider()
}

