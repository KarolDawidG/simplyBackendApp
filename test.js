const bcrypt = require('bcrypt');

const haso = 'kot';
const hash = '$2b$10$Nz5uEMoMQsQc8iNQRoUl8.VzsUzrt8CwW6.kJiPcRN6QKUM1nRjrC';

let test = bcrypt.compareSync(haso, hash);

console.log(test);