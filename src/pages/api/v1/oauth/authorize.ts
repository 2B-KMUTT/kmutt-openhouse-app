import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { KMUTT_CI } from "@/constants/colors";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { client_id, redirect_uri, state } = req.query;

    // ตรวจสอบ client_id
    const client = await prisma.oAuthClient.findUnique({ where: { client_id: client_id as string } });
    if (!client) return res.status(400).send("Invalid client");

    // render login form (POST method)
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Student Login</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          :root { --uni-red: ${KMUTT_CI.orange}; --uni-yellow: ${KMUTT_CI.yellow}; }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen flex flex-col">
        <main class="flex-grow flex items-center justify-center">
          <div class="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-[var(--uni-red)] mb-2">Student Login</h1>
            <p class="text-center mb-6">KMUTT Openhouse OAuth2</p>
            <form method="POST" action="/api/v1/oauth/authorize" class="space-y-5">
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" placeholder="you@example.com" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--uni-red)] focus:border-[var(--uni-red)] transition" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Password</label>
                <input type="password" name="password" placeholder="••••••••" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--uni-red)] focus:border-[var(--uni-red)] transition" />
              </div>

              <input type="hidden" name="client_id" value="${client_id}" />
              <input type="text" name="redirect_uri" value="${redirect_uri}" />
              <input type="hidden" name="state" value="${state}" />

              <button type="submit" class="w-full bg-[var(--uni-red)] text-white font-semibold py-2 rounded-lg hover:bg-[var(--uni-yellow)] hover:text-[var(--uni-red)] transition">
                Login
              </button>
            </form>
          </div>
        </main>
      </body>
      </html>
    `);
  }

  if (req.method === "POST") {
  const { email, password, client_id, redirect_uri, state } = req.body;

  // ตรวจสอบ student
  const student = await prisma.students.findUnique({ where: { email } });
  if (!student) {
    res.status(401).send("Invalid credentials");
    return;
  }

  const match = await compare(password, student.password_hash);
  if (!match) {
    res.status(401).send("Invalid credentials");
    return;
  }

  // สร้าง authorization code
  const code = Math.random().toString(36).substring(2, 15);

  await prisma.oAuthCode.create({
    data: {
      code,
      studentId: student.id,
      clientId: client_id,
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 นาที
    },
  });

res.setHeader("Content-Type", "text/html");
res.send(`
  <html>
    <body>
      <script>
        // redirect ไป client callback
        window.location.href = "${redirect_uri}?code=${code}&state=${state}";
      </script>
      Redirecting...
      <a href="${redirect_uri}?code=${code}&state=${state}">Click here if not redirected</a>
    </body>
  </html>
`);
return;

}

}
