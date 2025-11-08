import { useState, useEffect } from "react";
import "./App.css";
import ActivityCard from "./components/ActivityCard";

// Glavna komponenta aplikacije Dnevnik aktivnosti.
// Omogoča dodajanje, urejanje, brisanje in samodejno odstranjevanje preteklih aktivnosti.
function App() {

  // Glavni state za vse aktivnosti
  const [activities, setActivities] = useState([]);

  // Modal za dodajanje ali urejanje aktivnosti
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("Hobi");
  const [categoryInput, setCategoryInput] = useState("");

  // Ob zagonu aplikacije naloži aktivnosti iz localStorage.
  // Odstrani pretekle aktivnosti in nastavi časovnik, ki se sproži ob polnoči.
  // Namen: da se vsak dan zjutraj seznam samodejno osveži in pokaže le prihodnje aktivnosti.
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("activities")) || [];

    // Odstrani pretekle aktivnosti
    const upcoming = removePastActivities(saved);
    setActivities(upcoming);

    // Shranjevanje očiščenega seznama nazaj v localStorage
    localStorage.setItem("activities", JSON.stringify(upcoming));

    // Nastavimo timeout do polnoči, da se samodejno brišejo pretekle aktivnosti
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const msUntilMidnight = nextMidnight - now;

    const timeoutId = setTimeout(() => {
      const updated = removePastActivities(JSON.parse(localStorage.getItem("activities")) || []);
      setActivities(updated);
      localStorage.setItem("activities", JSON.stringify(updated));

      const intervalId = setInterval(() => {
        const updated = removePastActivities(JSON.parse(localStorage.getItem("activities")) || []);
        setActivities(updated);
        localStorage.setItem("activities", JSON.stringify(updated));
      }, 24 * 60 * 60 * 1000); // vsakih 24h

      window._midnightInterval = intervalId;
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (window._midnightInterval) clearInterval(window._midnightInterval);
    };
  }, []);

  // Odstrani vse aktivnosti, katerih datum je že v preteklosti.
  // Primer: če je danes 2025-11-08, bo odstranila vse z datumi manjšimi od 2025-11-08.
  const removePastActivities = (list) => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return list.filter((a) => !a.date || a.date >= todayStr);
  };

  // Centralna funkcija za posodabljanje seznama aktivnosti.
  // Vedno poskrbi, da se spremembe hkrati zapišejo v state in localStorage.
  const saveActivities = (newList) => {
    setActivities(newList);
    localStorage.setItem("activities", JSON.stringify(newList));
  };

  // Ustvari novo aktivnost na podlagi vnosnih polj.
  // Izvede osnovno validacijo (ime, kategorija, trajanje) in shrani v localStorage.
  const addActivity = (e) => {
    e.preventDefault();
    if (!name) {
      alert("Ime aktivnosti mora biti vnešeno!");
      return;
    }
    if (category === "Drugo" && !categoryInput) {
      alert("Če izberete 'Drugo', vnesite svojo kategorijo!");
      return;
    }
    if (duration && Number(duration) <= 0) {
      alert("Trajanje mora biti pozitivno število!");
      return;
    }

    const selectedCategory = category === "Drugo" ? categoryInput : category;

    const newActivity = {
      id: Date.now(), // unikatni ID
      name,
      description,
      date,
      ...(duration ? { duration: Number(duration) } : {}),
      category: selectedCategory,
    };

    const updated = [...activities, newActivity];
    saveActivities(updated);

    resetForm();
  };

  // Izbriši aktivnost
  const deleteActivity = (id) => {
    const updated = activities.filter((a) => a.id !== id);
    saveActivities(updated);
  };

  // Uredi aktivnost 
  const editActivity = (activity) => {
    setEditingActivity(activity);
    setName(activity.name);
    setDescription(activity.description || "");
    setDate(activity.date || "");
    setDuration(activity.duration || "");
    setCategory(["Hobi", "Šola", "Služba"].includes(activity.category) ? activity.category : "Drugo");
    setCategoryInput(["Hobi", "Šola", "Služba"].includes(activity.category) ? "" : activity.category);
    setShowForm(true);
  };

  // Posodobi aktivnost po urejanju
  const updateActivity = (e) => {
    e.preventDefault();
    const selectedCategory = category === "Drugo" ? categoryInput : category;
    const updatedList = activities.map((a) =>
      a.id === editingActivity.id
        ? { ...a, name, description, date, duration: duration ? Number(duration) : undefined, category: selectedCategory }
        : a
    );
    saveActivities(updatedList);
    resetForm();
  };

  // Resetiraj formo in modal po dodajanju/urejanju
  const resetForm = () => {
    setEditingActivity(null);
    setName("");
    setDescription("");
    setDate("");
    setDuration("");
    setCategory("Hobi");
    setCategoryInput("");
    setShowForm(false);
  };

  // Uredi aktivnosti tako, da se tiste, ki so v naslednjih 48 urah (ali danes), prikažejo na vrhu.
  // Te "urgentne" aktivnosti so nato obarvane rdeče v ActivityCard komponenti.
  const sortedActivities = [...activities].sort((a, b) => {
    const now = new Date();

    const getIsSoon = (dateStr) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const diff = date - now;
      const isSameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();
      return isSameDay || (diff < 1000 * 60 * 60 * 48 && diff > 0);
    };

    const isSoonA = getIsSoon(a.date);
    const isSoonB = getIsSoon(b.date);

    if (isSoonA && !isSoonB) return -1;
    if (!isSoonA && isSoonB) return 1;

    return new Date(a.date) - new Date(b.date);
  });

  // JSX del aplikacije – prikaz glavnega vmesnika (header, modal in seznam aktivnosti)
  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>Dnevnik aktivnosti</h1>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Dodaj
        </button>
      </header>

      {/* MODAL (Add / Edit) */}
      {(showForm || editingActivity) && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingActivity ? "Uredi aktivnost" : "Dodaj novo aktivnost"}</h2>
            <form onSubmit={editingActivity ? updateActivity : addActivity}>
              <input
                type="text"
                placeholder="Ime aktivnosti *"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Opis (neobvezno)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="number"
                min="1"
                placeholder="Trajanje v minutah (ali pustite prazno)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Hobi">Hobi</option>
                <option value="Šola">Šola</option>
                <option value="Služba">Služba</option>
                <option value="Drugo">Drugo</option>
              </select>
              {category === "Drugo" && (
                <input
                  type="text"
                  placeholder="Vnesi svojo kategorijo"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                />
              )}
              <div className="form-buttons">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Prekliči
                </button>
                <button type="submit" className="save-btn">
                  Shrani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY LIST */}
      <section className="activities-grid">
        {activities.length === 0 ? (
          <dir className="no-activities">
            <p>Zabeležene ni nobene aktivnosti. Dodaj svojo prvo! </p>
            <p>Če bo aktivnost v naslednjih 48 urah, bo obarvana rdeče.</p>
          </dir>
        ) : (
          sortedActivities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onDelete={() => deleteActivity(a.id)}
              onEdit={() => editActivity(a)} // omogoča urejanje kartice
            />
          ))
        )}
      </section>
    </div>
  );
}

export default App;