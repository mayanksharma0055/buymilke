"use client";

import { ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, Fuel, Gauge, IndianRupee, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, UsersRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Opportunity = {
  id: string; month: string; city: string; targetBuyers: number; estimatedSaving: number; closingDate: string; deliveryWindow: string;
  _count: { requests: number };
  car: { brand: string; model: string; variant: string; fuel: string; transmission: string; basePrice: number; image: string };
};
type Modal = "join" | "subscribe" | null;
const money = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

export default function Marketplace() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("All cities");
  const [month, setMonth] = useState("Any month");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [garage, setGarage] = useState(false);
  const [requests, setRequests] = useState<{ id: string; opportunity: { month: string; city: string; car: { brand: string; model: string } } }[]>([]);
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);

  useEffect(() => {
    fetch("/api/opportunities").then((r) => r.json()).then((d) => setOpportunities(d.opportunities ?? []))
      .catch(() => setNotice("Unable to load buying groups. Refresh to try again.")).finally(() => setLoading(false));
  }, []);

  const cities = ["All cities", ...new Set(opportunities.map((o) => o.city))];
  const months = ["Any month", ...new Set(opportunities.map((o) => o.month))];
  const filtered = opportunities.filter((o) => (!query || `${o.car.brand} ${o.car.model} ${o.car.variant}`.toLowerCase().includes(query.toLowerCase())) && (city === "All cities" || o.city === city) && (month === "Any month" || o.month === month));

  async function refreshGarage(accountEmail: string) {
    const normalized = accountEmail.trim().toLowerCase();
    const [r, s] = await Promise.all([fetch("/api/requests"), fetch("/api/subscriptions")]);
    const [rd, sd] = await Promise.all([r.json(), s.json()]);
    setRequests(rd.requests ?? []); setSubscription(sd.subscription ?? null); setEmail(normalized); setGarage(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const joining = modal === "join";
    const response = await fetch(joining ? "/api/requests" : "/api/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(joining ? { ...data, opportunityId: selected?.id } : data),
    });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "Please try again."); return; }
    sessionStorage.setItem("bm-email", String(data.email).trim().toLowerCase());
    await refreshGarage(String(data.email)); setModal(null);
    setNotice(joining ? "You’ve joined the group. We’ll keep you posted." : "Demo membership active. No payment was taken.");
  }

  function showCars() { document.getElementById("groups")?.scrollIntoView({ behavior: "smooth" }); }
  async function openGarage() {
    setGarage(true);
    const accountEmail = sessionStorage.getItem("bm-email");
    if (accountEmail) await refreshGarage(accountEmail);
  }
  async function switchAccount() {
    await fetch("/api/session", { method: "DELETE" });
    sessionStorage.removeItem("bm-email");
    setEmail(""); setRequests([]); setSubscription(null); setGarage(false);
  }

  return <main>
    <div className="announcement"><Sparkles size={14} /> November buying groups are forming <span>·</span> Preview prices, final offers confirmed by dealers</div>
    <header className="site-header"><a href="#top" className="brand"><span className="brand-mark">बि</span><span>Buy<span className="brand-dev">मिलके</span><small>CAR BUYING, TOGETHER</small></span></a><nav><button onClick={() => { setGarage(false); showCars(); }}>Discover</button><a href="#how">How it works</a><button onClick={openGarage}>My garage</button></nav><div className="header-actions"><span className="india-label"><MapPin size={14} /> India <ChevronDown size={13} /></span><button className="member-button" onClick={() => setModal("subscribe")}>Become a member <ArrowUpRight size={15} /></button></div></header>
    {garage ? <section className="garage-section"><div className="kicker">YOUR BUYमिलके ACCOUNT</div><h1>My garage<span>.</span></h1>{!email ? <div className="garage-empty"><ShieldCheck size={28} /><h2>Your next car starts here.</h2><p>Join a buying group or become a member to keep your plans in one place.</p><button className="primary" onClick={() => setModal("subscribe")}>Explore membership <ArrowRight size={16} /></button><button className="text-button" onClick={() => setGarage(false)}>Browse buying groups</button></div> : <><p className="account-email">Signed in as <strong>{email}</strong> <button className="text-button" onClick={switchAccount}>Switch account</button></p><div className="garage-columns"><section><div className="garage-heading"><h2>Buying groups</h2><span>{requests.length} joined</span></div>{requests.length ? requests.map((r) => <article className="garage-request" key={r.id}><div><strong>{r.opportunity.car.brand} {r.opportunity.car.model}</strong><span>{r.opportunity.month} · {r.opportunity.city}</span></div><span className="status">INTERESTED</span></article>) : <p className="muted">No groups yet. Browse opportunities to join one.</p>}</section><section><div className="garage-heading"><h2>Membership</h2></div><div className="membership-status"><ShieldCheck /><div><strong>{subscription ? "Demo membership active" : "Not a member yet"}</strong><span>{subscription ? `Demo ${subscription.plan} plan · payment not connected` : "Membership is ₹199/month in this preview"}</span></div>{!subscription && <button className="text-button" onClick={() => setModal("subscribe")}>Join <ArrowRight size={14} /></button>}</div></section></div></>}</section> : <>
      <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><i /> THE SMARTER WAY TO BUY YOUR NEXT CAR</div><h1>Good things<br />come to those<br /><em>who buy together.</em></h1><p>Find your car. Join your city’s buying group. Let the power of many negotiate a better deal.</p><div className="hero-actions"><button className="primary" onClick={showCars}>Explore buying groups <ArrowRight size={17} /></button><a className="quiet-link" href="#how">How it works <ArrowRight size={16} /></a></div><div className="hero-footnote"><ShieldCheck size={15} /> You choose the car. You pay the dealer directly.</div></div><div className="hero-image"><div className="hero-photo" role="img" aria-label="Car on a scenic road"/><div className="hero-tint"/><div className="hero-stamp"><span>TOGETHER,</span><strong>WE GO<br/>FURTHER.</strong><b>✳</b></div><div className="image-caption">01 / 03 <i/> THE NEXT DRIVE, TOGETHER</div><div className="saving-float"><span><IndianRupee size={16}/></span><div><strong>Up to ₹52,000</strong><small>estimated group savings</small></div><ArrowUpRight size={17}/></div></div><div className="hero-bottom"><span>MADE FOR BUYERS, NOT BARGAINERS</span><i/><span>INDIA <b>✳</b> 2026</span></div></section>
      <section className="trust-strip"><div><span className="trust-icon"><UsersRound/></span><p><strong>Buy together</strong><small>Strength in numbers</small></p></div><i/><div><span className="trust-icon orange"><IndianRupee/></span><p><strong>Pay the dealer</strong><small>No middleman markups</small></p></div><i/><div><span className="trust-icon green"><ShieldCheck/></span><p><strong>Stay in control</strong><small>Your purchase, your choice</small></p></div><div className="trust-note"><span>EARLY ACCESS</span><strong>Growing across India <ArrowUpRight size={14}/></strong></div></section>
      <section className="opportunities" id="groups"><div className="section-top"><div><div className="kicker">THE COLLECTIVE ADVANTAGE</div><h2>Find your next <em>drive.</em></h2><p>Explore upcoming buying groups. Each brings local buyers together for one coordinated conversation with dealers.</p></div><button className="reset-button" onClick={() => { setCity("All cities"); setMonth("Any month"); setQuery(""); }}>Reset filters <ArrowRight size={15}/></button></div><div className="filters"><span className="filter-label"><SlidersHorizontal size={15}/> FIND A GROUP</span><label className="search-box"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search make or model"/></label><label className="select-box"><MapPin size={15}/><select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">{cities.map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={14}/></label><label className="select-box"><CalendarDays size={15}/><select value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month">{months.map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={14}/></label><span className="group-count">{loading ? "Loading…" : `${filtered.length} GROUP${filtered.length === 1 ? "" : "S"}`}</span></div>
        {loading ? <div className="loading"><span/>Finding your next car…</div> : filtered.length ? <div className="car-grid">{filtered.map((o, i) => <article className="car-card" key={o.id} style={{ animationDelay: `${i * 80}ms` }}><div className="car-image-wrap"><Image src={o.car.image} alt={`${o.car.brand} ${o.car.model}`} fill sizes="(max-width: 700px) 90vw, (max-width: 1050px) 45vw, 23vw" /><span className="car-month"><CalendarDays size={13}/> {o.month}</span><div className="car-shade"/><span className="car-brand">{o.car.brand}</span></div><div className="car-content"><div className="car-title"><div><h3>{o.car.model}</h3><span>{o.car.variant}</span></div><div className="saving"><strong>−{money(o.estimatedSaving)}</strong><small>EST. SAVING</small></div></div><div className="specs"><span><Fuel size={13}/>{o.car.fuel}</span><i/><span><Gauge size={13}/>{o.car.transmission}</span><i/><span><MapPin size={13}/>{o.city}</span></div><div className="car-price"><div><span>Est. ex-showroom</span><strong>{money(o.car.basePrice-o.estimatedSaving)} <del>{money(o.car.basePrice)}</del></strong></div><small>indicative</small></div><div className="cohort"><div><span><UsersRound size={14}/> {o._count.requests} <small>of {o.targetBuyers} buyers</small></span><span>{Math.min(100,Math.round(o._count.requests/o.targetBuyers*100))}%</span></div><div className="progress"><i style={{width:`${Math.max(o._count.requests?4:0,Math.min(100,o._count.requests/o.targetBuyers*100))}%`}}/></div><div className="cohort-foot"><span><Clock3 size={12}/> Closes {new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short"}).format(new Date(o.closingDate))}</span><span>{o.deliveryWindow}</span></div></div><button className="join-button" onClick={() => { setSelected(o); setModal("join"); }}>Join this group <ArrowRight size={16}/></button></div></article>)}</div> : <div className="no-results"><Search/><strong>No groups match those filters.</strong><button className="text-button" onClick={() => {setCity("All cities");setMonth("Any month");setQuery("");}}>Clear filters <ArrowRight size={14}/></button></div>}
        <div className="disclaimer"><span><Sparkles size={13}/> PREVIEW LISTINGS</span><p>Prices and savings shown are estimates for illustration, not confirmed offers. Final terms are negotiated with participating dealers after a group forms. No purchase is guaranteed.</p><ArrowUpRight size={15}/></div></section>
      <section className="how-section" id="how"><div className="how-intro"><div className="kicker">ONE BIG PURCHASE, MADE SIMPLE</div><h2>Many buyers.<br/><em>One better deal.</em></h2><p>We bring people with the same plan together. The group does the asking; you stay in the driver’s seat.</p><button className="text-button" onClick={() => setModal("subscribe")}>See membership <ArrowRight size={15}/></button></div><div className="steps">{[{n:"01",icon:<Search/>,title:"Find your match",text:"Choose a car, your city and when you’re ready to buy."},{n:"02",icon:<UsersRound/>,title:"Bring buyers together",text:"Join others with the same model and a similar timeline."},{n:"03",icon:<IndianRupee/>,title:"Choose your own deal",text:"Review dealer offers. Buy directly from the dealer, only if it works for you."}].map((s)=><article className="step" key={s.n}><span className="step-num">{s.n}</span><span className="step-icon">{s.icon}</span><div><h3>{s.title}</h3><p>{s.text}</p></div><ArrowUpRight className="step-arrow" size={17}/></article>)}</div><div className="side-note">BETTER TOGETHER <span>✳</span> BETTER TOGETHER</div></section>
      <section className="membership-band"><div className="band-mark">बि</div><div className="band-copy"><div className="kicker">A LITTLE CLOSER TO YOUR NEXT CAR</div><h2>Make room in the garage.</h2><p>Membership opens the door to upcoming buying groups, member updates and a more considered way to buy.</p></div><div className="band-action"><span>INTRODUCTORY MEMBERSHIP</span><strong>₹199 <small>/ month</small></strong><small>Demo only · no charge taken</small><button onClick={() => setModal("subscribe")}>Become a member <ArrowRight size={16}/></button></div></section>
    </>}
    <footer className="footer"><a href="#top" className="brand"><span className="brand-mark">बि</span><span>Buy<span className="brand-dev">मिलके</span><small>CAR BUYING, TOGETHER</small></span></a><p>A better way to buy, together.</p><span>© 2026 Buyमिलके · Preview platform</span></footer>
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
    {modal && <div className="modal-backdrop" onMouseDown={(e) => {if(e.target===e.currentTarget)setModal(null);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" aria-label="Close" onClick={() => setModal(null)}><X/></button><div className="kicker">{modal === "join" ? "YOUR NEXT CAR, TOGETHER" : "BUYमिलके MEMBERSHIP"}</div><h2 id="modal-title">{modal === "join" ? `Join the ${selected?.car.model} group.` : "Make buying together your thing."}</h2><p>{modal === "join" ? `${selected?.month} · ${selected?.city} · No commitment to buy.` : "Create your demo membership. Payment is not connected in this preview."}</p><form onSubmit={submit}><label>Your name<input name="name" required minLength={2} autoComplete="name" placeholder="e.g. Aanya Mehta"/></label><label>Email address<input name="email" required type="email" autoComplete="email" placeholder="you@example.com"/></label><label>Phone number<input name="phone" required type="tel" minLength={8} autoComplete="tel" placeholder="+91 98765 43210"/></label>{modal === "join" && <label>Your city<input name="city" required defaultValue={selected?.city} autoComplete="address-level2"/></label>}{modal === "subscribe" && <label>Membership plan<select name="plan"><option value="monthly">Monthly · ₹199 / month</option><option value="annual">Annual · ₹1,999 / year</option></select></label>}<button className="primary submit-button">{modal === "join" ? "Join this buying group" : "Create demo membership"} <ArrowRight size={16}/></button><div className="form-note"><ShieldCheck size={14}/>{modal === "join" ? "Your details stay with this buying group." : "No payment will be collected in this demo."}</div></form></section></div>}
  </main>;
}