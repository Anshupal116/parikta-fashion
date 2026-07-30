import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "parikta_homepage_cms_v1";

const defaultContent = {
  general: {
    announcementEnabled: true,
    announcementText: "Free shipping on orders above ₹999",
    announcementLink: "/products",
  },
  hero: {
    enabled: true,
    eyebrow: "Parikta Signature Edit",
    title: "Timeless Indian Fashion, Crafted for You",
    subtitle:
      "Discover thoughtfully designed ethnic wear for celebrations and everyday elegance.",
    desktopImage:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1800&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    buttonText: "Shop Collection",
    buttonLink: "/products",
    overlay: 32,
    textAlign: "Left",
    textColor: "#ffffff",
  },
  featuredCategories: {
    enabled: true,
    heading: "Shop by Category",
    subheading: "Curated styles for every mood and occasion.",
    items: [
      {
        id: "cat-1",
        name: "Sarees",
        image:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
        link: "/products?category=saree",
        active: true,
      },
      {
        id: "cat-2",
        name: "Suits",
        image:
          "https://images.unsplash.com/photo-1583391733975-d3f0c7f166f5?auto=format&fit=crop&w=900&q=80",
        link: "/products?category=suit",
        active: true,
      },
    ],
  },
  newArrivals: {
    enabled: true,
    heading: "New Arrivals",
    subheading: "Fresh styles, newly added.",
    source: "Latest Products",
    productLimit: 8,
    buttonText: "View All",
    buttonLink: "/products?sort=newest",
  },
  bestSellers: {
    enabled: true,
    heading: "Best Sellers",
    subheading: "Loved by our customers.",
    source: "Top Selling",
    productLimit: 8,
    buttonText: "Shop Best Sellers",
    buttonLink: "/products?sort=popular",
  },
  promotional: {
    enabled: true,
    eyebrow: "Limited Time Offer",
    title: "Festive Styles Up to 30% Off",
    subtitle:
      "Celebrate in standout silhouettes crafted with intricate details and rich textures.",
    image:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1800&q=85",
    buttonText: "Shop the Edit",
    buttonLink: "/products",
    overlay: 36,
    textAlign: "Left",
    textColor: "#ffffff",
  },
  testimonial: {
    enabled: true,
    heading: "What Our Customers Say",
    subheading: "Real stories from the Parikta community.",
    items: [
      {
        id: "review-1",
        name: "Riya Sharma",
        city: "Delhi",
        rating: 5,
        review:
          "Beautiful fabric and finishing. The outfit looked exactly like the photos.",
        active: true,
      },
    ],
  },
  instagram: {
    enabled: true,
    heading: "Follow Our Story",
    subheading: "@pariktafashion",
    profileLink: "https://instagram.com/",
    items: [
      {
        id: "insta-1",
        image:
          "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80",
        link: "https://instagram.com/",
        active: true,
      },
    ],
  },
  newsletter: {
    enabled: true,
    eyebrow: "Stay in the Loop",
    heading: "Join the Parikta Community",
    subheading:
      "Get early access to launches, private offers and styling inspiration.",
    placeholder: "Enter your email address",
    buttonText: "Subscribe",
    backgroundColor: "#5B3B32",
    textColor: "#ffffff",
  },
  seo: {
    pageTitle: "Parikta Fashion | Premium Indian Ethnic Wear",
    metaDescription:
      "Shop premium sarees, suits, lehengas and kurtis at Parikta Fashion.",
    canonicalUrl: "https://parikta.com/",
    ogImage: "",
  },
  sectionOrder: [
    "hero",
    "featuredCategories",
    "newArrivals",
    "bestSellers",
    "promotional",
    "testimonial",
    "instagram",
    "newsletter",
  ],
};

const labels = {
  hero: "Hero Section",
  featuredCategories: "Featured Categories",
  newArrivals: "New Arrivals",
  bestSellers: "Best Sellers",
  promotional: "Promotional Banner",
  testimonial: "Testimonials",
  instagram: "Instagram Gallery",
  newsletter: "Newsletter",
};

const inputClass =
  "w-full rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-[#5B3B32] outline-none transition focus:border-[#9A3F4D] focus:ring-2 focus:ring-[#9A3F4D]/10";
