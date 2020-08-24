**Problem:**
1. In the midst of a global pandemic, finding methods to safely pursue favorite activities is more important than ever. Since most major cities in the US have gone into lockdown, the NYT has listed dining as a top 5 missed activity to promote normalcy! The current safest ways to “eat out” are outdoor dining and takeout. Unfortunately, the methods to check if a restaurant has outdoor seating available and if the weather conditions are good are difficult.
1. Prompted by the CA wildfires, the Air Quality Index was also built into this app. To know whether it is safe and healthy to breathe the outdoor air will better inform a decision on whether to dine outside.

**Solution:**
This app will allow users to locate local restaurants by food type or name, check if they have outdoor dining available at the location, and also provide a local weather forecast so one knows what to wear and can otherwise prepare appropriately.

**front end**
1. user searches for type of food or name of food establishment in city; the past ten searches will populate the left column
1. returned restaurants and local weather and air conditions for the area will appear in center and right columns
1. user may click into each returned restaurant result and view a modal with more information on that restaurant
1. UI is mobile ready and can fit various screen sizes in an aesthetically pleasing way

**back end**
1. used the following APIs: OpenWeather, Zomato, Air Quality Open Data Platform
1. used the following libraries: Moments, MD Bootstrap
1. localStorage saves recent searches

[DINE OUTSIDE: CLICK HERE FOR DEPLOYED APP](https://baytamo.github.io/Project1/)

**Contributors**
- [Bermond Batistiana](https://github.com/berjonbatistiana)
- [Rachael Martinez](https://github.com/baytamo)
- [Son Nguyen](https://github.com/sotrnguy92)
- [Brandon Scott](https://github.com/Bscott95)


![Dine Outside app](images/deployedapp.gif)
![Dine Outside mobile app](images/mobileapp.gif)