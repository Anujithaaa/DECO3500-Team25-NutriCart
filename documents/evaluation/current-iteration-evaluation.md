**NutriCart: Current Iteration Evaluation**

# 1. Focus of this iteration

This newest iteration of NutriCart moves further away from the original
idea of making healthy shopping more social. The focus is now on a more
practical problem: how people in a share house organise meals, grocery
requests, budgets and shopping when they are not always together.

The current prototype connects a shared Home Hub with detachable Cart
Units. The Hub is used for planning at home, while the Cart Unit takes
the same household information into the supermarket. The aim of this
iteration is to see whether that connection can cut down on repeated
messages, forgotten requests and duplicate purchases without making
housemates interact more than they actually want to.

# 2. What informed this iteration

Earlier interviews and prototype feedback showed us that people organise
groceries in very different ways. Some shop together, some shop alone,
some care most about price, and others care more about brands, nutrition
or convenience. Because of that, the design needed to support
coordination without assuming every household works the same way.

| **Finding from earlier research**                       | **Response in the newest iteration**                                                                                        |
|---------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Housemates often shop at different times.               | Shared lists and requests can be updated before the shopper leaves and checked later in the store.                          |
| People use different priorities when choosing products. | Compare shows price and available product information side by side without calling one product the universal “best” choice. |
| Budget changes between shopping trips.                  | The current shop keeps a running budget and lets the current shelf price be different from a saved reference price.         |
| Extra social features were not always useful.           | The social side now comes from doing the household task together through meals, shared lists, requests and Split Shop.      |
| Some items need exact preferences while others do not.  | A list item can stay simple, or it can be linked to an exact scanned product when that detail actually matters.             |

# 3. What the current iteration brings together

| **Part of the prototype**  | **Role in this iteration**                                                                                            |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Home Hub                   | A shared starting point for meal ideas, the shopping list, requests, budget and what is already at home.              |
| Meals + shared list        | Connects deciding what to cook with the actual items that need to be bought.                                          |
| Requests + Already at Home | Carries useful household context into the shop, especially when the shopper was not part of the earlier conversation. |
| Cart Unit + Compare        | Takes the shared plan into the store and supports quick price or product decisions while shopping.                    |
| Split Shop                 | Lets two shoppers divide responsibility while still working from the same household task.                             |

# 4. What testing showed about this iteration

Two small group sessions gave us a more critical view of app-v2. Group 1
tested the Home Hub and Cart Unit with two housemates swapping roles,
while Group 2 tested the screens in the participants’ own shared home.
The two groups did not react in exactly the same way, which was useful
because it showed where the idea makes sense and where it still feels
like extra work.

| **Testing theme**                  | **What participants said or did**                                                                                                                                                         | **What it means for the iteration**                                                                                                              |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Navigation and first use           | Both groups found the interface hard to understand at first. Group 1 described it as “too many steps”, while Group 2 also said the navigation was not very friendly for first-time users. | The next version needs a clearer starting point, fewer steps and stronger labels before adding more functions.                                   |
| Compare, price and budget          | Compare was liked in both groups. Group 1 especially liked the remaining budget, and Group 2 highlighted comparison and seeing prices in one place.                                       | These are some of the clearest practical benefits and should stay central to the Cart Unit.                                                      |
| Meals                              | Group 1 liked the meal ideas when housemates were indecisive about what to cook.                                                                                                          | Meal planning is more useful when it feeds straight into the shopping list instead of sitting as a separate recipe feature.                      |
| Requests and “Already at Home”     | Group 1 often felt these could just be replaced by a message or would be too tedious to maintain. Group 2 saw more value in avoiding duplicate purchases and sharing suggestions.         | These features should stay optional and lightweight. They should save a message, not create another system people have to constantly maintain.   |
| Split Shop and social value        | Group 1 questioned whether splitting shoppers apart actually made the experience more social. Group 2 saw Split Shop as useful.                                                           | Split Shop should be presented as optional coordination for larger shared trips, not as proof that the product is automatically social.          |
| Dedicated device vs existing tools | Group 1 repeatedly compared NutriCart with group chats, Notes and existing grocery apps. Group 2 said it was worth trying if it saved a meaningful amount of time or money.               | The prototype has to prove value beyond being “another grocery app”. Features that do not clearly reduce effort should be simplified or removed. |

