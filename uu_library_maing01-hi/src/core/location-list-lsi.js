const Lsi = {
  author: { cs: "Autor", en: "Author" },
  state: { cs: "Stav", en: "State" },
  active: { cs: "Aktivní", en: "Active" },
  passive: { cs: "Pozastavená", en: "Suspend" },
  closed: { cs: "Zavřená", en: "Closed" },
  capacity: { cs: "Kapacita", en: "Capacity" },
  updateButton: { cs: "Upravit", en: "Update" },
  deleteButton: { cs: "Smazat", en: "Delete" },
  createButton: { cs: "Vytvořit", en: "Create" },
  borrowButton: { cs: "Půjčit", en: "Borrow" },
  returnButton: { cs: "Vrátit", en: "Return" },
  deleteLocation: { cs: "Smazat oddělení", en: "Delete location" },
  forceDelete: { cs: "Smazat i knihy z lokace", en: "Delete books from location" },
  areYouSureToDelete: { cs: "Jste si jistý?", en: "Are your sure?" },
  cancel: { cs: "Zrušit", en: "Cancel" },
  //failed codes
  "uu-library-main/location/delete/locationContainBooks": {
    cs: "Lokace obsahuje nějaké knihy, pokud chcete smazat lokaci i s knihami zaškrtněte tuto možnost ve formuláři,",
    en: "Location contains some books. If you want to delte them. Then choose this option in form."
  }
};

export default Lsi;
