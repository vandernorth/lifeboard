# LifeBoard
A real-life live dashboard currently with the following data:

 - Tweakers.net - News Feed
 - Nu.nl        - News Feed
 - OpenPli      - Current Channel 
 - Ziggo (NL)   - Internet status
 - Google       - My location and shared locations (alpha)
 - Google       - Calendar & Tasks
 
 ## Collector 
 Docker-based runner:
 
 ``docker run -v /var/config:/config:ro -a stdin -a stdout -a stderr -ti collector``
 
 ### In development
 
 - INFO
     - p1 - electricity / gas
     - Weather - current
     - Weather - forecast
     - Bitcoin: Stockprive
     - Bitcoin: Bittrex
     - Bitcoin: Binance
     - Bitcoin: BL3P
     - Bunq - Last transactions
     - Bunq - Account info
     - Hue - Status / lights
     - << less important >>
       - WiFi/network - Clients
       - Spotify - Current track
       - AH - Orders
       - Front-door-bell
       - Scale / Weight / Fitbit / Health / Sleep
       - PostNL/DHL - Upcoming Mail and packages
       - Nest - Status (SmokeDetector)
       - Nest - Temperature
 - EVENTS
    - Bunq - New transactions
    - Google - Calendar reminder
    - Nest - Smoke
    - Change of (fenced) locations
        - Google - Notable location change
 - Intelligence
    - Time to home/work/nextCalendarlocation
 - ACTIONS
    - [hue] change lights
    - [spotify] change track / volume
    - [openpli] change channels / volume
    - [nest] change temprature