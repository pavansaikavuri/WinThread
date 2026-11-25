# Feature 03: Approval Queue & 5-Step Call Script Co-Pilot
*Route:* `/outreach`  
*Target Entity:* `winthreads`, `thread_events`  
*Reference:* `raisedhand-rea.md` (Approval Queue, Sequence Builder), `outpero-rea.md` (5-Step Script, Pre-Call Vars)

## 1. Job-to-be-Done (JTBD)
> **When** I am ready to contact an approved prospect,  
> **I want to** copy an AI-drafted message and launch their profile in 1 click (or read a 5-step call script),  
> **So that** I reach out with zero platform ban risk and log the outcome in under 30 seconds.

## 2. Core User Capabilities
1. **Ready-to-Send Outreach Queue:**
   - Displays all threads in `ready_to_send` status.
   - Generates contextual copy referencing their post:
     `"Hey {firstname}, saw your post about {post_topic} at {company}..."`
   - Hard 20-invite daily warning counter to ensure users stay well below LinkedIn limits.
2. **1-Click Deep-Link Delivery (0% Ban Risk):**
   - **`Send on LinkedIn`:** Copies message to OS clipboard via `navigator.clipboard.writeText()` and opens `linkedin_url` in a new tab.
   - **`Send via Email`:** Opens default mail client (`mailto:`) with pre-filled subject and body.
   - **`Send on WhatsApp`:** Launches `https://wa.me/{phone_e164}?text={encoded_message}`.
   - Marks thread as `contacted` upon click.
3. **5-Step Human Call Script Drawer (Voice-Ready Co-Pilot):**
   - Click "Open Call Script" on any lead card with a verified `phone_e164`.
   - Opens drawer with 5 interactive stages:
     1. *Step 1: Orient* ("Hi {firstname}, this is {user_name} from {agency}...")
     2. *Step 2: Qualify* (Single question on current workflow bottlenecks)
     3. *Step 3: Objections* (Accordion with answers to Pricing, Timing, Competitors)
     4. *Step 4: Book/Quote* ("Can I send over an itemized quote today?")
     5. *Step 5: Close Warmly*
   - Logs structured call outcome: `Interested`, `Send Quote`, `Callback`, `Not Interested`, `Wrong Number`.
   - Updates `consent_status`: `opted_in` if interested, `dnd_blocked` if user requests removal.

## 3. UI States
- **Empty:** "Outreach queue is empty. Approve leads from the /threads feed to stage messages here."
- **Drawer Open:** Sliding right-side drawer with high-contrast text designed for live reading during a phone call.

## 4. Verification & Testing
- Clipboard copy event executes without security exceptions.
- Call outcome writes to `thread_events` with `event_type = 'call.completed'`.
