# Threelittlewonders 🌟

**Little lessons. Big wonders!** A child-friendly, mobile-ready learning website with pre-primary skills and sample starter lessons for Nursery, LKG, UKG and Classes 1 through 10.

## What's included

- 80 short, grade-appropriate starter lessons across Maths, English, Science, EVS, Social Science, General Knowledge and Computer basics.
- A Nursery, LKG, UKG and Class 1 to Class 10 selector.
- Search and subject filters.
- Readable lesson cards with clear explanations, examples and mini-challenges.
- Two-question practice quizzes with retry feedback.
- Learning progress and stars stored locally in the browser.
- Responsive design and keyboard-accessible controls.
- No account, ads, analytics, server or external database needed for the prototype.

> **Scope:** These are curated introductory sample lessons. The project does not yet provide a complete board-aligned or NCERT textbook curriculum, lesson videos, accounts or multi-device progress sync.

## Run locally

Open `index.html` in a modern browser. Alternatively, serve this folder locally:

```bash
python3 -m http.server 8000
```

Visit http://localhost:8000.

## Publish on GitHub Pages

1. Use the existing repository `funnyspace/Threelittlewonders`.
2. Upload `index.html`, `styles.css`, `content.js`, `preprimary.js`, `curriculum.js`, `school-curriculum.js`, `secondary-curriculum.js`, `app.js`, `curriculum-ui.js`, `contact-form.js`, `site-navigation.js`, `favicon.svg` and `README.md` to its root.
3. In the repository, go to **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Your GitHub Pages URL will normally be `https://funnyspace.github.io/Threelittlewonders/` once deployment completes.

You can also deploy this static site on Netlify, Cloudflare Pages or another static web host.

## Customize

- **Brand**: Edit the heading and footer in `index.html`, along with the palette in `styles.css`.
- **Curriculum**: Add or update lessons in `content.js` using the `add()` helper. All data is local and is not downloaded from a third-party service.
- **Progress**: Stored under the browser key `Threelittlewonders-progress-v1`. The former `threeelittlewonders-progress-v1` key is supported for migration. Clearing browser storage clears progress.

## Future production features

Board-aligned course mapping, comprehensive chapter explanations, richer question banks, teacher/parent dashboards, student authentication, age-appropriate content moderation, multilingual accessibility, and secure synced progress. If accounts for children are introduced, implement suitable child-privacy and parental consent requirements before collecting personal data.

Built with HTML, CSS and vanilla JavaScript; no package installation required.

## Brand logo

The site header, footer, and favicon use three vertical RGB bars (red, green, blue).


## Pre-primary levels

Nursery, LKG and UKG are shown before Class 1. Lessons for these levels are added in `preprimary.js`. Previous grade-0 progress remains valid under UKG.

## Nursery, LKG and UKG learning topics

The learning roadmap now includes the complete set of 80 requested pre-primary topic headings:

- **Nursery:** 19 topics grouped into communication and early literacy, early mathematics, nature and everyday life, creativity/play/movement, and feelings/friendship.
- **LKG:** 32 topics under Language (9), Mathematics (12), and Environmental awareness (11).
- **UKG:** 29 topics under Language (8), Mathematics (10), and Environmental learning (11).

Select any topic to see a short guided practice activity. Families can mark a topic as practised (and reverse the selection), with local-browser storage under `Threelittlewonders-curriculum-progress-v1`. Topic practice does not affect quiz stars or lesson completion.

The topic list is a learning roadmap with short practice prompts, not a complete syllabus-aligned course or a full set of interactive lessons. Existing 80 two-question starter lessons remain available below the roadmap.

## Class 1 through Class 7 learning roadmaps

The website provides 276 new curriculum topics organized by class and learning area, with a short guided activity for each topic. These appear when Class 1, 2, 3, 4, 5, 6, or 7 is selected. The new content is stored in `school-curriculum.js`, which extends (and does not replace) `curriculum.js`.

- **Class 1:** Hindi/English language skills, mathematics, and World Around Us (26 topics).
- **Class 2:** Hindi/English language skills, mathematics, and environmental learning (26 topics).
- **Classes 3, 4 and 5:** Hindi/English, mathematics, The World Around Us, art, physical education, vocational education, and computational thinking/AI (56 topics per class; grade-specific activity levels).
- **Class 6:** English/Hindi/Sanskrit, mathematics, science, social science, art and physical education (28 topics).
- **Class 7:** Three language subjects, advanced mathematics, science, social science, art, physical education, skill education, and computational thinking/AI (28 topics).

**Total learning roadmap:** 409 topics for Nursery through Class 10, including 53 new Class 8–10 roadmap topics, in addition to the existing 80 interactive starter lessons. The Class 8–10 outlines use the subjects and themes requested for the website; they are not a verified exhaustive CBSE or NCERT syllabus.

These new entries are structured topic cards with simple practice activities and local progress tracking. They are not full textbook chapters, official board-approved syllabus mappings, or complete lessons with quizzes.

## Class 8 to Class 10 learning roadmaps

The website includes 53 additional topic cards in `secondary-curriculum.js`. They use the existing guided activity and local practice tracker, so no new account or backend is required.

