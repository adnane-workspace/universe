export class Etudiant {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly groupId: string;

  constructor(id: string, name: string, initials: string, groupId: string) {
    this.id = id;
    this.name = name;
    this.initials = initials;
    this.groupId = groupId;
  }

  static creer(id: string, name: string, groupId: string) {
    const nom = name.trim();
    return new Etudiant(id, nom, Etudiant.initiales(nom), groupId);
  }

  static initiales(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'ET';
  }

  estDans(groupId: string) {
    return this.groupId === groupId;
  }
}
