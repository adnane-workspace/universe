export class Calendrier {
  static decaler(date: Date, jours: number) {
    const copie = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copie.setDate(copie.getDate() - jours);
    const mois = String(copie.getMonth() + 1).padStart(2, '0');
    const jour = String(copie.getDate()).padStart(2, '0');
    return `${copie.getFullYear()}-${mois}-${jour}`;
  }

  static semaine(date: Date, offset = 0) {
    const debut = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const weekday = debut.getDay();
    debut.setDate(debut.getDate() + (weekday === 0 ? -6 : 1 - weekday) + offset * 7);
    return Array.from({ length: 7 }, (_, index) =>
      Calendrier.decaler(new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + index), 0),
    );
  }

  static dateValide(valeur: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return false;
    const [annee, mois, jour] = valeur.split('-').map(Number);
    const date = new Date(annee, mois - 1, jour);
    return date.getFullYear() === annee && date.getMonth() === mois - 1 && date.getDate() === jour;
  }

  static heureValide(valeur: string) {
    if (!/^\d{2}:\d{2}$/.test(valeur)) return false;
    const [heure, minute] = valeur.split(':').map(Number);
    return heure >= 0 && heure <= 23 && minute >= 0 && minute <= 59;
  }
}
