// Initial Convi journey, modeled as ReactFlow nodes + edges.
// Each node is a stage with its own list of "events" (emails, banners, etc).

const LANE_X = { merchant: 80, both: 540, shopper: 1000 };

// We compute y positions after the array is built, accounting for how
// many events each stage has — otherwise tall cards overlap.
function stage(n, lane, _idx, payload) {
  return {
    id: String(n),
    type: "stage",
    position: { x: LANE_X[lane], y: 0 },
    data: { n, lane, ...payload },
  };
}

export const initialNodes = [
  stage(1, "merchant", 0, {
    when: "Day 0 · 0s",
    title: 'Click "Install" on the Shopify App Store',
    where: "OAuth callback",
    desc:
      "Merchant approves OAuth. Four things happen in parallel, invisibly.",
    events: [
      {
        type: "backend",
        icon: "DB",
        title: "Shop record created",
        subtitle:
          "Defaults: widget OFF, app embed OFF, chatbot ON, FAQ widget OFF",
        detail:
          "A new Shop row is written with default settings. A NotificationSettings row is created using the contact email Shopify gave us. No email goes out yet.",
      },
      {
        type: "backend",
        icon: "🕷",
        title: "Storefront crawl starts",
        subtitle: "Indexes products, collections, pages",
        detail:
          "Background job crawls the storefront to index everything for the AI. Surfaces later in the Import Health card.",
      },
      {
        type: "backend",
        icon: "⚙",
        title: "AI abilities + web-search seeded",
        subtitle: "Tools the AI can use + default web-search config",
        detail:
          "Second job seeds the merchant's 'abilities' and a default web-search configuration.",
      },
      {
        type: "backend",
        icon: "📡",
        title: "Intercom sync (+60s)",
        subtitle: "Only signal the Convi team gets on install",
        detail:
          "After 60 seconds, an Intercom sync fires. No Slack hook in code beyond Intercom.",
      },
    ],
  }),

  stage(2, "merchant", 1, {
    when: "Minute 1",
    title: "Lands in the Convi admin home",
    where: "/",
    desc: "Free-tier onboarding home — no products indexed yet.",
    events: [
      {
        type: "banner",
        icon: "🎁",
        title: "Welcome Offer banner",
        subtitle: "7-day countdown, dismissible, on pricing page",
        detail:
          "Push for the discounted first plan. Dismissible. Lives on the pricing page.",
      },
      {
        type: "banner",
        icon: "🪪",
        title: "Onboarding Discount — Incomplete",
        subtitle: "Sync data · test in playground · pre-flight checks",
        detail: "Three gates to unlock the discount.",
      },
      {
        type: "banner",
        icon: "📈",
        title: "Import Health / Launch Progress",
        subtitle: "Live crawl % completion",
        detail: "Shows the crawl % completion live as products get indexed.",
      },
      {
        type: "banner",
        icon: "ℹ",
        title: "Import in progress",
        subtitle: "Info tone, % complete, dismissible",
        detail: "Soft, informational banner about the crawl.",
      },
      {
        type: "banner",
        icon: "📅",
        title: "Booking Demo CTA",
        subtitle: "Persistent at the bottom",
        detail: "Always-on demo booking CTA.",
      },
    ],
  }),

  stage(3, "merchant", 2, {
    when: "Minutes 2 – 10",
    title: "5-step setup wizard",
    where: "/setup",
    desc: "Funneled through five steps before they leave the wizard.",
    events: [
      {
        type: "banner",
        icon: "1",
        title: "Intro",
        subtitle: "Explains Convi · accept terms",
        detail: "Explains what Convi does, asks to accept terms.",
      },
      {
        type: "banner",
        icon: "2",
        title: "Store Profile",
        subtitle: "Pick tone of voice · agent goals",
        detail: "Choose a tone of voice for the AI and goals for the agent.",
      },
      {
        type: "banner",
        icon: "3",
        title: "Syncing Data",
        subtitle: "Wait for crawl · optional email-when-done",
        detail:
          'A waiting screen + "email me when sync is done" Email Notification banner.',
      },
      {
        type: "banner",
        icon: "4",
        title: "Try It (sandbox)",
        subtitle: "Sandbox Environment info banner",
        detail:
          "Ask the AI questions before going public. A Sandbox Environment info banner makes clear this isn't production.",
      },
      {
        type: "banner",
        icon: "5",
        title: "Ready",
        subtitle: "Success screen",
        detail: "Final success screen of the wizard.",
      },
    ],
  }),

  stage(4, "merchant", 3, {
    when: "When catalog sync finishes",
    title: "Welcome email + Train Nudge",
    where: "Email",
    desc: "Two lifecycle emails fire once the catalog is indexed.",
    events: [
      {
        type: "email",
        icon: "✉",
        title: "Welcome",
        subject: "Welcome to Convi — your AI agent is ready to train",
        subtitle: "How many products + knowledge items indexed",
        detail:
          "Sent the moment the catalog sync completes. Tells them how many products and knowledge items were indexed and links to the training dashboard.",
      },
      {
        type: "email",
        icon: "👉",
        title: "Train Nudge",
        subject: "Your AI agent is waiting — 5 minutes to launch",
        subtitle: "Pushes toward enabling the widget",
        detail:
          "Second lifecycle email; fires after the welcome to push the merchant toward enabling the widget.",
      },
    ],
  }),

  stage(5, "merchant", 4, {
    when: "Training phase",
    title: "Train the agent",
    where: "/train",
    desc: "Adding custom FAQs, docs, policies. Banners surface gaps.",
    events: [
      {
        type: "banner",
        icon: "🩺",
        title: "Content Health",
        subtitle: "Coverage · Freshness · Quality · Sources",
        detail:
          "Four metrics: Coverage (full/partial), Freshness (current/syncing), Quality (flagged item count), Sources (custom FAQs added).",
      },
      {
        type: "banner",
        icon: "⚠",
        title: "Missing Policies warning",
        subtitle: "Products synced but no shipping/return policies",
        detail:
          "If they synced products but didn't import shipping/return policies, a Missing Policies warning shows up (dismissible).",
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
  }),

  stage(6, "merchant", 5, {
    when: "Publish step",
    title: "Gating — plan + permissions",
    where: "/publish/widgets",
    desc: "Two banners and a modal gate the merchant here.",
    events: [
      {
        type: "banner",
        icon: "🔒",
        title: "Free Plan Upgrade (critical)",
        subtitle: "Free plan + paid widget feature → 'See plans'",
        detail:
          "Critical-tone banner with a 'See plans' button. Routes to /settings/plan.",
      },
      {
        type: "banner",
        icon: "🧩",
        title: "App Embed Widget Status",
        subtitle: "Green when enabled · deep-link to theme editor",
        detail:
          "The 'Activate' button deep-links into the Shopify theme editor so they can add the Convi app block.",
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
  }),

  stage(7, "merchant", 6, {
    when: "Widget enabled",
    title: "🎉 Widget goes live",
    where: "Email · Home swap",
    desc: "Widget + app embed flip on → celebration.",
    events: [
      {
        type: "email",
        icon: "🚀",
        title: "Widget Live",
        subject: "🎉 Convi is live on {shop-domain}",
        subtitle: "Storefront link · what the widget can do · settings link",
        detail: "Sent the moment widget + app embed flip on.",
      },
      {
        type: "banner",
        icon: "🟢",
        title: 'Celebration "Just Live" banner',
        subtitle: "Plan active · Bubble widget · App embed",
        detail:
          "Home page swaps to a green celebration card with three green badges. Primary CTA: 'Start test conversation' opens the storefront.",
      },
    ],
  }),

  stage(8, "shopper", 7, {
    when: "Before any click",
    title: "Widget loads silently",
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
          'After 30 seconds of dwell, a proactive speech bubble may pop up (e.g., "Need help finding something?"). Only if enabled.',
      },
    ],
  }),

  stage(9, "shopper", 8, {
    when: "Click bubble",
    title: "Widget home view",
    where: "in-widget",
    desc: "If no chat is in progress.",
    events: [
      {
        type: "widget",
        icon: "👋",
        title: "Welcome message",
        subtitle: 'Default "Chat with us" — configurable',
        detail: "Greeting at the top of the widget home.",
      },
      {
        type: "widget",
        icon: "✨",
        title: "Suggested starter prompts",
        subtitle: 'e.g. "Track my order", "Return policy?"',
        detail: "Only if the merchant configured prompts.",
      },
      {
        type: "widget",
        icon: "⌨",
        title: "Text input",
        subtitle: 'Placeholder: "Type your message here…"',
        detail: "Where the shopper composes their first message.",
      },
      {
        type: "widget",
        icon: "🔗",
        title: '"Powered by Convi" footer',
        subtitle: "Optional — merchant can disable",
        detail: "Links to conviapp.com unless disabled.",
      },
    ],
  }),

  stage(10, "shopper", 9, {
    when: "First-time chat",
    title: "Optional pre-chat survey",
    where: "modal",
    desc: "If the merchant enabled it.",
    events: [
      {
        type: "modal",
        icon: "📝",
        title: "Pre-chat survey",
        subtitle: "Name + email · Send / Skip · can be required",
        detail:
          'Modal: "Please introduce yourself:" with name + email fields and Send/Skip buttons.',
      },
    ],
  }),

  stage(11, "shopper", 10, {
    when: "AI is thinking",
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
        detail: "Generic waiting/loading states between tool calls.",
      },
    ],
  }),

  stage(12, "shopper", 11, {
    when: "Cart actions",
    title: "Cart edits can fail",
    where: "in-widget",
    desc: "Hardcoded error copy if add/update/clear cart fails.",
    events: [
      {
        type: "widget",
        icon: "🛒",
        title: "Generic cart error",
        subtitle: '"I had trouble updating your cart. Please try again."',
        detail: "Hardcoded fallback.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Out of stock",
        subtitle: '"Sorry, that item is out of stock."',
        detail: "Inventory miss.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Variant unavailable",
        subtitle: '"That variant is not available."',
        detail: "Variant gone or unpublished.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Product not found",
        subtitle: '"Sorry, I couldn\'t find that product."',
        detail: "Lookup miss.",
      },
      {
        type: "widget",
        icon: "🛒",
        title: "Ambiguous match",
        subtitle: '"Multiple matching items. Please be more specific."',
        detail: "More than one product matched.",
      },
    ],
  }),

  stage(13, "both", 12, {
    when: "Order cancellation",
    title: "Shopper asks to cancel → OTP loop",
    where: "Email (shopper) + Email (admin)",
    desc:
      "OTP proves they own the order before the request is forwarded.",
    events: [
      {
        type: "email",
        icon: "🔢",
        title: "OTP email to shopper",
        subtitle: "6-digit code, sent directly to the shopper",
        detail:
          "Emails the shopper a 6-digit one-time passcode to prove they own the order.",
      },
      {
        type: "email",
        icon: "📨",
        title: "Order Cancellation Requested — admin",
        subtitle: "Forwarded internally after OTP entered",
        detail:
          "After the OTP is entered, the cancellation request is emailed to the merchant's configured notification address.",
      },
    ],
  }),

  stage(14, "shopper", 13, {
    when: "When something breaks",
    title: "Generic error screen",
    where: "in-widget",
    desc: "Heading hardcoded; body from the backend.",
    events: [
      {
        type: "widget",
        icon: "⚠",
        title: '"Something went wrong"',
        subtitle: "Heading hardcoded · detail from API",
        detail: 'Shopper sees "Something went wrong" + backend detail.',
      },
    ],
  }),

  stage(15, "both", 14, {
    when: "Shopper asks for a human",
    title: "Handover or resolved",
    where: "Widget + Admin email",
    desc: "Two outcomes for the shopper, one alert for the merchant.",
    events: [
      {
        type: "widget",
        icon: "🙋",
        title: "Handover happens",
        subtitle: '"…handed over to a human agent…"',
        detail:
          'Shopper sees: "This conversation has been handed over to a human agent. Start a new chat if you don\'t want to wait."',
      },
      {
        type: "widget",
        icon: "🔒",
        title: "Conversation resolved",
        subtitle: '"This conversation is closed…"',
        detail:
          'Shopper sees: "This conversation is closed. You can start a new chat to chat with us."',
      },
      {
        type: "email",
        icon: "🆘",
        title: "Handover Notification (to merchant)",
        subject: "Customer Needs Your Help",
        subtitle: "Urgent tone",
        detail: "Goes to the merchant's notification address.",
      },
      {
        type: "email",
        icon: "📨",
        title: "Admin handover email (internal)",
        subtitle: "Sent to the shop's configured notification address",
        detail: "Fires whenever the handover tool fires.",
      },
    ],
  }),

  stage(16, "shopper", 15, {
    when: "After AI responds",
    title: "Optional CSAT survey",
    where: "modal",
    desc: "If the merchant enabled satisfaction feedback.",
    events: [
      {
        type: "modal",
        icon: "👍",
        title: "Was your inquiry resolved?",
        subtitle: "Thumbs up / down",
        detail: "After AI finishes responding, a CSAT modal can appear.",
      },
      {
        type: "modal",
        icon: "💬",
        title: "Negative feedback follow-up",
        subtitle: '"We are sorry that you had a bad experience…"',
        detail: 'Thumbs down opens a text field. Submit → "Your feedback submitted".',
      },
    ],
  }),

  stage(17, "merchant", 16, {
    when: "Per conversation",
    title: "Day-to-day operations",
    where: "Home + Email",
    desc: "Live banner + transactional emails as shoppers chat.",
    events: [
      {
        type: "banner",
        icon: "📊",
        title: "Live Shopper Activity",
        subtitle: "Polls every 10s · active shoppers + avg response",
        detail:
          "Live banner on the admin home with an 'Open Conversations' button.",
      },
      {
        type: "email",
        icon: "🗣",
        title: "New Customer Conversation",
        subject: "New Customer Conversation - Convi",
        subtitle: "Shopper sends first 2 messages · AI reply preview",
        detail: "Body has AI's first response preview + dashboard link.",
      },
      {
        type: "email",
        icon: "📋",
        title: "Session Summary",
        subject: "Chat summary: {customer name}",
        subtitle: "Topics · resolution · sentiment · AI performance",
        detail: "Fires when a conversation is resolved.",
      },
      {
        type: "email",
        icon: "📨",
        title: "Admin order-cancellation email",
        subtitle: "Internal email when the cancellation tool fires",
        detail: "Goes to the shop's configured notification address.",
      },
    ],
  }),

  stage(18, "merchant", 17, {
    when: "Usage approaches cap",
    title: "80% → 100% usage warnings",
    where: "in-app banner",
    desc: "Two banners gate the merchant as they outgrow the plan.",
    events: [
      {
        type: "banner",
        icon: "⚡",
        title: "Early Warning (80%)",
        subtitle: '"You\'re approaching your limit" · Upgrade CTA',
        detail: "Dismissible. Button: 'Upgrade to {Plan} — ${price}'.",
      },
      {
        type: "banner",
        icon: "🛑",
        title: "Limit Reached (100%)",
        subtitle: "Critical · countdown to reset · Upgrade plan",
        detail: "Red tone with countdown until monthly reset.",
      },
    ],
  }),

  stage(19, "merchant", 18, {
    when: "Weekly",
    title: "Weekly digest emails",
    where: "Email",
    desc: "One of two emails fires every week.",
    events: [
      {
        type: "email",
        icon: "📈",
        title: "Weekly Value Report (active shops)",
        subject: "Your week with Convi: {N} questions answered, ~{H} hours saved",
        subtitle: "Top products · pages · resolution rate · insights",
        detail: "Sent if the shop had activity that week.",
      },
      {
        type: "email",
        icon: "💤",
        title: "Weekly Re-engagement (quiet shops)",
        subject: "Convi is ready when your customers are",
        subtitle: "Soft nudge",
        detail: "Sent if the shop had no activity that week.",
      },
    ],
  }),

  stage(20, "both", 19, {
    when: "Cross-cutting",
    title: "Background banners + boundaries",
    where: "Everywhere applicable",
    desc: "Banners that can appear depending on state.",
    events: [
      {
        type: "banner",
        icon: "🧪",
        title: "Sandbox Environment",
        subtitle: "Playground · pre-flight · simulation logs",
        detail: "Info banner — 'this isn't production' — anywhere sandboxed runs are shown.",
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
        icon: "🔗",
        title: "Bubble dependency warning",
        subtitle: "Disabling bubble while another feature depends on it",
        detail: "Prevents inadvertent break.",
      },
      {
        type: "toast",
        icon: "🔌",
        title: "Gorgias / Zendesk disconnected",
        subtitle: "If a support integration drops",
        detail: "Fires when an integration loses its connection.",
      },
      {
        type: "modal",
        icon: "💥",
        title: "Error Boundary",
        subtitle: 'Generic "Something went wrong" screen',
        detail: "If the React tree crashes. Never shows raw errors.",
      },
    ],
  }),

  stage(21, "both", 20, {
    when: "Templates exist · not sending",
    title: "Roadmap — lifecycle emails not yet shipping",
    where: "Celery tasks raise NotImplementedError",
    desc: "Three lifecycle emails exist as templates but raise NotImplementedError today.",
    events: [
      {
        type: "roadmap",
        icon: "🧷",
        title: "Pre-flight Report",
        subject: "Pre-flight: {X} / {Y} checks passed",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — merchant never receives it today.",
      },
      {
        type: "roadmap",
        icon: "💡",
        title: "Weekly Insight",
        subject: "Insight: {headline}",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — merchant never receives it today.",
      },
      {
        type: "roadmap",
        icon: "🏆",
        title: "Milestone",
        subject:
          "🎉 {N} questions answered — that's about {H} hours saved",
        subtitle: "Template + task exist · not sent today",
        detail: "On the roadmap — merchant never receives it today.",
      },
    ],
  }),
];

// --- Layout pass: stack stages vertically with room for each card's events.
const Y_START = 40;
const BASE_H = 210; // header + desc + actions
const EV_H = 38; // per event row
const GAP = 96; // vertical breathing room between cards
{
  let cursor = Y_START;
  for (const node of initialNodes) {
    const evCount = node.data.events?.length ?? 0;
    node.position = { x: LANE_X[node.data.lane], y: cursor };
    cursor += BASE_H + evCount * EV_H + GAP;
  }
}

export const initialEdges = initialNodes.slice(1).map((n, i) => ({
  id: `e${i + 1}-${i + 2}`,
  source: String(i + 1),
  target: String(i + 2),
  type: "smoothstep",
  animated: false,
}));

export const TYPE_LABEL = {
  email: "Email",
  banner: "Banner",
  modal: "Modal",
  widget: "Widget",
  toast: "Toast",
  backend: "Backend",
  roadmap: "Roadmap",
};

export const ALL_TYPES = Object.keys(TYPE_LABEL);

export function defaultFilters() {
  return Object.fromEntries(ALL_TYPES.map((t) => [t, true]));
}
