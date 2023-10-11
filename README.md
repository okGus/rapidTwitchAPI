### About
Unofficial Twitch API Web Scraper

## Docker Commands
I'm still new so these might be wrong\
docker build -t rapidapitwitch .\
If already build and you want to build again no cache\
docker build --no-cache -t rapidapitwitch .\
And to run\
docker run -d -p 8080:8080 rapidapitwitch\



## Four endpoints

/Homepage
- Live channels in homepage (small footprint)
- Url
- Channel name

/Categories
- Most popular categories by views
- Link
- Title
- Views

/Category/:catogoryId
- Live channels within a category
- Channel Name
- Title
- View count
- Link

/Channel/:chanelId
- Info about channel
- If they are live or not
- View count
- Title
- Category
- Time alive