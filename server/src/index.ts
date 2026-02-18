import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { signupSchema, type ApiResponse, type SignupInput } from "shared";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { authConfig, prisma } from "./auth";

export const app = new Hono<{
  Variables: {
    authUser: any
  }
}>()

  .use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }))
  // @ts-ignore
  .use("*", initAuthConfig((c) => authConfig))
  // @ts-ignore
  .use("/auth/*", authHandler())

  .get("/", (c) => {
    return c.text("Hello Hono!");
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .get("/protected", verifyAuth() as any, (c) => {
    const auth = c.get("authUser");
    return c.json({
      message: `Hello ${auth?.user?.name || "User"}!`,
      session: auth
    });
  })

  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };

    return c.json(data, { status: 200 });
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .post("/api/signup", zValidator("json", signupSchema) as any, async (c) => {
    const data = c.req.valid("json" as never) as SignupInput;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return c.json({ success: false, message: "El usuario ya existe" }, 400);
    }

    const hashedPassword = await Bun.password.hash(data.password);

    try {
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      console.log("User registered:", newUser);

      const response: ApiResponse = {
        message: "Usuario registrado exitosamente",
        success: true,
      };

      return c.json(response, { status: 201 });
    } catch (error) {
      console.error("Error creating user:", error);
      return c.json({ success: false, message: "Error al crear usuario" }, 500);
    }
  })

  .post("/api/login", async (c) => {
    const body = await c.req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return c.json({ success: false, message: "Email y contraseña requeridos" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        role: true,
        onboardingStep: true,
      }
    });

    if (!user || !user.password) {
      return c.json({ success: false, message: "Credenciales inválidas" }, 401);
    }

    const isValid = await Bun.password.verify(password, user.password);
    if (!isValid) {
      return c.json({ success: false, message: "Credenciales inválidas" }, 401);
    }

    const { encode } = await import("@auth/core/jwt");
    const secret = process.env.AUTH_SECRET!;

    const token = await encode({
      token: {
        sub: user.id,
        name: user.name,
        email: user.email,
        picture: user.image,
      },
      secret,
      salt: "authjs.session-token",
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    c.header("Set-Cookie", `authjs.session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);

    return c.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        onboardingStep: user.onboardingStep,
      },
    });
  })

  .post("/api/logout", (c) => {
    c.header("Set-Cookie", "authjs.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    return c.json({ success: true });
  })

  .get("/api/profile", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const user = await prisma.user.findUnique({ where: { id: token.sub }, select: { id: true, name: true, email: true, phone: true, image: true, role: true } });
    if (!user) return c.json({ success: false, message: "Usuario no encontrado" }, 404);

    return c.json({ success: true, user });
  })

  .put("/api/profile", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const body = await c.req.json();
    const { name, email, phone } = body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: token.sub },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
        },
        select: { id: true, name: true, email: true, phone: true, image: true, role: true },
      });

      return c.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      return c.json({ success: false, message: "Error al actualizar perfil" }, 500);
    }
  })

  .post("/api/profile/upload-avatar", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
    const cloudMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!cloudMatch) return c.json({ success: false, message: "Cloudinary no configurado" }, 500);

    const [, apiKey, apiSecret, cloudName] = cloudMatch;

    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      if (!file) return c.json({ success: false, message: "No se envió archivo" }, 400);

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const folder = "mindora/avatars";
      const signString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

      const encoder = new TextEncoder();
      const data = encoder.encode(signString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const uploadData = new FormData();
      uploadData.append("file", file as any);
      uploadData.append("api_key", apiKey as string);
      uploadData.append("timestamp", timestamp);
      uploadData.append("folder", folder);
      uploadData.append("signature", signature);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      const cloudResData = await cloudRes.json() as { secure_url?: string; error?: { message: string } };

      if (!cloudRes.ok || !cloudResData.secure_url) {
        return c.json({ success: false, message: `Error de Cloudinary: ${cloudResData.error?.message || "Error desconocido"}` }, 500);
      }

      await prisma.user.update({
        where: { id: token.sub },
        data: { image: cloudResData.secure_url },
      });

      return c.json({ success: true, url: cloudResData.secure_url });
    } catch (error) {
      return c.json({ success: false, message: "Error interno del servidor" }, 500);
    }
  })

  .put("/api/profile/password", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: token.sub } });
    if (!user || !user.password) return c.json({ success: false, message: "Usuario no encontrado" }, 404);

    const isValid = await Bun.password.verify(currentPassword, user.password);
    if (!isValid) return c.json({ success: false, message: "Contraseña actual incorrecta" }, 401);

    const hashedPassword = await Bun.password.hash(newPassword);
    await prisma.user.update({
      where: { id: token.sub },
      data: { password: hashedPassword },
    });

    return c.json({ success: true, message: "Contraseña actualizada" });
  })

  .post("/api/promo-key/redeem", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const { key } = await c.req.json();
    if (!key) return c.json({ success: false, message: "El código es obligatorio" }, 400);

    const now = new Date();

    try {
      const promoKey = await prisma.promoKey.findUnique({
        where: { key: key.toUpperCase() },
      });

      if (!promoKey) return c.json({ success: false, message: "Código no válido" }, 404);
      if (now < promoKey.startDate) return c.json({ success: false, message: "Código no activo" }, 400);
      if (now > promoKey.endDate) return c.json({ success: false, message: "Código expirado" }, 400);
      if (promoKey.used >= promoKey.uses) return c.json({ success: false, message: "Sin usos disponibles" }, 400);

      const existingRedemption = await prisma.promoKeyRedemption.findUnique({
        where: { userId_promoKeyId: { userId: token.sub, promoKeyId: promoKey.id } },
      });

      if (existingRedemption) return c.json({ success: false, message: "Ya canjeado" }, 400);

      const result = await prisma.$transaction(async (tx) => {
        await tx.promoKeyRedemption.create({ data: { userId: token.sub!, promoKeyId: promoKey.id } });
        await tx.promoKey.update({ where: { id: promoKey.id }, data: { used: { increment: 1 } } });

        // Create a $0 transaction for history visibility
        await tx.transaction.create({
          data: {
            userId: token.sub!,
            amount: 0,
            concept: `Canje Código: ${promoKey.key}`,
            status: "COMPLETED",
          }
        });

        return promoKey.type;
      });

      return c.json({ success: true, message: "Canjeado con éxito", promoType: result });
    } catch (error) {
      return c.json({ success: false, message: "Error al procesar" }, 500);
    }
  })

  // ONBOARDING ENDPOINTS
  .put("/api/onboarding/profile", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const { phone, address, image } = await c.req.json();
    if (!phone || !address) return c.json({ success: false, message: "Phone y Address requeridos" }, 400);

    try {
      await prisma.user.update({
        where: { id: token.sub },
        data: {
          phone,
          address,
          image: image || undefined,
          onboardingStep: 1,
        },
      });
      return c.json({ success: true, message: "Perfil de onboarding actualizado" });
    } catch (error) {
      console.error("Onboarding profile error:", error);
      return c.json({ success: false, message: "Error al actualizar perfil" }, 500);
    }
  })

  .put("/api/onboarding/agenda", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const data = await c.req.json();

    try {
      await prisma.user.update({
        where: { id: token.sub },
        data: {
          workingHours: data,
          specialty: data.specialty || "Terapeuta",
          onboardingStep: 2,
        },
      });
      return c.json({ success: true, message: "Agenda de onboarding actualizada" });
    } catch (error) {
      console.error("Onboarding agenda error:", error);
      return c.json({ success: false, message: "Error al actualizar agenda" }, 500);
    }
  })

  .post("/api/onboarding/finalize", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const { promoKey, plan } = await c.req.json();

    try {
      const result = await prisma.$transaction(async (tx) => {
        if (promoKey) {
          const pk = await tx.promoKey.findUnique({ where: { key: promoKey.toUpperCase() } });
          if (pk && pk.used < pk.uses) {
            // Check if already redeemed to avoid unique constraint error
            const existing = await tx.promoKeyRedemption.findUnique({
              where: { userId_promoKeyId: { userId: token.sub!, promoKeyId: pk.id } }
            });

            if (!existing) {
              await tx.promoKeyRedemption.create({ data: { userId: token.sub!, promoKeyId: pk.id } });
              await tx.promoKey.update({ where: { id: pk.id }, data: { used: { increment: 1 } } });

              // Create a transaction for history
              await tx.transaction.create({
                data: {
                  userId: token.sub!,
                  amount: 0,
                  concept: `Onboarding Promo: ${pk.key}`,
                  status: "COMPLETED",
                }
              });
            }
          }
        }

        if (plan) {
          const amount = plan.includes("monthly") ? 29.0 : 290.0;
          const concept = plan === "professional_monthly" ? "Plan Premium Mensual" : "Plan Premium Anual";
          await tx.transaction.create({
            data: {
              userId: token.sub!,
              amount,
              concept,
              plan,
            }
          });
        }

        return await tx.user.update({
          where: { id: token.sub },
          data: {
            onboardingStep: 3,
            isProfessionalActive: true,
            role: "professional"
          },
        });
      });

      console.log(`[ONBOARDING] Finalized for user ${token.sub}. Role set to professional.`);

      return c.json({ success: true, message: "¡Suscripción activa! Bienvenido a Mindora Pro", user: result });
    } catch (error) {
      console.error("Onboarding finalize error:", error);
      return c.json({ success: false, message: "Error al finalizar onboarding" }, 500);
    }
  })

  .get("/api/profile/billing", async (c) => {
    const { decode } = await import("@auth/core/jwt");
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/authjs\.session-token=([^;]+)/);
    if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

    const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
    if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

    const transactions = await prisma.transaction.findMany({
      where: { userId: token.sub },
      orderBy: { createdAt: "desc" },
    });

    const promoRedemptions = await prisma.promoKeyRedemption.findMany({
      where: { userId: token.sub },
      include: { promoKey: true },
      orderBy: { redeemedAt: "desc" },
    });

    return c.json({
      success: true,
      data: {
        transactions,
        promoRedemptions
      }
    });
  });

export default app;