const cardClass =
  "rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm md:p-6";
const labelClass = "mb-2 block text-sm font-semibold text-[#5B3B32]";
const clone = (value) => JSON.parse(JSON.stringify(value));

function HomepageCMS() {
  const [content, setContent] = useState(defaultContent);
  const [activeTab, setActiveTab] = useState("general");
  const [device, setDevice] = useState("Desktop");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");
  const [dragged, setDragged] = useState(null);
  const importRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) setContent({ ...clone(defaultContent), ...saved });
    } catch (error) {
      console.error("CMS load error", error);
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const update = (section, field, value) => {
    setContent((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
    setDirty(true);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setDirty(false);
    setToast("Homepage content saved");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parikta-homepage-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      setContent({ ...clone(defaultContent), ...data });
      setDirty(true);
      setToast("CMS imported. Save changes to apply.");
    } catch {
      alert("Invalid JSON file");
    }
    event.target.value = "";
  };

  const reset = () => {
    if (!window.confirm("Default homepage content restore karna hai?")) return;
    setContent(clone(defaultContent));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContent));
    setDirty(false);
    setToast("Default content restored");
  };

  const moveSection = (target) => {
    if (!dragged || dragged === target) return;
    const next = [...content.sectionOrder];
    const from = next.indexOf(dragged);
    const to = next.indexOf(target);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setContent((current) => ({ ...current, sectionOrder: next }));
    setDragged(null);
    setDirty(true);
  };

  const enabledCount = useMemo(
    () =>
      content.sectionOrder.filter((key) => content[key]?.enabled !== false)
        .length,
    [content]
  );

  return (
    <div className="pb-20">
      {toast && (
        <div className="fixed right-5 top-5 z-[900] rounded-2xl bg-[#5B3B32] px-5 py-4 font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#BFA996]">
            Website Content
          </p>
          <h1 className="heading-font mt-2 text-4xl text-[#5B3B32] md:text-5xl">
            Homepage CMS
          </h1>
          <p className="mt-2 max-w-3xl text-[#8b746b]">
            Homepage sections ko admin panel se manage karo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]">
            Export
          </button>
          <button onClick={() => importRef.current?.click()} className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]">
            Import
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={importData} className="hidden" />
          <button onClick={save} className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white shadow-lg">
            {dirty ? "Save Changes *" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sections" value={content.sectionOrder.length} note="Configured homepage blocks" />
        <Stat label="Enabled" value={enabledCount} note="Visible sections" />
        <Stat label="Categories" value={content.featuredCategories.items.length} note="Featured category cards" />
        <Stat label="Reviews" value={content.testimonial.items.length} note="Customer testimonials" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-3 shadow-sm xl:sticky xl:top-5">
          {[
            ["general", "General Settings"],
            ["sections", "Section Order"],
            ["hero", "Hero Section"],
            ["featuredCategories", "Featured Categories"],
            ["newArrivals", "New Arrivals"],
            ["bestSellers", "Best Sellers"],
            ["promotional", "Promotional Banner"],
            ["testimonial", "Testimonials"],
            ["instagram", "Instagram Gallery"],
            ["newsletter", "Newsletter"],
            ["seo", "Homepage SEO"],
          ].map(([key, text]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`mb-1 w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === key ? "bg-[#9A3F4D] text-white" : "text-[#5B3B32] hover:bg-[#FDEAE6]"}`}>
              {text}
            </button>
          ))}
        </aside>

        <main className="min-w-0 space-y-6">
          {activeTab === "general" && <General content={content} update={update} />}
          {activeTab === "sections" && <SectionOrder content={content} setContent={setContent} dragged={dragged} setDragged={setDragged} moveSection={moveSection} setDirty={setDirty} />}
          {activeTab === "hero" && <Hero content={content} update={update} device={device} setDevice={setDevice} />}
          {activeTab === "featuredCategories" && <Categories content={content} setContent={setContent} update={update} setDirty={setDirty} />}
          {["newArrivals", "bestSellers"].includes(activeTab) && <ProductSection section={activeTab} content={content} update={update} />}
          {activeTab === "promotional" && <Promo content={content} update={update} />}
          {activeTab === "testimonial" && <Testimonials content={content} setContent={setContent} update={update} setDirty={setDirty} />}
          {activeTab === "instagram" && <Instagram content={content} setContent={setContent} update={update} setDirty={setDirty} />}
          {activeTab === "newsletter" && <Newsletter content={content} update={update} />}
          {activeTab === "seo" && <SEO content={content} update={update} />}
        </main>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5">
        <p className="text-sm text-[#8b746b]">Abhi data browser localStorage me save hoga.</p>
        <button onClick={reset} className="text-sm font-bold text-red-600 underline">Restore defaults</button>
      </div>
    </div>
  );
}

