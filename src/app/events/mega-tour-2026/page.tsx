import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "মেগা ট্যুর ২০২৬ — টিম Brz",
  description:
    "ঢাকা থেকে বান্দরবান, বগালেক, তিন্দু এবং হোয়াইট পিক — টিম Brz-এর পরবর্তী বড় গ্রুপ রাইড।",
};

const RULES = [
  {
    num: "০১",
    title: "স্পিড লিমিট",
    desc: "লিডার জায়গা ও রাস্তার অবস্থা অনুযায়ী স্পিড লিমিট নির্ধারণ করবেন — সেটা সবাইকে মেনে চলতে হবে।",
  },
  {
    num: "০২",
    title: "শারীরিক অসুস্থতা",
    desc: "রাইডের মাঝে কারো শরীর খারাপ লাগলে অবশ্যই Moderator-দের জানাতে হবে — নিজে নিজে সামলানোর চেষ্টা করবেন না।",
  },
  {
    num: "০৩",
    title: "Riding Gear বাধ্যতামূলক",
    desc: "জ্যাকেট, গ্লাভস, বুট সহ ফুল রাইডিং গিয়ার ছাড়া ট্যুরে অংশগ্রহণ করা যাবে না।",
  },
  {
    num: "০৪",
    title: "Certified Helmet বাধ্যতামূলক",
    desc: "সার্টিফাইড হেলমেট (DOT / ECE / ISI) ছাড়া রাইড করা সম্পূর্ণ নিষিদ্ধ।",
  },
  {
    num: "০৫",
    title: "বাইকের কাগজপত্র আপ-টু-ডেট",
    desc: "রেজিস্ট্রেশন, ফিটনেস, ট্যাক্স টোকেন — সব কাগজ বৈধ ও আপ-টু-ডেট থাকতে হবে।",
  },
  {
    num: "০৬",
    title: "NID / জন্ম নিবন্ধন সনদের কপি",
    desc: "প্রতিটি রাইডারকে NID বা জন্ম নিবন্ধন সনদের কপি সাথে রাখতে হবে।",
  },
  {
    num: "০৭",
    title: "অপ্রাপ্তবয়স্ক রাইডার (১৮ বছরের নিচে)",
    desc: "১৮ বছরের কম বয়সীদের ক্ষেত্রে অভিভাবকের সাথে আলোচনা করে সম্মতি নেওয়ার পরই চূড়ান্ত সিদ্ধান্ত নেওয়া হবে।",
  },
];

