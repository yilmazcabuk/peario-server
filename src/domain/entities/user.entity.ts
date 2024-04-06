export default class User {
  constructor(
    public id: string,
    public name: string,
    public roomId: string,
    public lastActive: number,
    public cooldown: number,
  ) {}
}