The biggest takeaway from these sessions is that the concept cannot rely
on novelty. People were only willing to accept a shared household system
when it gave them something clearly better than sending a message or
writing a quick list. That makes saving time, keeping track of money and
carrying useful household information into the shop more important than
adding extra social features.

# 5. How the newest iteration should respond

| **Issue raised in testing**                 | **Iteration response**                                                                                                                                                   |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Too many steps / confusing navigation       | Reduce the number of screens needed for the main journey. Make Plan → Start Shop → Shop → Finish obvious, with clearer first-use guidance.                               |
| Feels like another Notes list or group chat | Prioritise things that are harder to do in a normal message, such as live shared status, a running budget, product comparison and the meal-to-list connection.           |
| Requests can feel like another group chat   | Keep requests short and tied directly to the shopping context. They should be optional rather than another communication channel people are forced to use.               |
| Already at Home may become tedious          | Use it where it can realistically stop duplicate purchases. Do not expect users to maintain a detailed household inventory all the time.                                 |
| Split Shop purpose is unclear               | Make the two-device workflow easier to understand and explain that it is mainly for dividing a larger shared shop, not separating people on every trip.                  |
| LED feedback was not valued                 | Do not make the LED a major feature. Participants preferred feedback they would actually notice, such as clear on-screen information or a simple sound/chime.            |
| Store and price source were unclear         | Clearly label whether a price is a saved reference price, a current shelf price or linked to a particular store. Do not make a saved value look like live retailer data. |

# 6. How the wider peer feedback fits

The class feedback was generally more positive about the overall idea
than Group 1, but it brought up many of the same usability issues.
Reviewers understood the link between the Home Hub and Cart Units and
repeatedly picked out the shared list, meal planning, budget and Split
Shop as the strongest parts. They also wanted clearer onboarding, better
real-time synchronisation, stronger privacy boundaries and more reliable
barcode scanning.

Taken together, the class feedback and the group testing suggest that
the direction is understandable, but the full journey still needs to
feel clearer. The most useful next iteration is not one with more
features. It is one where the features already there feel connected,
quick and dependable.

# 7. What this iteration still needs to resolve

- Participation may become uneven if one housemate ends up maintaining
  most of the shared information.

- Food preferences, requests and spending can feel personal, so shared
  and private information need clearer boundaries.

- Product and nutrition data can be incomplete. Missing values should be
  shown as unavailable rather than estimated.

- Scanner performance depends on camera quality, lighting and network
  access, so failed scans need to be easy to recover from.

- The physical Hub and Cart Units still need to prove that they save
  enough effort to justify using dedicated devices instead of a phone,
  Notes or a group chat.

# 8. What should be tested next

The next evaluation should follow one complete two-person journey from
the household to the store instead of testing screens on their own. Two
participants could plan a meal, build a shared list, start the shop,
split part of the list, respond to a change during the trip, compare a
product and then return to the Hub. The main thing to watch is where
they hesitate, when they fall back to messaging, whether both people
stay aware of changes and whether the system actually saves time or
avoids duplicated work.

It would also be useful to compare close friends with housemates who do
not know each other as well. This would help test whether NutriCart can
support both active collaboration and lower-pressure practical
coordination without assuming every household wants the same level of
social interaction.

# 9. Iteration reflection

This iteration gives NutriCart a clearer purpose than the earlier
healthy-shopping concept. The strongest parts are the features that
directly connect planning and shopping: the shared list, meal planning,
budget awareness, comparison and the Home Hub to Cart Unit handover. The
testing also showed that some features can quickly feel like extra work
if they do not save time.

The next version should therefore be judged less by how many functions
it has and more by whether the main journey is quicker and easier than
the tools housemates already use. If NutriCart can make a shared shop
easier to organise without forcing extra communication, then the social
value comes from supporting the household task itself.
