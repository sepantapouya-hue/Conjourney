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
    desc:
      "Three gates have to all pass for the widget to render on the storefront: paid plan, App Embed active, and at least one widget switched on.",
    events: [
      {
        type: "banner",
        icon: "🔒",
        title: "Free Plan Upgrade (critical)",
        subtitle: "Gate 1 — free plan blocks publishing",
        detail:
          "Critical-tone banner with a 'See plans' button. Routes to /settings/plan.",
      },
      {
        type: "banner",
        icon: "🧩",
        title: "App Embed Widget Status",
        subtitle: "Gate 2 — embed must be active in Shopify theme",
        detail:
          "The 'Activate' button deep-links into the Shopify theme editor so they can add the Convi app block. Without it, the storefront has nowhere to mount Convi.",
      },
      {
        type: "banner",
        icon: "🟢",
        title: "Widget toggles (Bubble / FAQ / …)",
        subtitle: "Gate 3 — at least one surface needs to be on",
        detail:
          "Per-widget on/off switches. Even with a paid plan and active embed, nothing renders if every widget is off.",
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

  // Conditional gate — three checks must all pass for the widget to render
  // on the storefront. Each "no" loops back to stage 6 with the blocker
  // labeled on the edge so the merchant sees what's needed.
  {
    id: "6c1",
    type: "condition",
    position: { x: LANE_X.merchant, y: 0 }, // set in layout pass
    data: {
      lane: "merchant",
      label: "1 · Is the merchant on a paid plan?",
      hint:
        "Free-plan merchants can't enable the widget. They're routed back to the upgrade banner until they upgrade.",
      yesLabel: "Paid plan",
      noLabel: "Free plan",
    },
  },
  {
    id: "6c2",
    type: "condition",
    position: { x: LANE_X.merchant, y: 0 },
    data: {
      lane: "merchant",
      label: "2 · Is App Embed enabled in the Shopify theme?",
      hint:
        "The Convi app block has to be added in the Shopify theme editor. Without it, the storefront has nowhere to mount the widget.",
      yesLabel: "Enabled",
      noLabel: "Disabled",
    },
  },
  {
    id: "6c3",
    type: "condition",
    position: { x: LANE_X.merchant, y: 0 },
    data: {
      lane: "merchant",
      label: "3 · Is at least one widget switched on?",
      hint:
        "Bubble, FAQ, or another widget surface must be active. With all surfaces off, nothing renders even when plan + embed are good.",
      yesLabel: "≥ 1 active",
      noLabel: "All off",
    },
  },

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

// --- Layout pass: stack vertically with enough room that no card overlaps
// the next one, regardless of how many events it contains. Exported so the
// "Tidy" / auto-layout button can reuse the same constants.
export const LAYOUT = {
  LANE_X,
  Y_START: 60,
  STAGE_BASE_H: 280,
  STAGE_EV_H: 44,
  COND_H: 220,
  GAP: 140,
};

const Y_START = LAYOUT.Y_START;
const STAGE_BASE_H = LAYOUT.STAGE_BASE_H;
const STAGE_EV_H = LAYOUT.STAGE_EV_H;
const COND_H = LAYOUT.COND_H;
const GAP = LAYOUT.GAP;
{
  let cursor = Y_START;
  for (const node of initialNodes) {
    const lane = node.data.lane || "merchant";
    node.position = { x: LANE_X[lane], y: cursor };
    if (node.type === "condition") {
      cursor += COND_H + GAP;
    } else {
      const evCount = node.data.events?.length ?? 0;
      cursor += STAGE_BASE_H + evCount * STAGE_EV_H + GAP;
    }
  }
}

// --- Edges: connect each stage to the next, except where the condition
// branches the flow. Stage 6 → condition; condition (yes) → stage 7;
// condition (no) → back to stage 6 (loop, until they upgrade).
const _stageSeq = initialNodes
  .filter((n) => n.type !== "condition")
  .map((n) => n.id);

const _baseEdgeStyle = { strokeWidth: 2 };

export const initialEdges = [];
for (let i = 0; i < _stageSeq.length - 1; i++) {
  const src = _stageSeq[i];
  const tgt = _stageSeq[i + 1];
  if (src === "6" && tgt === "7") continue; // routed through 6c instead
  initialEdges.push({
    id: `e-${src}-${tgt}`,
    source: src,
    target: tgt,
    type: "smoothstep",
    style: _baseEdgeStyle,
  });
}

// Helpers to keep the three-condition chain edges concise.
const _yesEdge = (id, source, target, label) => ({
  id,
  source,
  sourceHandle: "yes",
  target,
  type: "smoothstep",
  label,
  style: { stroke: "#16a34a", strokeWidth: 2 },
  labelStyle: { fill: "#15803d", fontWeight: 700, fontSize: 11 },
  labelBgStyle: { fill: "#dcfce7" },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 6,
});
const _noEdge = (id, source, target, label) => ({
  id,
  source,
  sourceHandle: "no",
  target,
  type: "smoothstep",
  label,
  animated: true,
  style: { stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "6 4" },
  labelStyle: { fill: "#b91c1c", fontWeight: 700, fontSize: 11 },
  labelBgStyle: { fill: "#fee2e2" },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 6,
});

// Stage 6 enters the chain
initialEdges.push({
  id: "e-6-6c1",
  source: "6",
  target: "6c1",
  type: "smoothstep",
  style: _baseEdgeStyle,
});

// 1. Paid plan? — yes flows on, no kicks back with the blocker labeled
initialEdges.push(_yesEdge("e-6c1-6c2", "6c1", "6c2", "Paid plan ✓"));
initialEdges.push(
  _noEdge("e-6c1-6", "6c1", "6", "Free plan — upgrade required"),
);

// 2. App Embed active in theme? — yes flows on, no kicks back
initialEdges.push(_yesEdge("e-6c2-6c3", "6c2", "6c3", "App embed on ✓"));
initialEdges.push(
  _noEdge("e-6c2-6", "6c2", "6", "App embed off — activate in theme"),
);

// 3. At least one widget enabled? — yes publishes, no kicks back
initialEdges.push(
  _yesEdge("e-6c3-7", "6c3", "7", "Widget on ✓ publish allowed"),
);
initialEdges.push(
  _noEdge("e-6c3-6", "6c3", "6", "All widgets off — enable at least one"),
);

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

// --- Split journeys (Merchant vs Customer) --------------------------------
// Cross-cutting stages (lane === 'both') appear in both views because they
// touch both parties (OTP, handover, etc.).

function _layoutClone(nodes) {
  const out = nodes.map((n) => ({
    ...n,
    position: { ...n.position },
    data: { ...n.data },
  }));
  let cursor = Y_START;
  for (const n of out) {
    const lane = n.data.lane || "merchant";
    n.position = { x: LANE_X[lane] ?? LANE_X.merchant, y: cursor };
    if (n.type === "condition") {
      cursor += COND_H + GAP;
    } else {
      const evCount = n.data.events?.length || 0;
      cursor += STAGE_BASE_H + evCount * STAGE_EV_H + GAP;
    }
  }
  return out;
}

function _filterByLanes(allowed) {
  const setAllowed = new Set(allowed);
  const filtered = initialNodes.filter((n) =>
    setAllowed.has(n.data.lane || "merchant"),
  );
  const placed = _layoutClone(filtered);
  const ids = new Set(placed.map((n) => n.id));
  const edges = initialEdges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({ ...e }));
  return { nodes: placed, edges };
}

const _customerLane = _filterByLanes(["shopper", "both"]);

// =========================================================================
//  STATE-GROUPED FLOW VIEWS — Merchant + Customer
//  Each view is a single column of stage cards organized under section
//  headers (STATE 0, STATE 1, …). Headers are pure visual dividers; the
//  flow edges connect stage → stage only.
// =========================================================================

const FLOW_X = 80;

// Heights used by the layout pass for this flow. Stage heights vary per
// event count; header / email / modal cards are uniform.
const FLOW_BASE_H = 210; // stage base
const FLOW_EV_H = 44; // per event
const FLOW_HEADER_H = 130;
const FLOW_GAP = 90;

function _h(id, title, subtitle, tone = "primary", kicker) {
  return {
    _kind: "header",
    id,
    title,
    subtitle,
    tone,
    kicker,
  };
}

function _s(id, title, opts) {
  return {
    _kind: "stage",
    id,
    title,
    when: opts.when || "",
    where: opts.where || "",
    desc: opts.desc || "",
    events: opts.events || [],
    n: opts.n || id,
  };
}

function _ev(type, icon, title, subtitle, detail, extra = {}) {
  return { type, icon, title, subtitle, detail, ...extra };
}

// --- MERCHANT FLOW (state-grouped) ----------------------------------------

const _MERCHANT_FLOW_SPEC = [
  _h(
    "h0",
    "STATE 0 — Pre-install",
    "Shopify App Store. Merchant is not yet a Convi user.",
    "muted",
    "Section 0",
  ),
  _s("s0", "Pre-install · Shopify side", {
    when: "Before Convi exists for this shop",
    where: "Shopify App Store · OAuth screen",
    desc:
      'The merchant sees only Shopify-controlled surfaces. No Convi-side messaging until the OAuth callback completes.',
    events: [
      _ev(
        "backend",
        "🛒",
        "App Store listing page",
        "Marketing copy — conviapp.com / convi-website territory",
        "Not in this codebase. The merchant browses the listing and clicks Install.",
      ),
      _ev(
        "backend",
        "🔐",
        "Shopify OAuth consent screen",
        "Access scopes: products, customers, orders, fulfillments, …",
        "Shopify shows the standard consent screen. Convi has no say in its content.",
      ),
    ],
  }),

  _h(
    "h1",
    "STATE 1 — Install moment (t=0)",
    "OAuth callback completes. Everything below happens in the same instant.",
    "primary",
    "Section 1",
  ),
  _s("s1.1", "Backend side effects on OAuth callback", {
    when: "t = 0",
    where: "Convi backend (invisible to merchant)",
    desc:
      "Every install seeds the database with default rows and queues Celery tasks for crawling, Intercom syncing, and webhook registration.",
    events: [
      _ev(
        "backend",
        "DB",
        "Shop record created",
        "app_embed_enabled=False · chatbot_enabled=True · faq_widget_enabled=False · widget_enabled=False · ask_ai_button_enabled=False",
        "All four user-visible switches default OFF except the chatbot engine itself.",
      ),
      _ev(
        "backend",
        "✉",
        "NotificationSettings row",
        "Seeded with Shopify's contact_email for the shop",
        "Used as the recipient for all admin / merchant emails.",
      ),
      _ev(
        "backend",
        "🎨",
        "WidgetSettings row",
        "Brand defaults: colors, copy, suggested prompts",
        "Editable later under /publish/customize.",
      ),
      _ev(
        "backend",
        "🛠",
        "ShopAbility rows",
        "ShopAbilityService.update_or_create_all — which AI tools the shop is permitted to use",
        "Tools default to a curated baseline. Editable internally.",
      ),
      _ev(
        "backend",
        "🌐",
        "WebSearchConfiguration row",
        "Defaults for the web-search tool",
        "Disabled by default; merchant can enable in settings.",
      ),
      _ev(
        "backend",
        "🧠",
        "MerchantAITrainingCustomization row",
        "Empty container filled in by /train",
        "Holds custom FAQs, policies, tone-of-voice overrides.",
      ),
      _ev(
        "backend",
        "🌍",
        "sync_translations_task (Celery)",
        "Pulls the shop's Shopify locales into Convi",
        "Runs immediately on the install queue.",
      ),
      _ev(
        "backend",
        "📡",
        "register_shop_locales_webhooks_task",
        "Subscribes to shop-update / locales-create / locales-update",
        "Keeps locale config in sync over time.",
      ),
      _ev(
        "backend",
        "⏱",
        "post_installation_support_related_actions_task (+60s)",
        "Intercom integration",
        "Runs 60 seconds after install so the Intercom contact reflects the new shop.",
      ),
      _ev(
        "backend",
        "🕷",
        "store_storefront_content_task",
        "Crawls Shopify catalog → indexes into Pinecone",
        "On INSTALLATION_QUEUE. Drives the Import Health card.",
      ),
      _ev(
        "backend",
        "📈",
        "Three Intercom syncs at +60s",
        "update_intercom_contact_app_subscription_attributes · update_shop_post_installation_intercom_attributes · update_intercom_contact_overall_info_attributes",
        "Internal Convi ops visibility comes via Intercom. No Slack hook is defined.",
      ),
    ],
  }),
  _s("s1.2", "Lands on Convi admin home (Free home variant)", {
    when: "t = 0 + ~1s redirect",
    where: "/",
    desc:
      "Because conversations=0 and plan=free, the home router lands on the Free home screen (covered in detail in STATE 2 below).",
    events: [
      _ev(
        "backend",
        "🧭",
        "Home router decision",
        "src/features/home — picks the Free screen",
        "useLaunchStatus() returns JUST_INSTALLED / PREVIEW_READY depending on crawl progress.",
      ),
    ],
  }),
  _h(
    "h2",
    "STATE 2 — Free plan, post-install",
    "Most merchants spend hours or days here. All four sub-states render the Free home screen with different banner combinations.",
    "primary",
    "Section 2",
  ),
  _s("s2.1", "Free + catalog still indexing + no policies imported", {
    when: "First 5–15 minutes after install",
    where: "/ · Free home · src/features/home/screens/free",
    desc:
      "Page title: time-of-day greeting (Good morning / afternoon / evening, {ShopName}). Subtitle: home.subtitle_launch — 'Get your AI agent live.'",
    events: [
      _ev(
        "banner",
        "🎁",
        "Onboarding Discount Banner — Incomplete",
        "Tone: info · home.onboarding_discount_banner.incomplete_*",
        "Stays on Incomplete copy until all three onboarding checks pass: data sync complete, playground tested, pre-flight checks run.",
      ),
      _ev(
        "banner",
        "⏳",
        "Failure Mode Banner — Import In Progress",
        "Tone: info · dismissible (BANNERS.IMPORT_IN_PROGRESS_DISMISSED)",
        "home.failure_mode_banner.import_in_progress_* — body interpolates % completion.",
      ),
      _ev(
        "banner",
        "✅",
        "Launch Progress checklist",
        "Catalog · Policies · Trained · Playground · Pre-flight · Plan · Widget · Embed",
        "Each step shows Pending / In progress / Done.",
      ),
      _ev(
        "banner",
        "📊",
        "Import Health card",
        "Per-resource: Products X/Y · Pages X/Y · Articles X/Y · Collections X/Y · Policies X/Y",
        "Drives the Content Health metrics on /train later.",
      ),
      _ev(
        "banner",
        "🛍️",
        "Storefront Status card (Free variant)",
        "'Free plan — upgrade to go live'",
        "Routes to /settings/plan.",
      ),
      _ev(
        "banner",
        "📅",
        "Booking Demo Card",
        "home.booking_demo_banner.* · persistent CTA",
        "Always-on call to book a sales call.",
      ),
    ],
  }),
  _s("s2.2", "Free + catalog indexed but policies missing", {
    when: "After the catalog crawl finishes (minutes to hours later)",
    where: "/ · Free home",
    desc:
      "The most common state after the catalog finishes. Shopify policies (return / shipping / privacy / refund / terms) often fail to sync if the merchant hasn't published them on the store.",
    events: [
      _ev(
        "banner",
        "⚠",
        "Failure Mode Banner — Missing Policies",
        "Tone: warning · dismissible (BANNERS.MISSING_POLICIES_DISMISSED)",
        "Trigger: mainResourcesSynced === true && policies.count === 0 && !dismissed",
      ),
      _ev(
        "banner",
        "🧪",
        "Embedded Playground grid",
        "Trigger: isPastTrainStep && preflight not all passed",
        "Inline 'ask the AI' surface on the home page, below the Storefront Status card.",
      ),
      _ev(
        "banner",
        "🎁",
        "Onboarding Discount Banner — Incomplete (still)",
        "Until all three onboarding checks pass",
        "Same as in 2.1.",
      ),
    ],
  }),
  _s("s2.3", "Free + everything indexed + all onboarding complete", {
    when: "After they finish training, run pre-flight, etc.",
    where: "/ · Free home",
    desc:
      "The merchant has done everything except buy a plan. The discount banner flips to Complete state with a live promo code.",
    events: [
      _ev(
        "banner",
        "🎉",
        "Onboarding Discount Banner — Complete",
        "Tone: success · home.onboarding_discount_banner.complete_*",
        "Three bullet perks (complete_perk_1/2/3). Action button: 'Get {discount}% off for {X} months' — applies promo code free-trial-100 to the first paid plan they buy.",
      ),
    ],
  }),
  _s("s2.4", "Free + everything complete + discount banner dismissed", {
    when: "After they dismiss the discount banner",
    where: "/ · Free home",
    desc:
      "Plain home with home.subtitle_launch subtitle. Launch Progress + Storefront Status still push the plan upgrade.",
    events: [
      _ev(
        "banner",
        "ℹ",
        "Plain Free home (no celebratory banners)",
        "Launch Progress + Storefront Status still push upgrade",
        "Failure-mode banners are also gone.",
      ),
    ],
  }),
  _s("s2-email1", "Email · Welcome — Synced", {
    when: "When catalog crawl completes (between 2.1 → 2.2)",
    where: "LifecycleEmailSenderService.send_welcome_synced()",
    desc:
      "First lifecycle email the merchant ever receives. Body contains the indexed product count + knowledge item count and links to /train.",
    events: [
      _ev(
        "email",
        "✉",
        "Welcome — Synced",
        "Subject: Welcome to Convi — your AI agent is ready to train",
        "Body: count of indexed products + knowledge items, link back to the training dashboard.",
      ),
    ],
  }),
  _s("s2-email2", "Email · Train Nudge", {
    when: "Dispatched after Welcome by dispatch_lifecycle_emails_task",
    where: "LifecycleEmailSenderService.send_train_nudge()",
    desc:
      "Second lifecycle email; pushes the merchant toward enabling the widget.",
    events: [
      _ev(
        "email",
        "👉",
        "Train Nudge",
        "Subject: Your AI agent is waiting — 5 minutes to launch",
        "Sender service: LifecycleEmailSenderService.send_train_nudge()",
      ),
    ],
  }),
  _s("s2-modal", "Modal · Permission Modal (Free tries paid feature)", {
    when: "Whenever they tap a paid-only feature while on Free",
    where: "Anywhere a paid feature lives",
    desc: "Routes them to /settings/plan.",
    events: [
      _ev(
        "modal",
        "🚫",
        "Permission Modal",
        "permission.permission_modal_title / _description",
        "Pops up with an upgrade CTA. Closes by clicking 'See plans' (→ /settings/plan) or dismissing.",
      ),
    ],
  }),
  _s("s2-pricing", "/settings/plan · Welcome Offer Banner (within 7 days)", {
    when: "Within 7 days of install",
    where: "/settings/plan",
    desc: "Pricing page surfaces a 7-day countdown timer urging early upgrade.",
    events: [
      _ev(
        "banner",
        "⏱",
        "Welcome Offer Banner",
        "pricing.welcome_offer_banner.title / .description",
        "Includes the Timer component (7-day countdown). Trigger: now - lastInstallTime < 7 days. Dismissible.",
      ),
      _ev(
        "banner",
        "💳",
        "Pricing tier cards",
        "Monthly / annual toggle",
        "Standard tier comparison.",
      ),
    ],
  }),

  _h(
    "h3",
    "STATE 3 — Paid plan, just upgraded, nothing live yet",
    "Plan purchase succeeds via Shopify's hosted checkout. Home router now picks Paid Without Conversation screen.",
    "primary",
    "Section 3",
  ),
  _s("s3.1", "Paid + Widget OFF + Embed OFF", {
    when: "Right after plan purchase",
    where: "/ · Paid Without Conversation · src/features/home/screens/paid-without-conversation",
    desc:
      "Page subtitle: home.subtitle_launch ('Get your AI agent live.'). Most early checklist items are now green (synced, trained, plan upgraded). Two still red: widget enabled, app embed activated.",
    events: [
      _ev(
        "banner",
        "✅",
        "Launch Progress checklist",
        "Two items red: widget, app embed",
        "Synced, trained, plan upgraded all green.",
      ),
      _ev(
        "banner",
        "📊",
        "Import Health card",
        "Likely fully green by now",
        "All sub-resources should be done indexing.",
      ),
      _ev(
        "banner",
        "🛍️",
        "Storefront Status card (Paid variant)",
        "Points to /publish/widgets",
        "isPaid={true} variant.",
      ),
      _ev(
        "banner",
        "📅",
        "Booking Demo Card",
        "Persistent",
        "Same as always.",
      ),
    ],
  }),
  _s("s3.2", "Paid + Widget ON + Embed OFF", {
    when: "Toggled the bubble (or ask-AI / FAQ) on under /publish/widgets",
    where: "/ · Paid Without Conversation · plus /publish/widgets",
    desc: "Launch Progress widget step now green; app embed step still red.",
    events: [
      _ev(
        "banner",
        "🧩",
        "App Embed Status Banner — warning",
        "publish.widgets.app_embed_title_off / _description_off",
        "Action button 'Activate' deep-links into the Shopify theme editor via useAppEmbedInfo().activationDeepLink.",
      ),
    ],
  }),
  _s("s3.3", "Paid + Widget OFF + Embed ON", {
    when: "They added the app embed block before flipping the widget toggle",
    where: "/ · Paid Without Conversation",
    desc:
      "Rare path. Home looks like 3.1 with the embed step green and the widget step red.",
    events: [
      _ev(
        "banner",
        "🧩",
        "App Embed Status Banner — success",
        "publish.widgets.app_embed_title_on / _description_on",
        "Green tone — embed is good. Just the widget toggle that's blocking publish.",
      ),
    ],
  }),
  _s("s3.4", "🎉 Paid + Widget ON + Embed ON, but zero conversations", {
    when: "Both switches just flipped on",
    where: "/ · Paid Without Conversation",
    desc:
      "The 'Just Live' moment. useLaunchStatus() flips to VERIFIED_LIVE. Page subtitle: home.subtitle_just_live — 'Convi is live. Send a test message.'",
    events: [
      _ev(
        "banner",
        "🟢",
        "Celebration Banner / 'Just Live'",
        "Tone: success · home.just_live.title / .subtitle",
        "Green Card background with three green badges: Plan active ✓ · Bubble widget active ✓ · App embed active ✓. Primary CTA: home.just_live.start_test_conversation → opens storefront in a new tab.",
        { quote: "Convi is live. Send a test message." },
      ),
      _ev(
        "banner",
        "✅",
        "Launch Progress (all green)",
        "Every checklist item complete",
        "Visual signal that pre-launch is done.",
      ),
      _ev(
        "banner",
        "🛍️",
        "Storefront Status (live state)",
        "Confirms the widget is rendering on the storefront",
        "isPaid + widget + embed all true.",
      ),
    ],
  }),
  _s("s3-email", "Email · Widget Live (sent at the Just-Live moment)", {
    when: "When widget + embed both flip ON",
    where: "LifecycleEmailSenderService.send_widget_live()",
    desc: "Storefront link + what the widget can now do + settings link.",
    events: [
      _ev(
        "email",
        "🚀",
        "Widget Live",
        "Subject: 🎉 Convi is live on {shop_domain}",
        "Sender: LifecycleEmailSenderService.send_widget_live()",
      ),
    ],
  }),

  _h(
    "h4",
    "STATE 4 — Live, first shopper arrives",
    "Backend signal chat_session_first_2_messages_added_signal fires once a new chat reaches 2 shopper messages.",
    "primary",
    "Section 4",
  ),
  _s("s4.1", "First conversation created (signal fires)", {
    when: "First time a chat reaches 2 shopper messages",
    where: "Backend signal · home router flips to With Conversation",
    desc:
      "Once analytics.conversations.totalCount > 0, the home router switches to the With Conversation screen permanently.",
    events: [
      _ev(
        "backend",
        "📶",
        "chat_session_first_2_messages_added_signal",
        "Fires the first time any new chat hits 2 shopper messages",
        "Triggers the merchant-side new-conversation email and flips the home variant.",
      ),
    ],
  }),
  _s("s4-email", "Email · New Customer Conversation (every new chat)", {
    when: "Each new chat reaches 2 shopper messages",
    where: "EmailNotificationService.prepare_new_conversation_email()",
    desc:
      "Goes to merchant primary email. Optionally CCs the customer per NotificationSettings.",
    events: [
      _ev(
        "email",
        "🗣",
        "New Customer Conversation",
        "Subject: New Customer Conversation - Convi",
        "Template: convi/apps/account/templates/account/new_conversation_email.html. Body: customer's first message + AI's response preview + dashboard link.",
      ),
    ],
  }),

  _h(
    "h5",
    "STATE 5 — Steady-state operator",
    "Paid + live + has conversations. The everyday view. Sub-states cover usage caps, regressions, and downgrade.",
    "primary",
    "Section 5",
  ),
  _s("s5.1", "Steady state — under usage limit", {
    when: "Every visit during normal operation",
    where: "/ · With Conversation",
    desc:
      "Page subtitle: home.subtitle_operator. The home is the operator dashboard with KPIs, live activity, and recommendations.",
    events: [
      _ev(
        "banner",
        "📊",
        "Live Banner",
        "home.operator.live_banner_title — refreshes every 10s",
        "Active shoppers + avg AI reply time + conversations today. 'Open Conversations' button → /analyze or /conversations.",
      ),
      _ev(
        "banner",
        "🚨",
        "Needs Attention list",
        "Low-quality answer flagged · feedback to triage · knowledge gap · handover awaiting reply",
        "Items requiring merchant action.",
      ),
      _ev(
        "banner",
        "📈",
        "Overview KPI grid",
        "Conversations answered · hours saved · AI resolution rate · top topics",
        "Aggregated stats.",
      ),
      _ev(
        "banner",
        "💳",
        "Current Plan card (paid-only)",
        "Current tier · usage bar · next plan suggestion",
        "Hidden on Free.",
      ),
      _ev(
        "banner",
        "📡",
        "Live Activity Feed (paid-only)",
        "Stream of recent events: AI answered · handover · negative feedback",
        "Hidden on Free.",
      ),
      _ev(
        "banner",
        "💡",
        "Recommendations",
        "'Add return policy to knowledge' · 'Train on FAQs from last week's chats'",
        "Algorithmic suggestions.",
      ),
      _ev(
        "banner",
        "🎯",
        "Engagement Section",
        "Onboarding cards for tasks they haven't done",
        "Train more, customize bubble, test simulations.",
      ),
      _ev(
        "banner",
        "📅",
        "Booking Demo Card",
        "Persistent",
        "Always present.",
      ),
    ],
  }),
  _s("s5.2", "At ~80% of monthly cap", {
    when: "monthlyAiResolutionUsage / Limit ≈ 0.8",
    where: "/ · With Conversation",
    desc: "Same as 5.1 plus an early-warning banner.",
    events: [
      _ev(
        "banner",
        "⚡",
        "Early Warning Banner",
        "Tone: warning · dismissible (BANNERS.EARLY_PRICING_WARNING)",
        "pricing.early_warning_title / _description. CTA: pricing.early_warning_cta — 'Upgrade to {Plan} — ${price}' with live pricing.",
      ),
    ],
  }),
  _s("s5.3", "At 100% of monthly cap", {
    when: "monthlyAiResolutionUsage >= monthlyAiResolutionLimit",
    where: "/ · With Conversation",
    desc: "Critical banner sits until reset or upgrade.",
    events: [
      _ev(
        "banner",
        "🛑",
        "Limit Reached Banner",
        "Tone: critical · NOT dismissible",
        "home.operator.limit_reached_title / _description. Action 'Upgrade plan' → /settings/plan. Body interpolates days-until-reset or 'resets today'.",
      ),
    ],
  }),
  _s("s5.4", "Paid + Widget ON + Embed OFF + has historical conversations", {
    when: "They removed the app embed after going live",
    where: "/ · With Conversation",
    desc: "Reason not live in useLaunchStatus(): EMBED.",
    events: [
      _ev(
        "banner",
        "📊",
        "Live Banner (zero active shoppers)",
        "Widget not on the storefront, so no live shoppers",
        "Activity feed still shows past events.",
      ),
      _ev(
        "banner",
        "🚨",
        "Needs Attention surfaces 'App embed not activated'",
        "Calls out the missing embed",
        "Direct deep-link to fix.",
      ),
    ],
  }),
  _s("s5.5", "Paid + Widget OFF + Embed ON + has historical conversations", {
    when: "They disabled the widget toggle inside Convi",
    where: "/ · With Conversation",
    desc: "Reason not live: WIDGET.",
    events: [
      _ev(
        "banner",
        "🚨",
        "Needs Attention surfaces 'Enable a widget'",
        "Embed is good but all widget toggles are off",
        "Click to /publish/widgets.",
      ),
    ],
  }),
  _s("s5.6", "Paid + Widget OFF + Embed OFF + has historical conversations", {
    when: "Worst paid regression — both switches off",
    where: "/ · With Conversation",
    desc: "Reason not live: WIDGET (widget is the first thing checked).",
    events: [
      _ev(
        "banner",
        "🚨",
        "Needs Attention flags BOTH widget and embed",
        "No live activity until at least both come back on",
        "Recommendations push to re-enable.",
      ),
    ],
  }),
  _s("s5.7", "Free + has historical conversations (downgrade)", {
    when: "The merchant downgraded after using Convi",
    where: "/ · With Conversation",
    desc:
      "Home variant is still With Conversation because count > 0, but the paid-only sections disappear.",
    events: [
      _ev(
        "banner",
        "👻",
        "Current Plan card hidden",
        "Paid-only",
        "Gone on Free.",
      ),
      _ev(
        "banner",
        "👻",
        "Live Activity Feed hidden",
        "Paid-only",
        "Gone on Free.",
      ),
      _ev(
        "banner",
        "💡",
        "Recommendations push re-subscribe",
        "Re-engagement messaging",
        "Plus the plan-gate suppresses the widget on the storefront.",
      ),
    ],
  }),
  _s("s5-handover", "Email · Handover Notification", {
    when: "Shopper requests handover OR AI cannot resolve",
    where: "EmailNotificationService — chat_session_handed_over_to_human_signal",
    desc: "Urgent tone email to the merchant.",
    events: [
      _ev(
        "email",
        "🆘",
        "Handover Notification",
        "Subject: Customer Needs Your Help",
        "Body: urgent tone, dashboard link.",
      ),
    ],
  }),
  _s("s5-summary", "Email · Session Summary", {
    when: "Conversation resolved (chat_session_resolved_signal)",
    where: "EmailNotificationService",
    desc: "Per-conversation digest.",
    events: [
      _ev(
        "email",
        "📋",
        "Session Summary",
        "Subject: Chat summary: {customer_name} — Convi",
        "Body: topics discussed · resolution status · sentiment · AI performance metrics.",
      ),
    ],
  }),
  _s("s5-weekly", "Email · Weekly digest (one of two)", {
    when: "Weekly cron — send_weekly_reports_fanout_task",
    where: "Per shop, picks one based on activity",
    desc: "Either the Value Report (active shop) or the Re-engagement nudge (quiet shop).",
    events: [
      _ev(
        "email",
        "📈",
        "Weekly Value Report (shop had activity)",
        "Subject: Your week with Convi: {N} questions answered, ~{H} hours saved",
        "Body: top products, top pages, AI resolution rate, trending insights, conversations answered, hours saved.",
      ),
      _ev(
        "email",
        "💤",
        "Weekly Re-engagement (shop had no activity)",
        "Subject: Convi is ready when your customers are",
        "Body: soft nudge to drive traffic to the widget.",
      ),
    ],
  }),
  _s("s5-admin", "Email · Internal admin emails", {
    when: "Tool-driven",
    where: "Sent to the merchant's configured notification address",
    desc: "Two internal-ish emails that fire when the AI uses certain tools.",
    events: [
      _ev(
        "email",
        "📨",
        "Chat Handover Notification (Admin)",
        "Subject: Chat Handover Requested",
        "Template: convi/apps/tools/templates/tools/handover.html. Triggered when shopper invokes the handover tool.",
      ),
      _ev(
        "email",
        "📨",
        "Order Cancellation Notification (Admin)",
        "Subject: Order Cancellation Requested",
        "Template: convi/apps/tools/templates/tools/cancel_order.html. Triggered when shopper uses the AI order-cancellation tool.",
      ),
    ],
  }),
  _s("s5-roadmap", "Emails coded but not yet sending (roadmap)", {
    when: "Templates + Celery tasks exist, raise NotImplementedError",
    where: "Roadmap — never delivered today",
    desc: "Three lifecycle emails are stubbed but never reach the merchant.",
    events: [
      _ev(
        "roadmap",
        "🧷",
        "Pre-flight Report",
        "Subject: Pre-flight: {passed} / {total} checks passed",
        "Template + Celery task exist; raises NotImplementedError.",
      ),
      _ev(
        "roadmap",
        "💡",
        "Weekly Insight",
        "Subject: Insight: {insight_headline}",
        "Template + Celery task exist; raises NotImplementedError.",
      ),
      _ev(
        "roadmap",
        "🏆",
        "Milestone",
        "Subject: 🎉 {N} questions answered — that's about {H} hours saved",
        "Template + Celery task exist; raises NotImplementedError.",
      ),
    ],
  }),

  _h(
    "hx",
    "CROSS-CUTTING — surfaces visible from any state",
    "Banners and modals that can layer on top of any of the states above. Not state-gated.",
    "neutral",
    "Section X",
  ),
  _s("sx-train", "/train · Knowledge management surfaces", {
    when: "Whenever the merchant is on /train",
    where: "/train",
    desc: "Two banners ride on this page.",
    events: [
      _ev(
        "banner",
        "🩺",
        "Content Health Banner",
        "train.learn.banner_title / .banner_description",
        "Four sub-metric blocks: Coverage (Full/Partial), Freshness (Current/Syncing), Quality (N flagged), Sources (N custom FAQs).",
      ),
      _ev(
        "banner",
        "✉",
        "Email Notification Banner (Post-Sync)",
        "train.learn.email_banner_title / .email_banner_desc",
        "Offered during indexing; lets the merchant opt in to an email when sync is done.",
      ),
    ],
  }),
  _s("sx-analyze", "/analyze · Conversations + logs", {
    when: "Viewing playground / pre-flight / simulation logs",
    where: "/analyze",
    desc:
      "Info banner clarifying that this is sandboxed traffic, not production.",
    events: [
      _ev(
        "banner",
        "🧪",
        "Sandbox Environment Banner",
        "evaluate.env_sandbox_banner_title / _description",
        "Tone: info.",
      ),
    ],
  }),
  _s("sx-eval", "/evaluate/simulations · Pre-flight simulations", {
    when: "Visiting the simulations tab",
    where: "/evaluate/simulations",
    desc: "Pitches simulations as a feature.",
    events: [
      _ev(
        "banner",
        "🎛",
        "Simulations Feature Banner",
        "evaluate.simulations.banner_title / .banner_description",
        "Marketing-ish info card.",
      ),
    ],
  }),
  _s("sx-publish", "/publish/widgets · Widget management", {
    when: "Whenever on /publish/widgets",
    where: "/publish/widgets",
    desc: "Plan + embed gating banners + per-widget toggles.",
    events: [
      _ev(
        "banner",
        "🧩",
        "App Embed Status Banner (success or warning)",
        "publish.widgets.app_embed_title_on/off + _description_on/off",
        "On click: deep-links to Shopify theme editor.",
      ),
      _ev(
        "banner",
        "🔒",
        "Free Plan Upgrade Prompt (Free only)",
        "Tone: critical · publish.widgets.free_plan_title / _description",
        "Action 'See plans' → /settings/plan.",
      ),
    ],
  }),
  _s("sx-settings", "/settings/plan · Pricing page", {
    when: "Pricing page visits",
    where: "/settings/plan",
    desc: "Pricing-specific banners + cards.",
    events: [
      _ev(
        "banner",
        "⏱",
        "Welcome Offer Banner",
        "pricing.welcome_offer_banner.title / .description",
        "Trigger: within 7 days of install. 7-day countdown timer. Dismissible.",
      ),
    ],
  }),
  _s("sx-error", "Global · Error Boundary", {
    when: "If the React tree crashes",
    where: "Wraps the entire app",
    desc: "Never shows raw error messages.",
    events: [
      _ev(
        "modal",
        "💥",
        "Error Boundary",
        "common.error_boundary_title / _description / _action",
        "Fallback screen. Click action to retry / refresh.",
      ),
    ],
  }),
];

// --- CUSTOMER FLOW (Shopper STATE 0..9) -----------------------------------

const _CUSTOMER_FLOW_SPEC = [
  _h(
    "ch0",
    "Shopper Journey — Storefront",
    "Everything the customer sees on the merchant's store, from before they click the bubble to closing a chat.",
    "primary",
    "Customer",
  ),
  _s("sh0", "Shopper STATE 0 — Storefront loaded, widget not yet opened", {
    when: "Before the shopper interacts with the widget",
    where: "Storefront",
    desc: "Launcher button + optional proactive bubble.",
    events: [
      _ev(
        "widget",
        "●",
        "Launcher button",
        "Icon, no text",
        "The default closed state of the widget.",
      ),
      _ev(
        "widget",
        "💭",
        "Proactive Speech Bubble (+30s)",
        "Merchant-configured displayText + assistantText",
        "After 30s dwell on a product/home page, if the merchant enabled it. Otherwise nothing.",
      ),
    ],
  }),
  _s("sh1", "Shopper STATE 1 — Widget opens, no chat yet", {
    when: "On first click of the launcher",
    where: "In-widget · home view",
    desc: "Welcome + suggested prompts + input + footer.",
    events: [
      _ev(
        "widget",
        "👋",
        "Welcome message",
        "chatWelcome (default 'Chat with us') or embedChatWelcome",
        "Top of the widget home.",
      ),
      _ev(
        "widget",
        "✨",
        "Suggested starter prompts",
        "predefinedInquiries array",
        "Default empty; merchant fills.",
      ),
      _ev(
        "widget",
        "⌨",
        "Text input placeholder",
        "'Type your message here…' (placeholder / embedPlaceholder key)",
        "Hardcoded fallback.",
      ),
      _ev(
        "widget",
        "🔗",
        "'Powered by Convi' footer",
        "Only if settings.isPoweredByEnabled === true",
        "Links to conviapp.com.",
      ),
    ],
  }),
  _s("sh2", "Shopper STATE 2 — Pre-chat survey (optional)", {
    when: "Only if settings.isSurveyEnabled === true",
    where: "Modal inside widget",
    desc: "Captures name + email before the first message.",
    events: [
      _ev(
        "modal",
        "📝",
        "Pre-chat survey modal",
        "surveyMessage (default 'Please introduce yourself:')",
        "Fields: surveyNamePlaceholder · surveyEmailPlaceholder. Buttons: surveySendButtonText · surveySkipButtonText (Skip hidden if required).",
      ),
    ],
  }),
  _s("sh3", "Shopper STATE 3 — AI is working (state placeholders)", {
    when: "Between shopper message and AI reply",
    where: "In-widget · status placeholders",
    desc:
      "Hardcoded English-only placeholders cycle as the AI calls tools (convi-sdk/.../state-placeholder).",
    events: [
      _ev(
        "widget",
        "◌",
        "Initializing…",
        "Boot state",
        "Initial status while the agent spins up.",
      ),
      _ev(
        "widget",
        "🧠",
        "Processing… / Thinking…",
        "Reasoning",
        "Generic working states.",
      ),
      _ev(
        "widget",
        "🔎",
        "Searching…",
        "Search tool in flight",
        "Calling the search tool.",
      ),
      _ev(
        "widget",
        "📦",
        "Tracking order…",
        "Order tool in flight",
        "Order tracking tool is being called.",
      ),
      _ev(
        "widget",
        "⏳",
        "Waiting… / Loading…",
        "Generic standby",
        "Between tool calls.",
      ),
    ],
  }),
  _s("sh4", "Shopper STATE 4 — Cart actions (hardcoded errors)", {
    when: "If the AI's cart tool fails",
    where: "In-widget · cart errors",
    desc: "All hardcoded English fallbacks.",
    events: [
      _ev(
        "widget",
        "🛒",
        "Generic cart update error",
        '"I had trouble updating your cart. Please try again."',
        "Fallback for cart write failures.",
      ),
      _ev(
        "widget",
        "🛒",
        "Cart read error",
        '"I had trouble reading your cart. Please try again."',
        "Fallback for cart read failures.",
      ),
      _ev(
        "widget",
        "🛒",
        "Cart clear error",
        '"I had trouble clearing your cart. Please try again."',
        "Fallback for cart clear failures.",
      ),
      _ev(
        "widget",
        "🛒",
        "Out of stock",
        '"Sorry, that item is out of stock."',
        "Inventory miss.",
      ),
      _ev(
        "widget",
        "🛒",
        "Variant unavailable",
        '"That variant is not available."',
        "Variant gone or unpublished.",
      ),
      _ev(
        "widget",
        "🛒",
        "Product not found",
        "\"Sorry, I couldn't find that product.\"",
        "Lookup miss.",
      ),
      _ev(
        "widget",
        "🛒",
        "Quantity exceeds stock",
        '"Could not update quantity — the requested amount may exceed available stock."',
        "Inventory constraint.",
      ),
      _ev(
        "widget",
        "🛒",
        "Ambiguous match",
        '"I found multiple matching items. Please be more specific."',
        "Multiple products matched.",
      ),
      _ev(
        "widget",
        "🛒",
        "Out-of-stock badge on product cards",
        '"Out of stock"',
        "Inline badge on each card.",
      ),
    ],
  }),
  _s("sh5", "Shopper STATE 5 — Order cancellation (OTP)", {
    when: "Shopper asks the AI to cancel an order",
    where: "In-widget + email to shopper",
    desc:
      "Shopper-side OTP loop. After verification, the merchant gets the admin cancellation email.",
    events: [
      _ev(
        "email",
        "🔢",
        "OTP email to shopper",
        "Template: convi/apps/tools/templates/tools/otp.html",
        "6-digit code with TTL countdown. Sent to the shopper's email.",
      ),
      _ev(
        "modal",
        "🔢",
        "OTP confirmation modal in widget",
        "Captures the code",
        "Once entered, triggers the Admin Order Cancellation email to the merchant.",
      ),
    ],
  }),
  _s("sh6", "Shopper STATE 6 — Handover requested or AI gives up", {
    when: "Shopper escalates OR AI cannot resolve",
    where: "In-widget · handover banner",
    desc: "Hardcoded message + merchant gets the Handover Notification email.",
    events: [
      _ev(
        "widget",
        "🙋",
        "Handover banner inside chat",
        "\"This conversation has been handed over to a human agent. Start a new chat if you don't want to wait.\"",
        "Static copy.",
      ),
    ],
  }),
  _s("sh7", "Shopper STATE 7 — Conversation resolved", {
    when: "Conversation closes",
    where: "In-widget · resolved banner",
    desc: "Hardcoded message + merchant gets the Session Summary email.",
    events: [
      _ev(
        "widget",
        "🔒",
        "Resolved banner inside chat",
        '"This conversation is closed. You can start a new chat to chat with us."',
        "Static copy.",
      ),
    ],
  }),
  _s("sh8", "Shopper STATE 8 — Generic error", {
    when: "When something breaks",
    where: "In-widget · error screen",
    desc: "Heading hardcoded; body dynamic from API.",
    events: [
      _ev(
        "widget",
        "⚠",
        "'Something went wrong' heading",
        "Hardcoded",
        "Body: dynamic API error message.",
      ),
    ],
  }),
  _s("sh9", "Shopper STATE 9 — Post-conversation CSAT (optional)", {
    when:
      "After AI's last message, only if settings.isSatisfactionFeedbackEnabled",
    where: "Modal in widget",
    desc: "Thumbs up/down + optional follow-up.",
    events: [
      _ev(
        "modal",
        "👍",
        "CSAT prompt",
        "satisfactionFeedbackTitle (default 'Was your inquiry resolved?')",
        "Thumbs up / thumbs down.",
      ),
      _ev(
        "modal",
        "💬",
        "Negative feedback follow-up",
        "negativeSatisfactionFeedbackReason — 'We are sorry that you had a bad experience. What was the problem?'",
        "Field placeholder negativeFeedbackPlaceholder; submit negativeFeedbackSendButtonText.",
      ),
      _ev(
        "modal",
        "✅",
        "Submitted confirmation",
        "satisfactionFeedbackAfterSubmission — 'Your feedback submitted'",
        "Confirms the submission.",
      ),
    ],
  }),
  _s("sh10", "What the shopper NEVER sees", {
    when: "Always",
    where: "Anywhere",
    desc: "Things deliberately omitted from the widget.",
    events: [
      _ev(
        "widget",
        "🚫",
        "No GDPR / cookie consent UI",
        "Out of scope for the widget",
        "Relies on the merchant's broader site consent.",
      ),
      _ev(
        "widget",
        "🚫",
        "No business-hours awareness",
        "Widget is always 'open'",
        "There's no out-of-hours messaging.",
      ),
      _ev(
        "widget",
        "🚫",
        "No proactive email capture",
        "Beyond the pre-chat survey",
        "No standalone email-capture nudges.",
      ),
      _ev(
        "widget",
        "🚫",
        "No 'Powered by Convi' when disabled",
        "Hidden when settings.isPoweredByEnabled === false",
        "Merchant-controlled.",
      ),
    ],
  }),
];

// --- Build flow nodes + edges from spec -----------------------------------

function _buildFlow(spec) {
  const nodes = [];
  const edges = [];
  let cursor = 60;
  let prevStageId = null;

  for (const item of spec) {
    if (item._kind === "header") {
      nodes.push({
        id: item.id,
        type: "header",
        position: { x: FLOW_X, y: cursor },
        data: {
          lane: "merchant",
          kicker: item.kicker,
          title: item.title,
          subtitle: item.subtitle,
          tone: item.tone,
        },
      });
      cursor += FLOW_HEADER_H + FLOW_GAP;
      // Headers reset the chain — but we still draw a faint linking edge from
      // the previous stage to give visual continuity.
    } else {
      nodes.push({
        id: item.id,
        type: "stage",
        position: { x: FLOW_X, y: cursor },
        data: {
          lane: "merchant",
          n: item.n,
          title: item.title,
          when: item.when,
          where: item.where,
          desc: item.desc,
          events: item.events,
        },
      });
      const evCount = item.events?.length ?? 0;
      cursor += FLOW_BASE_H + evCount * FLOW_EV_H + FLOW_GAP;
      if (prevStageId) {
        edges.push({
          id: `e-${prevStageId}-${item.id}`,
          source: prevStageId,
          target: item.id,
          type: "smoothstep",
          style: { strokeWidth: 2 },
        });
      }
      prevStageId = item.id;
    }
  }
  return { nodes, edges };
}

const _merchantFlow = _buildFlow(_MERCHANT_FLOW_SPEC);
const _customerFlow = _buildFlow(_CUSTOMER_FLOW_SPEC);

export const INITIAL_VIEWS = [
  {
    id: "merchant",
    name: "🛍️ Merchant journey",
    nodes: _merchantFlow.nodes,
    edges: _merchantFlow.edges,
    filters: defaultFilters(),
  },
  {
    id: "customer",
    name: "🛒 Customer journey",
    nodes: _customerFlow.nodes,
    edges: _customerFlow.edges,
    filters: defaultFilters(),
  },
  {
    id: "full",
    name: "🌐 Full journey (legacy linear)",
    nodes: initialNodes,
    edges: initialEdges,
    filters: defaultFilters(),
  },
];
