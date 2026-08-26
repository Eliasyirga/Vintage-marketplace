import { env } from '../../config/env'
import type { PaymentProviderName } from '../../types/monetization.types'
import type { PaymentProvider } from './PaymentProvider'
import { ChapaPaymentProvider } from './ChapaPaymentProvider'
import { MockPaymentProvider } from './MockPaymentProvider'

export function getPaymentProvider(providerName?: PaymentProviderName): PaymentProvider {
  if (providerName === 'MOCK') {
    return new MockPaymentProvider()
  }

  // Chapa is the official payment provider for Vintage Marketplace
  if (providerName === 'CHAPA' || !providerName) {
    if (env.CHAPA_SECRET_KEY) {
      return new ChapaPaymentProvider()
    }
    console.warn('⚠️ [Payment] CHAPA_SECRET_KEY not configured. Falling back to MockPaymentProvider.')
    return new MockPaymentProvider()
  }

  return new ChapaPaymentProvider()
}

