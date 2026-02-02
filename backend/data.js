const users = [
    {
      id: 1,
      email: "master@mail.com",
      password: "$2b$10$fakehash", // luego bcrypt
      role: "MASTER"
    },
    {
      id: 2,
      email: "player@mail.com",
      password: "$2b$10$fakehash",
      role: "PLAYER"
    }
  ];
  
  const characters = [
    {
      id: 1,
      name: "Guerrero",
      ownerId: 2,
      attributes: {
        strength: 10,
        dexterity: 8
      }
    }
  ];
  
  module.exports = { users, characters };
  