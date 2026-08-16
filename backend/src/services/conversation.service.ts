import {
  Conversation,
  Message,
  User,
  Listing,
  ListingImage,
  SellerProfile,
} from "../models";
import { sequelize } from "../config/database";
import { Op } from "sequelize";
import { trackInteraction } from "./interaction.service";

const userAttributes = [
  "id",
  "full_name",
  "avatar_url",
  "is_email_verified",
  "is_phone_verified",
  "is_fayda_verified",
  "is_face_verified",
];

export interface SafeConversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt: Date;
  createdAt: Date;
  listing: {
    id: string;
    title: string;
    price: number;
    status: string;
    image: string | null;
  };
  otherParty: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    displayName?: string | null;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    isRead: boolean;
    createdAt: Date;
  } | null;
}

export async function getOrCreateConversation(
  buyerId: string,
  listingId: string,
  sellerId: string,
  initialMessage?: string,
): Promise<{ conversation: Conversation; isNew: boolean }> {
  if (buyerId === sellerId) {
    throw Object.assign(
      new Error("You cannot message yourself about your own listing."),
      {
        statusCode: 400,
      },
    );
  }

  const listing = await Listing.findByPk(listingId);
  if (!listing) {
    throw Object.assign(new Error("Listing not found."), { statusCode: 404 });
  }

  const seller = await User.findByPk(sellerId);
  if (!seller) {
    throw Object.assign(new Error("Seller not found."), { statusCode: 404 });
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    where: { listing_id: listingId, buyer_id: buyerId },
  });

  let isNew = false;

  if (!conversation) {
    isNew = true;
    conversation = await sequelize.transaction(async (transaction) => {
      const conv = await Conversation.create(
        {
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message_at: new Date(),
        },
        { transaction },
      );

      if (initialMessage && initialMessage.trim()) {
        await Message.create(
          {
            conversation_id: conv.id,
            sender_id: buyerId,
            content: initialMessage.trim(),
            is_read: false,
          },
          { transaction },
        );
      }

      return conv;
    });
    // Increment listing contact_count when a new conversation is created
    try {
      await listing.increment("contact_count");
    } catch {
      // non-fatal
    }
  } else if (initialMessage && initialMessage.trim()) {
    await Message.create({
      conversation_id: conversation.id,
      sender_id: buyerId,
      content: initialMessage.trim(),
      is_read: false,
    });
    conversation.last_message_at = new Date();
    await conversation.save();
  }

  trackInteraction(buyerId, "CONTACT", listingId);

  return { conversation, isNew };
}

export async function getUserConversations(
  userId: string,
): Promise<SafeConversation[]> {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ buyer_id: userId }, { seller_id: userId }],
    },
    include: [
      {
        model: Listing,
        as: "listing",
        attributes: ["id", "title", "price", "status"],
        include: [
          {
            model: ListingImage,
            as: "images",
            attributes: ["url", "sort_order"],
          },
        ],
        paranoid: false,
      },
      {
        model: User,
        as: "buyer",
        attributes: userAttributes,
        include: [
          {
            model: SellerProfile,
            as: "sellerProfile",
            attributes: ["display_name", "profile_image"],
          },
        ],
      },
      {
        model: User,
        as: "seller",
        attributes: userAttributes,
        include: [
          {
            model: SellerProfile,
            as: "sellerProfile",
            attributes: ["display_name", "profile_image"],
          },
        ],
      },
      {
        model: Message,
        as: "messages",
        limit: 1,
        order: [["created_at", "DESC"]],
      },
    ],
    order: [["last_message_at", "DESC"]],
  });

  return conversations.map((conv) => {
    const isBuyer = conv.buyer_id === userId;
    const otherUser = isBuyer
      ? (conv as Conversation & { seller?: User }).seller
      : (conv as Conversation & { buyer?: User }).buyer;

    const listing = (conv as Conversation & { listing?: Listing }).listing;
    const images =
      (listing as Listing & { images?: ListingImage[] })?.images ?? [];
    const sortedImages = images
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
    const coverImage = sortedImages[0]?.url ?? null;

    const otherProfile = (otherUser as User & { sellerProfile?: SellerProfile })
      ?.sellerProfile;
    const lastMsg = (conv as Conversation & { messages?: Message[] })
      ?.messages?.[0];

    return {
      id: conv.id,
      listingId: conv.listing_id,
      buyerId: conv.buyer_id,
      sellerId: conv.seller_id,
      lastMessageAt: conv.last_message_at,
      createdAt: conv.created_at,
      listing: {
        id: listing?.id ?? conv.listing_id,
        title: listing?.title ?? "Listing",
        price: listing ? Number(listing.price) : 0,
        status: listing?.status ?? "ACTIVE",
        image: coverImage,
      },
      otherParty: {
        id: otherUser?.id ?? "",
        fullName: otherUser?.full_name ?? "User",
        avatarUrl: otherProfile?.profile_image ?? otherUser?.avatar_url ?? null,
        displayName: otherProfile?.display_name ?? null,
      },
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            senderId: lastMsg.sender_id,
            isRead: lastMsg.is_read,
            createdAt: lastMsg.created_at,
          }
        : null,
    };
  });
}

export async function getConversationDetails(
  conversationId: string,
  userId: string,
) {
  const conv = await Conversation.findByPk(conversationId, {
    include: [
      {
        model: Listing,
        as: "listing",
        attributes: ["id", "title", "price", "status", "city", "condition"],
        include: [
          {
            model: ListingImage,
            as: "images",
            attributes: ["url", "sort_order"],
          },
        ],
        paranoid: false,
      },
      {
        model: User,
        as: "buyer",
        attributes: userAttributes,
      },
      {
        model: User,
        as: "seller",
        attributes: userAttributes,
      },
      {
        model: Message,
        as: "messages",
        order: [["created_at", "ASC"]],
      },
    ],
  });

  if (!conv) {
    throw Object.assign(new Error("Conversation not found."), {
      statusCode: 404,
    });
  }

  if (conv.buyer_id !== userId && conv.seller_id !== userId) {
    throw Object.assign(
      new Error("You do not have permission to view this conversation."),
      {
        statusCode: 403,
      },
    );
  }

  // Mark messages from other user as read
  await Message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conv.id,
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    },
  );

  return conv;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
) {
  if (!content || !content.trim()) {
    throw Object.assign(new Error("Message content cannot be empty."), {
      statusCode: 400,
    });
  }

  const conv = await Conversation.findByPk(conversationId);
  if (!conv) {
    throw Object.assign(new Error("Conversation not found."), {
      statusCode: 404,
    });
  }

  if (conv.buyer_id !== senderId && conv.seller_id !== senderId) {
    throw Object.assign(
      new Error(
        "You do not have permission to send messages in this conversation.",
      ),
      {
        statusCode: 403,
      },
    );
  }

  const message = await Message.create({
    conversation_id: conv.id,
    sender_id: senderId,
    content: content.trim(),
    is_read: false,
  });

  conv.last_message_at = new Date();
  await conv.save();

  return message;
}
