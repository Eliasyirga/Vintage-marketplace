import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as transactionController from '../controllers/transaction.controller'

const router = Router()

router.post('/', requireAuth, transactionController.createTransaction)
router.get('/buyer', requireAuth, transactionController.getBuyerTransactions)
router.get('/seller', requireAuth, transactionController.getSellerTransactions)

export default router
