import { Absence } from './Absence.ts';
import { Calendrier } from './Calendrier.ts';
import { Compte } from './Utilisateur.ts';
import { Enseignant } from './Enseignant.ts';
import { Etudiant } from './Etudiant.ts';
import { Groupe } from './Groupe.ts';
import { Registre } from './Registre.ts';
import { Reservation } from './Reservation.ts';
import { Salle } from './Salle.ts';
import { Seance } from './Seance.ts';

const creneauxGi4: { day: number; start: string; end: string; course: string; room: string; teacherId: string }[] = [
  { day: 1, start: '08:30', end: '10:00', course: 'Analyse des données', room: 'Salle A35', teacherId: 'teacher-majdoub' },
  { day: 1, start: '10:30', end: '12:00', course: 'Analyse des données', room: 'Salle A35', teacherId: 'teacher-majdoub' },
  { day: 1, start: '14:30', end: '16:00', course: 'Génie logiciel et design patterns', room: 'Salle A35', teacherId: 'teacher-elakkad' },
  { day: 1, start: '16:30', end: '18:00', course: 'Génie logiciel et design patterns', room: 'Salle A35', teacherId: 'teacher-elakkad' },
  { day: 3, start: '08:30', end: '10:00', course: 'Français', room: 'Salle A21', teacherId: 'teacher-ibnkouar' },
  { day: 3, start: '10:30', end: '12:00', course: 'Anglais', room: 'Salle A22', teacherId: 'teacher-elouardi' },
  { day: 4, start: '08:30', end: '10:00', course: 'Programmation orientée objet C#/.NET', room: 'Salle A35', teacherId: 'teacher-lakhrissi' },
  { day: 4, start: '10:30', end: '12:00', course: 'Programmation orientée objet C#/.NET', room: 'Salle A35', teacherId: 'teacher-lakhrissi' },
  { day: 4, start: '14:30', end: '16:00', course: 'Intelligence artificielle 2', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 4, start: '16:30', end: '18:00', course: 'Intelligence artificielle 2', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 5, start: '08:30', end: '10:00', course: 'Projet tutoré et DEVOPS', room: 'Salle A35', teacherId: 'teacher-aounzou' },
  { day: 5, start: '10:30', end: '12:00', course: 'Projet tutoré et DEVOPS', room: 'Salle A35', teacherId: 'teacher-aounzou' },
  { day: 5, start: '14:30', end: '16:00', course: 'Programmation distribuée JEE', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 5, start: '16:30', end: '18:00', course: 'Programmation distribuée JEE', room: 'Salle A35', teacherId: 'teacher-hajji' },
];

