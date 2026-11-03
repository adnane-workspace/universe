export class Salle {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: string;

  constructor(id: string, name: string, capacity: number, equipment: string) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.equipment = equipment;
  }

  correspond(capaciteMin: number, equipement: string) {
    const cherche = equipement.trim().toLowerCase();
    const capaciteOk = capaciteMin <= 0 || this.capacity >= capaciteMin;
    const equipementOk = cherche.length === 0 || this.equipment.toLowerCase().includes(cherche);
    return capaciteOk && equipementOk;
  }

  porteLeNom(nom: string) {
    return this.name.toLowerCase() === nom.trim().toLowerCase();
  }
}
