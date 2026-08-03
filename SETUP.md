# Connecting the CMS

The site runs without this. Out of the box it renders three demo case studies,
so you can install, start it, and see the finished design immediately:

```
npm install
npm run dev
```

Follow the steps below when you want to edit that content yourself. It takes
about twenty minutes and you only do it once.

---

## What you are setting up

Case studies are stored in **Sanity**, a hosted CMS with a free tier. The
editing interface is not a separate site — it is served from this project at
`/studio`, so it deploys with everything else and can never fall out of step
with the code.

The fields you will see there are defined in `sanity/schema.ts`. They already
exist; nothing about the schema needs importing or configuring.

---

## 1. Create a Sanity account

Go to [sanity.io](https://www.sanity.io) and sign up. Google or GitHub is
fastest. The free plan is enough for this site.

## 2. Create a project

In the terminal, from this folder:

```
npx sanity login
npx sanity init --create-project "Your Site Name" --dataset production
```

When it asks whether to add configuration files, say **no** — this project
already has them.

Note the **project ID** it prints. It looks like `7k3n2p9x`. You can find it
again any time at [sanity.io/manage](https://www.sanity.io/manage).

## 3. Add the project ID

```
cp .env.example .env.local
```

Open `.env.local` and set:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
```

## 4. Allow your site to talk to Sanity

Sanity rejects requests from domains it does not know. Add yours:

```
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://your-live-domain.com --credentials
```

**If you skip this step the Studio will load and then fail on every request,**
with an error that does not mention CORS. It is the most common thing to get
wrong.

## 5. Load the demo content

Your new project is empty. This copies the three demo case studies into it so
you have something to edit rather than a blank screen.

Create a token at [sanity.io/manage](https://www.sanity.io/manage) → your
project → **API** → **Tokens** → **Add API token**, with **Editor**
permissions. Put it in `.env.local`:

```
SANITY_WRITE_TOKEN=your-token
```

Then:

```
npm run seed
```

Delete the token from `.env.local` afterwards. It is only needed for this step,
and the site never reads it.

## 6. Open the Studio

```
npm run dev
```

Go to <http://localhost:3000/studio>. Your case studies are there. Edit one,
press **Publish**, and the change appears on the site.

## 7. Deploying

Set the same two variables in your hosting provider's environment settings:

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
```

A local `.env.local` file is not uploaded, so missing this is why a site works
on your machine and shows demo content once deployed.

---

## Editing case studies

At `/studio`, **Case Study** in the sidebar. Each one has:

| Field | Notes |
| --- | --- |
| **Title** | The headline on the card. Keep it under about 90 characters. |
| **URL** | Generated from the title. Press *Generate* if it is blank. |
| **Client name** | Shown at the top left of the card. |
| **Year** | Four digits. Appears in the chip at the top right. |
| **Summary** | Two lines. Over ~140 characters it starts pushing the stats down. |
| **Stats** | Exactly four — they sit in a 2×2 grid. Keep values short: `13.2x`, `42%`, `$80K+`. |
| **Panel colour** | The tint behind the text half. |
| **Screenshot** | The product shot. Drag the hotspot to set what stays visible when it crops. |
| **Order** | Lowest first. Only the first three show on the home page. |

Changes appear on the live site within a minute of publishing.

---

## If something is wrong

**The site shows demo case studies after I set everything up.**
The project ID is missing or wrong in the environment. On a deployed site,
check the host's environment variables, not `.env.local`.

**`/studio` says the CMS is not connected.**
`NEXT_PUBLIC_SANITY_PROJECT_ID` is not set. Restart the dev server after
editing `.env.local` — environment variables are read at startup.

**The Studio loads but everything fails, or logging in loops.**
Step 4. Add the exact origin you are visiting, including `http://` or
`https://` and the port.

**`npm run seed` says the dataset does not exist.**
```
npx sanity dataset create production
```

**I want to start over.**
Deleting the documents in the Studio is enough; `npm run seed` can be run again
at any time. It replaces the demo entries rather than duplicating them.
