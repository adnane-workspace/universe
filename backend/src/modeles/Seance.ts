export class Seance {
  readonly id: string;
  readonly course: string;
  readonly room: string;
  readonly date: string;
  readonly start: string;
  readonly end: string;
  readonly groupId: string;
  readonly teacherId: string;
  readonly called: boolean;

  constructor(
    id: string,
    course: string,
    room: string,
    date: string,
    start: string,
    end: string,
    groupId: string,
    teacherId: string,
    called: boolean,
  ) {
    this.id = id;
    this.course = course;
    this.room = room;
    this.date = date;
    this.start = start;
    this.end = end;
    this.groupId = groupId;
    this.teacherId = teacherId;
    this.called = called;
  }

  static prevue(
    id: string,
    course: string,
    room: string,
    date: string,
    start: string,
    end: string,
    groupId: string,
    teacherId: string,
  ) {
    return new Seance(id, course, room, date, start, end, groupId, teacherId, false);
  }

  marquerAppelee() {
    return new Seance(this.id, this.course, this.room, this.date, this.start, this.end, this.groupId, this.teacherId, true);
  }

  occupe(groupId: string, date: string, debut: string, fin: string) {
    return this.groupId === groupId && this.date === date && this.start < fin && debut < this.end;
  }

  estDe(teacherId: string) {
    return this.teacherId === teacherId;
  }
}
