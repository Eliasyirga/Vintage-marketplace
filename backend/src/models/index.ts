/**
 * Central model registry.
 * Import models here to ensure they are registered with Sequelize
 * before any sync/query is performed.
 */
import User from './User'
import PendingRegistration from './PendingRegistration'
import PasswordReset from './PasswordReset'
import Category from './Category'
import Listing from './Listing'
import ListingImage from './ListingImage'
import SellerProfile from './SellerProfile'
import Favorite from './Favorite'
import RecentlyViewed from './RecentlyViewed'
import Conversation from './Conversation'
import ConversationParticipant from './ConversationParticipant'
import Message from './Message'
import UserBlock from './UserBlock'
import Review from './Review'
import Report from './Report'
import UserVerification from './UserVerification'
import AdminAuditLog from './AdminAuditLog'
import UserInteraction from './UserInteraction'
import RecommendationEvent from './RecommendationEvent'

// ── Monetization & Transaction Models ───────────────────────────────────────
import Plan from './Plan'
import Payment from './Payment'
import Entitlement from './Entitlement'
import BusinessProfile from './BusinessProfile'
import Subscription from './Subscription'
import Advertisement from './Advertisement'
import AdvertisementEvent from './AdvertisementEvent'
import Transaction from './Transaction'
import DeliveryOrder from './DeliveryOrder'

// ── E-Commerce Order & Fulfillment Models ───────────────────────────────────
import Order from './Order'
import OrderEvent from './OrderEvent'
import MeetingOrder from './MeetingOrder'
import Notification from './Notification'

// ── Core & Profile Associations ─────────────────────────────────────────────

User.hasOne(SellerProfile, { foreignKey: 'user_id', as: 'sellerProfile' })
SellerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasOne(BusinessProfile, { foreignKey: 'user_id', as: 'businessProfile' })
BusinessProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasMany(Listing, { foreignKey: 'seller_id', as: 'listings' })
Listing.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' })

Category.hasMany(Listing, { foreignKey: 'category_id', as: 'listings' })
Listing.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })

Listing.hasMany(ListingImage, { foreignKey: 'listing_id', as: 'images' })
ListingImage.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

// ── Buyer Features Associations ──────────────────────────────────────────────

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' })
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Listing.hasMany(Favorite, { foreignKey: 'listing_id', as: 'favorites' })
Favorite.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

User.hasMany(RecentlyViewed, { foreignKey: 'user_id', as: 'recentlyViewed' })
RecentlyViewed.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Listing.hasMany(RecentlyViewed, {
  foreignKey: 'listing_id',
  as: 'recentlyViewed',
})
RecentlyViewed.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

User.hasMany(Conversation, {
  foreignKey: 'buyer_id',
  as: 'buyerConversations',
})
Conversation.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' })

User.hasMany(Conversation, {
  foreignKey: 'seller_id',
  as: 'sellerConversations',
})
Conversation.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' })

Listing.hasMany(Conversation, {
  foreignKey: 'listing_id',
  as: 'conversations',
})
Conversation.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages',
})
Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
})

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' })
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' })

// ── Conversation Participant Associations ───────────────────────────────────

Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversation_id',
  as: 'participants',
})
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
})

User.hasMany(ConversationParticipant, {
  foreignKey: 'user_id',
  as: 'conversationParticipants',
})
ConversationParticipant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// ── User Blocking Associations ──────────────────────────────────────────────

User.hasMany(UserBlock, { foreignKey: 'blocker_id', as: 'blockedUsers' })
UserBlock.belongsTo(User, { foreignKey: 'blocker_id', as: 'blocker' })

User.hasMany(UserBlock, { foreignKey: 'blocked_user_id', as: 'blockedByUsers' })
UserBlock.belongsTo(User, { foreignKey: 'blocked_user_id', as: 'blockedUser' })

// ── Trust & Safety Associations ───────────────────────────────────────────────

User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'writtenReviews' })
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' })

User.hasMany(Review, { foreignKey: 'seller_id', as: 'receivedReviews' })
Review.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' })

Listing.hasMany(Review, { foreignKey: 'listing_id', as: 'reviews' })
Review.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

User.hasMany(Report, { foreignKey: 'reporter_id', as: 'filedReports' })
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' })

User.hasMany(UserVerification, { foreignKey: 'user_id', as: 'verifications' })
UserVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasMany(AdminAuditLog, { foreignKey: 'admin_id', as: 'auditLogs' })
AdminAuditLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' })

// ── Analytics & Recommendation Associations ───────────────────────────────────

