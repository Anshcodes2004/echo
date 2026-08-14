# Echo: Conversation Clarity

Build a polished, modern web application called "Echo", a real-time conversation intelligence and personal voice-notes app.

The core concept is:

Record → Transcribe in real time → Understand → Extract useful insights

The user can choose between two recording modes:

Meeting

Personal

The UI should feel premium, calm, intelligent, minimal, and highly polished. Use a sophisticated pastel color palette with lots of whitespace. Avoid overly bright colors, childish illustrations, excessive gradients, or a generic AI-dashboard appearance.

VISUAL DIRECTION

Use a soft pastel aesthetic:

Warm off-white / ivory background

Soft lavender

Muted lilac

Dusty blue

Soft sage green

Very subtle peach accents

Dark charcoal text rather than pure black

White cards with very subtle borders/shadows

The overall feeling should be:

calm + intelligent + premium + trustworthy + modern

Think of a combination of a premium productivity app and a modern AI product.

Use:

Rounded cards

Large comfortable spacing

Subtle shadows

Thin borders

Soft hover animations

Smooth transitions

Clean typography

Minimal icons

Small pastel status indicators

Do NOT make everything purple. Use pastel colors selectively to establish hierarchy.

MAIN APP STRUCTURE

Create a clean application shell with:

Left sidebar

Main content area

Optional right-side contextual panel when useful

Sidebar:

Echo logo

Navigation:

Home

Record

History

Insights

Settings

At the bottom:

User profile

Small usage/status indicator

The sidebar should be compact and elegant rather than taking up too much screen space.

HOME SCREEN

Create a welcoming dashboard.

At the top:

Good morning 👋

Subtext:

"Turn conversations and thoughts into something you can act on."

Then create two large mode-selection cards.

MEETING CARD

Icon: microphone / users

Title:
Meeting

Description:
"Capture conversations, decisions, action items and important moments."

Pastel lavender background.

Features displayed subtly:

Live transcription

Speaker detection

Decisions

Action items

Timestamps

CTA:

Start Meeting

PERSONAL CARD

Icon: microphone / spark

Title:
Personal

Description:
"Capture thoughts, ideas and reflections without worrying about taking notes."

Pastel sage/blue background.

Features:

Live transcription

Ideas

Goals

Questions

Important thoughts

CTA:

Start Recording

RECORDING SCREEN

This is the most important screen.

Make it visually beautiful and focused.

At the top:

Meeting Recording

or

Personal Recording

Show a small status:

● Recording

with a subtle pulsing animation.

Large recording timer:

00:12:43

Below it, create a beautiful microphone visualization.

Do NOT use an overly complicated waveform. Use a subtle, elegant audio visualization with soft pastel bars/circles that react to the microphone input.

Below the visualization:

Listening...

Then:

LIVE TRANSCRIPT

Create a large transcript card.

For Meeting mode, display speaker labels:

Speaker 1
"Can everyone see the latest version of the project?"

Speaker 2
"Yes. I think we should change the authentication flow."

The currently-being-transcribed/interim text should have a slightly lighter appearance so the user can distinguish it from finalized transcript text.

Each transcript segment should support a timestamp.

Example:

02:14

"Let's use MongoDB for the new service."

Make timestamps subtle but clickable.

At the bottom center:

Large rounded Stop Recording button.

Use a muted coral/red pastel accent for the stop action.

Also show:

Microphone status

Connection status

Language

Example:

🎙 Microphone connected • 🟢 Connected • English

MEETING RESULTS SCREEN

After stopping a meeting, show a short processing state:

Processing your meeting...

Subtext:

"We're organizing the conversation into decisions, action items and important moments."

Then transition into the results page.

The results page should feel like a polished meeting intelligence report.

At the top:

Product Architecture Discussion

42 min • 4 speakers • Today

Actions:

Rename

Download

Delete

Create tabs:

Overview | Transcript | Action Items | Timeline

MEETING OVERVIEW

Create a large summary card.

Summary

A concise AI-generated summary of the meeting.

Then create a grid of insight cards:

Key Topics

Show:

02:14 — Database architecture
08:31 — API performance
15:42 — Authentication
27:18 — Deployment

Decisions

Each decision should show:

04:31

Use MongoDB for the new service

Action Items

This should be one of the most visually prominent sections.

Each action item should contain:

Checkbox

Task

Owner

Deadline

Timestamp

Example:

☐ Implement WebSocket reconnection
Ansh · Due Friday · 05:21

