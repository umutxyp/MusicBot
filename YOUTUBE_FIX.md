# YouTube Bot Detection Error Fix

## What's the Problem?

Some users may encounter this error message:

```
ERROR: [youtube] Sign in to confirm you're not a bot. 
Use --cookies-from-browser or --cookies for the authentication.
```

This error occurs due to YouTube's bot protection blocking yt-dlp. YouTube may detect requests from certain IPs or during heavy usage as bot activity and require cookie authentication.

## Solution Methods

### Method 1: Using Browser Cookies (Recommended)

This is the easiest method with automatic updates.

1. Open your `.env` file
2. Add one of the following lines based on your browser:

```env
# If you use Chrome
COOKIES_FROM_BROWSER=chrome

# If you use Firefox
COOKIES_FROM_BROWSER=firefox

# If you use Edge
COOKIES_FROM_BROWSER=edge

# If you use Safari (Mac)
COOKIES_FROM_BROWSER=safari
```

3. Make sure you're logged into YouTube in the specified browser
4. Restart the bot

**Important:** For this method, you need to be logged into YouTube in the specified browser. The bot will automatically extract cookies from your browser.

### Method 2: Using cookies.txt File

This method is more manual but can be more reliable in some cases.

#### Step 1: Install Cookie Export Extension

**For Chrome/Edge:**
1. Install [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) extension

**For Firefox:**
1. Install [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/) extension

#### Step 2: Export Cookies

1. Log in to YouTube (with any Google account)
2. While on YouTube.com, click the extension
3. Click "Export" or "Download" button
4. Download the `cookies.txt` file

#### Step 3: Place File in Bot Folder

1. Copy the downloaded `cookies.txt` file to the bot's root directory (where index.js is located)

#### Step 4: Update .env File

Add this to your `.env` file:

```env
COOKIES_FILE=./cookies.txt
```

#### Step 5: Restart the Bot

```bash
npm start
```

## Which Method Should I Use?

| Method | Advantages | Disadvantages |
|--------|-----------|---------------|
| **Browser Cookies (Method 1)** | ✅ Auto-updates<br>✅ Easy setup<br>✅ No file management | ❌ Must be logged in browser<br>❌ May have issues when browser is closed |
| **cookies.txt (Method 2)** | ✅ More reliable<br>✅ Works on servers<br>✅ Works even if browser is closed | ❌ Requires manual updates<br>❌ Cookies may expire (need regeneration) |

### Recommendations:

- **Running on personal computer:** Method 1 (Browser Cookies)
- **Running on VPS/Server:** Method 2 (cookies.txt file)

## Verification

After completing the setup, test your bot:

```bash
npm start
```

Then try playing music in Discord:
```
/play Despacito
```

## If the Problem Persists

If the error continues:

1. ✅ Make sure you're logged into YouTube
2. ✅ Clear browser cookies and log in again
3. ✅ Try a different browser
4. ✅ Regenerate the cookies.txt file
5. ✅ Completely stop and restart the bot

## Security Note

⚠️ **IMPORTANT:** 
- Your `cookies.txt` file contains your YouTube session data
- Never share this file with anyone
- Make sure `cookies.txt` is added to `.gitignore`
- Do not upload the file to GitHub

## Help

If your issue persists:
- [Discord Support Server](https://discord.gg/ACJQzJuckW) - Live support
- [GitHub Issues](https://github.com/umutxyp/musicbot/issues) - Bug reports

---

**Note:** Cookies may expire periodically (usually 1-2 months). If you see the error again, you may need to re-export the cookies.
