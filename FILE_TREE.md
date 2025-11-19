# P7 E-Commerce Project File Structure

```
p7-ecommerce/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── backend/
│   ├── __tests__/
│   │   └── auth.test.js
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── error.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── server.js
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── create-mernstarter/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── App.test.tsx
│   │   │   └── basic.test.tsx
│   │   ├── assets/
│   │   │   └── favicon.ico
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── test/
│   │   │   └── setup.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── .eslintrc.json
│   ├── Dockerfile
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── package.json
│   └── package-lock.json
├── .env.example
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── FILE_TREE.md
├── FINAL_SUMMARY.md
├── LICENSE
├── PROJECT-GUIDE.md
├── PROJECT_OVERVIEW.md
├── QUICKSTART.md
├── README.md
├── SUMMARY.md
├── TREE.txt
├── package.json
├── package-lock.json
├── setup.js
└── verify-setup.js
```