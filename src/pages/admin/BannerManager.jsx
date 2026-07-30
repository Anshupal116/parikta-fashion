import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "parikta_banner_manager";

const defaultBanners = [
  {
    id: "banner-hero-1",
    title: "Summer Edit 2026",
    subtitle: "Fresh silhouettes crafted for effortless elegance.",
    desktopImage:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1800&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
    buttonText: "Shop Collection",
    buttonLink: "/collections/summer-edit",
    placement: "Hero Slider",
    status: "Active",
    priority: 1,
    startDate: "",
    endDate: "",
    openInNewTab: false,
    overlay: 28,
    textAlign: "Left",
    textColor: "#ffffff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "banner-offer-1",
    title: "Free Shipping",
    subtitle: "On all orders above ₹999",
    desktopImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=80",
    mobileImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    buttonText: "Explore Now",
    buttonLink: "/shop",
    placement: "Promotional Banner",
    status: "Active",
    priority: 2,
    startDate: "",
    endDate: "",
    openInNewTab: false,
    overlay: 35,
    textAlign: "Center",
    textColor: "#ffffff",
    createdAt: new Date().toISOString(),
  },
];

const emptyBanner = {
  title: "",
  subtitle: "",
  desktopImage: "",
  mobileImage: "",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  placement: "Hero Slider",
  status: "Active",
  priority: 1,
  startDate: "",
  endDate: "",
  openInNewTab: false,
  overlay: 30,
  textAlign: "Left",
  textColor: "#ffffff",
};

const placements = [
  "Hero Slider",
  "Promotional Banner",
  "Category Banner",
  "Collection Banner",
  "Mobile Banner",
];

const inputClass =
  "w-full rounded-xl border border-[#eadbd4] bg-white px-4 py-3 text-[#5B3B32] outline-none transition focus:border-[#9A3F4D] focus:ring-2 focus:ring-[#9A3F4D]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[#5B3B32]";

