import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, MapPin, Clock3, Leaf, Utensils, Heart, Menu, X, Search, Phone, ExternalLink } from 'lucide-react';
import { defaults, sampleMenu, photos, loadContent } from './content';
import './styles.css';

function MenuImage({ dish }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [dish.image]);
  return <div className="menu-thumbnail">{dish.image && !failed
    ? <img src={dish.image} alt={dish.name} loading="lazy" onError={() => setFailed(true)}/>
    : <span role="img" aria-label={`Photo unavailable for ${dish.name}`}><Utensils size={26}/></span>}</div>;
}

function App() {
  const [content, setContent] = useState({ settings: defaults, menu: sampleMenu, isSample: true });
  const [navOpen, setNavOpen] = useState(false);
  const [category, setCategory] = useState('All dishes');
  const [search, setSearch] = useState('');
  const dialog = useRef(null);
  const s = content.settings;
  useEffect(() => {
    const controller = new AbortController();
    loadContent({ menuURL: import.meta.env.VITE_MENU_CSV_URL || `${import.meta.env.BASE_URL}menu-template.csv`, settingsURL: import.meta.env.VITE_SETTINGS_CSV_URL || `${import.meta.env.BASE_URL}settings-template.csv`, signal: controller.signal }).then(data => { if (!controller.signal.aborted) setContent(data); });
    return () => controller.abort();
  }, []);
  useEffect(() => { document.title = `${s.name} Restaurant · A taste of home in Springvale`; }, [s.name]);
  const categories = ['All dishes', ...new Set(content.menu.map(d => d.category))];
  const dishes = content.menu.filter(d => (category === 'All dishes' || d.category === category) && `${d.name} ${d.vietnamese} ${d.description}`.toLowerCase().includes(search.toLowerCase()));
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} Restaurant ${s.address}`)}`;
  const order = () => dialog.current.showModal();
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="announcement">A little taste of home, in the heart of Springvale <span>✦</span> Dine in · Takeaway · Delivery</div>
    <header className="header">
      <a className="brand" href="#" aria-label={`${s.name} Restaurant home`}><span className="brand-icon">南</span><span>{s.name}<small>RESTAURANT</small></span></a>
      <nav className={navOpen ? 'nav is-open' : 'nav'} aria-label="Main navigation">
        {[['Our menu', '#menu'], ['Our story', '#story'], ['Visit us', '#visit']].map(([label, href]) => <a key={href} href={href} onClick={() => setNavOpen(false)}>{label}</a>)}
        <button className="button nav-order" onClick={() => { setNavOpen(false); order(); }}>Order online <ArrowUpRight size={16}/></button>
      </nav>
      <button className="mobile-toggle" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      <section className="hero section-wrap">
        <div className="hero-copy"><p className="eyebrow"><span/> CHINESE & VIETNAMESE KITCHEN</p><h1>{s.headline.split('\n').map((line, i) => <React.Fragment key={i}>{i > 0 && <br/>}{i === 1 ? <em>{line}</em> : line}</React.Fragment>)}</h1><p className="hero-description">{s.intro}</p><div className="hero-actions"><a className="button" href="#menu">Explore our menu <ArrowUpRight size={18}/></a><button className="text-button" onClick={order}>Order your favourites <ArrowRight size={18}/></button></div><a className="hero-location" href={directions} target="_blank" rel="noreferrer"><MapPin size={17}/>{s.address}<ArrowUpRight size={14}/></a></div>
        <div className="hero-visual"><img className="hero-image" src={photos.hero} alt="Illustrative bowl of noodles with fresh vegetables" fetchPriority="high"/><div className="photo-overlay"/><div className="round-seal"><span>GOOD FOOD</span><Utensils size={27}/><span>GOOD COMPANY</span></div><div className="image-caption"><span>COMFORT IN EVERY BOWL</span><p>Pull up a chair.<br/><em>You're in good company.</em></p></div><span className="photo-note">Serving inspiration · illustrative photography</span></div>
      </section>
      <div className="values-strip"><span><Utensils size={18}/> Chinese & Vietnamese favourites</span><i>✦</i><span><Heart size={18}/> Good food, shared together</span><i>✦</i><span><Leaf size={18}/> A little comfort in every bite</span></div>
      <section className="section-wrap favourites"><div className="section-heading"><div><p className="eyebrow">FROM OUR KITCHEN</p><h2>Find your new <em>favourite.</em></h2></div><a className="inline-link" href="#menu">Explore the menu <ArrowUpRight size={18}/></a></div><div className="dish-grid">{content.menu.filter(d => d.featured).slice(0, 3).map((dish, index) => <article className="dish-card" key={`${dish.id}-${index}`}><div className="dish-photo">{dish.image ? <img src={dish.image} alt={`Illustrative presentation for ${dish.name}`} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }}/> : <Utensils size={38}/>}<span className="dish-tag">{dish.tag || dish.category}</span><span className="dish-number">0{index + 1}</span></div><div className="dish-title"><h3>{dish.name}</h3><ArrowUpRight size={21}/></div><p>{dish.description}</p></article>)}</div><p className="fine-print">Photography is illustrative. {content.isSample ? 'Selected dishes from public listings; availability and prices should be confirmed with the restaurant.' : 'Please let our team know about any allergies before ordering.'}</p></section>
      <section id="story" className="story section-wrap"><div className="story-art" aria-hidden="true"><div className="circle-text">A PLACE AT THE TABLE</div><span className="story-character">南</span><div className="story-art-bottom">NAM SON <span>✦</span> SPRINGVALE</div></div><div className="story-copy"><p className="eyebrow">A NEIGHBOURHOOD KITCHEN</p><h2>More than a meal.<br/><em>A feeling of home.</em></h2><p>{s.story}</p><a href="#visit" className="inline-link">Come say hello <ArrowUpRight size={18}/></a></div></section>
      <section id="menu" className="section-wrap menu-section"><div className="section-heading"><div><p className="eyebrow">SOMETHING FOR EVERY CRAVING</p><h2>Good things <em>on the menu.</em></h2></div><label className="search"><Search size={18}/><input aria-label="Search menu" placeholder="Find a favourite…" value={search} onChange={e => setSearch(e.target.value)}/></label></div><div className="filters" aria-label="Menu categories">{categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><div className="menu-list">{dishes.map((d, i) => <article className="menu-item" key={`${d.id}-${i}`}><MenuImage dish={d}/><div className="menu-item-copy"><h3>{d.name}</h3>{d.vietnamese && <span className="vietnamese">{d.vietnamese}</span>}<p>{d.description}</p></div>{d.price && <span className="price">{d.price}</span>}</article>)}</div>{dishes.length === 0 && <p className="empty-state">No dishes found. Try another search or category.</p>}<p className="menu-note">{content.isSample ? 'A taste of our selection, not the full menu. See our delivery partners for current prices and availability.' : 'Prices and availability may vary on delivery platforms.'} Please speak with our team about dietary requirements.</p></section>
      <section className="order-banner"><div><p className="eyebrow">YOUR FAVOURITES, YOUR WAY</p><h2>A cosy night in?<br/><em>We'll bring the flavour.</em></h2></div><div><p>Your next good meal is just a few clicks away.</p><div className="delivery-buttons"><a className="button light" href={s.uber} target="_blank" rel="noreferrer">Uber Eats <ArrowUpRight size={18}/></a><a className="button outlined" href={s.doordash} target="_blank" rel="noreferrer">DoorDash <ArrowUpRight size={18}/></a></div><span className="delivery-note">Delivery availability and fees are set by our partners.</span></div></section>
      <section id="visit" className="visit section-wrap"><div><p className="eyebrow">WE'LL SAVE YOU A SEAT</p><h2>See you in <em>Springvale.</em></h2><p className="visit-intro">Stop by for something delicious. We'd love to have you.</p><div className="visit-detail"><MapPin/><div><h3>Find us</h3><p>{s.address}</p></div></div><div className="visit-detail"><Clock3/><div><h3>Opening hours</h3><p className="preserve-lines">{s.hours}</p></div></div>{s.phone && <div className="visit-detail"><Phone/><div><h3>Give us a call</h3><a href={`tel:${s.phone.replace(/[^+\d]/g, '')}`}>{s.phone}</a></div></div>}<a className="button" href={directions} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={18}/></a></div><div className="visit-card"><iframe title={`${s.name} Restaurant location on Google Maps`} src={`https://maps.google.com/maps?q=${encodeURIComponent(`${s.name} Restaurant ${s.address}`)}&z=17&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><div className="map-footer"><div><strong>{s.name} Restaurant</strong><p>{s.address}</p></div><a href={directions} target="_blank" rel="noreferrer" aria-label="Open restaurant location in Google Maps"><ExternalLink size={20}/></a></div></div></section>
    </main>
    <footer className="footer"><div className="footer-top"><a className="brand" href="#"><span className="brand-icon">南</span><span>{s.name}<small>RESTAURANT</small></span></a><p>Familiar flavours. Warm welcomes.</p><a className="inline-link" href={s.facebook} target="_blank" rel="noreferrer">Find us on Facebook <ArrowUpRight size={16}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {s.name} Restaurant.</span><span>Chinese & Vietnamese kitchen · Springvale, Melbourne</span><a href="#">Back to top ↑</a></div></footer>
    <dialog ref={dialog} className="order-dialog" onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}><button className="dialog-close" aria-label="Close delivery options" onClick={() => dialog.current.close()}><X/></button><p className="eyebrow">LET'S EAT</p><h2>Your favourites,<br/><em>delivered.</em></h2><p>Choose a delivery partner to see their current menu, prices and delivery options.</p><a className="button" href={s.uber} target="_blank" rel="noreferrer">Order on Uber Eats <ArrowUpRight size={18}/></a><a className="button secondary" href={s.doordash} target="_blank" rel="noreferrer">Order on DoorDash <ArrowUpRight size={18}/></a></dialog>
  </>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
