import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const response = await axios.post(
    "/api/payment/stripe/create-payment-intent",
    {
        orderId
    },
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

const clientSecret =
    response.data.clientSecret;

const { error } =
    await stripe.confirmCardPayment(
        clientSecret,
        {
            payment_method: {
                card: cardElement
            }
        }
    );