- **Class 8 (34 topics, seven learning areas):** English, Hindi, Sanskrit / Urdu, Mathematics (rational numbers, equations, algebra, geometry, mensuration, exponents, proportion, data handling, basic probability), Science (crop production, microorganisms, materials, force, pressure, sound, light, electricity, natural resources, environment, biology), Social Science (modern Indian history, resources, agriculture, industries, constitution, parliament, judiciary, social justice), Art, Physical Education, Vocational Education.
- **Class 9 (11 topics, five learning areas):** English and Hindi, Core Mathematics, integrated Science (Physics, Chemistry and Biology), an optional Science Advanced extension, and Social Science (History, Geography, Political Science / Civics and Economics).
- **Class 10 (eight topics, two learning areas):** Core subjects English, Hindi, Mathematics, Science and Social Science; internal assessment topics Health & Physical Education, Work Experience and Art Education.

The Science Advanced activity is explicitly labelled optional and is not presented as part of every learner's core science pathway. Students should use the subject and level approved by their own school. The website is a guided practice roadmap; it does not promise exhaustive chapters, official affiliation, or board-approved syllabus mapping.


## One-section navigation and Contact page

The header now presents **Home**, **Explore courses**, **Contact**, and **How it works**, with **My learning** as a separate destination. Each link shows only its own main section; the footer and site header remain visible across views. Home displays the hero section only.

The URL hash controls the view, so direct links such as `#home`, `#explore`, `#contact`, `#how-it-works`, and `#my-learning` remain usable without a backend. Routing is implemented in `site-navigation.js`. The former standalone call-to-action strip has been removed because the homepage hero already contains the learning buttons.

Contact now includes the supplied email address, Patna, Bihar location, support hours and a parent/guardian enquiry form. The form builds a `mailto:` draft and opens the user's default email application. **There is no email delivery backend**, and the visitor must press Send in their email app. No enquiry form contents are stored in the website. The WhatsApp business number and official social account URLs were not provided, so they appear only as clearly identified placeholders, not clickable fake links.

## Footer and website information pages

The compact footer shows **ThreeLittleWonders | Learn • Explore • Grow**, working internal links for About Us, Contact Us, Privacy Policy, Terms & Conditions, Child Safety and FAQs, plus a mailto Email link. WhatsApp and Facebook/Instagram/YouTube labels are non-clickable until the actual business number and official social profile URLs are supplied.

The brief information sections are written to match the current static implementation; they should be reviewed and, where appropriate, approved by the business before launch. Contact details shown on the page are the details provided for this update; this edit does not independently verify that the mailbox is active.

### Contact form behaviour

The parent/guardian form requests a name and email address, optional contact phone, optional class (Nursery to Class 10), required purpose, and required message. Submission prepares an email addressed to `hello@threelittlewonders.com` using `contact-form.js`. A working email application is required to send it. The site cannot confirm delivery. For server-side form delivery or inbox tracking, a backend or a suitable hosted form service is required.


## Nursery Maths: five new interactive lessons

The Nursery **Quick interactive lessons → Maths** filter includes five additional topic cards: **Number Awareness**, **Counting Objects**, **Colours**, **Shapes**, and **Big/Small, More/Less**. Each has a short picture/emoji-supported explanation, example, activity and two-question quiz. The previous Nursery lessons remain intact. Total site starter lessons: **94**.


## Nursery English interactive lessons

Nursery → Quick interactive lessons → English now includes **Listening and Speaking**, **Rhymes and Stories**, **Picture Recognition**, and **Vocabulary Development**, in addition to the existing **Hello and Thank You** lesson. Each new lesson includes a simple explanation, activity and two-question quiz.


## Nursery Hindi, EVS and subject order

Nursery → Quick interactive lessons now uses the subject order **English → Hindi → Maths → EVS**. The former Nursery **General Knowledge** subject has been removed. Hindi includes **सुनना और बोलना**, **चित्र पहचान**, **शब्द भंडार**, and **हिंदी कविताएँ**. EVS adds **Nature and Surroundings**, **Family and Community**, **Good Habits**, and **Social-Emotional Learning**. Existing Nursery English, Maths and EVS lessons remain available. Total site starter lessons: **94**.


## LKG and UKG subject structure

LKG and UKG Quick interactive lessons now follow the same four-subject order as Nursery: **English → Hindi → Maths → EVS**. LKG adds four Hindi lessons: **वर्ण पहचान**, **चित्र और शब्द**, **शब्द भंडार**, and **हिंदी कविताएँ**; its existing **Big and Small** lesson is classified under Maths. UKG adds four Hindi lessons: **अक्षर और ध्वनि**, **सरल शब्द**, **सरल वाक्य**, and **कहानी सुनना और बोलना**; **Days of the Week** is classified under EVS. Neither LKG nor UKG shows a General Knowledge subject. Total site starter lessons: **94**.


## Nursery English rich lesson content

Nursery → English no longer includes **Hello and Thank You** as a separate lesson. **Listening and Speaking** now contains 15 guided speaking/listening activities with teacher-child examples. **Rhymes and Stories** now contains four rhymes and three complete nursery stories supplied for this site, with morals shown for the stories. The usual two-question quiz remains available after the learning content. Total site starter lessons: **94**.
