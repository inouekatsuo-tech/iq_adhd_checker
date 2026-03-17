import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(key);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'ADHD×IQ診断テスト 結果閲覧',
              description: 'あなたのADHDスコアとIQ推定値を確認できます',
            },
            unit_amount: 200,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/result?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/gate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
