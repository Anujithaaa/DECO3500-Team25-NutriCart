# Tradeshow pitch: NutriCart Hub (2:45, about 340 words)

The tradeshow is a **demonstration, not a presentation**. Hand the visitor a device in the first 20 seconds and talk *while* they use it. **Everyone learns the whole pitch**, because any of us can be marked alone.

**Set-up for each visitor:** Hub on the laptop (Visitor A), Cart Unit phone in hand (Visitor B). For a single visitor, they hold the phone and you play the housemate at the Hub.

---

**1. Hook (20 s).** Hand over the phone.
> "Ever come home from the shops and found your housemate already bought the milk? Or checked the group chat for a request someone sent three days ago? We talked to UQ students in share houses. Their problem wasn't knowing what's healthy. It was money, time, and coordinating with the people they live with."

**2. What research showed (25 s).** Point at the poster's research panel.
> "Price decides almost everything. One student said '99 out of 100 times' it's the price. Health apps felt judgy: one said a group goal was 'essentially telling me that I'm fat.' So we stopped designing a health app and designed for the household."

**3. The design (25 s).** Point at the Hub, then the phone.
> "NutriCart Hub is one shared system in two places. The Hub sits in the kitchen, where the house plans meals and leaves requests. Whoever goes shopping takes the Cart Unit, so the household's list, requests and budget travel to the aisle."

**4. Try it (50 s).** Guide, don't drive.
> - Visitor A, at the Hub: *"Add something you want from the shops."* Visitor B: *"Watch your phone."* It appears live.
> - Visitor B: *"Scan this yoghurt."* Compare shows the options by price. *"See the budget left? That's the biggest number on the screen on purpose."*
> - *"Already at home stops you buying things twice, and meal ideas show what you can cook from what's there."*
> - *"Shopping together? Split Shop divides the list between two of you."*

**5. What testing told us (35 s).** This is the part markers care about most. Say it plainly.
> "We tested with two groups of housemates. All four named the money side, the budget, Compare or deals, as the best part. But one group told us straight: it 'feels like another group chat.' And one said: 'the only time I can see myself using this is when I'm talking to someone in the grocery store.' That changed our direction. The value isn't another place to send messages. It's the live moment when one person is in the aisle and the house is at home. So our next version leans into that, works with the group chat instead of competing with it, and makes first use simpler."

**6. Close (10 s).**
> "Scan the QR code for our process and ethics. Would your house use it, or stick with the group chat?"

---

## Likely questions (everyone should know these)

| Question | Answer |
|---|---|
| **Why not just use a group chat?** | Honestly, our testers asked the same thing. A chat is great for messages but it doesn't know what's on the list, what's already at home, what's been bought or how much budget is left. That shared state is what G-02 valued: no guessing and no buying things twice. So we're designing to work *alongside* the chat, not replace it. |
| **Your testers said they wouldn't use it. What did you do?** | That's why we tested. We changed our story from "a shared list" to "live coordination while someone is shopping", which is what they said they'd actually use. We also planned a simpler first use, clearer labels, and a chime instead of lights. |
| **What's social about it?** | It supports coordination and awareness the household already does: who is shopping now, what others asked for, what's at home (Schmidt 2002 on awareness; the 3C model). On the time–space matrix: planning together is same time, same place; requests are different time, same place; Ask home is same time, different place. Olsson et al. (2020) push us to support people being together, which is why we're moving Split Shop toward shopping together in one store. |
| **Which framework did you use?** | The location framework from the brief: the Hub is location-specific (the kitchen), and the Cart Unit is designed for the store context: the list, the budget and what's relevant in the aisle. Plus the time–space matrix for the six group moments. |
| **Who does the work? (Grudin)** | Testers told us updating Already at home "seems super tedious". That's Grudin's (1994) warning about effort and benefit. In v0.3 the finished shop updates what's at home automatically, and our next step is one-line quick-add. |
| **Why a physical device?** | A shared object in a shared place belongs to the household, not to one person's phone. Our testers also showed its limits: they said the LEDs would go unnoticed, so we're swapping them for a chime. |
| **Healthy eating?** | We don't define it for people. Compare shows facts in the order *you* choose (price, protein, less sugar) and never says "healthier". |
| **Privacy?** | Aliases only, no accounts, no live location (the shopper picks the store), no analytics, and the household's data stays on our laptop and is wiped between sessions. See our Ethical Considerations page. |
| **What's real and what's simulated?** | Real: the live shared list and requests across devices, barcode scanning, Compare, budget and meal ideas. Simulated: prices (entered by us for Woolworths only) and deal alerts. Ask home, live two-phone Split Shop and the cost split are built in our v0.3 code (in the repo) and come back in the next version. |
