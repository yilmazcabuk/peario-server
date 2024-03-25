import Client from "./client";

class User {
  id: string;

  name: string;

  roomId: string;

  constructor(client: Client) {
    this.id = client.id;
    this.name = client.name;
    this.roomId = client.roomId;
  }
}

export default User;
