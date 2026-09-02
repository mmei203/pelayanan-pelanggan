FILE DB.JS DI CONFIG JANGAN PERNAH DI OTAK ATIK

# how to use it (in case aku ngulang)
1. npm install
2. npm run dev
3. npx prisma init
4. npx prisma generate

# API Customer Service
- '/pelanggan' GET all pelanggan (sudah)
- '/pelanggan' POST pelanggan (sudah)
- '/pelanggan/:id' GET detail pelanggan (sudah)
- '/pelanggan/:id' PUT detail pelanggan
- '/pelanggan/:status' GET all pelanggan by status
- '/history' GET all history pelanggan
- '/user' GET detail user

## CATATAN LAIN
Pakai params jika data adalah ID/identitas unik dari resource yang dituju.

Pakai query jika data digunakan untuk filtering, pencarian, pagination, atau sorting.

Pakai body jika Anda ingin membuat/mengubah data yang memiliki banyak kolom/field.