export class Demonstration {
  static registre(maintenant = new Date()) {
    const groups = [new Groupe('GL1', 'GL1'), new Groupe('GL2', 'GL2'), new Groupe('GL3', 'GL3'), new Groupe('GI4A', 'GI 4A')];
    const teachers = [
      new Enseignant('teacher-durand', 'Pierre Durand'),
      new Enseignant('teacher-bernard', 'Claire Bernard'),
      new Enseignant('teacher-rossi', 'Marco Rossi'),
      ...Demonstration.enseignantsGi4(),
    ];
    const students = [
      Etudiant.creer('stu-aminata', 'Aminata Mensah', 'GL2'),
      Etudiant.creer('stu-yacouba', 'Yacouba Koné', 'GL2'),
      Etudiant.creer('stu-fatou', 'Fatou Ndiaye', 'GL2'),
      Etudiant.creer('stu-paul', 'Paul Bernard', 'GL2'),
      Etudiant.creer('stu-sara', 'Sara Diop', 'GL2'),
      Etudiant.creer('stu-lea', 'Léa Martin', 'GL2'),
      Etudiant.creer('stu-gl1-a', 'Nadia Benali', 'GL1'),
      Etudiant.creer('stu-gl1-b', 'Hugo Petit', 'GL1'),
      Etudiant.creer('stu-gl1-c', 'Inès Morel', 'GL1'),
      Etudiant.creer('stu-gl1-d', 'Adam Traoré', 'GL1'),
      Etudiant.creer('stu-gl3-a', 'Chloé Roux', 'GL3'),
      Etudiant.creer('stu-gl3-b', 'Malik Sow', 'GL3'),
      Etudiant.creer('stu-gl3-c', 'Emma Bernard', 'GL3'),
      Etudiant.creer('stu-gl3-d', 'Yanis Cohen', 'GL3'),
      ...Demonstration.etudiantsGi4(),
    ];
    const courses = ['Bases de données', 'Développement mobile', 'Génie logiciel'];
    const rooms = ['Salle A-112', 'Salle B-204', 'Salle C-018'];
    const sessions: Seance[] = [];
    for (let index = 1; index <= 8; index += 1) {
      sessions.push(
        new Seance(
          `gl2-past-${index}`,
          courses[index % 3],
          rooms[index % 3],
          Calendrier.decaler(maintenant, index * 3),
          '10:30',
          '12:30',
          'GL2',
          'teacher-durand',
          true,
        ),
      );
    }
    sessions.push(
      new Seance('gl2-today-db', 'Bases de données', 'Salle A-112', Calendrier.decaler(maintenant, 0), '08:00', '10:00', 'GL2', 'teacher-durand', true),
      Seance.prevue('gl2-today-mobile', 'Développement mobile', 'Salle B-204', Calendrier.decaler(maintenant, 0), '10:30', '12:30', 'GL2', 'teacher-durand'),
      Seance.prevue('gl2-today-gl', 'Génie logiciel', 'Salle C-018', Calendrier.decaler(maintenant, 0), '14:00', '16:00', 'GL2', 'teacher-durand'),
      new Seance('gl1-past-1', 'Algorithmique', 'Salle D-010', Calendrier.decaler(maintenant, 4), '08:00', '10:00', 'GL1', 'teacher-bernard', true),
      new Seance('gl3-past-1', 'Réseaux', 'Salle E-220', Calendrier.decaler(maintenant, 2), '14:00', '16:00', 'GL3', 'teacher-rossi', true),
      ...Demonstration.seancesAVenir(maintenant),
      ...Demonstration.seancesGi4(maintenant),
    );
    const absences = [
      Absence.ouverte('abs-aminata-open', 'gl2-past-1', 'stu-aminata'),
      Absence.depuis('abs-aminata-ok', 'gl2-past-3', 'stu-aminata', 'justifiee', Calendrier.decaler(maintenant, 8), 'Convocation administrative.'),
      Absence.depuis('abs-aminata-old', 'gl2-past-6', 'stu-aminata', 'justifiee', Calendrier.decaler(maintenant, 16), 'Absence pour raison familiale.'),
      Absence.depuis('abs-yacouba-review', 'gl2-past-2', 'stu-yacouba', 'envoye', Calendrier.decaler(maintenant, 5), 'Certificat médical pour une consultation.'),
      Absence.depuis('abs-gl1', 'gl1-past-1', 'stu-gl1-a', 'justifiee', Calendrier.decaler(maintenant, 3), 'Rendez-vous médical.'),
      Absence.ouverte('abs-gl3-a', 'gl3-past-1', 'stu-gl3-a'),
      Absence.depuis('abs-gl3-b', 'gl3-past-1', 'stu-gl3-b', 'envoye', Calendrier.decaler(maintenant, 1), 'Retard de train, justificatif SNCF.'),
    ];
    return new Registre(groups, students, teachers, sessions, absences);
  }

  static comptes() {
    return [
      new Compte('teacher-durand', 'p.durand@univ-lumiere.fr', 'Lumiere2026', 'Pierre', 'Pierre Durand', 'PD', 'enseignant', 'Groupe GL2 · Développement mobile', null, 'teacher-durand'),
      new Compte('student-mensah', '22104982', 'Etudiant2026', 'Aminata', 'Aminata Mensah', 'AM', 'etudiant', 'Groupe GL2 · Génie logiciel', 'stu-aminata', null),
      new Compte('student-menouar', 'a.elmenouar', 'Etudiant2026', 'Adnane', 'Adnane El Menouar', 'AE', 'etudiant', 'Groupe GI 4A · Génie logiciel', 'gi4-22', null),
      new Compte('teacher-elakkad', 'n.elakkad@univ-lumiere.fr', 'Elakkad2026', 'Nabil', 'Nabil El Akkad', 'NA', 'enseignant', 'GI 4A · Génie logiciel et design patterns', null, 'teacher-elakkad'),
      new Compte('admin-diallo', 'adm.direction', 'Admin2026', 'Lahlou', 'Lahlou Aziz', 'LA', 'admin', 'Direction des études', null, null),
    ];
  }

