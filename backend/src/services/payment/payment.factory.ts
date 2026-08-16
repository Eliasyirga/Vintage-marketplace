import type { PaymentProviderName } from '../../types/monetization.types'
import type { PaymentProvider } from './PaymentProvider'
import { MockPaymentProvider } from './MockPaymentProvider'
import { ChapaPaymentProvider } from './ChapaPaymentProvider'
import { TelebirrPaymentProvider } from './TelebirrPaymentProvider'

export function getPaymentProvider(providerName: PaymentProviderName): PaymentProvider {
  switch (providerName) {
    case 'CHAPA':
      if (process.env.CHAPA_SECRET_KEY) {
        return new ChapaPaymentProvider()
      }
      console.warn('⚠️ CHAPA_SECRET_KEY not set. Using MockPaymentProvider fallback for testing.')
      return new MockPaymentProvider()

    case 'TELEBIRR':
      if (process.env.TELEBIRR_APP_ID && process.env.TELEBIRR_APP_KEY) {
        return new TelebirrPaymentProvider()
      }
      console.warn('⚠️ TELEBIRR credentials not set. Using MockPaymentProvider fallback for testing.')
      return new MockPaymentProvider()

    case 'MOCK':
    default:
      return new MockPaymentProvider()
  }
}