const ITINERARY = [
  {
    day: "দিন ১",
    title: "ঢাকা → বান্দরবান → বগালেক",
    points: [
      "রাত ১২:০০ টায় Dhaka, Basabo, Moon Light থেকে একসাথে রওনা।",
      "হানিফ ফ্লাইওভার পেরিয়ে টোল প্লাজার সামনে প্রথম স্টপ — সর্বোচ্চ ১০ মিনিট অপেক্ষা, তারপর গ্রুপ এগিয়ে যাবে।",
      "কুমিল্লায় ~১ ঘণ্টা ব্রেকফাস্ট ও বিশ্রাম (এখানকার খাবার নিজের খরচে, ট্যুর বাজেটে নেই)।",
      "বারইয়ারহাটে সংক্ষিপ্ত বিরতি, তারপর সকাল ৭টার পর লিংক রোডের শেষে পেট্রোল পাম্পে ফুয়েল + ব্রেকফাস্ট।",
      "কর্ণফুলী ব্রিজ → সাতকানিয়া হয়ে চট্টগ্রাম–কক্সবাজার হাইওয়ে → বান্দরবান শহরে প্রবেশ।",
      "বান্দরবানে লাঞ্চ ও বিশ্রাম — এখানেই ট্যাংক ফুল করুন, পাহাড়ে ঢোকার আগে শেষ সার্ভিস স্টেশন।",
      "বান্দরবান → রুমা জংশন → রুমা বাজার, যেখান থেকে লোকাল গাইড নেওয়া হবে।",
      "বগালেকে পৌঁছানোর টার্গেট: বিকেল ৩–৪টা। রাতের খাবার, গল্প, রাত্রিযাপন।",
    ],
  },
  {
    day: "দিন ২",
    title: "বগালেক → তিন্দু",
    points: [
      "ভোর ৬টায় কেওক্রাডং ও সুংসাং পাড়া যাওয়ার অপশন — সকাল ৯টার মধ্যে বগালেকে ফিরতেই হবে, কোনো ব্যতিক্রম নেই।",
      "ব্রেকফাস্টের পর সকাল ১০টায় তিন্দুর উদ্দেশ্যে রওনা।",
      "পথে: ডাবল হাট ফলস, বলিপাড়া আর্মি চেকপোস্ট, কিছু ভিউপয়েন্ট — সংক্ষিপ্ত থামা, দিনটা ছোট।",
      "আর্মি চেকপোস্টের কাছে ~৳১০০-তে খিচুড়ি/তেহারি পাওয়া যায়।",
      "সূর্যাস্তের আগেই তিন্দু রোড পার করতে হবে — বগালেক থেকে ১১৮ কিমি, এর মধ্যে ~১ কিমি ভাঙা রাস্তা; ওই অংশ সবাই একসাথে পার করবে।",
      "বিকেল ৩–৪টার মধ্যে তিন্দু পৌঁছানো, রাত্রিযাপন।",
    ],
  },
  {
    day: "দিন ৩",
    title: "তিন্দুতে নৌকার দিন",
    points: [
      "সকালে নৌকা ভাড়া — প্রতি নৌকায় সর্বোচ্চ ৫ জন রাইডার।",
      "বাঘের মুখ, রাজা পাথর, বড় পাথর ও আশেপাশের নদী এলাকা ঘুরে দেখা; নৌকায় থাকাকালীনই লাঞ্চ।",
      "তিন্দুতে ফিরে দ্বিতীয় রাত।",
    ],
  },
  {
    day: "দিন ৪",
    title: "তিন্দু → হোয়াইট পিক, লামা",
    points: [
      "সকালে হোয়াইট পিকের উদ্দেশ্যে রওনা — ২–৩ ঘণ্টার পথ।",
      "একটি ব্রিজ পেরিয়ে নির্ধারিত গ্যারেজে বাইক রেখে, তারপর ~৪০ মিনিটের নৌকায় হোয়াইট পিক।",
      "সারাদিন নদীতে গোসল আর আরাম — ৳৮৫০-এর প্যাকেজে তিন বেলা খাবার ও স্ন্যাক।",
      "হোয়াইট পিকে রাত্রিযাপন।",
    ],
  },
  {
    day: "দিন ৫",
    title: "ঢাকায় ফেরা",
    points: [
      "সকাল ১০–১১টার মধ্যে নৌকায় ফিরে লামা থেকে সরাসরি বাইকে ঢাকার পথে।",
    ],
  },
];

const HIGHLIGHTS = [
  {
    icon: "🏔️",
    title: "বগালেকে সূর্যাস্ত",
    desc: "পাহাড়ি লেকের ক্যাম্প যেখান থেকে ট্যুর শুরু — উচ্চতায় রাতের খাবার আর গল্প।",
  },
  {
    icon: "🚤",
    title: "তিন্দুর নৌকার দিন",
    desc: "বাঘের মুখ, রাজা পাথর, বড় পাথর — সব দেখা নদীর বুক থেকে।",
  },
  {
    icon: "🏊",
    title: "হোয়াইট পিকে নদীর দিন",
    desc: "সারাদিন গোসল আর কিচ্ছু না করার আনন্দ, নদীর পাড়ে।",
  },
  {
    icon: "⛰️",
    title: "কেওক্রাডং সূর্যোদয় (অপশনাল)",
    desc: "ভোরে উঠলে সুযোগ আছে — সকাল ৯টার গ্রুপ ডিপার্চারের আগেই ফিরতে হবে।",
  },
];

