Tạo file .env và cop bên .envexample sang
Vào file GlassBE\src\config\config.json: sửa username, password tương ứng
chạy lệnh:
trước đó thêm schema: glasses trong mysql
npm install --save-dev sequelize-cli
npx sequelize-cli init
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all