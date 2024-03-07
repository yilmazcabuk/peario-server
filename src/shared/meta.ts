class Meta {
  id: string;

  type: string;

  name: string;

  description: string;

  year: number;

  logo: string;

  poster: string;

  background: string;

  constructor(meta: any) {
    this.id = meta.id;
    this.type = meta.type;
    this.name = meta.name;
    this.description = meta.description;
    this.year = meta.year;
    this.logo = meta.logo;
    this.poster = meta.poster;
    this.background = meta.background;
  }
}

export default Meta;
