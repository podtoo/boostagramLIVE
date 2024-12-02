# Boostagram.LIVE
Boostagram, is an open-source tool that will allow your fans to send boosts to your show. Our goal is to create boostagram live to be a standalone app, that can accept voice &amp; video messages as well as text messages.

Demo/Development Site: https://Boostagram.live (coming soon)

# Powered by L402 & SecureRSS
Boostagram.live software utilises the L402.org idea, &amp; SecureRSS by PodToo to allow users to boost a podcast.

# Development Stack
This software uses the following software/plugins, note that this may change as development goes.

- noSQL (MongoDB Atlas - FREE VERSION)
- nostr+connect (to connect to your wallet)
- NextJS (to make development fast - but might be swapped later)
- MUI (Simple UI interface)
- Docker (we will provide a Dockerfile to make spinning it up easy)

# TO DO LIST
## Basic features
- [ ] Settings Page
- [ ] Set suggested amount for min-boost (based on boost type)
- [ ] Set boost to private or public
- [ ] Public Boost JSON (for anyone to see all boost or query any boost)
- [ ] Admin UI
- [ ] Support for audio messages (Will need AWS/GCS)
- [ ] Support for video messages (Will need AWS/GCS)
- [ ] Interactive Audio Alerts for boosts (allows you to set different audio sounds depending on type &amp; / or amount of boostagram)


## Social Plugins 
- [ ] nostr-tools (npm package)
- [ ] oAuth (for Mastodon servers)
