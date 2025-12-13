import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const OFFER_OPTIONS = ["Lessons", "Boarding"];
const API_ROOT = import.meta.env.VITE_API_URL || "";
const API_PREFIX = "/api";

export default function StableProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return getCurrentUser() || null; } catch { return null; }
  }, []);
  const userId = user?.UserID ?? user?.userId ?? user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [stable, setStable]   = useState(null);
  const [error, setError]     = useState("");

  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");
  const [address, setAddr]  = useState("");
  const [city, setCity]     = useState("");
  const [stateVal, setSt]   = useState("");
  const [zip, setZip]       = useState("");
  const [email, setEmail]   = useState("");
  const [offers, setOffers] = useState([]);

  const [about, setAbout] = useState("");
  const [notes, setNotes] = useState("");

  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    Name: "",
    Price: "",
    DurationMinutes: "60",
    Type: "Riding",
    Description: "",
    IsPublic: true,
    IsActive: true,
  });
  const [serviceSaving, setServiceSaving] = useState(false);
  const [slotsByService, setSlotsByService] = useState({});
  const [slotForm, setSlotForm] = useState({});
  const [bookingsByService, setBookingsByService] = useState({});
  const [bookingForm, setBookingForm] = useState({});
  const [bookingOpen, setBookingOpen] = useState({});
  const [newHorseForm, setNewHorseForm] = useState({});
  const [bookingLoading, setBookingLoading] = useState({});
  const [stableHorses, setStableHorses] = useState([]);
  const [userHorses, setUserHorses] = useState([]);
  const horseId = (h) => h?.HorseID ?? h?.Id ?? h?.id;
  const [equipment, setEquipment] = useState([]);
  const [bookingEquipment, setBookingEquipment] = useState({});
  const [bookingEquipmentForm, setBookingEquipmentForm] = useState({});
  const [equipmentForm, setEquipmentForm] = useState({
    Name: "",
    Description: "",
    PricePerLesson: "",
    Quantity: "",
  });
  const [equipmentSaving, setEquipmentSaving] = useState(false);
  const publicStableHorses = useMemo(
    () =>
      (stableHorses || []).filter((h) => {
        if (!h) return false;
        const flag = h.isPublic ?? h.IsPublic ?? h.is_public ?? h.is_visible ?? h.isVisible;
        if (typeof flag === "string") {
          const norm = flag.trim().toLowerCase();
          return norm === "true" || norm === "1" || norm === "yes";
        }
        return flag === true || flag === 1;
      }),
    [stableHorses]
  );

  const [bannerBlobID, setBannerBlobID] = useState(null);
  const [avatarBlobID, setAvatarBlobID] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);

  const isOwner = !!(userId && stable && stable.OwnerID === userId);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const s = await api(`${API_PREFIX}/stables/${id}`);
        if (cancel) return;

        setStable(s);
        setName(s.StableName || "");
        setPhone(s.PhoneNumber || "");
        setAddr(s.Address || "");
        setCity(s.City || "");
        setSt(s.State || "");
        setZip(s.Zipcode || "");
        setEmail(s.Email || "");
        setAbout(s.About || "");
        setNotes(s.Notes || "");
        setBannerBlobID(s.BannerBlobID || null);
        setAvatarBlobID(s.AvatarBlobID || null);

        const parsedOffers = (s.Offers || "")
          .split(",")
          .map(t => t.trim())
          .filter(Boolean);
        setOffers(parsedOffers);

        try {
          const list = await api(`${API_PREFIX}/stables/${id}/services`);
          setServices(Array.isArray(list) ? list : []);
        } catch {}
        try {
          const horses = await api(`${API_PREFIX}/stables/${id}/horses`);
          setStableHorses(Array.isArray(horses) ? horses : []);
        } catch {
          setStableHorses([]);
        }
        if (userId) {
          try {
            const myHorses = await api(`${API_PREFIX}/users/${userId}/horses`);
            setUserHorses(Array.isArray(myHorses) ? myHorses : []);
          } catch {
            setUserHorses([]);
          }
        }
        try {
          const gear = await api(`${API_PREFIX}/stables/${id}/equipment`);
          setEquipment(Array.isArray(gear) ? gear : []);
        } catch {
          setEquipment([]);
        }
      } catch (e) {
        setError(e.message || "Failed to load stable");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  useEffect(() => {
    if (isOwner) return;
    services.forEach(svc => {
      if (svc?.ServiceID) {
        loadSlots(svc.ServiceID);
      }
    });
  }, [isOwner, services]);

  useEffect(() => {
    if (!publicStableHorses.length || !services.length) return;
    setBookingForm((prev) => {
      const next = { ...prev };
      services.forEach((svc) => {
        if (!svc?.ServiceID) return;
        const current = prev[svc.ServiceID] || {};
        if (!current.HorseID && publicStableHorses.length) {
          const defaultHorse = horseId(publicStableHorses[0]);
          if (defaultHorse) {
            next[svc.ServiceID] = { ...current, HorseID: defaultHorse };
          }
        }
      });
      return next;
    });
  }, [publicStableHorses, services]);

  function toggleOffer(value) {
    if (!isOwner) return;
    setOffers(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  }

  async function createEquipment(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    setEquipmentSaving(true);
    try {
      const payload = {
        Name: equipmentForm.Name.trim(),
        Description: equipmentForm.Description?.trim() || null,
        PricePerLesson: Number(equipmentForm.PricePerLesson),
        Quantity: parseInt(equipmentForm.Quantity || "0", 10),
      };
      const created = await api(`${API_PREFIX}/stables/${id}/equipment`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setEquipment(prev => [created, ...prev]);
      setEquipmentForm({ Name: "", Description: "", PricePerLesson: "", Quantity: "" });
    } catch (e) {
      setError(e.message || "Failed to add equipment");
    } finally {
      setEquipmentSaving(false);
    }
  }

  async function updateEquipment(equipmentId, fields) {
    if (!isOwner) return;
    try {
      const updated = await api(`${API_PREFIX}/stables/${id}/equipment/${equipmentId}`, {
        method: "PUT",
        body: JSON.stringify(fields),
      });
      setEquipment(prev => prev.map(eq => (eq.EquipmentID === equipmentId ? { ...eq, ...updated } : eq)));
    } catch (e) {
      setError(e.message || "Failed to update equipment");
    }
  }

  async function deleteEquipment(equipmentId) {
    if (!isOwner) return;
    try {
      await api(`${API_PREFIX}/stables/${id}/equipment/${equipmentId}`, { method: "DELETE" });
      setEquipment(prev => prev.filter(eq => eq.EquipmentID !== equipmentId));
    } catch (e) {
      setError(e.message || "Failed to delete equipment");
    }
  }

  async function saveCore(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    try {
      const payload = {
        StableName: name.trim() || stable?.StableName || "",
        PhoneNumber: phone.trim() || null,
        Address: address.trim() || null,
        City: city.trim() || null,
        State: stateVal.trim() || null,
        Zipcode: zip.trim() || null,
        Email: email.trim() || null,
        Offers: offers.join(","),
        OwnerID: stable?.OwnerID,
      };

      const updated = await api(`${API_PREFIX}/stables/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStable(updated);

      const updatedOffersStr = updated.Offers || payload.Offers || "";
      const updatedOffers = updatedOffersStr
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      setOffers(updatedOffers);
    } catch (e) {
      setError(e.message || "Update failed");
    }
  }

  async function savePage(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    try {
      await api(`${API_PREFIX}/stables/${id}/page`, {
        method: "PUT",
        body: JSON.stringify({ about, notes }),
      });
    } catch (e) {
      setError(e.message || "Saving page content failed");
    }
  }

  const formatServiceDuration = (svc) => {
    if (svc?.Type === "Boarding") {
      const days = Math.max(1, Math.round((svc.DurationMinutes || 0) / 1440));
      return `${days} day${days === 1 ? "" : "s"}`;
    }
    return `${svc.DurationMinutes} min`;
  };

  async function createService(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    setServiceSaving(true);
    try {
      const parsedPrice = Number(serviceForm.Price);
      const durationValue =
        serviceForm.Type === "Boarding"
          ? Math.max(1, parseInt(serviceForm.DurationMinutes || "30", 10)) * 1440 // days -> minutes
          : parseInt(serviceForm.DurationMinutes || "60", 10);

      const payload = {
        Name: serviceForm.Name.trim(),
        Price: isNaN(parsedPrice) ? 0 : parsedPrice,
        DurationMinutes: isNaN(durationValue) || durationValue <= 0 ? 60 : durationValue,
        Type: serviceForm.Type || "Riding",
        Description: serviceForm.Description?.trim() || null,
        IsPublic: !!serviceForm.IsPublic,
        IsActive: !!serviceForm.IsActive,
      };
      const created = await api(`${API_PREFIX}/stables/${id}/services`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setServices(prev => [created, ...prev]);
      setServiceForm({
        Name: "",
        Price: "",
        DurationMinutes: "60",
        Type: "Riding",
        Description: "",
        IsPublic: true,
        IsActive: true,
      });
    } catch (e) {
      setError(e.message || "Failed to create service");
    } finally {
      setServiceSaving(false);
    }
  }

  async function updateService(svcId, fields) {
    if (!isOwner) return;
    try {
      const updated = await api(`${API_PREFIX}/stables/${id}/services/${svcId}`, {
        method: "PUT",
        body: JSON.stringify(fields),
      });
      setServices(prev => prev.map(s => (s.ServiceID === svcId ? { ...s, ...updated } : s)));
    } catch (e) {
      setError(e.message || "Failed to update service");
    }
  }

  async function deleteService(svcId) {
    if (!isOwner) return;
    try {
      await api(`${API_PREFIX}/stables/${id}/services/${svcId}`, { method: "DELETE" });
      setServices(prev => prev.filter(s => s.ServiceID !== svcId));
      setSlotsByService(prev => {
        const copy = { ...prev };
        delete copy[svcId];
        return copy;
      });
    } catch (e) {
      setError(e.message || "Failed to delete service");
    }
  }

  async function loadSlots(svcId) {
    try {
      const list = await api(`${API_PREFIX}/stables/${id}/services/${svcId}/slots`);
      setSlotsByService(prev => ({ ...prev, [svcId]: Array.isArray(list) ? list : [] }));
    } catch {
      setSlotsByService(prev => ({ ...prev, [svcId]: [] }));
    }
  }

  async function addSlot(svcId) {
    if (!isOwner) return;
    const form = slotForm[svcId] || {};
    if (!form.StartTime || !form.EndTime) {
      setError("Start and end time required");
      return;
    }
    const startISO = new Date(form.StartTime);
    const endISO = new Date(form.EndTime);
    if (isNaN(+startISO) || isNaN(+endISO)) {
      setError("Invalid date/time values");
      return;
    }
    try {
      const payload = {
        StartTime: startISO.toISOString(),
        EndTime: endISO.toISOString(),
        Status: form.Status || "available",
      };
      const created = await api(`${API_PREFIX}/stables/${id}/services/${svcId}/slots`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSlotsByService(prev => ({
        ...prev,
        [svcId]: [...(prev[svcId] || []), created],
      }));
      setSlotForm(prev => ({ ...prev, [svcId]: { StartTime: "", EndTime: "", Status: "available" } }));
    } catch (e) {
      setError(e.message || "Failed to add slot");
    }
  }

  async function updateSlotStatus(svcId, slotId, status) {
    if (!isOwner) return;
    try {
      const updated = await api(`${API_PREFIX}/stables/${id}/services/slots/${slotId}`, {
        method: "PATCH",
        body: JSON.stringify({ Status: status }),
      });
      setSlotsByService(prev => ({
        ...prev,
        [svcId]: (prev[svcId] || []).map(s => (s.SlotID === slotId ? { ...s, ...updated } : s)),
      }));
    } catch (e) {
      setError(e.message || "Failed to update slot");
    }
  }

  async function loadBookings(svcId) {
    setBookingLoading(prev => ({ ...prev, [svcId]: true }));
    try {
      const list = await api(`${API_PREFIX}/stables/${id}/services/${svcId}/bookings`);
      setBookingsByService(prev => ({ ...prev, [svcId]: Array.isArray(list) ? list : [] }));
    } catch {
      setBookingsByService(prev => ({ ...prev, [svcId]: [] }));
    } finally {
      setBookingLoading(prev => ({ ...prev, [svcId]: false }));
    }
  }

  async function loadBookingEquipment(bookingId) {
    try {
      const list = await api(`${API_PREFIX}/lessons/bookings/${bookingId}/equipment`);
      setBookingEquipment(prev => ({ ...prev, [bookingId]: Array.isArray(list) ? list : [] }));
    } catch {
      setBookingEquipment(prev => ({ ...prev, [bookingId]: [] }));
    }
  }

  async function addBookingEquipment(bookingId) {
    if (!bookingEquipmentForm[bookingId]?.EquipmentID) {
      setError("Select equipment to attach");
      return;
    }
    try {
      const form = bookingEquipmentForm[bookingId];
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        Quantity: Math.max(1, parseInt(form.Quantity || "1", 10)),
      };
      if (form.RentalPrice) payload.RentalPrice = Number(form.RentalPrice);
      const created = await api(`${API_PREFIX}/lessons/bookings/${bookingId}/equipment`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setBookingEquipment(prev => ({
        ...prev,
        [bookingId]: [created, ...(prev[bookingId] || [])],
      }));
      setBookingEquipmentForm(prev => ({
        ...prev,
        [bookingId]: { EquipmentID: "", Quantity: "1", RentalPrice: "" },
      }));
    } catch (e) {
      setError(e.message || "Failed to attach equipment");
    }
  }

  async function removeBookingEquipment(bookingId, bookingEquipmentId) {
    try {
      await api(`${API_PREFIX}/lessons/bookings/${bookingId}/equipment/${bookingEquipmentId}`, {
        method: "DELETE",
      });
      setBookingEquipment(prev => ({
        ...prev,
        [bookingId]: (prev[bookingId] || []).filter(eq => eq.BookingEquipmentID !== bookingEquipmentId),
      }));
    } catch (e) {
      setError(e.message || "Failed to remove equipment");
    }
  }

  async function updateBookingStatus(svcId, bookingId, status) {
    if (!isOwner) return;
    try {
      const updated = await api(`${API_PREFIX}/stables/${id}/services/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ Status: status }),
      });
      setBookingsByService(prev => ({
        ...prev,
        [svcId]: (prev[svcId] || []).map(b => (b.BookingID === bookingId ? { ...b, ...updated } : b)),
      }));
    } catch (e) {
      setError(e.message || "Failed to update booking");
    }
  }

  async function createUserHorseAndSelect(svcId) {
    if (!userId) {
      setError("Please sign in to add a horse.");
      return;
    }
    const form = newHorseForm[svcId] || {};
    if (!form.Name?.trim() || !form.DOB) {
      setError("Horse name and DOB are required.");
      return;
    }
    setError("");
    try {
      const payload = {
        Name: form.Name.trim(),
        DOB: form.DOB,
      };
      const created = await api(`${API_PREFIX}/users/${userId}/horses`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUserHorses(prev => [created, ...prev]);
      setBookingForm(prev => ({
        ...prev,
        [svcId]: { ...(prev[svcId] || {}), HorseID: created.HorseID || created.Id || created.id },
      }));
      setNewHorseForm(prev => ({ ...prev, [svcId]: { Name: "", DOB: "" } }));
    } catch (e) {
      setError(e.message || "Failed to add horse");
    }
  }

  async function createBooking(svc) {
    if (!userId) {
      setError("Please sign in to book this service.");
      navigate("/login");
      return;
    }
    const form = bookingForm[svc.ServiceID] || {};
    setError("");
    if (!form.SlotID) {
      setError("Please select an available time slot.");
      return;
    }
    const isBoarding = (svc.Type || "").toLowerCase() === "boarding";
    if (isBoarding) {
      if (!userHorses.length) {
        setError("Add a horse to your profile to book boarding.");
        return;
      }
      if (!form.HorseID) {
        setError("Please select your horse for boarding.");
        return;
      }
    } else {
      if (!publicStableHorses.length) {
        setError("This stable has no publicly bookable horses right now.");
        return;
      }
      if (!form.HorseID) {
        setError("Please select one of the stable's horses.");
        return;
      }
    }
    const selectedSlot = (slotsByService[svc.ServiceID] || []).find(sl => sl.SlotID === Number(form.SlotID));
    const payload = {
      UserID: Number(userId),
      HorseID: form.HorseID ? Number(form.HorseID) : null,
      SlotID: form.SlotID ? Number(form.SlotID) : null,
      Status: "pending",
      TotalPrice: svc.Price != null ? Number(svc.Price) : undefined,
      Notes: form.Notes?.trim() || undefined,
      ScheduledFor: selectedSlot?.StartTime ? new Date(selectedSlot.StartTime).toISOString() : undefined,
    };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });
    try {
      console.info("[booking] creating booking", {
        serviceId: svc.ServiceID,
        stableId: id,
        slotId: payload.SlotID,
        horseId: payload.HorseID,
        isBoarding,
      });
      const created = await api(`${API_PREFIX}/stables/${id}/services/${svc.ServiceID}/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.info("[booking] booking created", created);
      // Hide the slot locally so riders don't double-book it in this view
      if (payload.SlotID) {
        setSlotsByService(prev => ({
          ...prev,
          [svc.ServiceID]: (prev[svc.ServiceID] || []).filter(sl => sl.SlotID !== payload.SlotID),
        }));
        // Best-effort: mark slot unavailable in backend so reloads don't show it
        try {
          await api(`${API_PREFIX}/stables/${id}/services/slots/${payload.SlotID}`, {
            method: "PATCH",
            body: JSON.stringify({ Status: "cancelled" }),
          });
        } catch (slotErr) {
          console.warn("[booking] slot status update failed (non-blocking)", slotErr);
        }
      }
      setBookingsByService(prev => ({
        ...prev,
        [svc.ServiceID]: [created, ...(prev[svc.ServiceID] || [])],
      }));
      setBookingForm(prev => ({
        ...prev,
        [svc.ServiceID]: { SlotID: "", Notes: "", HorseID: form.HorseID || "" },
      }));
      setBookingOpen(prev => ({ ...prev, [svc.ServiceID]: false }));
      navigate(`/payment?bookingId=${created.BookingID}&amount=${svc.Price || 0}&service=${encodeURIComponent(svc.Name || "Service")}&stableId=${id}&serviceId=${svc.ServiceID}`);
    } catch (e) {
      console.error("[booking] create failed", e);
      setError(e.message || "Failed to create booking");
    }
  }

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(+dt)) return d;
      return dt.toLocaleString();
    } catch {
      return d;
    }
  };

  async function upload(kind, file) {
    if (!isOwner || !file) return;
    setMediaBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const json = await api(`${API_PREFIX}/stables/${id}/media/${kind}`, {
        method: "PUT",
        body: fd,
      });
      if (kind === "banner") setBannerBlobID(json.blobId || null);
      else setAvatarBlobID(json.blobId || null);
    } catch (e) {
      setError(e.message || `Uploading ${kind} failed`);
    } finally {
      setMediaBusy(false);
    }
  }

  function remove(kind) {
    if (kind === "banner") setBannerBlobID(null);
    else setAvatarBlobID(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <div className="container mx-auto px-6 py-10 space-y-4">
          <div className="h-48 rounded-3xl bg-[hsl(var(--muted))] animate-pulse" />
          <div className="grid lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-card p-6 text-center space-y-3">
          <p className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Stable not found.</p>
          <button className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const bannerSrc = bannerBlobID ? `${API_ROOT}${API_PREFIX}/blobs/${bannerBlobID}` : null;
  const avatarSrc = avatarBlobID ? `${API_ROOT}${API_PREFIX}/blobs/${avatarBlobID}` : null;

  const hasLessons = offers.includes("Lessons");
  const hasBoarding = offers.includes("Boarding");

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="relative h-64 md:h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-70" />
        {bannerSrc ? (
          <img src={bannerSrc} alt="Stable banner" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--accent)/0.15),transparent_40%),radial-gradient(circle_at_80%_10%,hsl(var(--primary)/0.2),transparent_40%),var(--gradient-hero)]" />
        )}
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative container mx-auto px-6 h-full flex items-end pb-6">
          <div className="flex items-end gap-4">
            <div className="relative h-28 w-28 rounded-3xl overflow-hidden border-4 border-white shadow-elevated bg-white">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Stable logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-[hsl(var(--rich-brown))] bg-[hsl(var(--muted))]">
                  Logo
                </div>
              )}
              {isOwner && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs flex justify-between items-center px-2 py-1">
                  <label className="cursor-pointer">
                    Edit
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && upload("avatar", e.target.files[0])}
                    />
                  </label>
                  {avatarBlobID && (
                    <button type="button" onClick={() => remove("avatar")} aria-label="Remove avatar">
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-white space-y-1">
              <input
                className="text-3xl md:text-4xl font-serif bg-transparent border-none outline-none placeholder:text-white/70"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
              />
              <p className="text-sm text-white/80">
                {city || stateVal ? `${city}, ${stateVal}` : "Add location"}
              </p>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <label className="px-4 py-2 rounded-full bg-white text-[hsl(var(--primary))] font-semibold shadow-card cursor-pointer">
              {mediaBusy ? "Working..." : "Change banner"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && upload("banner", e.target.files[0])}
              />
            </label>
            {bannerBlobID && (
              <button
                className="px-4 py-2 rounded-full bg-black/60 text-white font-semibold"
                type="button"
                onClick={() => remove("banner")}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 -mt-10 pb-12 space-y-6">
        <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white shadow-elevated border border-[hsl(var(--border))] p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[hsl(var(--muted-foreground))]">Email</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
                <div>
                  <label className="text-sm text-[hsl(var(--muted-foreground))]">Phone</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">Address</label>
                <input
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddr(e.target.value)}
                  disabled={!isOwner}
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!isOwner}
                  />
                  <select
                    className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    value={stateVal}
                    onChange={(e) => setSt(e.target.value)}
                    disabled={!isOwner}
                  >
                    <option value="">State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    placeholder="Zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
              </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Services Offered</p>
                  <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">What riders can book</h3>
                  {isOwner && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Toggle what you currently provide. These appear on your public profile.
                    </p>
                  )}
                </div>
              </div>

              {isOwner ? (
                <div className="flex flex-wrap gap-2">
                  {OFFER_OPTIONS.map(opt => {
                    const active = offers.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition ${
                          active
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-soft"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={active}
                          onChange={() => toggleOffer(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {offers.length > 0 ? (
                    offers.map(opt => (
                      <span key={opt} className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--rich-brown))] font-semibold">
                        {opt}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">No services listed.</span>
                  )}
                </div>
              )}
            </div>

            {isOwner && (
              <div className="rounded-3xl bg-white shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Manage Services</p>
                    <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Add or edit offerings</h3>
                  </div>
                </div>

                <form className="grid md:grid-cols-2 gap-4" onSubmit={createService}>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Name *</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={serviceForm.Name}
                      onChange={(e) => setServiceForm(f => ({ ...f, Name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Service type</label>
                    <select
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={serviceForm.Type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setServiceForm(f => ({
                          ...f,
                          Type: val,
                          DurationMinutes: val === "Boarding" ? "30" : "60",
                        }));
                      }}
                    >
                      <option value="Riding">Riding Lesson</option>
                      <option value="Boarding">Boarding</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Price ($) *</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.Price}
                      onChange={(e) => setServiceForm(f => ({ ...f, Price: e.target.value }))}
                      required
                    />
                  </div>
                  {serviceForm.Type === "Riding" ? (
                    <div className="space-y-2">
                      <label className="text-sm text-[hsl(var(--muted-foreground))]">Duration (minutes) *</label>
                      <input
                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                        type="number"
                        min="1"
                        value={serviceForm.DurationMinutes}
                        onChange={(e) => setServiceForm(f => ({ ...f, DurationMinutes: e.target.value }))}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm text-[hsl(var(--muted-foreground))]">Duration (days) *</label>
                      <input
                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                        type="number"
                        min="1"
                        value={serviceForm.DurationMinutes}
                        onChange={(e) => setServiceForm(f => ({ ...f, DurationMinutes: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Public?</label>
                    <select
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={serviceForm.IsPublic ? "1" : "0"}
                      onChange={(e) => setServiceForm(f => ({ ...f, IsPublic: e.target.value === "1" }))}
                    >
                      <option value="1">Visible to riders</option>
                      <option value="0">Hidden</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Description</label>
                    <textarea
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      rows={3}
                      value={serviceForm.Description}
                      onChange={(e) => setServiceForm(f => ({ ...f, Description: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-[hsl(var(--rich-brown))]">
                      <input
                        type="checkbox"
                        checked={!!serviceForm.IsActive}
                        onChange={(e) => setServiceForm(f => ({ ...f, IsActive: e.target.checked }))}
                      />
                      <span>Active</span>
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft disabled:opacity-60"
                      disabled={serviceSaving}
                    >
                      {serviceSaving ? "Saving..." : "Add service"}
                    </button>
                  </div>
                </form>

                {services.length > 0 && (
                  <div className="space-y-3">
                    {services.map((svc) => (
                      <div key={svc.ServiceID} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-[hsl(var(--rich-brown))]">{svc.Name}</div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                              {svc.Type ? `${svc.Type} • ` : ""}{formatServiceDuration(svc)} - ${Number(svc.Price || 0).toFixed(2)}
                            </div>
                            {svc.Description && <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{svc.Description}</div>}
                            <div className="flex gap-2 mt-2 text-xs">
                              <span className={`px-2 py-1 rounded-full border ${svc.IsActive ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"}`}>
                                {svc.IsActive ? "Active" : "Inactive"}
                              </span>
                              <span className={`px-2 py-1 rounded-full border ${svc.IsPublic ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"}`}>
                                {svc.IsPublic ? "Public" : "Hidden"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"
                              onClick={() => updateService(svc.ServiceID, { IsActive: !svc.IsActive })}
                            >
                              {svc.IsActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--destructive))]"
                              onClick={() => deleteService(svc.ServiceID)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[hsl(var(--rich-brown))]">Availability slots</div>
                            <button
                              className="text-[hsl(var(--primary))] text-sm font-semibold"
                              onClick={() => loadSlots(svc.ServiceID)}
                            >
                              Load slots
                            </button>
                          </div>

                            <div className="grid md:grid-cols-2 gap-2">
                              <input
                                type="datetime-local"
                                className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                value={slotForm[svc.ServiceID]?.StartTime || ""}
                                onChange={(e) => setSlotForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), StartTime: e.target.value } }))}
                              />
                              <input
                                type="datetime-local"
                                className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                value={slotForm[svc.ServiceID]?.EndTime || ""}
                                onChange={(e) => setSlotForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), EndTime: e.target.value } }))}
                              />
                            </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                              value={slotForm[svc.ServiceID]?.Status || "available"}
                              onChange={(e) => setSlotForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), Status: e.target.value } }))}
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked</option>
                              <option value="blocked">Blocked</option>
                            </select>
                            <button
                              className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold"
                              type="button"
                              onClick={() => addSlot(svc.ServiceID)}
                            >
                              Add slot
                            </button>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {(slotsByService[svc.ServiceID] || []).map(slot => (
                              <div key={slot.SlotID} className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm">
                                <div>
                                  <div className="font-semibold text-[hsl(var(--rich-brown))]">
                                    {formatDate(slot.StartTime)} - {formatDate(slot.EndTime)}
                                  </div>
                                  <div className="text-[hsl(var(--muted-foreground))]">{slot.Status}</div>
                                </div>
                                <select
                                  className="rounded-lg border border-[hsl(var(--border))] px-2 py-1"
                                  value={slot.Status}
                                  onChange={(e) => updateSlotStatus(svc.ServiceID, slot.SlotID, e.target.value)}
                                >
                                  <option value="available">Available</option>
                                  <option value="booked">Booked</option>
                                  <option value="blocked">Blocked</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-[hsl(var(--rich-brown))]">Bookings</div>
                            <button
                              className="text-[hsl(var(--primary))] text-sm font-semibold"
                              type="button"
                              onClick={() => loadBookings(svc.ServiceID)}
                            >
                              {bookingLoading[svc.ServiceID] ? "Loading..." : "Load bookings"}
                            </button>
                          </div>
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {(bookingsByService[svc.ServiceID] || []).length === 0 ? (
                              <div className="text-[hsl(var(--muted-foreground))] text-sm">No bookings yet.</div>
                            ) : (
                              (bookingsByService[svc.ServiceID] || []).map(b => (
                                <div key={b.BookingID} className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div className="font-semibold text-[hsl(var(--rich-brown))]">
                                        {b.ScheduledFor ? formatDate(b.ScheduledFor) : "No time set"}
                                      </div>
                                      <div className="text-[hsl(var(--muted-foreground))]">User #{b.UserID}{b.HorseID ? ` • Horse #${b.HorseID}` : ""}</div>
                                      {b.Notes && <div className="text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{b.Notes}</div>}
                                    </div>
                                    <select
                                      className="rounded-lg border border-[hsl(var(--border))] px-2 py-1"
                                      value={b.Status || "pending"}
                                      onChange={(e) => updateBookingStatus(svc.ServiceID, b.BookingID, e.target.value)}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  {isOwner && (
                                    <div className="mt-2 border-t border-[hsl(var(--border))] pt-2 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Equipment</span>
                                        <button
                                          className="text-[hsl(var(--primary))] text-xs font-semibold"
                                          type="button"
                                          onClick={() => loadBookingEquipment(b.BookingID)}
                                        >
                                          {bookingEquipment[b.BookingID] ? "Refresh" : "Load"}
                                        </button>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-[1.2fr,1fr,1fr,auto] gap-2 items-center">
                                          <select
                                            className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-sm"
                                            value={bookingEquipmentForm[b.BookingID]?.EquipmentID || ""}
                                            onChange={(e) => setBookingEquipmentForm(f => ({ ...f, [b.BookingID]: { ...(f[b.BookingID] || {}), EquipmentID: e.target.value } }))}
                                          >
                                            <option value="">Select gear</option>
                                            {equipment.map(eq => (
                                              <option key={eq.EquipmentID} value={eq.EquipmentID}>{eq.Name}</option>
                                            ))}
                                          </select>
                                          <input
                                            className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-sm"
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            value={bookingEquipmentForm[b.BookingID]?.Quantity || "1"}
                                            onChange={(e) => setBookingEquipmentForm(f => ({ ...f, [b.BookingID]: { ...(f[b.BookingID] || {}), Quantity: e.target.value } }))}
                                          />
                                          <input
                                            className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-sm"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Rental $"
                                            value={bookingEquipmentForm[b.BookingID]?.RentalPrice || ""}
                                            onChange={(e) => setBookingEquipmentForm(f => ({ ...f, [b.BookingID]: { ...(f[b.BookingID] || {}), RentalPrice: e.target.value } }))}
                                          />
                                          <button
                                            className="px-3 py-1 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-semibold"
                                            type="button"
                                            onClick={() => addBookingEquipment(b.BookingID)}
                                          >
                                            Attach
                                          </button>
                                        </div>
                                        <div className="space-y-1">
                                          {(bookingEquipment[b.BookingID] || []).map(be => (
                                            <div key={be.BookingEquipmentID} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1 text-xs">
                                              <div>
                                                <span className="font-semibold text-[hsl(var(--rich-brown))]">{be.Name || `Item #${be.EquipmentID}`}</span>
                                                <span className="text-[hsl(var(--muted-foreground))]"> • Qty {be.Quantity}</span>
                                                {be.RentalPrice != null && <span className="text-[hsl(var(--muted-foreground))]"> • ${Number(be.RentalPrice).toFixed(2)}</span>}
                                              </div>
                                              <button
                                                className="text-[hsl(var(--destructive))]"
                                                type="button"
                                                onClick={() => removeBookingEquipment(b.BookingID, be.BookingEquipmentID)}
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isOwner && (
              <div className="rounded-3xl bg-white shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Equipment</p>
                    <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Gear available to rent</h3>
                  </div>
                </div>

                <form className="grid md:grid-cols-2 gap-4" onSubmit={createEquipment}>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Name *</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={equipmentForm.Name}
                      onChange={(e) => setEquipmentForm(f => ({ ...f, Name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Price per lesson ($) *</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={equipmentForm.PricePerLesson}
                      onChange={(e) => setEquipmentForm(f => ({ ...f, PricePerLesson: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Quantity *</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      type="number"
                      min="1"
                      value={equipmentForm.Quantity}
                      onChange={(e) => setEquipmentForm(f => ({ ...f, Quantity: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Description</label>
                    <textarea
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      rows={3}
                      value={equipmentForm.Description}
                      onChange={(e) => setEquipmentForm(f => ({ ...f, Description: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft disabled:opacity-60"
                      disabled={equipmentSaving}
                    >
                      {equipmentSaving ? "Saving..." : "Add equipment"}
                    </button>
                  </div>
                </form>

                {equipment.length === 0 ? (
                  <div className="text-[hsl(var(--muted-foreground))]">No equipment listed yet.</div>
                ) : (
                  <div className="space-y-3">
                    {equipment.map((eq) => (
                      <div key={eq.EquipmentID} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-[hsl(var(--rich-brown))]">{eq.Name}</div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">${Number(eq.PricePerLesson || 0).toFixed(2)} per lesson • Qty {eq.Quantity}</div>
                            {eq.Description && <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{eq.Description}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"
                              type="button"
                              onClick={() => updateEquipment(eq.EquipmentID, { Quantity: Math.max(1, (parseInt(eq.Quantity, 10) || 1) - 1) })}
                            >
                              - Qty
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"
                              type="button"
                              onClick={() => updateEquipment(eq.EquipmentID, { Quantity: Math.max(1, (parseInt(eq.Quantity, 10) || 1) + 1) })}
                            >
                              + Qty
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--destructive))]"
                              type="button"
                              onClick={() => deleteEquipment(eq.EquipmentID)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

              {!isOwner && (
                <div className="rounded-3xl bg-white shadow-card border border-[hsl(var(--border))] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Services</h3>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">Book directly with this stable</div>
                  </div>

                  {(services.filter(s => s.IsPublic !== false).length === 0) ? (
                    <div className="text-[hsl(var(--muted-foreground))]">No services listed yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {services
                        .filter(s => s.IsPublic !== false)
                        .map((svc) => {
                          const availableSlots = (slotsByService[svc.ServiceID] || []).filter(sl => sl.Status === "available");
                          const form = bookingForm[svc.ServiceID] || {};
                          const open = bookingOpen[svc.ServiceID];
                          return (
                            <div key={svc.ServiceID} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-lg font-semibold text-[hsl(var(--rich-brown))]">{svc.Name}</div>
                                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                    {svc.Type ? `${svc.Type} • ` : ""}{formatServiceDuration(svc)} - ${Number(svc.Price || 0).toFixed(2)}
                                  </div>
                                  {svc.Description && <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{svc.Description}</div>}
                                </div>
                                <button
                                  className="px-3 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold"
                                  type="button"
                                  onClick={() => setBookingOpen(prev => ({ ...prev, [svc.ServiceID]: !prev[svc.ServiceID] }))}
                                >
                                  {open ? "Hide" : "Book now"}
                                </button>
                              </div>

                              {open && (
                                <div className="space-y-3 border-t border-[hsl(var(--border))] pt-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold text-[hsl(var(--rich-brown))]">Available times</p>
                                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Pick a slot defined by the stable.</p>
                                    </div>
                                    <button
                                      className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] text-sm font-semibold"
                                      type="button"
                                      onClick={() => loadSlots(svc.ServiceID)}
                                    >
                                      Refresh slots
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {availableSlots.length > 0 ? (
                                      availableSlots.map(slot => (
                                        <button
                                          key={slot.SlotID}
                                          className={`px-3 py-2 rounded-lg border text-sm ${form.SlotID === slot.SlotID ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-white text-[hsl(var(--rich-brown))]"}`}
                                          onClick={() => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), SlotID: slot.SlotID } }))}
                                        >
                                          {formatDate(slot.StartTime)}
                                        </button>
                                      ))
                                    ) : (
                                      <div className="text-sm text-[hsl(var(--muted-foreground))]">No available slots right now.</div>
                                    )}
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      {svc.Type?.toLowerCase() === "boarding" ? (
                                        <>
                                          <label className="text-sm text-[hsl(var(--muted-foreground))]">Select your horse</label>
                                          {userHorses.length > 0 && (
                                            <select
                                              className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                              value={form.HorseID || ""}
                                              onChange={(e) => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), HorseID: e.target.value } }))}
                                            >
                                              <option value="">Select horse</option>
                                              {userHorses.map(h => {
                                                const idVal = horseId(h);
                                                return (
                                                  <option key={idVal} value={idVal}>
                                                    {h.Name || `Horse #${idVal}`}
                                                  </option>
                                                );
                                              })}
                                            </select>
                                          )}
                                          <div className="space-y-1">
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Need to add a horse for boarding?</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              <input
                                                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm"
                                                placeholder="Horse name"
                                                value={newHorseForm[svc.ServiceID]?.Name || ""}
                                                onChange={(e) => setNewHorseForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), Name: e.target.value } }))}
                                              />
                                              <input
                                                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm"
                                                type="date"
                                                value={newHorseForm[svc.ServiceID]?.DOB || ""}
                                                onChange={(e) => setNewHorseForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), DOB: e.target.value } }))}
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] text-sm font-semibold"
                                                type="button"
                                                onClick={() => createUserHorseAndSelect(svc.ServiceID)}
                                              >
                                                Add & select horse
                                              </button>
                                              <Link className="text-xs text-[hsl(var(--primary))] underline" to="/createHorse">Manage horses</Link>
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <label className="text-sm text-[hsl(var(--muted-foreground))]">Select a stable horse</label>
                                          {publicStableHorses.length === 0 ? (
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">No public horses available. Riders use stable horses for lessons.</div>
                                          ) : (
                                            <select
                                              className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                              value={form.HorseID || ""}
                                              onChange={(e) => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), HorseID: e.target.value } }))}
                                            >
                                              {publicStableHorses.map(h => {
                                                const idVal = horseId(h);
                                                return (
                                                  <option key={idVal} value={idVal}>
                                                    {h.Name || `Horse #${idVal}`}
                                                  </option>
                                                );
                                              })}
                                            </select>
                                          )}
                                          <div className="text-xs text-[hsl(var(--muted-foreground))]">Lesson riders select from stable horses; bringing your own is disabled.</div>
                                        </>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-sm text-[hsl(var(--muted-foreground))]">Your contact</label>
                                      <input
                                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                        placeholder="Your name"
                                        value={form.RiderName || user?.Username || ""}
                                        onChange={(e) => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), RiderName: e.target.value } }))}
                                      />
                                      <input
                                        className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 mt-2"
                                        placeholder="Your email"
                                        type="email"
                                        value={form.RiderEmail || user?.Email || ""}
                                        onChange={(e) => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), RiderEmail: e.target.value } }))}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Notes</label>
                                    <textarea
                                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                                      rows={3}
                                      placeholder="Anything the stable should know"
                                      value={form.Notes || ""}
                                      onChange={(e) => setBookingForm(f => ({ ...f, [svc.ServiceID]: { ...(f[svc.ServiceID] || {}), Notes: e.target.value } }))}
                                    />
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft"
                                      onClick={() => createBooking(svc)}
                                      disabled={
                                        (svc.Type?.toLowerCase() === "boarding" && !userHorses.length && !newHorseForm[svc.ServiceID]?.Name) ||
                                        (svc.Type?.toLowerCase() !== "boarding" && !publicStableHorses.length)
                                      }
                                    >
                                      Continue to payment
                                    </button>
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold"
                                      onClick={() => setBookingOpen(prev => ({ ...prev, [svc.ServiceID]: false }))}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {hasLessons && (
                  <Link className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold" to="/lessons">
                    Riding Lessons
                  </Link>
                )}
                {hasBoarding && (
                  <Link className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold" to="/boardingInfo">
                    Boarding Services
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Announcements</h3>
                {isOwner ? (
                  <textarea
                    className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-3"
                    rows={4}
                    placeholder="Share news or temporary notices..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                ) : (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-[hsl(var(--muted-foreground))]">
                    {notes?.trim() ? notes : "No announcements right now."}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold" onClick={saveCore}>Save changes</button>
                  <button className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold" onClick={savePage}>Save page content</button>
                  {error && <span className="text-[hsl(var(--destructive))] text-sm">{error}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white shadow-card border border-[hsl(var(--border))] p-6 space-y-3">
              <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">About us</h3>
              {isOwner ? (
                <textarea
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-3"
                  rows={8}
                  placeholder="Info about stable, trainers, horses etc"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              ) : (
                <div className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {about?.trim() ? about : "Owner has not added an about section yet."}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white shadow-card border border-[hsl(var(--border))] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Our Horses</h3>
                {isOwner && (
                  <Link className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]" to={`/stables/${id}/horses/new`}>
                    Add horse
                  </Link>
                )}
              </div>
              {(isOwner ? stableHorses : publicStableHorses).length === 0 ? (
                <div className="text-[hsl(var(--muted-foreground))]">No horses added yet.</div>
              ) : (
                <ul className="space-y-2">
                  {(isOwner ? stableHorses : publicStableHorses).map(h => {
                    const hid = horseId(h);
                    return (
                      <li key={hid} className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                        <div>
                          <div className="font-semibold text-[hsl(var(--rich-brown))]">{h.Name || `Horse #${hid}`}</div>
                          {h.Breed && <div className="text-xs text-[hsl(var(--muted-foreground))]">{h.Breed}</div>}
                        </div>
                        {isOwner ? (
                          <Link className="text-[hsl(var(--primary))]" to={`/stables/${id}/horses/${hid}`}>Manage</Link>
                        ) : (
                          <Link className="text-[hsl(var(--primary))]" to={`/stables/${id}/horses/${hid}`}>View</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="pt-2">
                <Link className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold inline-flex" to={`/stables/${id}/horses`}>
                  See Full List
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!isOwner && error && (
          <div className="text-[hsl(var(--destructive))] text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
