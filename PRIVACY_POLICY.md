# Privacy Policy

_Last updated: October 2, 2025_

This Privacy Policy explains how the MusicMaker Discord bot ("the Bot") created by **umutxyp** collects, uses, and protects information when you invite and interact with the Bot on your Discord server.

By adding the Bot to your server or interacting with it, you agree to the practices outlined below. If you do not agree with this Privacy Policy, please remove the Bot from your server.

## 1. Information We Collect

The Bot aims to collect the minimum amount of data necessary to provide its music playback and localization features.

| Data Category | Purpose | Storage | Retention |
| ------------- | ------- | ------- | --------- |
| Discord **Guild (Server) ID** | Identifies the server to store language preferences. | Stored locally in `database/languages.json`. | Retained until you request deletion or remove the Bot for 30+ days. |
| **Language preference** per server | Delivers responses in the preferred language. | Stored locally alongside the server ID. | Retained until you request deletion or remove the Bot. |
| **Command metadata** (ephemeral) | Processes your `/play`, `/help`, and other commands. | Handled in memory only; not saved after the command completes. | Not retained. |

The Bot **does not** collect personal messages, media, or any other personal data. Voice channel audio is streamed directly from the requested source and is not recorded or stored.

## 2. Legal Bases for Processing (EEA/UK Users)

For users located in the European Economic Area or the United Kingdom, the Bot processes data on the basis of **legitimate interest** (providing bot functionality) and **consent** (your voluntary use of the Bot).

## 3. How We Use the Information

We use the limited information collected to:

- Remember the preferred language for each Discord server.
- Execute music playback and queue management commands.
- Diagnose technical issues and ensure the Bot functions reliably.

We do not sell, rent, or share your information with third parties for marketing purposes.

## 4. Third-Party Services

The Bot interacts with the following services solely to fulfill user requests:

- **Discord API** for command handling and permissions.
- **YouTube**, **Spotify**, and **SoundCloud** APIs or public endpoints to search for and stream requested tracks.

When you request content from these services, their respective privacy policies may apply. The Bot does not transmit your personal data to these services beyond what is required by Discord for the request.

## 5. Data Security

- Configuration secrets (Discord token, Spotify credentials) are stored using environment variables and are not persisted in the code repository.
- The language preference database is stored on the host machine running the Bot. Access is restricted to the Bot operator.
- No end-user personal data is intentionally stored.

Despite taking reasonable precautions, no system is completely secure. If you believe your data has been compromised, please contact us immediately (see Section 8).

## 6. Data Retention and Deletion

- Language preferences are retained while the Bot remains active on your server.
- If the Bot is removed from your server for more than 30 days, the associated server ID and language preference may be deleted during routine maintenance.
- You may request deletion of your server data at any time (see Section 8). Requests will be honored within 30 days.

## 7. Children’s Privacy

The Bot is intended for use by Discord users aged 13 or older, in line with Discord’s Terms of Service. We do not knowingly collect information from users under 13. If you believe we have data from a child under 13, contact us for removal.

## 8. Your Rights and Contact Information

Depending on your location, you may have rights to access, correct, or delete your data. To exercise these rights or ask questions about this Privacy Policy, please contact:

- **Support Server:** [https://discord.gg/ACJQzJuckW](https://discord.gg/ACJQzJuckW)

Please provide your Discord server ID when submitting a request so we can locate your data.

## 9. Changes to This Policy

We may update this Privacy Policy to reflect changes to the Bot or applicable laws. We will post the updated policy in the GitHub repository and, when practical, announce the update in the support server. The "Last updated" date at the top of this page indicates the current version.

By continuing to use the Bot after changes become effective, you agree to the revised policy.
