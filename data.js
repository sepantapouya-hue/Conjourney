/* The Convi User Journey — structured data
 * Each "stage" is one row in the swim-lane diagram.
 * lane: 'merchant' | 'shopper' | 'both'
 * events: list of items that fire in that stage, each with:
 *   type: email | banner | modal | widget | toast | backend | roadmap
 *   icon: short glyph
 *   title: headline
 *   subject?: email subject line
 *   subtitle: short description
 *   detail: longer description for the side panel
 *   meta: optional key/value pairs (tone, trigger, body, route)
 *   quote?: literal copy shown to user
 */

const STAGES = [
  {
    n: 1,
    when: "Day 0 · 0s",
    lane: "merchant",
    title: "Click \"Install\" on the Shopify App Store",
    where: "OAuth callback",
    desc:
      "Merchant approves the OAuth permissions. The instant the callback hits the backend, four things happen in parallel — invisibly.",
    events: [
      {
        type: "backend",
        icon: "DB",
        title: "Shop record created",
        subtitle:
          "Defaults: widget OFF, app embed OFF, chatbot ON, FAQ widget OFF",
        detail:
          "A new Shop row is written with default settings. A NotificationSettings row is created using the contact email Shopify gave us. No email goes out yet.",
        meta: [
          ["widget", "off"],
          ["app embed", "off"],
          ["chatbot", "on"],
          ["faq widget", "off"],
        ],
      },
      {
        type: "backend",
        icon: "🕷",
        title: "Storefront crawl starts",
        subtitle: "Indexes products, collections, pages",
        detail:
          "A background job crawls the merchant's storefront to index everything for the AI. Progress is surfaced later in the admin home as the Import Health card.",
      },
      {
        type: "backend",
        icon: "⚙",
        title: "AI abilities + web-search seeded",
        subtitle:
          "Picks which tools the AI is allowed to use and the default web-search config",
        detail:
          "A second job seeds the merchant's \"abilities\" (which tools the AI is allowed to use) and a default web-search configuration.",
      },
      {
        type: "backend",
        icon: "📡",
        title: "Intercom sync (+60s)",
        subtitle:
          "The only signal the Convi internal team gets on install",
        detail:
          "After a 60-second delay, an Intercom sync fires. There's no Slack ping defined in code beyond the Intercom event — ops visibility lives in Intercom.",
        meta: [
          ["delay", "60s"],
          ["destination", "Intercom"],
          ["slack hook", "not defined"],
        ],
      },
    ],
  },

  {
    n: 2,
    when: "Minute 1",
    lane: "merchant",
    title: "Lands in the Convi admin home",
    where: "/",
    desc:
      "Brand-new free-tier user, no products indexed yet — they see the Free-tier onboarding home.",
    events: [
      {
        type: "banner",
        icon: "🎁",
        title: "Welcome Offer banner",
        subtitle: "7-day countdown card pushing the discounted first plan",
        detail:
          "Lives on the pricing page. Dismissible.",
        meta: [
          ["tone", "promo"],
          ["dismissible", "yes"],
          ["countdown", "7 days"],
        ],
      },
      {
        type: "banner",
        icon: "🪪",
        title: "Onboarding Discount banner",
        subtitle:
          "Incomplete state — needs sync, playground test, pre-flight checks to unlock discount",
        detail:
          "Tells the merchant they need to (1) sync data, (2) test in playground, and (3) pass pre-flight checks to unlock a discount.",
        meta: [["state", "incomplete"]],
      },
      {
        type: "banner",
        icon: "📈",
        title: "Import Health / Launch Progress",
        subtitle: "Live crawl % completion",
        detail:
          "Shows the crawl % completion live as products get indexed.",
      },
      {
        type: "banner",
        icon: "ℹ",
        title: "Import in progress (info)",
        subtitle: "Info tone · % complete · dismissible",
        detail: "Failure-mode banner — soft, informational.",
        meta: [
          ["tone", "info"],
          ["dismissible", "yes"],
        ],
      },
      {
        type: "banner",
        icon: "📅",
        title: "Booking Demo CTA",
        subtitle: "Persistent at the bottom",
        detail: "Persistent call-to-action to book a demo.",
      },
    ],
  },

  {
    n: 3,
    when: "Minutes 2 – 10",
    lane: "merchant",
    title: "5-step setup wizard",
    where: "/setup",
    desc: "Funneled through five steps before they leave the wizard.",
    events: [
      {
        type: "banner",
        icon: "1",
        title: "Step 1 — Intro",
        subtitle: "Explains Convi · accept terms",
        detail:
          "Explains what Convi does, asks the merchant to accept terms.",
      },
      {
        type: "banner",
        icon: "2",
        title: "Step 2 — Store Profile",
        subtitle: "Pick tone of voice · agent goals",
        detail:
          "They pick a tone of voice for the AI and goals for the agent.",
      },
      {
        type: "banner",
        icon: "3",
        title: "Step 3 — Syncing Data",
        subtitle:
          "Waiting screen + optional \"email me when sync is done\" banner",
        detail:
          "They wait for the storefront crawl to finish. The screen shows an Email Notification Banner offering to email them when sync is done — so they don't have to sit and wait.",
      },
      {
        type: "banner",
        icon: "4",
        title: "Step 4 — Try It (sandbox)",
        subtitle: "Sandbox Environment info banner shown",
        detail:
          "A sandbox where they ask their own AI questions before going public. A Sandbox Environment info banner makes clear this isn't production.",
        meta: [["banner", "Sandbox Environment (info)"]],
      },
      {
        type: "banner",
        icon: "5",
        title: "Step 5 — Ready",
        subtitle: "Success screen",
        detail: "Final success screen of the wizard.",
      },
    ],
  },

  {
    n: 4,
    when: "When catalog sync finishes",
    lane: "merchant",
    title: "Welcome email + Train Nudge",
    where: "Email · Email",
    desc:
      "The two first lifecycle emails fire once the catalog is indexed.",
    events: [
      {
        type: "email",
        icon: "✉",
        title: "Email #1 — Welcome",
        subject: "Welcome to Convi — your AI agent is ready to train",
        subtitle: "Body: products + knowledge items indexed · training link",
        detail:
          "Sent the moment the catalog sync completes. Tells them how many products and knowledge items were indexed and links back to the training dashboard.",
        quote:
          "Subject: Welcome to Convi — your AI agent is ready to train",
      },
      {
        type: "email",
        icon: "👉",
        title: "Email #2 — Train Nudge",
        subject: "Your AI agent is waiting — 5 minutes to launch",
        subtitle: "Pushes them toward enabling the widget",
        detail:
          "Second lifecycle email; fires after the welcome to push the merchant toward enabling the widget.",
        quote:
          "Subject: Your AI agent is waiting — 5 minutes to launch",
      },
    ],
  },

  {
    n: 5,
    when: "Training phase",
    lane: "merchant",
    title: "Train the agent",
    where: "/train",
    desc:
      "Adding custom FAQs, docs, policies. Banners surface coverage gaps.",
    events: [
      {
        type: "banner",
        icon: "🩺",
        title: "Content Health banner",
        subtitle: "Coverage · Freshness · Quality · Sources",
        detail:
          "Four metrics: Coverage (full/partial), Freshness (current/syncing), Quality (flagged item count), Sources (custom FAQs added).",
        meta: [
          ["coverage", "full / partial"],
          ["freshness", "current / syncing"],
          ["quality", "flagged item count"],
          ["sources", "custom FAQs added"],
        ],
      },
      {
        type: "banner",
        icon: "⚠",
        title: "Missing Policies warning",
        subtitle: "Synced products but not shipping/return policies",
        detail:
          "If they synced products but didn't import shipping/return policies, a Missing Policies warning banner shows up (dismissible).",
        meta: [
          ["tone", "warning"],
          ["dismissible", "yes"],
        ],
      },
      {
        type: "toast",
        icon: "✓",
        title: "FAQ saved · item added · doc created",
        subtitle: "Green success toasts",
        detail:
          "When they add custom FAQs / docs / policies, they get green success toasts: faq_saved_toast, item_added_toast, toast_created, etc.",
      },
    ],
  },

  {
    n: 6,
    when: "Publish step",
    lane: "merchant",
    title: "Gating: plan + permissions",
    where: "/publish/widgets",
    desc:
      "Two banners and a modal can show up here, depending on plan and what they try to enable.",
    events: [
      {
        type: "banner",
        icon: "🔒",
        title: "Free Plan Upgrade (critical)",
        subtitle: "If free plan + paid widget feature",
        detail:
          "Critical-tone banner with a \"See plans\" button. Routes to /settings/plan.",
        meta: [
          ["tone", "critical"],
          ["cta", "See plans → /settings/plan"],
        ],
      },
      {
        type: "banner",
        icon: "🧩",
        title: "App Embed Widget Status",
        subtitle:
          "Green when enabled · warning when disabled · deep-link to theme editor",
        detail:
          "On a paid plan. The \"Activate\" button deep-links into the Shopify theme editor so they can add the Convi app block to their theme.",
      },
      {
        type: "modal",
        icon: "🚫",
        title: "Permission Modal",
        subtitle: "Feature their plan doesn't permit",
        detail:
          "If they try a feature their plan doesn't permit, a Permission Modal pops up with an upgrade CTA.",
      },
    ],
  },

  {
    n: 7,
    when: "Widget enabled",
    lane: "merchant",
    title: "🎉 Widget goes live",
    where: "Email · Home swap",
    desc:
      "The instant the merchant flips on the widget + app embed, the celebration kicks in.",
    events: [
      {
        type: "email",
        icon: "🚀",
        title: "Email #3 — Widget Live",
        subject: "🎉 Convi is live on {shop-domain}",
        subtitle: "Storefront link · what the widget can do · settings link",
        detail:
          "Sent the moment the widget + app embed flip on.",
        quote: "Subject: 🎉 Convi is live on {their-shop-domain}",
      },
      {
        type: "banner",
        icon: "🟢",
        title: "Celebration \"Just Live\" banner",
        subtitle:
          "Three green badges: Plan active · Bubble widget active · App embed active",
        detail:
          "Home page swaps from the \"Free with onboarding\" view to a green celebration card. Primary CTA: \"Start test conversation\" → opens their storefront in a new tab.",
        meta: [
          ["badges", "Plan · Bubble · App embed"],
          ["cta", "Start test conversation"],
        ],
      },
    ],
  },

  {
    n: 8,
    when: "Before any click",
    lane: "shopper",
    title: "The widget loads silently",
    where: "storefront",
    desc: "Shopper hasn't clicked anything yet.",
    events: [
      {
        type: "widget",
        icon: "●",
        title: "Launcher bubble",
        subtitle: "Just an icon, no text",
        detail: "Idle launcher state.",
      },
      {
        type: "widget",
        icon: "💭",
        title: "Proactive speech bubble (+30s)",
        subtitle: "Merchant-controlled copy, optional",
        detail:
          "After 30 seconds of dwell time on a product or home page, an optional proactive speech bubble may pop up, with copy controlled by the merchant from the admin (e.g., \"Need help finding something?\"). Only shows if the merchant enabled speech bubbles.",
        meta: [
          ["trigger", "30s dwell"],
          ["copy", "merchant-configurable"],
          ["enabled by", "merchant setting"],
        ],
      },
    ],
  },

  {
    n: 9,
    when: "Shopper clicks bubble",
    lane: "shopper",
    title: "Widget home view",
    where: "in-widget",
    desc: "If no chat is in progress.",
    events: [
      {
        type: "widget",
        icon: "👋",
        title: "Welcome message",
        subtitle: "Default \"Chat with us\" — merchant-configurable",
        detail: "Greeting at the top of the widget home.",
      },
      {
        type: "widget",
        icon: "✨",
        title: "Suggested starter prompts",
        subtitle: "e.g. \"Track my order\", \"What's your return policy?\"",
        detail: "Only shows if the merchant configured prompts.",
      },
      {
        type: "widget",
        icon: "⌨",
        title: "Text input",
        subtitle: "Placeholder: \"Type your message here…\"",
        detail: "Where the shopper composes their first message.",
      },
      {
        type: "widget",
        icon: "🔗",
        title: "\"Powered by Convi\" footer",
        subtitle: "Optional — merchant can disable",
        detail: "Links to conviapp.com unless the merchant disables it.",
      },
    ],
  },

  {
    n: 10,
    when: "First-time chat",
    lane: "shopper",
    title: "Optional pre-chat survey",
    where: "modal",
    desc: "If the merchant enabled it.",
    events: [
      {
        type: "modal",
        icon: "📝",
        title: "Pre-chat survey modal",
        subtitle: "Name + email · Send / Skip · can be required",
        detail:
          "A modal appears: \"Please introduce yourself:\" with name + email fields and Send/Skip buttons. The merchant can make it required.",
        quote: "Please introduce yourself:",
      },
    ],
  },

  {
    n: 11,
    when: "AI is thinking",
    lane: "shopper",
    title: "Animated state placeholders",
    where: "in-widget",
    desc: "Swap based on what tool the AI is calling.",
    events: [
      {
        type: "widget",
        icon: "◌",
        title: "Initializing…",
        subtitle: "Boot",
        detail: "Initial state while the agent spins up.",
      },
      {
        type: "widget",
        icon: "🧠",
        title: "Thinking…",
        subtitle: "Reasoning",
        detail: "While the AI is composing its response.",
      },
      {
        type: "widget",
        icon: "🔎",
        title: "Searching…",
        subtitle: "Calling a search tool",
        detail: "Search is in flight.",
      },
      {
        type: "widget",
        icon: "📦",
        title: "Tracking order…",
        subtitle: "Order tracking tool",
        detail: "Order-tracking tool is in flight.",
      },
      {
        type: "widget",
        icon: "⏳",
        title: "Waiting… / Loading…",
        subtitle: "Generic standby",
        detail:
          "Generic waiting/loading states that may show up between tool calls.",
      },
    ],
  },

  {
    n: 12,
    when: "Cart actions",
    lane: "shopper",
    title: "Cart edits can fail — hardcoded error copy",
    where: "in-widget",
    desc: "If add/update/clear cart fails.",
    events: [
      {
        type: "widget",
        icon: "🛒",
        title: "Generic cart error",
        subtitle: "\"I had trouble updating your cart. Please try again.\"",
        detail: "Hardcoded fallback message.",
        quote: "I had trouble updating your cart. Please try again.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Out of stock",
        subtitle: "\"Sorry, that item is out of stock.\"",
        detail: "Inventory miss.",
        quote: "Sorry, that item is out of stock.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Variant unavailable",
        subtitle: "\"That variant is not available.\"",
        detail: "Variant gone or unpublished.",
        quote: "That variant is not available.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Product not found",
        subtitle: "\"Sorry, I couldn't find that product.\"",
        detail: "Lookup miss.",
        quote: "Sorry, I couldn't find that product.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Ambiguous match",
        subtitle: "\"I found multiple matching items. Please be more specific.\"",
        detail: "More than one product matched.",
        quote:
          "I found multiple matching items. Please be more specific.",
      },
    ],
  },

  {
    n: 13,
    when: "Order cancellation",
    lane: "both",
    title: "Shopper asks to cancel → OTP loop",
    where: "Email (shopper) + Email (admin)",
    desc:
      "If they ask to cancel an order through the widget, an OTP proves they own the order before the request is forwarded.",
    events: [
      {
        type: "email",
        icon: "🔢",
        title: "OTP email to shopper",
        subject: "Order cancellation — verification code",
        subtitle: "6-digit code · sent directly to the shopper",
        detail:
          "The system emails the shopper a 6-digit one-time passcode to prove they own the order.",
      },
      {
        type: "email",
        icon: "📨",
        title: "Order Cancellation Requested — admin email",
        subject: "Order Cancellation Requested",
        subtitle:
          "Once the OTP is entered, the request is forwarded internally",
        detail:
          "After the shopper enters the OTP, the cancellation request is emailed to the merchant's configured notification address.",
        meta: [["recipient", "merchant notification address"]],
      },
    ],
  },

  {
    n: 14,
    when: "When something breaks",
    lane: "shopper",
    title: "Generic error screen",
    where: "in-widget",
    desc: "Heading is hardcoded; body comes from the backend.",
    events: [
      {
        type: "widget",
        icon: "⚠",
        title: "\"Something went wrong\"",
        subtitle: "Heading hardcoded · detail from API",
        detail:
          "Shopper sees \"Something went wrong\" with the backend's detail message underneath.",
        quote: "Something went wrong",
      },
    ],
  },

  {
    n: 15,
    when: "Shopper asks for a human",
    lane: "both",
    title: "Handover or resolved",
    where: "Widget + Admin email",
    desc: "Two outcomes for the shopper, one alert for the merchant.",
    events: [
      {
        type: "widget",
        icon: "🙋",
        title: "Handover happens",
        subtitle:
          "\"This conversation has been handed over to a human agent…\"",
        detail:
          "Shopper sees: \"This conversation has been handed over to a human agent. Start a new chat if you don't want to wait.\" The merchant gets the \"Customer Needs Your Help\" email.",
        quote:
          "This conversation has been handed over to a human agent. Start a new chat if you don't want to wait.",
      },
      {
        type: "widget",
        icon: "🔒",
        title: "Conversation resolved",
        subtitle: "\"This conversation is closed…\"",
        detail:
          "Shopper sees: \"This conversation is closed. You can start a new chat to chat with us.\"",
        quote:
          "This conversation is closed. You can start a new chat to chat with us.",
      },
      {
        type: "email",
        icon: "🆘",
        title: "Email #4 — Handover Notification (to merchant)",
        subject: "Customer Needs Your Help",
        subtitle:
          "Fires when shopper asks for a human, or the AI gives up · Urgent tone",
        detail:
          "Goes to the merchant's notification address. Tone: urgent.",
        meta: [["tone", "urgent"]],
      },
      {
        type: "email",
        icon: "📨",
        title: "Admin handover email (internal)",
        subject: "Internal — handover requested",
        subtitle:
          "Sent to the shop's configured notification address",
        detail:
          "Goes to the shop's configured notification address whenever the handover tool fires.",
      },
    ],
  },

  {
    n: 16,
    when: "After AI responds",
    lane: "shopper",
    title: "Optional CSAT survey",
    where: "modal",
    desc: "If the merchant enabled satisfaction feedback.",
    events: [
      {
        type: "modal",
        icon: "👍",
        title: "Was your inquiry resolved?",
        subtitle: "Thumbs up / down",
        detail:
          "After the AI finishes responding, an optional CSAT modal can appear.",
        quote: "Was your inquiry resolved?",
      },
      {
        type: "modal",
        icon: "💬",
        title: "Negative feedback follow-up",
        subtitle: "\"We are sorry that you had a bad experience…\"",
        detail:
          "On thumbs down, a text field appears: \"We are sorry that you had a bad experience. What was the problem?\" Submitting shows \"Your feedback submitted\".",
        quote:
          "We are sorry that you had a bad experience. What was the problem?",
      },
    ],
  },

  {
    n: 17,
    when: "Once live · per conversation",
    lane: "merchant",
    title: "Day-to-day operations",
    where: "Home + Email",
    desc:
      "While shoppers chat, the merchant sees a live activity banner and receives transactional emails.",
    events: [
      {
        type: "banner",
        icon: "📊",
        title: "Live Shopper Activity",
        subtitle: "Polls every 10s · active shoppers + avg AI response time",
        detail:
          "Live banner on the admin home with an \"Open Conversations\" button.",
        meta: [
          ["poll", "10s"],
          ["cta", "Open Conversations"],
        ],
      },
      {
        type: "email",
        icon: "🗣",
        title: "Email #5 — New Customer Conversation",
        subject: "New Customer Conversation - Convi",
        subtitle:
          "Fires when a shopper sends the first 2 messages · AI's first reply preview",
        detail:
          "Body contains the AI's first response preview + dashboard link.",
      },
      {
        type: "email",
        icon: "🆘",
        title: "Email #6 — Handover Notification",
        subject: "Customer Needs Your Help",
        subtitle: "Urgent tone · shopper requested human or AI gave up",
        detail:
          "Same template as the handover email under shopper handover step — listed here because it's part of the merchant's day-to-day flow.",
      },
      {
        type: "email",
        icon: "📋",
        title: "Email #7 — Session Summary",
        subject: "Chat summary: {customer name}",
        subtitle:
          "Topics · resolution status · sentiment · AI performance",
        detail:
          "Fires when a conversation is resolved.",
      },
      {
        type: "email",
        icon: "📨",
        title: "Admin order-cancellation email",
        subject: "Order Cancellation Requested",
        subtitle: "Internal email when the cancellation tool fires",
        detail:
          "Goes to the shop's configured notification address whenever the order-cancellation tool fires.",
      },
    ],
  },

  {
    n: 18,
    when: "Usage approaches cap",
    lane: "merchant",
    title: "80% → 100% usage warnings",
    where: "in-app banner",
    desc: "Two banners gate the merchant as they outgrow the plan.",
    events: [
      {
        type: "banner",
        icon: "⚡",
        title: "Early Warning (80%)",
        subtitle:
          "\"You're approaching your limit\" · Upgrade CTA with live pricing",
        detail:
          "Dismissible. Button reads \"Upgrade to {Plan} — ${price}\" with live pricing.",
        meta: [
          ["threshold", "80%"],
          ["dismissible", "yes"],
        ],
      },
      {
        type: "banner",
        icon: "🛑",
        title: "Limit Reached (100%)",
        subtitle: "Critical · countdown to monthly reset · Upgrade plan",
        detail: "Red tone with the countdown until monthly reset.",
        meta: [
          ["threshold", "100%"],
          ["tone", "critical"],
        ],
      },
    ],
  },

  {
    n: 19,
    when: "Weekly",
    lane: "merchant",
    title: "Weekly digest emails",
    where: "Email",
    desc: "One of two emails fires every week.",
    events: [
      {
        type: "email",
        icon: "📈",
        title: "Weekly Value Report (active shops)",
        subject:
          "Your week with Convi: {N} questions answered, ~{H} hours saved",
        subtitle:
          "Top products · top pages · AI resolution rate · trending insights",
        detail:
          "Sent if the shop had activity that week.",
      },
      {
        type: "email",
        icon: "💤",
        title: "Weekly Re-engagement (quiet shops)",
        subject: "Convi is ready when your customers are",
        subtitle: "Soft nudge for shops with no activity",
        detail: "Sent if the shop had no activity that week.",
      },
    ],
  },

  {
    n: 20,
    when: "Cross-cutting",
    lane: "both",
    title: "Background banners + boundaries",
    where: "Everywhere applicable",
    desc:
      "Banners and surfaces that can appear depending on state, regardless of stage.",
    events: [
      {
        type: "banner",
        icon: "🧪",
        title: "Sandbox Environment",
        subtitle: "Playground · pre-flight · simulation logs",
        detail:
          "Info-tone banner — \"this isn't production\" — anywhere the merchant is viewing sandboxed runs.",
      },
      {
        type: "banner",
        icon: "🎛",
        title: "Simulations Feature",
        subtitle: "On the evaluate screen",
        detail: "Pitches simulations on the evaluate screen.",
      },
      {
        type: "banner",
        icon: "📅",
        title: "Booking Demo",
        subtitle: "Persistent CTA",
        detail: "Always-available demo booking CTA.",
      },
      {
        type: "banner",
        icon: "🔗",
        title: "Bubble dependency warning",
        subtitle:
          "If they try to disable the bubble while another feature depends on it",
        detail: "Prevents an inadvertent break.",
      },
      {
        type: "toast",
        icon: "🔌",
        title: "Gorgias / Zendesk disconnected toasts",
        subtitle: "If a support integration drops",
        detail: "Fires when the integration loses its connection.",
      },
      {
        type: "modal",
        icon: "💥",
        title: "Error Boundary",
        subtitle: "Generic \"Something went wrong\" screen",
        detail:
          "If the React tree crashes. Never shows raw errors.",
      },
    ],
  },

  {
    n: 21,
    when: "Templates exist · not sending",
    lane: "both",
    title: "Roadmap — lifecycle emails not yet shipping",
    where: "Celery tasks raise NotImplementedError",
    desc:
      "Three lifecycle emails exist as templates + Celery tasks but raise NotImplementedError today.",
    events: [
      {
        type: "roadmap",
        icon: "🧷",
        title: "Pre-flight Report",
        subject: "Pre-flight: {X} / {Y} checks passed",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — the merchant never receives it today.",
      },
      {
        type: "roadmap",
        icon: "💡",
        title: "Weekly Insight",
        subject: "Insight: {headline}",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — the merchant never receives it today.",
      },
      {
        type: "roadmap",
        icon: "🏆",
        title: "Milestone",
        subject:
          "🎉 {N} questions answered — that's about {H} hours saved",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — the merchant never receives it today.",
      },
    ],
  },
];
