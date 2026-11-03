export class Groupe {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  porteLeNom(nom: string) {
    return this.name.toLowerCase() === nom.trim().toLowerCase();
  }
}
