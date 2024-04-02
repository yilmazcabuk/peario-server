export default class Player {
  constructor(
    public paused: boolean = true,
    public buffering: boolean = true,
    public time: number = 0,
  ) {}
}
