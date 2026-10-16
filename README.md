# Nam Son Restaurant

A responsive React + Vite restaurant website with a read-only Google Sheets CMS. No admin passwords, database, or service account credentials need to be stored in the website. Owners edit their spreadsheet using Google's own access controls.

## Run

Node.js 20.19+ recommended.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Deploy the generated `dist` directory to any static website host. The site works without a connected spreadsheet, using clearly labelled sample content.

## Connect Google Sheets

1. Create a Google spreadsheet with two tabs: **Menu** and **Settings**.
2. Import `public/menu-template.csv` into Menu and `public/settings-template.csv` into Settings, replacing each tab's contents. Preserve the column headings.
3. Review the sample dishes with the owners. Add confirmed prices (including the currency symbol, e.g. `$18.50`), availability, descriptions and direct HTTPS image URLs for photos you own or are licensed to use.
4. In Google Sheets choose **File → Share → Publish to web**. Select the Menu tab and **Comma-separated values (.csv)**, then publish and copy its URL. Repeat for Settings. Enable automatic republishing when changes are made.
5. Copy `.env.example` to `.env.local`. Set `VITE_MENU_CSV_URL` and `VITE_SETTINGS_CSV_URL` to the corresponding published CSV URLs. Restart the dev server; for deployment set the same build environment variables and rebuild once.
6. Share edit access with the owners using their Google accounts. They update cells; changes appear on the next website load after Google's publishing cache refreshes (which can take several minutes). Normal content edits do not require rebuilding.

**Privacy:** Published sheet tabs are publicly readable. Use a dedicated spreadsheet containing only public restaurant content; never publish customer details, credentials, financial records or other private data. The URLs are embedded in the public build by design. Keep edit sharing restricted; publishing is not the same as granting edit access.

### Menu fields

- `id`: stable dish identifier.
- `name`, `category`: required; categories automatically become filter buttons.
- `vietnamese`, `description`: optional text.
- `price`: display text, including currency symbol; leave blank if unconfirmed.
- `image`: optional public HTTPS URL. Images without valid URLs get a neutral placeholder.
- `tag`: short featured-card label.
- `featured`: `true` to show in the three-card featured section (first three in spreadsheet order).
- `available`: `false` to hide the dish. All other values show it.

### Settings fields

The Settings tab uses `key,value` columns. Supported keys are `name`, `headline`, `intro`, `address`, `hours`, `phone`, `story`, `uber`, `doordash`, `facebook`. Headline and hours support line breaks inside cells. Leave phone empty until confirmed. Delivery and social URLs must be HTTPS. Unknown keys are ignored.

### Failure behaviour and migration

Menu and settings load independently. A missing or unreachable menu feed uses labelled sample dishes, never invented prices. A valid menu with no available rows shows an empty state. Settings default independently if unavailable. No content is written back to Google Sheets. Spreadsheet values are rendered as text, not HTML.

`src/content.js` is the CMS adapter: parsing, validation, defaults and loading are separated from UI rendering. To switch CMS later, replace `loadContent` with another provider returning the same `{settings, menu, isSample}` shape. No visual redesign is required.

## Before launch

- Confirm address, cuisine, all dishes, prices, opening hours and telephone with the owners. Public listings suggest Chinese and Vietnamese cuisine at 51D Windsor Avenue, Springvale. Phone and opening hours were deliberately not invented.
- The initial menu is a selection derived from the supplied restaurant directory, not a verified full menu. Uber Eats blocked automated access; the DoorDash excerpt confirms Chinese and Vietnamese cuisine.
- Photography is illustrative Unsplash imagery, not photos of Nam Son's actual food. Replace with owner-approved photos before launch. Stock images are visibly labelled as illustrative; missing photos have neutral backgrounds. Fonts load from Google Fonts and photographs from Unsplash, so those services receive ordinary browser requests.
- Order buttons go to the supplied Uber Eats and DoorDash listings; no fake checkout or reservation form is included.
- The location panel is a clearly labelled illustration, not a geographic map. Directions opens Google Maps using the editable address.
- Verify the published Sheets URLs on the production host and test real owner edits. This project cannot create or publish an owner's Google spreadsheet without their account access.

## Sources

- https://namsonrestaurant.restaurants-us.com/
- https://www.facebook.com/namsonchineserestaurant/
- https://www.ubereats.com/au/store/nam-son-1/uMROu96STk-tSNy9Ji5oIg
- https://www.doordash.com/en-AU/store/nam-son-restaurant-springvale-1280093/1841660/
