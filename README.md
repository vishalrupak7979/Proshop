# ProShop

An online electronics store built with React, Express and MongoDB, with Stripe checkout.

## Setup

```bash
cd backend
npm ci
cp .env.example .env    # then fill in the values
npm run server          # http://localhost:5001

cd ../frontend
npm ci
echo "VITE_API_URL=http://localhost:5001" > .env
npm run dev             # http://localhost:5173
```

`npm run seed` adds sample data to an empty database, with accounts that use `SEED_PASSWORD`. It refuses to run if data already exists. `npm run seed:destroy` deletes everything, so never run it against a live database.

## Deploying

Set the variables from `backend/.env.example` on the host, with `NODE_ENV=production` and `FRONTEND_URL` set to the live site. On the frontend, set `VITE_API_URL` to the backend's address.

Password reset emails need a [Brevo](https://www.brevo.com) API key, with `EMAIL_FROM` set to a verified sender.

## Delivery

1. An admin adds delivery partners under **Partners**. Partners can't sign up themselves.
2. Customers pay by card or choose cash on delivery at checkout.
3. An admin assigns each order to a partner under **All orders**.
4. Partners sign in on the normal login page and work from **My deliveries**: picked up, out for delivery, then delivered, or failed with a reason. For cash orders they confirm the cash before marking delivered.
5. While an order is on its way, partners can share GPS or type a place. Customers see this on the order page, which refreshes by itself. GPS needs HTTPS, or localhost.

## Running the store

The left side menu is on every page and collapses to icons. Admins get an extra section with everything they need:

- **Products:** add, edit or delete products. Images are stored in MongoDB, because Render's disk is wiped on each deploy.
- **Festival offers:** percentage discounts on all products, categories or specific products, between two dates. The server applies them at checkout, and the biggest offer wins.
- **Promo codes:** percentage codes with an optional maximum discount, minimum order, usage limit and dates. Each customer can use a code once, and it comes off after any festival offer.
- **Advertisements:** banners on the home page, replacing the welcome banner while any are showing. Pick a ready-made sample banner or upload your own; wide images work best.
- **Send notification:** in-app messages to customers, partners or everyone. Order updates are sent automatically.

## Product details

Products can have extra photos, specifications and colours. Colours share one stock count, and the chosen colour is saved on the order. To add sample details to products that have none, run `npm run seed:details` in `backend`; anything already filled in is left alone.

## Returns and queries

Customers can return items from a delivered order for 7 days. An admin approves or declines the request, marks the items received, then refunds. Card orders refund through Stripe, and cash orders are recorded as manual refunds. Refunds match what was paid, so they take promo codes into account.

Customers can raise a query about an order, a product or anything else, and admins reply in a conversation under **Customer queries**.

## Shopper tools

- **Compare:** up to 4 of the store's products side by side, using the compare button on each product or the search on the Compare page.
- **Price calculator:** add products and quantities to see the total and savings with live offers, then add everything to the cart.

## Testing payments

With Stripe test keys, pay with card `4242 4242 4242 4242`, any future expiry date and any CVC.
