export const menu = [
  { heading: "Menu" },
  {
    icon: "dashboard",
    text: "Dashboard",
    link: "/subscription/index",
  },
  {
    icon: "file-text",
    text: "My Subscription",
    link: "/subscription/subscriptions",
  },
  {
    icon: "report-profit",
    text: "Payment History",
    link: "/subscription/payments",
  },
  {
    icon: "users",
    text: "Manage Team",
    link: "/subscription/team",
  },
  {
    icon: "download-cloud",
    text: "Download",
    link: "/subscription/downloads",
  },
  {
    icon: "account-setting",
    text: "Account Setting",
    link: "/subscription/profile-setting",
  },
  {
    heading: "See Others",
  },
  {
    icon: "files",
    text: "Pre-Built Pages",
    active: true,
    subMenu: [
      {
        text: "Pricing",
        link: "/subscription/pricing",
      },
      {
        text: "Invoices",
        link: "/subscription/invoices",
        count: "2",
      },
      {
        text: "Tickets",
        link: "/subscription/tickets",
        count: "3",
      },
      {
        text: "Subscription Details",
        link: "/subscription/subscription-details/100394949",
      },
    ],
  },
  {
    heading: "Return To",
  },
  {
    icon: "dashlite-alt",
    text: "Main Dashboard",
    link: "/",
  },
  {
    icon: "layers-fill",
    text: "All Components",
    link: "/components",
  },
];
export const secoundmenu = [
  {
    heading: "Help Center",
  },
  {
    text: "FAQs",
    link: "/subscription/faqs",
  },
  {
    text: "Contact",
    link: "/subscription/contact",
  },
  {
    text: "Support",
    link: "/subscription/support",
  },
];
export default menu;
