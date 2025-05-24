import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ENV } from '@/utils/env';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(ENV.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}; 