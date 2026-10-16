export const defaults = {
  name: 'Nam Son',
  headline: 'Familiar flavours.\nMade with heart.',
  intro: 'From a comforting bowl of phở to your favourite wok-tossed classics. A little taste of home, right here in Springvale.',
  address: '51D Windsor Avenue, Springvale VIC 3171',
  hours: 'Monday–Tuesday: 10 am–9 pm\nWednesday: Closed\nThursday–Sunday: 10 am–9 pm',
  phone: '(03) 9548 3382',
  story: 'Good food brings people together. At Nam Son, Chinese and Vietnamese favourites find a place at the same table — from fragrant noodle soups to sizzling, savoury classics. Come for a quick lunch, settle in with friends, or take a little comfort home.',
  uber: 'https://www.ubereats.com/au/store/nam-son-1/uMROu96STk-tSNy9Ji5oIg',
  doordash: 'https://www.doordash.com/en-AU/store/nam-son-restaurant-springvale-1280093/1841660/',
  facebook: 'https://www.facebook.com/namsonchineserestaurant/',
};
export const photos = {
  hero: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1400&q=85',
  pho: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=85',
  rolls: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=85',
  beef: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=85',
  coffee: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=85',
};
export const sampleMenu = [
  { id: 'pho', name: 'Beef Phở', vietnamese: 'Phở bò', category: 'Noodle soups', description: 'A comforting Vietnamese classic with beef, rice noodles and fragrant broth.', price: '', image: photos.pho, tag: 'A bowl of comfort', featured: true },
  { id: 'beef', name: 'Shaking Beef with Rice', vietnamese: 'Bò lúc lắc', category: 'Rice & wok', description: 'Savoury diced beef, wok-seared and served with rice.', price: '', image: photos.beef, tag: 'Wok favourites', featured: true },
  { id: 'pork', name: 'Salt & Pepper Pork Chops', vietnamese: '', category: 'Rice & wok', description: 'A Chinese-style favourite with a fragrant salt and pepper seasoning.', price: '', image: photos.rolls, tag: 'Made for sharing', featured: true },
  { id: 'bun', name: 'Nam Son Crab Noodle Soup', vietnamese: 'Bún riêu Nam Son', category: 'Noodle soups', description: 'A Vietnamese crab and tomato noodle soup.', price: '', image: photos.hero, tag: '', featured: false },
  { id: 'coffee', name: 'Vietnamese Iced Coffee', vietnamese: 'Cà phê sữa đá', category: 'Drinks', description: 'Bold coffee, a little sweetness, and plenty of ice.', price: '', image: photos.coffee, tag: '', featured: false },
];

// RFC 4180-style parsing keeps quoted commas, newlines and escaped quotes intact.
export function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(v => v.trim())) rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Invalid CSV: unclosed quote');
  row.push(field); if (row.some(v => v.trim())) rows.push(row);
  const headers = (rows.shift() || []).map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  return rows.map(values => Object.fromEntries(headers.map((key, i) => [key, (values[i] || '').trim()])));
}
export function safeURL(value, fallback = '') {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : fallback; } catch { return fallback; }
}
export function normalizeMenu(rows) {
  if (!rows.length || !Object.hasOwn(rows[0], 'name') || !Object.hasOwn(rows[0], 'category')) throw new Error('Menu requires name and category columns');
  return rows.filter(r => r.name && r.category && r.available?.toLowerCase() !== 'false').map((r, i) => ({
    id: r.id || `dish-${i}`, name: r.name, vietnamese: r.vietnamese || '', category: r.category,
    description: r.description || '', price: r.price || '', image: safeURL(r.image), tag: r.tag || '', featured: r.featured?.toLowerCase() === 'true',
  }));
}
async function fetchSheet(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Sheet could not be loaded');
  const text = await response.text();
  if (/^\s*</.test(text)) throw new Error('Publish the sheet as CSV');
  return parseCSV(text);
}
export async function loadContent({ menuURL = '/menu-template.csv', settingsURL = '/settings-template.csv', signal } = {}) {
  const [menuResult, settingsResult] = await Promise.allSettled([
    menuURL ? fetchSheet(menuURL, signal).then(normalizeMenu) : Promise.resolve(null),
    settingsURL ? fetchSheet(settingsURL, signal) : Promise.resolve(null),
  ]);
  const settings = { ...defaults };
  if (settingsResult.status === 'fulfilled' && settingsResult.value) {
    for (const row of settingsResult.value) {
      if (Object.hasOwn(defaults, row.key)) settings[row.key] = ['uber', 'doordash', 'facebook'].includes(row.key) ? safeURL(row.value, defaults[row.key]) : row.value;
    }
  }
  return { settings, menu: menuResult.status === 'fulfilled' && menuResult.value !== null ? menuResult.value : sampleMenu,
    isSample: !menuURL || menuResult.status === 'rejected', failed: menuResult.status === 'rejected' || settingsResult.status === 'rejected' };
}
