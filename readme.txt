Trong glassbe tạo file .env và cop bên .envexample sang
Vào file GlassBE\src\config\config.json: sửa username, password tương ứng
chạy lệnh:
trước đó thêm schema: glasses trong mysql
cd glassbe\src
npm install --save-dev sequelize-cli
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

cd glassbe\src -> npm install
cd glassfe -> npm install

npm run start