  static etudiantsGi4() {
    const noms = [
      'Basir Younes',
      'Ben El Adem Walih',
      'Bentaleb Chaymae',
      'Berrada Hind',
      'Bichri Ilias',
      'Bouandji Abdellah',
      'Bouhsini Aya',
      'Boukouj Wiame',
      'Es Safi Mohamed Amine',
      'Afifi Saad',
      'Barassa Douae',
      'Bouacha Fadoua',
      'El Ansari Yassine',
      'Hmydouch Marwa',
      'Hmydouch Mourad',
      'Boutarfass Kenza',
      'Bougdi Idrissi Mohammed',
      'Draif Zineb',
      'El Asri Redouane',
      'El Attar Soufie Rabie',
      'El Kalai Ahmed',
      'Adnane El Menouar',
      'El Meziti Ghizlane',
      'Er-Rajy Hanae',
      'Ahmed El Harti',
      'Farhan Ilias',
      'Farhi Najibane',
      'Gazi Ibtissam',
      'Ibrahimi Hiba',
      'Jay Abdeslamad',
      'Menkari Malak',
      'El Moumen Aicha',
      'Farsi Aymame',
      'Hamdi Mehdi',
      'Mhamdi Alaoui Doha',
      'El Brahimi Abderrahmane',
      'El Mahdiy Fatima Zahrae',
      'Seghrouchni Salma',
      'Sergouti Mohamed Amine',
      'Kharbache Tasnim',
      'Medaoui Kiram',
      'Mejber Ali',
      'Meran Douae',
      'Mimi Abir',
      'Ntamime Ahmed',
      'Ouafi Jaafar',
      'Ouahmane Hiba',
      'Ouiaro Abdelmoughit',
      'Rami Adam',
      'Saadi Mohamed',
      'Saidi Mohamed',
      'Sbay Amine',
    ];
    return noms.map((nom, index) => Etudiant.creer(`gi4-${String(index + 1).padStart(2, '0')}`, nom, 'GI4A'));
  }

  static enseignantsGi4() {
    return [
      new Enseignant('teacher-elakkad', 'Nabil El Akkad'),
      new Enseignant('teacher-majdoub', 'Soufiane Majdoub'),
      new Enseignant('teacher-ibnkouar', 'Safae Ibn Kouar'),
      new Enseignant('teacher-elouardi', 'Abdelfattah El Ouardi'),
      new Enseignant('teacher-lakhrissi', 'Youness Lakhrissi'),
      new Enseignant('teacher-hajji', 'Tarik Hajji'),
      new Enseignant('teacher-aounzou', 'Youssef Aounzou'),
    ];
  }

  static seancesGi4(maintenant = new Date(), semaines = 4) {
    const aujourdhui = Calendrier.decaler(maintenant, 0);
    const seances: Seance[] = [];
    for (let offset = 0; offset < semaines; offset += 1) {
      for (const date of Calendrier.semaine(maintenant, offset)) {
        if (date < aujourdhui) continue;
        const [annee, mois, jour] = date.split('-').map(Number);
        const weekday = new Date(annee, mois - 1, jour).getDay();
        for (const creneau of creneauxGi4) {
          if (creneau.day !== weekday) continue;
          seances.push(Seance.prevue(`gi4-${date}-${creneau.start.replace(':', '')}`, creneau.course, creneau.room, date, creneau.start, creneau.end, 'GI4A', creneau.teacherId));
        }
      }
    }
    return seances;
  }

  static salles() {
    return [
      new Salle('room-a35', 'Salle A35', 40, 'Projecteur, tableau'),
      new Salle('room-a21', 'Salle A21', 30, 'Tableau'),
      new Salle('room-a22', 'Salle A22', 25, 'Tableau'),
      new Salle('room-a112', 'Salle A-112', 35, 'Ordinateurs, projecteur'),
      new Salle('room-b204', 'Salle B-204', 32, 'Projecteur'),
      new Salle('room-c018', 'Salle C-018', 28, 'Tableau'),
      new Salle('room-f101', 'Salle F-101', 20, 'Tableau'),
      new Salle('room-d010', 'Salle D-010', 30, 'Ordinateurs'),
      new Salle('room-e220', 'Salle E-220', 24, 'Projecteur, tableau'),
    ];
  }

  static reservationExemple(maintenant = new Date()) {
    return new Reservation(
      'res-demo-durand',
      'room-f101',
      'teacher-durand',
      'Projet tutoré',
      Calendrier.decaler(maintenant, -1),
      '18:00',
      '20:00',
      'en_attente',
    );
  }

  static seancesAVenir(maintenant = new Date()) {
    return [
      Seance.prevue('gl2-week-1', 'Génie logiciel', 'Salle C-018', Calendrier.decaler(maintenant, -1), '08:00', '10:00', 'GL2', 'teacher-durand'),
      Seance.prevue('gl2-week-2', 'Bases de données', 'Salle A-112', Calendrier.decaler(maintenant, -2), '10:30', '12:30', 'GL2', 'teacher-durand'),
      Seance.prevue('gl1-week-1', 'Algorithmique', 'Salle D-010', Calendrier.decaler(maintenant, -1), '14:00', '16:00', 'GL1', 'teacher-bernard'),
      Seance.prevue('gl3-week-1', 'Réseaux', 'Salle E-220', Calendrier.decaler(maintenant, -3), '08:00', '10:00', 'GL3', 'teacher-rossi'),
    ];
  }
}
