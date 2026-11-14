# HYBRID CINEMAS

Black-and-gold movie catalogue starter for Telugu, Hindi and Tamil titles.

## Files
- `index.html` — public movie catalogue with search and language filters
- `admin.html` — browser-only demo admin interface
- `styles.css` — responsive styling
- `app.js` and `admin.js` — front-end behaviour

## Publish with GitHub Pages
1. Open the repository **Settings** tab.
2. Select **Pages** in the sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main**, folder **/(root)**, then press **Save**.
5. Wait for publishing. GitHub will show the live website URL in the Pages section.

## Important limitations
This is a front-end prototype, not a production streaming platform. The admin password is visible in `admin.js`, and movie records are stored in the current browser's localStorage only. They are not shared between visitors or devices, and the login is not secure. Before public production use, replace it with server-side authentication, a database and secure media hosting.

Only publish films you own, verified public-domain films, or films for which you have written distribution/streaming permission. The sample catalogue entries are placeholders.