User.hasMany(UserInteraction, { foreignKey: 'user_id', as: 'interactions' })
UserInteraction.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Listing.hasMany(UserInteraction, {
  foreignKey: 'listing_id',
  as: 'interactions',
})
UserInteraction.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

User.hasMany(RecommendationEvent, {
  foreignKey: 'user_id',
  as: 'recommendationEvents',
})
RecommendationEvent.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Listing.hasMany(RecommendationEvent, {
  foreignKey: 'listing_id',
  as: 'recommendationEvents',
})
RecommendationEvent.belongsTo(Listing, {
  foreignKey: 'listing_id',
  as: 'listing',
})

// ── Monetization & Payment Associations ───────────────────────────────────────

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' })
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Payment.hasMany(Entitlement, { foreignKey: 'payment_id', as: 'entitlements' })
Entitlement.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

User.hasMany(Entitlement, { foreignKey: 'user_id', as: 'entitlements' })
Entitlement.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Listing.hasMany(Entitlement, { foreignKey: 'listing_id', as: 'entitlements' })
Entitlement.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

Plan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'subscriptions' })
Subscription.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' })

User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' })
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Payment.hasOne(Subscription, { foreignKey: 'payment_id', as: 'subscription' })
Subscription.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

User.hasMany(Advertisement, { foreignKey: 'advertiser_id', as: 'advertisements' })
Advertisement.belongsTo(User, { foreignKey: 'advertiser_id', as: 'advertiser' })

User.hasMany(Advertisement, { foreignKey: 'reviewed_by', as: 'reviewedAdvertisements' })
Advertisement.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' })

Plan.hasMany(Advertisement, { foreignKey: 'plan_id', as: 'advertisements' })
Advertisement.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' })

Payment.hasOne(Advertisement, { foreignKey: 'payment_id', as: 'advertisement' })
Advertisement.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

// ── Advertisement Event Associations ─────────────────────────────────────────

Advertisement.hasMany(AdvertisementEvent, {
  foreignKey: 'advertisement_id',
  as: 'events',
})
AdvertisementEvent.belongsTo(Advertisement, {
  foreignKey: 'advertisement_id',
  as: 'advertisement',
})

User.hasMany(AdvertisementEvent, { foreignKey: 'user_id', as: 'adEvents' })
AdvertisementEvent.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Payment.hasOne(UserVerification, { foreignKey: 'payment_id', as: 'verification' })
UserVerification.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

// ── Transaction & Scaffolding Associations ────────────────────────────────────

User.hasMany(Transaction, { foreignKey: 'buyer_id', as: 'buyerTransactions' })
Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' })

User.hasMany(Transaction, { foreignKey: 'seller_id', as: 'sellerTransactions' })
Transaction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' })

Listing.hasMany(Transaction, { foreignKey: 'listing_id', as: 'transactions' })
Transaction.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

Payment.hasOne(Transaction, { foreignKey: 'payment_id', as: 'transaction' })
Transaction.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

// ── E-Commerce Order Associations ─────────────────────────────────────────────

User.hasMany(Order, { foreignKey: 'buyer_id', as: 'buyerOrders' })
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' })

User.hasMany(Order, { foreignKey: 'seller_id', as: 'sellerOrders' })
Order.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' })

Listing.hasMany(Order, { foreignKey: 'listing_id', as: 'orders' })
Order.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' })

Order.hasOne(DeliveryOrder, { foreignKey: 'order_id', as: 'delivery' })
DeliveryOrder.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })

Order.hasOne(MeetingOrder, { foreignKey: 'order_id', as: 'meeting' })
MeetingOrder.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })

Order.hasMany(OrderEvent, { foreignKey: 'order_id', as: 'events' })
OrderEvent.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })

OrderEvent.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' })

// Payment ↔ Order: direct link for order-payment queries
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'orderPayments' })
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })

// ── Notifications ─────────────────────────────────────────────────────────────

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'passwordResets' })
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

export {
  User,
  PendingRegistration,
  Category,
  Listing,
  ListingImage,
  SellerProfile,
  Favorite,
  RecentlyViewed,
  Conversation,
  ConversationParticipant,
  Message,
  UserBlock,
  Review,
  Report,
  UserVerification,
  AdminAuditLog,
  UserInteraction,
  RecommendationEvent,
  Plan,
  Payment,
  Entitlement,
  BusinessProfile,
  Subscription,
  Advertisement,
  AdvertisementEvent,
  Transaction,
  DeliveryOrder,
  Order,
  OrderEvent,
  MeetingOrder,
  Notification,
  PasswordReset,
}