const GALLERY = [
  {
    src: "/images/tours/brz-mega-tour-1/4.jpg",
    alt: "মেগা ট্যুর ১ — পুরো ক্রু-এর গ্রুপ ফটো",
    span: "sm:col-span-2 sm:row-span-2",
  },
  {
    src: "/images/tours/brz-mega-tour-1/1.jpg",
    alt: "মেগা ট্যুর ১ — রওনার আগে গ্রুপ ফটো",
    span: "",
  },
  {
    src: "/images/tours/brz-mega-tour-1/2.jpg",
    alt: "মেগা ট্যুর ১ — রাইডাররা বাইকে প্রস্তুতি নিচ্ছে",
    span: "",
  },
  {
    src: "/images/tours/brz-mega-tour-1/6.jpg",
    alt: "মেগা ট্যুর ১ — নদীর পাড়ে বাইক পার্ক করা",
    span: "sm:col-span-2",
  },
  {
    src: "/images/tours/brz-mega-tour-1/3.jpg",
    alt: "মেগা ট্যুর ১ — বিশ্রামে দলগত খাবার",
    span: "",
  },
  {
    src: "/images/tours/brz-mega-tour-1/5.jpg",
    alt: "মেগা ট্যুর ১ — রাতে পুরো ক্রু",
    span: "",
  },
  {
    src: "/images/tours/brz-mega-tour-1/7.jpg",
    alt: "মেগা ট্যুর ১ — পাহাড়ি রাস্তায় রাইডাররা",
    span: "sm:col-span-2",
  },
];

const BUDGET_GROUPS = [
  {
    place: "বগালেক",
    items: [
      { label: "রাতের খাবার", cost: "৳২০০–২৫০" },
      { label: "গাইড", cost: "৳২০০–২৫০" },
      { label: "থাকা", cost: "৳৩০০–৪০০" },
    ],
  },
  {
    place: "তিন্দু",
    items: [
      { label: "থাকা (প্রতি রাত)", cost: "৳২০০–২৫০" },
      { label: "রাতের খাবার (প্রতি রাত)", cost: "৳২০০–২৫০" },
      { label: "সকালের নাস্তা (প্রতিদিন)", cost: "৳১৫০" },
      { label: "লাঞ্চ (নৌকার দিন)", cost: "৳২৫০" },
      { label: "নৌকা ভাড়া (জনপ্রতি)", cost: "৳১,০০০–১,৫০০" },
    ],
  },
  {
    place: "হোয়াইট পিক",
    items: [
      { label: "প্যাকেজ — ৩ বেলা + স্ন্যাক", cost: "৳৮৫০" },
      { label: "রুম (জনপ্রতি)", cost: "৳৩০০–৮০০" },
    ],
  },
];

const TERMS = [
  "শুধুমাত্র হাইওয়ে রাইডিং অভিজ্ঞতা আছে এবং আগে পাহাড়ি রাস্তায় একাধিকবার রাইড করেছেন এমন রাইডারদের জন্য — তিন্দুর রাস্তা চরম না হলেও সহজ নয়।",
  "প্রতিটি মিটিং পয়েন্টে সময়মতো থাকুন — টোল প্লাজায় সর্বোচ্চ ১০ মিনিট অপেক্ষা, তারপর কনভয় এগিয়ে যাবে।",
  "দিন ২-তে ভিউপয়েন্টে বেশিক্ষণ থামা যাবে না — সূর্যাস্তের আগেই তিন্দু রোড পার করতে হবে।",
  "একে অপরকে সাহায্য করুন এবং গ্রুপ হিসেবে একসাথে থাকুন, বিশেষ করে তিন্দুর ~১ কিমি ভাঙা রাস্তায়।",
  "হাইওয়েতে ব্যক্তিগত খাবারের খরচ (কুমিল্লা ও পথে) নিজেকে বহন করতে হবে, ট্যুর বাজেটের বাইরে।",
  "মদ্যপান নিষিদ্ধ। কেওক্রাডং/সুংসাং পাড়া যাওয়া অপশনাল, বাধ্যতামূলক নয়।",
];

