# NutriCart: Current Iteration Evaluation

*Written by James Olbes after the Week 12 group tests and the tradeshow. Sources: [G-01](G-01.md), [G-02](G-02.md), [tradeshow feedback](tradeshow-feedback.md).*

## 1. Focus of this iteration

This iteration moves further away from the original idea of making healthy shopping more social. The focus is now on a more practical problem: how people in a share house coordinate meals, grocery requests, budgets and shopping when they may not always be together.

The current prototype connects a shared Home Hub with detachable Cart Units. The Hub supports planning at home, while the Cart Unit carries the same household information into the supermarket. The aim of this iteration is to test whether that connection can reduce repeated messages, forgotten requests and duplicated purchases, without forcing housemates to interact more than they want to.

## 2. What informed this iteration

Earlier interviews and prototype feedback showed that people organise groceries in very different ways. Some shop together and some shop alone. Some care most about price, and others care more about brands, nutrition or convenience. The design therefore needed to support coordination without assuming that every household behaves the same way.

| Finding from earlier research | Response in the newest iteration |
|---|---|
| Housemates often shop at different times. | Shared lists and requests can be updated before the shopper leaves and checked later in the store. |
| People use different priorities when choosing products. | Comparison shows price and available product information side by side, without declaring one universal "best" product. |
| Budget changes between shopping trips. | The current shop keeps a running budget, and a current shelf price can differ from a saved reference price. |
| Extra social features were not always useful. | The social focus now comes from doing the household task together: meals, shared lists, requests and Split Shop. |
| Some items need exact preferences while others do not. | A list entry can stay simple, or be linked to an exact scanned product when that level of detail matters. |

## 3. What the current iteration brings together

| Part of the prototype | Role in this iteration |
|---|---|
| Home Hub | A shared starting point for meal ideas, the shopping list, requests, the budget and what is already at home. |
| Meals + shared list | Connects deciding what to cook with the items that need to be bought. |
| Requests + already at home | Carries household context into the shop, especially when the shopper was not part of the earlier conversation. |
| Cart Unit + Compare | Takes the shared plan into the store and supports quick price or product decisions while shopping. |
| Split Shop | Lets two shoppers divide responsibility while still working from the same household task. |

## 4. What testing showed about this iteration

Two small group sessions gave a more critical view of app-v2. G-01 tested the Home Hub and Cart Unit with two housemates swapping roles, and G-02 tested the screens in the participants' own shared home. The two sessions did not produce the same reaction. That is useful, because it shows where the concept is convincing and where it still feels like extra work.

| Testing theme | What participants said or did | What it means for the iteration |
|---|---|---|
| Navigation and first use | Both sessions found the interface difficult to understand at first. G-01 described "too many steps", and G-02 also said navigation was not friendly for first-time users. | The next version needs a clearer starting point, fewer steps and stronger labels before more functions are added. |
| Compare, price and budget | Compare was liked in both sessions. G-01 especially liked the remaining budget, and G-02 highlighted comparison and seeing prices in one place. | These are among the clearest practical benefits and should stay central to the Cart Unit. |
| Meals | G-01 liked meal ideas when housemates were indecisive about what to cook. | Meal planning is more useful when it feeds directly into the shopping list, not as a separate recipe feature. |
| Requests and "already at home" | G-01 often felt these could be replaced by a message or were too tedious to maintain. G-02 saw value in avoiding duplicate purchases and sharing suggestions. | These features should be optional and lightweight. They should save a message, not create another system that needs constant upkeep. |
| Split Shop and social value | G-01 questioned whether splitting shoppers apart made the experience more social. G-02 saw Split Shop as useful. | Split Shop should be presented as optional coordination for larger shared trips, not as proof that the product is automatically social. |
| Dedicated device vs existing tools | G-01 repeatedly compared NutriCart with group chats, Notes and existing grocery apps. G-02 said it was worth trying if it saved meaningful time or money. | The prototype must prove value beyond "another grocery app". Features that do not clearly reduce effort should be simplified or removed. |

The most important result from these sessions is that the concept cannot rely on novelty. Participants were willing to accept a shared household system only when it gave them something clearly better than sending a message or writing a list. That makes time saving, money awareness and connected household information more important than adding more social features.

## 5. How the newest iteration should respond

| Issue raised in testing | Iteration response |
|---|---|
| Too many steps / confusing navigation | Reduce the number of screens in the main journey. Make Plan → Start Shop → Shop → Finish obvious, with clearer first-use guidance. |
| Feels like another Notes list or group chat | Prioritise things that are harder to do in a normal message: live shared status, the running budget, product comparison and the meal-to-list connection. |
| Requests can feel like another group chat | Keep requests short and attached to the shopping context. They should be optional, not a required communication channel. |
| Already at home may become tedious | Use it only where it can realistically prevent a duplicate purchase. Don't expect users to maintain a detailed household inventory. |
| Split Shop purpose is unclear | Make the two-device workflow clearer, and explain that it is for dividing a larger shared shop, not for separating people on every trip. |
| LED feedback was not valued | Don't treat the LED as an important social feature. Participants preferred feedback they would notice, such as clear on-screen feedback or a simple chime. |
| Store and price source were unclear | Label clearly whether a price is a saved reference price, a current shelf price or tied to a particular store. Don't imply that a saved value is live retailer data. |

## 6. How the wider peer feedback fits

The class feedback at the tradeshow was generally more positive about the overall idea than G-01, but it raised similar usability concerns. Reviewers understood the relationship between the Home Hub and the Cart Units, and named the shared list, meal planning and the budget as strong parts (one also named Split Shop). They also wanted clearer onboarding, more reliable real-time synchronisation, stronger privacy boundaries and more reliable barcode scanning.

Together, the class feedback and the group tests suggest that the direction is understandable, but the prototype still has to show the full journey more clearly. The most useful next iteration is not one with more features. It is one where the existing features feel connected, fast and dependable.

## 7. What this iteration still needs to resolve

- Participation may become uneven if one housemate ends up maintaining most of the shared information.
- Food preferences, requests and spending can feel personal, so shared and private information need clearer boundaries.
- Product and nutrition data can be incomplete. Missing values should be shown as unavailable, not estimated.
- Scanner performance depends on camera quality, lighting and network access, so recovering from a failed scan needs to be simple.
- The physical Hub and Cart Units still need to prove they save enough effort to justify dedicated devices instead of a phone, Notes or a group chat.

## 8. What should be tested next

The next evaluation should follow one complete two-person journey from home to the store and back, rather than testing isolated screens. Two participants would plan a meal, build a shared list, start the shop, split part of the list, respond to a mid-trip change, compare a product and then return to the Hub. The test should measure where they hesitate, when they fall back to messaging, whether both people stay aware of changes, and whether the system actually saves time or reduces duplicated work.

It would also be useful to compare close friends with housemates who know each other less well. This would test whether NutriCart can support both active collaboration and lower-pressure practical coordination, without assuming that every household wants the same level of social interaction.

## 9. Iteration reflection

This iteration gives NutriCart a clearer purpose than the earlier healthy-shopping concept. The strongest parts are the features that connect planning and shopping: the shared list, meal planning, budget awareness, comparison and the handover from Home Hub to Cart Unit. Testing also shows that some features can easily become extra work if they do not save time.

The next version should therefore be judged less by how many functions it contains and more by whether the core journey is quicker and easier than the tools housemates already use. If NutriCart can make a shared shop easier to organise without forcing extra communication, then the social value comes from supporting the household task itself.