const formatDate = (value) => {
  if (!value) return "No limit";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isBannerLive = (banner) => {
  if (banner.status !== "Active") return false;

  const now = new Date();
  const start = banner.startDate ? new Date(`${banner.startDate}T00:00:00`) : null;
  const end = banner.endDate ? new Date(`${banner.endDate}T23:59:59`) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyBanner);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority");
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewDevice, setPreviewDevice] = useState("Desktop");
  const [showEditor, setShowEditor] = useState(false);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const [draggedId, setDraggedId] = useState(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const initial = Array.isArray(saved) ? saved : defaultBanners;
      setBanners(initial);
    } catch (error) {
      console.error("Banner load error:", error);
      setBanners(defaultBanners);
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const persist = (next) => {
    setBanners(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const stats = useMemo(() => {
    const active = banners.filter((banner) => banner.status === "Active").length;
    const scheduled = banners.filter((banner) => {
      if (!banner.startDate) return false;
      return new Date(`${banner.startDate}T00:00:00`) > new Date();
    }).length;
    const expired = banners.filter((banner) => {
      if (!banner.endDate) return false;
      return new Date(`${banner.endDate}T23:59:59`) < new Date();
    }).length;

    return {
      total: banners.length,
      active,
      scheduled,
      expired,
    };
  }, [banners]);

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = banners.filter((banner) => {
      const matchesSearch =
        !query ||
        banner.title.toLowerCase().includes(query) ||
        banner.subtitle.toLowerCase().includes(query) ||
        banner.buttonText.toLowerCase().includes(query);

      const matchesPlacement =
        placementFilter === "All" || banner.placement === placementFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Live"
          ? isBannerLive(banner)
          : banner.status === statusFilter);

      return matchesSearch && matchesPlacement && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "priority") return Number(a.priority) - Number(b.priority);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      return 0;
    });
  }, [banners, placementFilter, search, sortBy, statusFilter]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Banner title is required";
    if (!form.desktopImage.trim()) {
      nextErrors.desktopImage = "Desktop image URL is required";
    }

    if (!form.buttonText.trim()) {
      nextErrors.buttonText = "Button text is required";
    }

    if (!form.buttonLink.trim()) {
      nextErrors.buttonLink = "Button link is required";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      nextErrors.endDate = "End date must be after start date";
    }

    if (Number(form.priority) < 1) {
      nextErrors.priority = "Priority must be 1 or greater";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetEditor = () => {
    setForm(clone(emptyBanner));
    setEditingId(null);
    setErrors({});
    setPreviewDevice("Desktop");
  };

  const openCreate = () => {
    resetEditor();
    setForm((current) => ({
      ...current,
      priority: banners.length + 1,
    }));
    setShowEditor(true);
  };

  const openEdit = (banner) => {
    setForm({
      ...emptyBanner,
      ...clone(banner),
    });
    setEditingId(banner.id);
    setErrors({});
    setShowEditor(true);
  };

  const saveBanner = (event) => {
    event.preventDefault();
    if (!validate()) return;

    if (editingId) {
      const next = banners.map((banner) =>
        banner.id === editingId ? { ...banner, ...form } : banner
      );

      persist(next);
      setToast("Banner updated successfully");
    } else {
      const newBanner = {
        ...form,
        id: `banner-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      persist([...banners, newBanner]);
      setToast("Banner created successfully");
    }

    setShowEditor(false);
    resetEditor();
  };

  const deleteBanner = (id) => {
    const confirmed = window.confirm("Is banner ko delete karna hai?");
    if (!confirmed) return;

    const next = banners.filter((banner) => banner.id !== id);
    persist(next);
    setSelectedIds((current) => current.filter((item) => item !== id));
    setToast("Banner deleted");
  };

  const duplicateBanner = (banner) => {
    const duplicated = {
      ...clone(banner),
      id: `banner-${Date.now()}`,
      title: `${banner.title} Copy`,
      priority: banners.length + 1,
      status: "Inactive",
      createdAt: new Date().toISOString(),
    };

    persist([...banners, duplicated]);
    setToast("Banner duplicated");
  };

  const toggleStatus = (id) => {
    const next = banners.map((banner) =>
      banner.id === id
        ? {
            ...banner,
            status: banner.status === "Active" ? "Inactive" : "Active",
          }
        : banner
    );

    persist(next);
    setToast("Banner status updated");
  };

  const toggleSelection = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    const allVisibleSelected =
      filteredBanners.length > 0 &&
      filteredBanners.every((banner) => selectedIds.includes(banner.id));

    if (allVisibleSelected) {
      const visibleIds = new Set(filteredBanners.map((banner) => banner.id));
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.has(id))
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([
          ...current,
          ...filteredBanners.map((banner) => banner.id),
        ]),
      ]);
    }
  };

  const bulkStatus = (status) => {
    if (!selectedIds.length) return;

    const next = banners.map((banner) =>
      selectedIds.includes(banner.id) ? { ...banner, status } : banner
    );

    persist(next);
    setSelectedIds([]);
    setToast(`Selected banners marked ${status.toLowerCase()}`);
  };

  const bulkDelete = () => {
    if (!selectedIds.length) return;

    const confirmed = window.confirm(
      `${selectedIds.length} selected banners delete karne hain?`
    );

    if (!confirmed) return;

    persist(banners.filter((banner) => !selectedIds.includes(banner.id)));
    setSelectedIds([]);
    setToast("Selected banners deleted");
  };

  const exportBanners = () => {
    const blob = new Blob([JSON.stringify(banners, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `parikta-banners-${new Date().toISOString().slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setToast("Banner data exported");
  };

  const importBanners = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());

      if (!Array.isArray(data)) {
        throw new Error("Invalid file format");
      }

      const cleaned = data.map((banner, index) => ({
        ...emptyBanner,
        ...banner,
        id: banner.id || `banner-import-${Date.now()}-${index}`,
        createdAt: banner.createdAt || new Date().toISOString(),
      }));

      persist(cleaned);
      setSelectedIds([]);
      setToast("Banner data imported");
    } catch (error) {
      console.error("Banner import error:", error);
      window.alert("Invalid banner JSON file");
    } finally {
      event.target.value = "";
    }
  };

  const resetBanners = () => {
    const confirmed = window.confirm(
      "Default banner data restore karna hai?"
    );

    if (!confirmed) return;

    persist(clone(defaultBanners));
    setSelectedIds([]);
    setToast("Default banners restored");
  };

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    const ordered = [...banners].sort(
      (a, b) => Number(a.priority) - Number(b.priority)
    );

    const sourceIndex = ordered.findIndex((banner) => banner.id === draggedId);
    const targetIndex = ordered.findIndex((banner) => banner.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const [moved] = ordered.splice(sourceIndex, 1);
    ordered.splice(targetIndex, 0, moved);

    const next = ordered.map((banner, index) => ({
      ...banner,
      priority: index + 1,
    }));

    persist(next);
    setDraggedId(null);
    setToast("Banner order updated");
  };

  const visibleImage =
    previewDevice === "Mobile"
      ? form.mobileImage || form.desktopImage
      : form.desktopImage;

  return (
    <div className="pb-20">
      {toast && (
        <div className="fixed right-5 top-5 z-[500] rounded-2xl bg-[#5B3B32] px-5 py-4 font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#BFA996]">
            Homepage Content
          </p>

          <h1 className="heading-font mt-2 text-4xl text-[#5B3B32] md:text-5xl">
            Banner Manager
          </h1>

          <p className="mt-2 max-w-2xl text-[#8b746b]">
            Hero sliders, promotional banners aur collection campaigns manage
            karo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportBanners}
            className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]"
          >
            Export
          </button>

          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-xl border border-[#eadbd4] bg-white px-5 py-3 font-semibold text-[#5B3B32]"
          >
            Import
          </button>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={importBanners}
            className="hidden"
          />

          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white shadow-lg"
          >
            + Add Banner
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Banners" value={stats.total} note="All placements" />
        <StatCard label="Active" value={stats.active} note="Enabled banners" />
        <StatCard label="Scheduled" value={stats.scheduled} note="Future campaigns" />
        <StatCard label="Expired" value={stats.expired} note="Past campaigns" />
      </div>

      <div className="mt-8 rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,auto))]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search banner title or subtitle..."
            className={inputClass}
          />

          <select
            value={placementFilter}
            onChange={(event) => setPlacementFilter(event.target.value)}
            className={inputClass}
          >
            <option value="All">All Placements</option>
            {placements.map((placement) => (
              <option key={placement} value={placement}>
                {placement}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="All">All Status</option>
            <option value="Live">Currently Live</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className={inputClass}
          >
            <option value="priority">Sort by Priority</option>
            <option value="newest">Newest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FDEAE6] p-4">
            <p className="mr-auto font-semibold text-[#5B3B32]">
              {selectedIds.length} selected
            </p>

            <button
              type="button"
              onClick={() => bulkStatus("Active")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              Activate
            </button>

            <button
              type="button"
              onClick={() => bulkStatus("Inactive")}
              className="rounded-xl bg-[#5B3B32] px-4 py-2 text-sm font-bold text-white"
            >
              Deactivate
            </button>

            <button
              type="button"
              onClick={bulkDelete}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#5B3B32]">
          <input
            type="checkbox"
            checked={
              filteredBanners.length > 0 &&
              filteredBanners.every((banner) =>
                selectedIds.includes(banner.id)
              )
            }
            onChange={toggleAll}
            className="h-4 w-4 accent-[#9A3F4D]"
          />
          Select all visible
        </label>

        <p className="text-sm text-[#8b746b]">
          {filteredBanners.length} banner(s)
        </p>
      </div>

      {filteredBanners.length === 0 ? (
        <div className="mt-6 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-[#dfcbc2] bg-[#fffaf7] px-5 text-center">
          <h3 className="heading-font text-3xl text-[#5B3B32]">
            No banners found
          </h3>
          <p className="mt-2 text-[#8b746b]">
            Filter change karo ya new banner create karo.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white"
          >
            Add First Banner
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          {filteredBanners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              selected={selectedIds.includes(banner.id)}
              onSelect={() => toggleSelection(banner.id)}
              onEdit={() => openEdit(banner)}
              onDelete={() => deleteBanner(banner.id)}
              onDuplicate={() => duplicateBanner(banner)}
              onToggle={() => toggleStatus(banner.id)}
              onDragStart={() => setDraggedId(banner.id)}
              onDrop={() => handleDrop(banner.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={resetBanners}
          className="text-sm font-semibold text-red-600 underline"
        >
          Restore default banners
        </button>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-[600] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <div className="mx-auto my-4 w-full max-w-7xl overflow-hidden rounded-3xl bg-[#fffaf7] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eadbd4] px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                  Banner Editor
                </p>
                <h2 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                  {editingId ? "Edit Banner" : "Create Banner"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditor(false);
                  resetEditor();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#5B3B32] shadow"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveBanner}
              className="grid xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]"
            >
              <div className="space-y-7 p-6 md:p-8">
                <EditorSection title="Banner Content">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Banner Title"
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
                      error={errors.title}
                      placeholder="Festive Collection"
                    />

                    <Field
                      label="Button Text"
                      value={form.buttonText}
                      onChange={(event) =>
                        updateForm("buttonText", event.target.value)
                      }
                      error={errors.buttonText}
                      placeholder="Shop Now"
                    />

                    <Field
                      label="Subtitle"
                      value={form.subtitle}
                      onChange={(event) =>
                        updateForm("subtitle", event.target.value)
                      }
                      className="md:col-span-2"
                      placeholder="Premium styles for every celebration."
                    />

                    <Field
                      label="Button Link"
                      value={form.buttonLink}
                      onChange={(event) =>
                        updateForm("buttonLink", event.target.value)
                      }
                      error={errors.buttonLink}
                      className="md:col-span-2"
                      placeholder="/collections/festive"
                    />
                  </div>
                </EditorSection>

                <EditorSection title="Banner Images">
                  <div className="grid gap-5">
                    <Field
                      label="Desktop Image URL"
                      value={form.desktopImage}
                      onChange={(event) =>
                        updateForm("desktopImage", event.target.value)
                      }
                      error={errors.desktopImage}
                      placeholder="https://..."
                      hint="Recommended size: 1920 × 760 px"
                    />

                    <Field
                      label="Mobile Image URL"
                      value={form.mobileImage}
                      onChange={(event) =>
                        updateForm("mobileImage", event.target.value)
                      }
                      placeholder="https://..."
                      hint="Recommended size: 900 × 1200 px. Blank hone par desktop image use hogi."
                    />
                  </div>
                </EditorSection>

                <EditorSection title="Placement & Visibility">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Placement</label>
                      <select
                        value={form.placement}
                        onChange={(event) =>
                          updateForm("placement", event.target.value)
                        }
                        className={inputClass}
                      >
                        {placements.map((placement) => (
                          <option key={placement} value={placement}>
                            {placement}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Status</label>
                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateForm("status", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <Field
                      label="Priority"
                      type="number"
                      min="1"
                      value={form.priority}
                      onChange={(event) =>
                        updateForm("priority", event.target.value)
                      }
                      error={errors.priority}
                    />

                    <div>
                      <label className={labelClass}>Text Alignment</label>
                      <select
                        value={form.textAlign}
                        onChange={(event) =>
                          updateForm("textAlign", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="Left">Left</option>
                        <option value="Center">Center</option>
                        <option value="Right">Right</option>
                      </select>
                    </div>

                    <Field
                      label="Start Date"
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        updateForm("startDate", event.target.value)
                      }
                    />

                    <Field
                      label="End Date"
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        updateForm("endDate", event.target.value)
                      }
                      error={errors.endDate}
                    />
                  </div>
                </EditorSection>

                <EditorSection title="Display Style">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Overlay Strength</label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={form.overlay}
                        onChange={(event) =>
                          updateForm("overlay", Number(event.target.value))
                        }
                        className="w-full accent-[#9A3F4D]"
                      />
                      <p className="mt-1 text-xs text-[#8b746b]">
                        {form.overlay}% dark overlay
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Text Color</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={(event) =>
                            updateForm("textColor", event.target.value)
                          }
                          className="h-12 w-16 rounded-xl border border-[#eadbd4] bg-white p-1"
                        />
                        <input
                          value={form.textColor}
                          onChange={(event) =>
                            updateForm("textColor", event.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#eadbd4] bg-white p-4">
                    <input
                      type="checkbox"
                      checked={form.openInNewTab}
                      onChange={(event) =>
                        updateForm("openInNewTab", event.target.checked)
                      }
                      className="h-4 w-4 accent-[#9A3F4D]"
                    />
                    <div>
                      <p className="font-semibold text-[#5B3B32]">
                        Open link in new tab
                      </p>
                      <p className="text-xs text-[#8b746b]">
                        External campaign links ke liye useful.
                      </p>
                    </div>
                  </label>
                </EditorSection>
              </div>

              <div className="border-t border-[#eadbd4] bg-white p-6 xl:border-l xl:border-t-0">
                <div className="sticky top-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#BFA996]">
                        Live Preview
                      </p>
                      <h3 className="heading-font mt-1 text-3xl text-[#5B3B32]">
                        Banner Preview
                      </h3>
                    </div>

                    <div className="flex rounded-xl bg-[#FDEAE6] p-1">
                      {["Desktop", "Mobile"].map((device) => (
                        <button
                          key={device}
                          type="button"
                          onClick={() => setPreviewDevice(device)}
                          className={`rounded-lg px-3 py-2 text-xs font-bold ${
                            previewDevice === device
                              ? "bg-[#9A3F4D] text-white"
                              : "text-[#5B3B32]"
                          }`}
                        >
                          {device}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`mx-auto overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#f5efeb] shadow-xl ${
                      previewDevice === "Mobile"
                        ? "aspect-[3/4] max-w-[360px]"
                        : "aspect-[16/8] w-full"
                    }`}
                  >
                    {visibleImage ? (
                      <div
                        className="relative h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${visibleImage}")` }}
                      >
                        <div
                          className="absolute inset-0 bg-black"
                          style={{ opacity: Number(form.overlay) / 100 }}
                        />

                        <div
                          className={`relative flex h-full p-6 md:p-10 ${
                            form.textAlign === "Center"
                              ? "items-center justify-center text-center"
                              : form.textAlign === "Right"
                              ? "items-center justify-end text-right"
                              : "items-center justify-start text-left"
                          }`}
                          style={{ color: form.textColor }}
                        >
                          <div className="max-w-lg">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] opacity-80">
                              {form.placement}
                            </p>

                            <h3 className="heading-font mt-3 text-3xl md:text-5xl">
                              {form.title || "Banner Title"}
                            </h3>

                            <p className="mt-3 text-sm leading-6 opacity-90 md:text-base">
                              {form.subtitle || "Banner subtitle will appear here."}
                            </p>

                            <span className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#5B3B32] shadow">
                              {form.buttonText || "Shop Now"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8b746b]">
                        Desktop image URL add karo to preview dikhega.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#eadbd4] bg-[#fffaf7] p-4 text-sm text-[#5B3B32]">
                    <div className="flex justify-between gap-4 border-b border-[#eadbd4] pb-3">
                      <span>Placement</span>
                      <strong>{form.placement}</strong>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#eadbd4] py-3">
                      <span>Status</span>
                      <strong>{form.status}</strong>
                    </div>
                    <div className="flex justify-between gap-4 pt-3">
                      <span>Schedule</span>
                      <strong className="text-right">
                        {formatDate(form.startDate)} – {formatDate(form.endDate)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditor(false);
                        resetEditor();
                      }}
                      className="flex-1 rounded-xl border border-[#9A3F4D] px-5 py-3 font-bold text-[#9A3F4D]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#9A3F4D] px-5 py-3 font-bold text-white"
                    >
                      {editingId ? "Update Banner" : "Create Banner"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-[#eadbd4] bg-[#fffaf7] p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a837a]">
        {label}
      </p>
      <p className="heading-font mt-3 text-4xl text-[#5B3B32]">{value}</p>
      <p className="mt-2 text-sm text-[#8b746b]">{note}</p>
    </div>
  );
}

function Field({ label, error, hint, className = "", ...props }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input
        {...props}
        className={`${inputClass} ${error ? "border-red-400" : ""}`}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#8b746b]">{hint}</p>
      ) : null}
    </div>
  );
}

function EditorSection({ title, children }) {
  return (
    <section>
      <h3 className="heading-font mb-5 text-2xl text-[#5B3B32]">{title}</h3>
      {children}
    </section>
  );
}

function BannerCard({
  banner,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onDragStart,
  onDrop,
}) {
  const live = isBannerLive(banner);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="overflow-hidden rounded-3xl border border-[#eadbd4] bg-[#fffaf7] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/8] overflow-hidden bg-[#f5efeb]">
        {banner.desktopImage ? (
          <img
            src={banner.desktopImage}
            alt={banner.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8b746b]">
            No image
          </div>
        )}

        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: Number(banner.overlay || 0) / 100 }}
        />

        <label className="absolute left-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/95 shadow">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 accent-[#9A3F4D]"
          />
        </label>

        <div className="absolute right-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#5B3B32] shadow">
            #{banner.priority}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold shadow ${
              live
                ? "bg-emerald-500 text-white"
                : banner.status === "Active"
                ? "bg-amber-400 text-[#5B3B32]"
                : "bg-[#5B3B32] text-white"
            }`}
          >
            {live ? "Live" : banner.status}
          </span>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 p-5 ${
            banner.textAlign === "Center"
              ? "text-center"
              : banner.textAlign === "Right"
              ? "text-right"
              : "text-left"
          }`}
          style={{ color: banner.textColor || "#ffffff" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
            {banner.placement}
          </p>
          <h2 className="heading-font mt-2 text-3xl">{banner.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm opacity-90">
            {banner.subtitle}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Button" value={banner.buttonText} />
          <Info label="Priority" value={`#${banner.priority}`} />
          <Info label="Starts" value={formatDate(banner.startDate)} />
          <Info label="Ends" value={formatDate(banner.endDate)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eadbd4] pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-[#9A3F4D] px-4 py-2 text-sm font-bold text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="rounded-xl border border-[#9A3F4D] px-4 py-2 text-sm font-bold text-[#9A3F4D]"
          >
            {banner.status === "Active" ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-xl border border-[#eadbd4] bg-white px-4 py-2 text-sm font-bold text-[#5B3B32]"
          >
            Duplicate
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600"
          >
            Delete
          </button>
        </div>

        <p className="mt-4 text-xs text-[#9a837a]">
          Drag card to change banner priority.
        </p>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#9a837a]">{label}</p>
      <p className="mt-1 truncate font-semibold text-[#5B3B32]">{value}</p>
    </div>
  );
}

export default BannerManager;