function General({ content, update }) {
  const data = content.general;
  return <>
    <Header title="General Homepage Settings" description="Announcement bar manage karo." />
    <div className={cardClass}>
      <Toggle title="Announcement Bar" checked={data.announcementEnabled} onChange={() => update("general", "announcementEnabled", !data.announcementEnabled)} />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Announcement Text" value={data.announcementText} onChange={(e) => update("general", "announcementText", e.target.value)} />
        <Field label="Announcement Link" value={data.announcementLink} onChange={(e) => update("general", "announcementLink", e.target.value)} />
      </div>
    </div>
    <div className="rounded-3xl bg-[#5B3B32] px-6 py-4 text-center font-semibold text-white">{data.announcementEnabled ? data.announcementText : "Announcement disabled"}</div>
  </>;
}

function SectionOrder({ content, setContent, dragged, setDragged, moveSection, setDirty }) {
  return <>
    <Header title="Section Order" description="Cards drag karke homepage order change karo." />
    <div className={cardClass}>
      <div className="space-y-3">
        {content.sectionOrder.map((key, index) => (
          <div key={key} draggable onDragStart={() => setDragged(key)} onDragOver={(e) => e.preventDefault()} onDrop={() => moveSection(key)} className="flex items-center gap-4 rounded-2xl border border-[#eadbd4] bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEAE6] font-bold text-[#9A3F4D]">{index + 1}</div>
            <div className="flex-1"><p className="font-bold text-[#5B3B32]">{labels[key]}</p><p className="text-xs text-[#8b746b]">Drag to reorder</p></div>
            <button onClick={() => { setContent((current) => ({ ...current, [key]: { ...current[key], enabled: !current[key].enabled } })); setDirty(true); }} className={`rounded-full px-4 py-2 text-xs font-bold ${content[key].enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{content[key].enabled ? "Enabled" : "Disabled"}</button>
            <span className="text-xl">⋮⋮</span>
          </div>
        ))}
      </div>
    </div>
  </>;
}

function Hero({ content, update, device, setDevice }) {
  const data = content.hero;
  const image = device === "Mobile" ? data.mobileImage || data.desktopImage : data.desktopImage;
  return <>
    <Header title="Hero Section" description="Homepage ke main hero banner ko manage karo." />
    <div className="grid gap-6 2xl:grid-cols-[1fr_0.9fr]">
      <div className={cardClass}>
        <Toggle title="Enable Hero" checked={data.enabled} onChange={() => update("hero", "enabled", !data.enabled)} />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Eyebrow" value={data.eyebrow} onChange={(e) => update("hero", "eyebrow", e.target.value)} />
          <Field label="Title" value={data.title} onChange={(e) => update("hero", "title", e.target.value)} />
          <Area label="Subtitle" value={data.subtitle} onChange={(e) => update("hero", "subtitle", e.target.value)} className="md:col-span-2" />
          <Field label="Desktop Image URL" value={data.desktopImage} onChange={(e) => update("hero", "desktopImage", e.target.value)} className="md:col-span-2" />
          <Field label="Mobile Image URL" value={data.mobileImage} onChange={(e) => update("hero", "mobileImage", e.target.value)} className="md:col-span-2" />
          <Field label="Button Text" value={data.buttonText} onChange={(e) => update("hero", "buttonText", e.target.value)} />
          <Field label="Button Link" value={data.buttonLink} onChange={(e) => update("hero", "buttonLink", e.target.value)} />
          <Select label="Text Alignment" value={data.textAlign} options={["Left", "Center", "Right"]} onChange={(e) => update("hero", "textAlign", e.target.value)} />
          <Color label="Text Color" value={data.textColor} onChange={(value) => update("hero", "textColor", value)} />
          <div className="md:col-span-2"><label className={labelClass}>Overlay: {data.overlay}%</label><input type="range" min="0" max="80" value={data.overlay} onChange={(e) => update("hero", "overlay", Number(e.target.value))} className="w-full accent-[#9A3F4D]" /></div>
        </div>
      </div>
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between"><h3 className="heading-font text-2xl text-[#5B3B32]">Live Preview</h3><div className="flex rounded-xl bg-[#FDEAE6] p-1">{["Desktop","Mobile"].map((x)=><button key={x} onClick={()=>setDevice(x)} className={`rounded-lg px-3 py-2 text-xs font-bold ${device===x?"bg-[#9A3F4D] text-white":"text-[#5B3B32]"}`}>{x}</button>)}</div></div>
        <div className={`mx-auto overflow-hidden rounded-3xl bg-[#f3ece8] ${device === "Mobile" ? "aspect-[3/4] max-w-[350px]" : "aspect-[16/9]"}`}>
          {image ? <div className="relative h-full bg-cover bg-center" style={{backgroundImage:`url("${image}")`}}><div className="absolute inset-0 bg-black" style={{opacity:data.overlay/100}}/><div className={`relative flex h-full items-center p-7 ${data.textAlign === "Center" ? "justify-center text-center" : data.textAlign === "Right" ? "justify-end text-right" : "justify-start text-left"}`} style={{color:data.textColor}}><div className="max-w-md"><p className="text-xs font-bold uppercase tracking-[0.25em]">{data.eyebrow}</p><h2 className="heading-font mt-3 text-4xl">{data.title}</h2><p className="mt-3 text-sm leading-6">{data.subtitle}</p><button className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-[#5B3B32]">{data.buttonText}</button></div></div></div> : <div className="flex h-full items-center justify-center">Add image URL</div>}
        </div>
      </div>
    </div>
  </>;
}

function Categories({ content, setContent, update, setDirty }) {
  const data = content.featuredCategories;
  const changeItem = (id, field, value) => { setContent((current) => ({...current, featuredCategories:{...current.featuredCategories,items:current.featuredCategories.items.map((item)=>item.id===id?{...item,[field]:value}:item)}})); setDirty(true); };
  const add = () => { setContent((current)=>({...current,featuredCategories:{...current.featuredCategories,items:[...current.featuredCategories.items,{id:`cat-${Date.now()}`,name:"New Category",image:"",link:"/products",active:true}]}})); setDirty(true); };
  const remove = (id) => { setContent((current)=>({...current,featuredCategories:{...current.featuredCategories,items:current.featuredCategories.items.filter((item)=>item.id!==id)}})); setDirty(true); };
  return <>
    <Header title="Featured Categories" description="Homepage category cards manage karo." />
    <div className={cardClass}><Toggle title="Enable Categories" checked={data.enabled} onChange={()=>update("featuredCategories","enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Heading" value={data.heading} onChange={(e)=>update("featuredCategories","heading",e.target.value)}/><Field label="Subheading" value={data.subheading} onChange={(e)=>update("featuredCategories","subheading",e.target.value)}/></div></div>
    <div className="flex items-center justify-between"><h3 className="heading-font text-3xl text-[#5B3B32]">Category Cards</h3><button onClick={add} className="rounded-xl bg-[#9A3F4D] px-4 py-3 font-bold text-white">+ Add Category</button></div>
    <div className="grid gap-5 lg:grid-cols-2">{data.items.map((item)=><div key={item.id} className={cardClass}><div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-[#f3ece8]">{item.image?<img src={item.image} alt={item.name} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center">Image preview</div>}</div><div className="grid gap-4"><Field label="Name" value={item.name} onChange={(e)=>changeItem(item.id,"name",e.target.value)}/><Field label="Image URL" value={item.image} onChange={(e)=>changeItem(item.id,"image",e.target.value)}/><Field label="Link" value={item.link} onChange={(e)=>changeItem(item.id,"link",e.target.value)}/><div className="flex items-center justify-between"><Toggle title="Active" checked={item.active} onChange={()=>changeItem(item.id,"active",!item.active)} compact/><button onClick={()=>remove(item.id)} className="font-bold text-red-600">Delete</button></div></div></div>)}</div>
  </>;
}

function ProductSection({ section, content, update }) {
  const data = content[section];
  return <><Header title={labels[section]} description="Homepage product section configure karo."/><div className={cardClass}><Toggle title={`Enable ${labels[section]}`} checked={data.enabled} onChange={()=>update(section,"enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Heading" value={data.heading} onChange={(e)=>update(section,"heading",e.target.value)}/><Field label="Subheading" value={data.subheading} onChange={(e)=>update(section,"subheading",e.target.value)}/><Select label="Product Source" value={data.source} options={["Latest Products","Top Selling","Featured Products","Manual Selection"]} onChange={(e)=>update(section,"source",e.target.value)}/><Field label="Product Limit" type="number" min="1" max="20" value={data.productLimit} onChange={(e)=>update(section,"productLimit",Number(e.target.value))}/><Field label="Button Text" value={data.buttonText} onChange={(e)=>update(section,"buttonText",e.target.value)}/><Field label="Button Link" value={data.buttonLink} onChange={(e)=>update(section,"buttonLink",e.target.value)}/></div></div></>;
}

function Promo({ content, update }) {
  const data = content.promotional;
  return <><Header title="Promotional Banner" description="Wide marketing banner manage karo."/><div className={cardClass}><Toggle title="Enable Banner" checked={data.enabled} onChange={()=>update("promotional","enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Eyebrow" value={data.eyebrow} onChange={(e)=>update("promotional","eyebrow",e.target.value)}/><Field label="Title" value={data.title} onChange={(e)=>update("promotional","title",e.target.value)}/><Area label="Subtitle" value={data.subtitle} onChange={(e)=>update("promotional","subtitle",e.target.value)} className="md:col-span-2"/><Field label="Image URL" value={data.image} onChange={(e)=>update("promotional","image",e.target.value)} className="md:col-span-2"/><Field label="Button Text" value={data.buttonText} onChange={(e)=>update("promotional","buttonText",e.target.value)}/><Field label="Button Link" value={data.buttonLink} onChange={(e)=>update("promotional","buttonLink",e.target.value)}/><Select label="Text Alignment" value={data.textAlign} options={["Left","Center","Right"]} onChange={(e)=>update("promotional","textAlign",e.target.value)}/><Color label="Text Color" value={data.textColor} onChange={(value)=>update("promotional","textColor",value)}/></div></div>{data.image&&<div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-cover bg-center" style={{backgroundImage:`url("${data.image}")`}}><div className="absolute inset-0 bg-black" style={{opacity:data.overlay/100}}/><div className="relative flex min-h-[360px] items-center p-10 text-white"><div className="max-w-xl"><p className="text-xs uppercase tracking-[0.25em]">{data.eyebrow}</p><h3 className="heading-font mt-3 text-5xl">{data.title}</h3><p className="mt-4">{data.subtitle}</p></div></div></div>}</>;
}

function Testimonials({ content, setContent, update, setDirty }) {
  const data = content.testimonial;
  const change=(id,field,value)=>{setContent((current)=>({...current,testimonial:{...current.testimonial,items:current.testimonial.items.map((item)=>item.id===id?{...item,[field]:value}:item)}}));setDirty(true)};
  const add=()=>{setContent((current)=>({...current,testimonial:{...current.testimonial,items:[...current.testimonial.items,{id:`review-${Date.now()}`,name:"Customer Name",city:"",rating:5,review:"",active:true}]}}));setDirty(true)};
  const remove=(id)=>{setContent((current)=>({...current,testimonial:{...current.testimonial,items:current.testimonial.items.filter((item)=>item.id!==id)}}));setDirty(true)};
  return <><Header title="Testimonials" description="Customer reviews manage karo."/><div className={cardClass}><Toggle title="Enable Testimonials" checked={data.enabled} onChange={()=>update("testimonial","enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Heading" value={data.heading} onChange={(e)=>update("testimonial","heading",e.target.value)}/><Field label="Subheading" value={data.subheading} onChange={(e)=>update("testimonial","subheading",e.target.value)}/></div></div><div className="flex justify-end"><button onClick={add} className="rounded-xl bg-[#9A3F4D] px-4 py-3 font-bold text-white">+ Add Testimonial</button></div><div className="grid gap-5 lg:grid-cols-2">{data.items.map((item)=><div key={item.id} className={cardClass}><div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={item.name} onChange={(e)=>change(item.id,"name",e.target.value)}/><Field label="City" value={item.city} onChange={(e)=>change(item.id,"city",e.target.value)}/><Select label="Rating" value={item.rating} options={[5,4,3,2,1]} onChange={(e)=>change(item.id,"rating",Number(e.target.value))}/><Toggle title="Active" checked={item.active} onChange={()=>change(item.id,"active",!item.active)} compact/><Area label="Review" value={item.review} onChange={(e)=>change(item.id,"review",e.target.value)} className="md:col-span-2"/><button onClick={()=>remove(item.id)} className="text-left font-bold text-red-600">Delete</button></div></div>)}</div></>;
}

function Instagram({ content, setContent, update, setDirty }) {
  const data=content.instagram;
  const change=(id,field,value)=>{setContent((current)=>({...current,instagram:{...current.instagram,items:current.instagram.items.map((item)=>item.id===id?{...item,[field]:value}:item)}}));setDirty(true)};
  const add=()=>{setContent((current)=>({...current,instagram:{...current.instagram,items:[...current.instagram.items,{id:`insta-${Date.now()}`,image:"",link:current.instagram.profileLink,active:true}]}}));setDirty(true)};
  const remove=(id)=>{setContent((current)=>({...current,instagram:{...current.instagram,items:current.instagram.items.filter((item)=>item.id!==id)}}));setDirty(true)};
  return <><Header title="Instagram Gallery" description="Homepage social image grid manage karo."/><div className={cardClass}><Toggle title="Enable Instagram" checked={data.enabled} onChange={()=>update("instagram","enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Heading" value={data.heading} onChange={(e)=>update("instagram","heading",e.target.value)}/><Field label="Subheading" value={data.subheading} onChange={(e)=>update("instagram","subheading",e.target.value)}/><Field label="Profile Link" value={data.profileLink} onChange={(e)=>update("instagram","profileLink",e.target.value)} className="md:col-span-2"/></div></div><div className="flex justify-end"><button onClick={add} className="rounded-xl bg-[#9A3F4D] px-4 py-3 font-bold text-white">+ Add Post</button></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((item)=><div key={item.id} className={cardClass}><div className="aspect-square overflow-hidden rounded-2xl bg-[#f3ece8]">{item.image?<img src={item.image} alt="Instagram" className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center">Preview</div>}</div><div className="mt-4 grid gap-4"><Field label="Image URL" value={item.image} onChange={(e)=>change(item.id,"image",e.target.value)}/><Field label="Post Link" value={item.link} onChange={(e)=>change(item.id,"link",e.target.value)}/><div className="flex items-center justify-between"><Toggle title="Active" checked={item.active} onChange={()=>change(item.id,"active",!item.active)} compact/><button onClick={()=>remove(item.id)} className="font-bold text-red-600">Delete</button></div></div></div>)}</div></>;
}

function Newsletter({ content, update }) {
  const data=content.newsletter;
  return <><Header title="Newsletter" description="Newsletter signup section manage karo."/><div className={cardClass}><Toggle title="Enable Newsletter" checked={data.enabled} onChange={()=>update("newsletter","enabled",!data.enabled)}/><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Eyebrow" value={data.eyebrow} onChange={(e)=>update("newsletter","eyebrow",e.target.value)}/><Field label="Heading" value={data.heading} onChange={(e)=>update("newsletter","heading",e.target.value)}/><Area label="Subheading" value={data.subheading} onChange={(e)=>update("newsletter","subheading",e.target.value)} className="md:col-span-2"/><Field label="Placeholder" value={data.placeholder} onChange={(e)=>update("newsletter","placeholder",e.target.value)}/><Field label="Button Text" value={data.buttonText} onChange={(e)=>update("newsletter","buttonText",e.target.value)}/><Color label="Background" value={data.backgroundColor} onChange={(value)=>update("newsletter","backgroundColor",value)}/><Color label="Text Color" value={data.textColor} onChange={(value)=>update("newsletter","textColor",value)}/></div></div><div className="rounded-3xl p-10 text-center" style={{backgroundColor:data.backgroundColor,color:data.textColor}}><p className="text-xs uppercase tracking-[0.25em]">{data.eyebrow}</p><h3 className="heading-font mt-3 text-4xl">{data.heading}</h3><p className="mx-auto mt-3 max-w-2xl">{data.subheading}</p><div className="mx-auto mt-6 flex max-w-xl gap-3"><input placeholder={data.placeholder} className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-[#5B3B32]"/><button className="rounded-xl bg-white px-5 py-3 font-bold text-[#5B3B32]">{data.buttonText}</button></div></div></>;
}

function SEO({ content, update }) {
  const data=content.seo;
  return <><Header title="Homepage SEO" description="Meta title aur description manage karo."/><div className={cardClass}><div className="grid gap-5"><Field label="Page Title" value={data.pageTitle} onChange={(e)=>update("seo","pageTitle",e.target.value)} hint={`${data.pageTitle.length}/60 characters`}/><Area label="Meta Description" value={data.metaDescription} onChange={(e)=>update("seo","metaDescription",e.target.value)} hint={`${data.metaDescription.length}/160 characters`}/><Field label="Canonical URL" value={data.canonicalUrl} onChange={(e)=>update("seo","canonicalUrl",e.target.value)}/><Field label="Open Graph Image" value={data.ogImage} onChange={(e)=>update("seo","ogImage",e.target.value)}/></div></div><div className={cardClass}><p className="text-xl text-blue-700">{data.pageTitle}</p><p className="mt-1 text-sm text-emerald-700">{data.canonicalUrl}</p><p className="mt-2 text-sm text-[#5B3B32]">{data.metaDescription}</p></div></>;
}

function Header({ title, description }) { return <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#BFA996]">Homepage Editor</p><h2 className="heading-font mt-2 text-4xl text-[#5B3B32]">{title}</h2><p className="mt-2 text-[#8b746b]">{description}</p></div>; }
function Stat({ label, value, note }) { return <div className={cardClass}><p className="text-xs uppercase tracking-[0.18em] text-[#9a837a]">{label}</p><p className="heading-font mt-3 text-4xl text-[#5B3B32]">{value}</p><p className="mt-2 text-sm text-[#8b746b]">{note}</p></div>; }
function Toggle({ title, checked, onChange, compact=false }) { return <div className={`flex items-center justify-between gap-4 ${compact?"":"rounded-2xl border border-[#eadbd4] bg-white p-4"}`}><p className="font-semibold text-[#5B3B32]">{title}</p><button type="button" onClick={onChange} className={`relative h-7 w-12 rounded-full ${checked?"bg-[#9A3F4D]":"bg-gray-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked?"left-6":"left-1"}`}/></button></div>; }
function Field({ label, hint, className="", ...props }) { return <div className={className}><label className={labelClass}>{label}</label><input {...props} className={inputClass}/>{hint&&<p className="mt-1 text-xs text-[#8b746b]">{hint}</p>}</div>; }
function Area({ label, hint, className="", ...props }) { return <div className={className}><label className={labelClass}>{label}</label><textarea {...props} rows={4} className={`${inputClass} resize-y`}/>{hint&&<p className="mt-1 text-xs text-[#8b746b]">{hint}</p>}</div>; }
function Select({ label, options, ...props }) { return <div><label className={labelClass}>{label}</label><select {...props} className={inputClass}>{options.map((option)=><option key={option} value={option}>{option}</option>)}</select></div>; }
function Color({ label, value, onChange }) { return <div><label className={labelClass}>{label}</label><div className="flex gap-3"><input type="color" value={value} onChange={(e)=>onChange(e.target.value)} className="h-12 w-16 rounded-xl border border-[#eadbd4] bg-white p-1"/><input value={value} onChange={(e)=>onChange(e.target.value)} className={inputClass}/></div></div>; }

export default HomepageCMS;