const PREP = [
  "বাইক সার্ভিসিং — টায়ার, ব্রেক, চেইন এবং ক্লাচ আগেই চেক করুন।",
  "হেলমেট + ফুল রাইডিং গিয়ার, বেসিক টুল কিট এবং একটি স্পেয়ার ক্লাচ/ব্রেক লিভার।",
  "পর্যাপ্ত নগদ টাকা — পাহাড়ে নেটওয়ার্ক ও এটিএম সীমিত।",
  "ব্যক্তিগত ওষুধ, পাওয়ার ব্যাংক এবং বৃষ্টির সুরক্ষা।",
];

export default function MegaTour2026Page() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brz-line">
        <div className="relative h-[460px] sm:h-[520px] md:h-[600px]">
          <Image
            src="/images/tours/brz-mega-tour-1/5.jpg"
            alt="টিম Brz ক্রু মেগা ট্যুর ১-এ, রাতে"
            fill
            priority
            className="object-cover object-[50%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          <div className="absolute inset-0 mx-auto flex max-w-7xl 2xl:max-w-[1500px] flex-col justify-center px-4 md:px-6">
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] md:text-7xl">
              Mega Tour <span className="text-brz-red">2026</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
              ঢাকা → বান্দরবান → বগালেক → তিন্দু → হোয়াইট পিক → ঢাকা।
              দেশের সবচেয়ে কঠিন ও সুন্দর পাহাড়ি রাস্তায় পাঁচটি দিন।
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/events/mega-tour-2026/payment" className="styled-button">
                Register for Mega Tour
                <div className="inner-button">
                  <svg id="Arrow" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" height="30px" width="30px" className="icon">
                    <defs>
                      <linearGradient y2="100%" x2="100%" y1="0%" x1="0%" id="iconGradient">
                        <stop style={{ stopColor: "#FFFFFF", stopOpacity: 1 }} offset="0%" />
                        <stop style={{ stopColor: "#AAAAAA", stopOpacity: 1 }} offset="100%" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#iconGradient)" d="M4 15a1 1 0 0 0 1 1h19.586l-4.292 4.292a1 1 0 0 0 1.414 1.414l6-6a.99.99 0 0 0 .292-.702V15c0-.13-.026-.26-.078-.382a.99.99 0 0 0-.216-.324l-6-6a1 1 0 0 0-1.414 1.414L24.586 14H5a1 1 0 0 0-1 1z" />
                  </svg>
                </div>
              </Link>
              <a
                href="#last-year"
                className="rounded-md border border-white/40 px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:border-brz-red hover:text-brz-red"
              >
                গত বছরের ট্যুর দেখুন
              </a>
            </div>
          </div>
        </div>
        <div className="h-1.5 checker-flag-red" />
      </section>

      {/* Quick facts */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-14 md:px-6">
        <div className="grid gap-6 sm:grid-cols-4">
          <QuickFact value="৫ দিন / ৪ রাত" label="ঢাকা থেকে ঢাকা" />
          <QuickFact value="~১,০০০ কিমি" label="মোট রাউন্ড ট্রিপ" />
          <QuickFact value="৳৬,০০০ + ফুয়েল" label="খাবার ও থাকার বাজেট" />
          <QuickFact value="রাত ১২:০০" label="শুরু, বারইয়ারহাট" />
        </div>
      </section>

      {/* Warning banner */}
      <section className="border-y-2 border-red-600 bg-red-950/60">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-6 md:px-6">
          <p className="text-center text-base font-bold text-red-400 md:text-lg">
            ⚠️ যারা গ্রুপের Rules &amp; Regulations মেনে চলবেন না —{" "}
            <span className="text-red-300 underline underline-offset-4">
              তাদের এই ট্যুরে Join করার কোনো প্রয়োজন নেই।
            </span>
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="border-y border-brz-line bg-brz-charcoal/70">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-12 md:px-6">
          <p className="mx-auto max-w-3xl text-center text-brz-mute">
            লক্ষ্য হলো বান্দরবানের সবচেয়ে কঠিন পাহাড়ি রাস্তায় একটি নিরাপদ ও
            শৃঙ্খলাবদ্ধ মোটরসাইকেল রাইড — বগালেক, তিন্দু এবং লামার হোয়াইট পিক
            ঘুরে আসা। রুটটি সত্যিই চ্যালেঞ্জিং, তাই গ্রুপ ডিসিপ্লিনের উপর
            জোর দেওয়া হয়েছে: নির্দিষ্ট সময়ে মিটিং, রুমা বাজার থেকে লোকাল
            গাইড, এবং কঠিন অংশে সবাই সবার পাশে থাকা।
          </p>
        </div>
      </section>

      {/* Rules & Regulations */}
      <section id="rules" className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6 scroll-mt-20">
        <div className="mb-8 flex flex-wrap items-end gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
              Riding Rules &amp; Regulations
            </h2>
            <p className="mt-2 text-brz-mute">
              এই নিয়মগুলো মেনে চলা প্রতিটি রাইডারের জন্য বাধ্যতামূলক।
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((r) => (
            <div
              key={r.num}
              className="card relative overflow-hidden p-5 transition hover:border-red-600/60"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-red-600" />
              <div className="flex items-start gap-4">
                <span className="font-display text-2xl font-bold text-red-600/40">
                  {r.num}
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-red-400">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-brz-mute">{r.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
          Route Plan
        </h2>
        <p className="mt-2 max-w-xl text-brz-mute">
          প্রতিটি স্টপসহ পুরো রুট — ক্লাবের নিজস্ব ট্যুর পরিকল্পনা থেকে সরাসরি।
        </p>

        <div className="relative mt-10">
          <div className="absolute left-5 top-2 bottom-2 hidden w-px bg-gradient-to-b from-brz-red via-brz-line to-transparent sm:block" />
          <div className="space-y-6">
            {ITINERARY.map((d, idx) => (
              <div key={d.day} className="relative sm:pl-16">
                <div className="absolute left-0 top-5 z-10 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-brz-red bg-brz-black font-display text-sm font-bold text-brz-red shadow-[0_0_0_4px_var(--brz-black)] sm:flex">
                  {idx + 1}
                </div>
                <div className="card relative overflow-hidden p-6 transition hover:border-brz-red/40">
                  <div className="absolute inset-x-0 top-0 h-1 bg-brz-red" />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red sm:hidden">
                      {d.day}
                    </span>
                    <span className="hidden font-display text-xs font-bold uppercase tracking-widest text-brz-red sm:inline">
                      {d.day}
                    </span>
                    <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
                      {d.title}
                    </h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {d.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-brz-mute"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brz-red/70" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-brz-line bg-brz-charcoal/70">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
          <h2 className="text-center font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            কেন এই ট্যুরে যাবেন
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="card p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-brz-red/40"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brz-red/40 bg-brz-red/10 text-2xl">
                  {h.icon}
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-brz-white">
                  {h.title}
                </h3>
                <p className="mt-2 text-sm text-brz-mute">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
          আনুমানিক খরচ
        </h2>
        <p className="mt-2 max-w-xl text-brz-mute">
          শুধু খাবার ও থাকার খরচ — ফুয়েল এবং হাইওয়েতে ব্যক্তিগত খাবার
          (কুমিল্লা ইত্যাদি) আলাদা।
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {BUDGET_GROUPS.map((g) => (
            <div key={g.place} className="card p-6">
              <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
                {g.place}
              </span>
              <ul className="mt-4 divide-y divide-brz-line/60">
                {g.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <span className="text-brz-white/90">{item.label}</span>
                    <span className="shrink-0 font-semibold text-brz-red">
                      {item.cost}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="card relative mt-6 overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 checker-flag-red" />
          <div className="grid gap-8 text-center sm:grid-cols-2">
            <div>
              <div className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white md:text-5xl">
                ৳৬,০০০
              </div>
              <div className="mt-2 text-xs uppercase tracking-wide text-brz-mute">
                মোট খাবার ও থাকা (আনুমানিক)
              </div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold uppercase tracking-wide text-brz-red md:text-5xl">
                ≈ ৳৪,২০০
              </div>
              <div className="mt-2 text-xs uppercase tracking-wide text-brz-mute">
                ফুয়েল — ~১,০০০ কিমি ÷ ৪০ কিমি/লি ≈ ২৫ লিটার
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-brz-mute">
          ফুয়েল হিসাব ~৪০ কিমি/লিটার মাইলেজ ধরে — আসল খরচ ফুয়েলের দাম ও
          আপনার বাইকের উপর নির্ভর করবে।
        </p>
      </section>

      {/* Gallery */}
      <section
        id="last-year"
        className="border-y border-brz-line bg-brz-charcoal/70 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
                ফিরে দেখা: মেগা ট্যুর ১
              </h2>
              <p className="mt-2 max-w-xl text-brz-mute">
                প্রথমটা। এই ক্রু, এই রাস্তা, এই রাতগুলোই আমাদের আবার করার
                অনুপ্রেরণা দিয়েছে — এবারে আরও বড়।
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 auto-rows-[140px] gap-3 sm:grid-cols-4 sm:auto-rows-[160px] md:auto-rows-[190px]">
            {GALLERY.map((g) => (
              <div
                key={g.src}
                className={`group relative overflow-hidden rounded-2xl border border-brz-line ${g.span}`}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-70 transition group-hover:opacity-90" />
                <span className="absolute bottom-2 left-3 font-display text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  মেগা ট্যুর ১
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms + prep */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6 md:p-8">
            <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
              যোগ দেওয়ার আগে পড়ুন
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-brz-white">
              এই ট্যুর কাদের জন্য
            </h2>
            <ul className="mt-6 space-y-3.5">
              {TERMS.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-sm text-brz-white/90"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brz-red/15 text-[11px] font-bold text-brz-red">
                    !
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div className="card p-6 md:p-8">
              <span className="badge border border-brz-red/40 bg-brz-red/10 text-brz-red">
                প্রস্তুতি নিন
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-wide text-brz-white">
                কী নিয়ে যাবেন
              </h2>
              <ul className="mt-6 space-y-3.5">
                {PREP.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-brz-white/90"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-[11px] font-bold text-green-400">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card flex flex-1 flex-col justify-center p-6 md:p-8">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brz-white">
                সকল অ্যাপ্রুভড মেম্বারের জন্য উন্মুক্ত
              </h3>
              <p className="mt-2 text-sm text-brz-mute">
                এখনো মেম্বার হননি? আগে প্রোফাইল রিভিউ করিয়ে নিন।
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-md bg-brz-red px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-brz-ink transition hover:bg-brz-amber"
                >
                  ক্লাবে যোগ দিন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1500px] px-4 py-16 md:px-6">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="absolute inset-x-0 top-0 h-1.5 checker-flag-red" />
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-brz-white">
            এই সুযোগ মিস করবেন না
          </h2>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-md bg-brz-red px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-brz-ink transition hover:bg-brz-amber"
          >
            ক্লাবে যোগ দিন
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-6 text-center transition hover:border-brz-red/40">
      <div className="font-display text-2xl font-bold uppercase tracking-wide text-brz-white md:text-3xl">
        {value}
      </div>
      <div className="mt-2 h-1 w-10 mx-auto bg-brz-red" />
      <div className="mt-2 text-xs uppercase tracking-wide text-brz-mute">
        {label}
      </div>
    </div>
  );
}