☐ Review MongoDB indexes
Rahul · 13:47

If the owner is unknown, show:

Unassigned

If there is no deadline:

No deadline specified

Never visually imply information that wasn't actually provided.

Open Questions

Example:

21:04

"Who will own the deployment process?"

Risks / Concerns

Example:

31:17

"Current deployment timeline may be too aggressive."

TIMELINE

Create a beautiful vertical timeline of important moments.

Example:

02:14
Discussion started about database architecture

04:31
Decision: use MongoDB

08:42
Performance concern raised

13:47
Action item assigned to Rahul

21:04
Unresolved deployment question

Each timestamp should look clickable.

TRANSCRIPT SCREEN

Create a highly readable transcript.

Group transcript by speaker.

Example:

Speaker 1
02:14

"Let's discuss the database architecture first."

Speaker 2
02:31

"I think MongoDB makes the most sense because..."

Use subtle speaker-specific pastel indicators rather than loud colors.

Include:

Search transcript

Speaker filter

Timestamp

Copy transcript

Edit transcript

Clicking a timestamp should conceptually jump to that point in the audio.

PERSONAL MODE RESULTS

Personal recordings should NOT look like meeting summaries.

Instead, make them feel like a beautiful digital voice journal.

Title:

Personal Recording

Duration and date.

Primary section:

Transcript

Show the complete timestamped transcript.

Then an Insights section, but do NOT call it a "Summary."

Extract:

💡 Ideas

03:14

"I should build a system to track my interview preparation."

🎯 Goals

06:42

"Finish the project by Sunday."

❓ Questions

09:18

"Should I use MongoDB or PostgreSQL?"

📌 Important Thoughts

12:41

"I'm worried the real-time component may be unstable."

Use different subtle pastel backgrounds for each insight category.

The purpose of Personal mode is:

capture thoughts → organize them → make them easier to revisit

rather than summarizing the recording.

HISTORY PAGE

Create a beautiful searchable library.

Top:

Your recordings

Search bar:

"Search recordings..."

Filter:

All

Meetings

Personal

Each recording appears as a clean card/list item:

Product Architecture Discussion
Meeting · 42 min · Today

"Discussed database architecture, authentication and deployment..."

Interview Preparation Thoughts
Personal · 15 min · Yesterday

"Ideas about preparation strategy and project improvements..."

Use small pastel category badges:

MEETING
PERSONAL

Allow sorting by:

Newest

Oldest

Longest

EMPTY STATES

Design polished empty states rather than blank screens.

For example:

No recordings yet

"Your conversations and thoughts will appear here."

Button:

Start your first recording

Use a subtle abstract pastel illustration or geometric visual, NOT a generic stock illustration.

MICROINTERACTIONS

Add tasteful animations:

Smooth page transitions

Cards gently lift on hover

Recording indicator pulses

Audio visualization reacts while recording

Buttons have subtle hover states

Processing screen has a calm animated state

Transcript segments appear smoothly

Insight cards animate into view

Keep animations subtle and premium.

Do NOT over-animate.

RESPONSIVENESS

Make the application fully responsive.

Desktop should use the sidebar layout.

Tablet should reduce sidebar width.

Mobile should use:

Bottom navigation

Full-width recording interface

Stacked insight cards

The recording experience must remain extremely easy to use on mobile.

DESIGN SYSTEM

Create reusable components and a consistent design system.

Use a modern sans-serif font such as Inter, Geist, or a similarly clean font.

Suggested design tokens:

Background:
#FAF9F7

Primary pastel:
soft lavender

Secondary pastel:
soft sage

Accent:
dusty blue

Optional accent:
muted peach

Text:
dark charcoal

Borders:
very light warm gray

Use generous border radius, approximately 16–24px for major cards.

Avoid harsh black borders.

Avoid excessive gradients.

Avoid excessive glassmorphism.

Avoid neon colors.

Avoid overly dense dashboards.

IMPORTANT PRODUCT PRINCIPLE

The UI should communicate that Echo is not merely a transcription tool.

The product hierarchy should visually communicate:

Capture → Understand → Act

Meeting mode should emphasize:

Decisions + Action Items + Owners + Deadlines + Important Moments

Personal mode should emphasize:

Ideas + Goals + Questions + Important Thoughts

The transcript is the source of truth underneath these insights.

The overall application should feel like a real production SaaS product that could be launched publicly, not a hackathon demo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee94e0c5-407c-4a34-acbc-a86d8ae70ad8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
