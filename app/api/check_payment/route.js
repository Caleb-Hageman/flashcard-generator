// pages/api/checkPaymentStatus.js

import { getAuth } from "@clerk/nextjs/server";
import { stripe } from "../../../utils/get-stripe";  // Ensure you have initialized Stripe

export default async function handler(req, res) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Assuming you store Stripe customer ID in user metadata
        const user = await clerkClient.users.getUser(userId);
        const stripeCustomerId = user.privateMetadata.stripeCustomerId;

        if (!stripeCustomerId) {
            return res.status(404).json({ error: "Stripe customer ID not found" });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'all',
            expand: ['data.default_payment_method'],
        });

        const isPaid = subscriptions.data.some(
            (subscription) => subscription.status === 'active'
        );

        return res.status(200).json({ isPaid });
    } catch (error) {
        console.error("Error fetching payment status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
