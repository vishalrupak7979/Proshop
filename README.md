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

## Testing payments

With Stripe test keys, pay with card `4242 4242 4242 4242`, any future expiry date and any CVC.
