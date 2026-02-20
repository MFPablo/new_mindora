import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { signupSchema, type ApiResponse, type SignupInput } from "shared";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { authConfig, prisma } from "./auth.js";
import { Prisma } from "@prisma/client";
import { logger } from "./logger.js";
import { pinoLogger } from "hono-pino";
import bcryptjs from "bcryptjs";
import { handle } from "hono/vercel";

export const app = new Hono<{
  Variables: {
    authUser: any
  }
}>();

app.use(
  cors({
    origin: 'https://newmindora.vercel.app', // Explicitly allowed origin
    allowHeaders: ['Content-Type', 'Authorization'], // Add any custom headers you use
    allowMethods: ['POST', 'GET', 'OPTIONS'], // Add all necessary HTTP methods
    credentials: true, // Set to true if your requests use cookies/auth headers
  })
);

// @ts-ignore
app.use("*", initAuthConfig((c) => authConfig));
// Prevent caching of the session endpoint
app.use("/auth/session", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");
});

// @ts-ignore
app.use("/auth/*", authHandler());
app.use("*", pinoLogger({
  pino: logger,
  http: {
    reqId: () => crypto.randomUUID(),
  },
}) as any);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  return c.json({ status: "ok", time: new Date().toISOString() });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get("/protected", verifyAuth() as any, (c) => {
  const auth = c.get("authUser");
  return c.json({
    message: `Hello ${auth?.user?.name || "User"}!`,
    session: auth
  });
});


// Middleware to verify authentication and extract user info
app.use("/api/*", async (c, next) => {
  // Signup, login and logout are always public and don't need user context
  if (c.req.path === "/api/signup" || c.req.path === "/api/login" || c.req.path === "/api/logout") {
    return await next();
  }

  const isPublicRoute = c.req.path.includes("/public");

  const { decode } = await import("@auth/core/jwt");
  // Defensive cookie retrieval
  const cookie = (c.req.raw as any).headers?.cookie || "";
  // Detect Auth.js or NextAuth.js tokens (handling __Secure- prefix)
  const tokenMatch = cookie.match(/((?:__Secure-)?(?:authjs|next-auth)\.session-token)=([^;]+)/);

  if (!tokenMatch || !tokenMatch[1] || !tokenMatch[2]) {
    if (isPublicRoute) return await next();
    return c.json({ success: false, message: "No autenticado" }, 401);
  }

  const tokenName = tokenMatch[1];
  const tokenValue = tokenMatch[2];
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    logger.error("AUTH_SECRET is not defined");
    if (isPublicRoute) return await next();
    return c.json({ success: false, message: "Error de configuración del servidor" }, 500);
  }

  try {
    const token = await decode({
      token: tokenValue,
      secret: secret,
      // The salt MUST match the cookie name for decode to work
      salt: tokenName
    });

    if (!token?.sub) {
      if (isPublicRoute) return await next();
      return c.json({ success: false, message: "Token inválido" }, 401);
    }

    // Fetch user role from DB
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { id: true, role: true }
    });

    if (!user) {
      if (isPublicRoute) return await next();
      return c.json({ success: false, message: "Usuario no encontrado" }, 404);
    }

    // Attach to context
    c.set("userId" as any, user.id);
    c.set("userRole" as any, user.role);

    return await next();
  } catch (error) {
    if (isPublicRoute) return await next();
    logger.error({ error }, "Auth middleware error");
    return c.json({ success: false, message: "Error de autenticación" }, 401);
  }
});

// Role-based helper
app.use("/api/patient/*", async (c, next) => {
  const role = c.get("userRole" as any);
  if (role !== "patient" && role !== "professional") {
    return c.json({ success: false, message: "Acceso denegado: Se requiere rol de paciente o profesional" }, 403);
  }
  return await next();
});
app.use("/api/professional/*", async (c, next) => {
  // Allow GET access to appointments for patients (for booking)
  if (c.req.path.includes("/public") || (c.req.method === "GET" && c.req.path.includes("/appointments"))) {
    return await next();
  }

  const role = c.get("userRole" as any);
  if (role !== "professional") {
    return c.json({ success: false, message: "Acceso denegado: Se requiere rol de profesional" }, 403);
  }
  return await next();
});


app.get("/hello", async (c) => {
  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true,
  };

  return c.json(data, { status: 200 });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.post("/api/signup", zValidator("json", signupSchema) as any, async (c) => {
  const data = c.req.valid("json" as never) as SignupInput;

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return c.json({ success: false, message: "El usuario ya existe" }, 400);
  }

  const hashedPassword = await bcryptjs.hash(data.password, 10);

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
    logger.info({ user: newUser }, "User registered");

    const response: ApiResponse = {
      message: "Usuario registrado exitosamente",
      success: true,
    };

    return c.json(response, { status: 201 });
  } catch (error) {
    logger.error({ error }, "Error creating user");
    return c.json({ success: false, message: "Error al crear usuario" }, 500);
  }
});


app.post("/api/login", async (c) => {
  try {
    logger.info("Login attempt started");
    const body = await c.req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return c.json({ success: false, message: "Email y contraseña requeridos" }, 400);
    }

    logger.info({ email }, "Fetching user from DB");
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
      logger.warn({ email }, "User not found or no password");
      return c.json({ success: false, message: "Credenciales inválidas" }, 401);
    }

    logger.info("Comparing passwords");
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      logger.warn({ email }, "Invalid password");
      return c.json({ success: false, message: "Credenciales inválidas" }, 401);
    }

    logger.info("Encoding session token");
    const { encode } = await import("@auth/core/jwt");
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      logger.error("AUTH_SECRET is missing");
      throw new Error("AUTH_SECRET is missing");
    }

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

    logger.info({ userId: user.id }, "Login successful");
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
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, "Login route error");
    return c.json({ success: false, message: "Error interno del servidor", error: error.message }, 500);
  }
});

app.post("/api/logout", (c) => {
  // Clear all variations of Auth.js session cookies
  c.header("Set-Cookie", "authjs.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0", { append: true });
  c.header("Set-Cookie", "__Secure-authjs.session-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0", { append: true });
  c.header("Set-Cookie", "next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0", { append: true });
  c.header("Set-Cookie", "__Secure-next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0", { append: true });
  return c.json({ success: true });
});


app.get("/api/profile", async (c) => {
  const userId = c.get("userId" as any);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, image: true, role: true }
  });
  if (!user) return c.json({ success: false, message: "Usuario no encontrado" }, 404);

  return c.json({ success: true, user });
});

app.put("/api/profile", async (c) => {
  const userId = c.get("userId" as any);
  const body = await c.req.json();
  const { name, email, phone } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
      select: { id: true, name: true, email: true, phone: true, image: true, role: true },
    });

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error({ error }, "Error updating profile");
    return c.json({ success: false, message: "Error al actualizar perfil" }, 500);
  }
});

app.post("/api/profile/upload-avatar", async (c) => {
  const userId = c.get("userId" as any);
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
      where: { id: userId },
      data: { image: cloudResData.secure_url },
    });

    return c.json({ success: true, url: cloudResData.secure_url });
  } catch (error) {
    return c.json({ success: false, message: "Error interno del servidor" }, 500);
  }
});

app.put("/api/profile/password", async (c) => {
  const userId = c.get("userId" as any);
  const body = await c.req.json();
  const { currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) return c.json({ success: false, message: "Usuario no encontrado" }, 404);

  const isValid = await bcryptjs.compare(currentPassword, user.password);
  if (!isValid) return c.json({ success: false, message: "Contraseña actual incorrecta" }, 401);

  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return c.json({ success: true, message: "Contraseña actualizada" });
});

app.post("/api/promo-key/redeem", async (c) => {
  const userId = c.get("userId" as any);
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
      where: { userId_promoKeyId: { userId, promoKeyId: promoKey.id } },
    });

    if (existingRedemption) return c.json({ success: false, message: "Ya canjeado" }, 400);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.promoKeyRedemption.create({ data: { userId, promoKeyId: promoKey.id } });
      await tx.promoKey.update({ where: { id: promoKey.id }, data: { used: { increment: 1 } } });

      // Create a $0 transaction for history visibility
      await tx.transaction.create({
        data: {
          userId,
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
});


// ONBOARDING ENDPOINTS
app.put("/api/onboarding/profile", async (c) => {
  const userId = c.get("userId" as any);
  const { phone, address, image } = await c.req.json();
  if (!phone || !address) return c.json({ success: false, message: "Phone y Address requeridos" }, 400);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        address,
        image: image || undefined,
        onboardingStep: 1,
      },
    });
    return c.json({ success: true, message: "Perfil de onboarding actualizado" });
  } catch (error) {
    logger.error({ error }, "Onboarding profile error");
    return c.json({ success: false, message: "Error al actualizar perfil" }, 500);
  }
});

app.put("/api/onboarding/agenda", async (c) => {
  const userId = c.get("userId" as any);
  const data = await c.req.json();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        workingHours: data,
        specialty: data.specialty || "Terapeuta",
        onboardingStep: 2,
      },
    });
    return c.json({ success: true, message: "Agenda de onboarding actualizada" });
  } catch (error) {
    logger.error({ error }, "Onboarding agenda error");
    return c.json({ success: false, message: "Error al actualizar agenda" }, 500);
  }
});

app.post("/api/onboarding/finalize", async (c) => {
  const userId = c.get("userId" as any);
  const { promoKey, plan } = await c.req.json();

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (promoKey) {
        const pk = await tx.promoKey.findUnique({ where: { key: promoKey.toUpperCase() } });
        if (pk && pk.used < pk.uses) {
          // Check if already redeemed to avoid unique constraint error
          const existing = await tx.promoKeyRedemption.findUnique({
            where: { userId_promoKeyId: { userId, promoKeyId: pk.id } }
          });

          if (!existing) {
            await tx.promoKeyRedemption.create({ data: { userId, promoKeyId: pk.id } });
            await tx.promoKey.update({ where: { id: pk.id }, data: { used: { increment: 1 } } });

            // Create a transaction for history
            await tx.transaction.create({
              data: {
                userId,
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
            userId,
            amount,
            concept,
            plan,
          }
        });
      }

      return await tx.user.update({
        where: { id: userId },
        data: {
          onboardingStep: 3,
          isProfessionalActive: true,
          role: "professional"
        },
      });
    });

    logger.info({ userId }, "Finalized onboarding, role set to professional");

    return c.json({ success: true, message: "¡Suscripción activa! Bienvenido a Mindora Pro", user: result });
  } catch (error) {
    logger.error({ error }, "Onboarding finalize error");
    return c.json({ success: false, message: "Error al finalizar onboarding" }, 500);
  }
});


app.get("/api/profile/billing", async (c) => {
  const userId = c.get("userId" as any);
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const promoRedemptions = await prisma.promoKeyRedemption.findMany({
    where: { userId },
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

// PUBLIC PROFESSIONAL PROFILE
app.get("/api/professional/:id/public", async (c) => {
  const professionalId = c.req.param("id");
  const loggedInUserId = c.get("userId" as any);

  logger.info({ professionalId, loggedInUserId }, "Accessing public profile");

  const professional = await prisma.user.findUnique({
    where: { id: professionalId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      specialty: true,
      address: true,
      phone: true,
      licenseNumber: true,
      bio: true,
      languages: true,
      sessionPrice: true,
      isProfilePublic: true,
      isProfileEnabled: true,
      isProfessionalActive: true,
      workingHours: true,
      minAnticipationHours: true,
      role: true,
    },
  });

  const isOwner = loggedInUserId === professionalId;

  if (!professional) {
    logger.warn({ professionalId, loggedInUserId, isOwner }, "Professional not found in DB");
    return c.json({ success: false, message: "Profesional no encontrado" }, 404);
  }

  // Owners can ALWAYS see their own profile, even if it's not fully enabled yet or role is still being set
  if (isOwner) {
    const { isProfilePublic, isProfileEnabled, isProfessionalActive, ...publicData } = professional;
    return c.json({ success: true, professional: publicData, isPublic: professional.isProfilePublic, isOwner: true });
  }

  // For non-owners, check if it's actually a professional and if the profile is enabled
  if (professional.role !== "professional") {
    logger.warn({ professionalId, role: professional.role }, "Access denied: User is not a professional");
    return c.json({ success: false, message: "Profesional no encontrado" }, 404);
  }

  if (!loggedInUserId && professional.isProfilePublic) {
    // Allow limited public view? No, per requirements session is needed.
  }

  if (!loggedInUserId) {
    return c.json({ success: false, message: "Inicia sesión para ver perfiles" }, 401);
  }

  // Check if profile is enabled (all required fields present)
  const isEnabled = professional.isProfileEnabled &&
    professional.isProfessionalActive &&
    professional.workingHours != null &&
    professional.licenseNumber != null &&
    professional.name != null &&
    professional.specialty != null;

  if (!isEnabled) {
    return c.json({ success: false, message: "El perfil de este profesional no está disponible" }, 404);
  }

  // If profile is public, return it
  if (professional.isProfilePublic) {
    const { isProfilePublic, isProfileEnabled, isProfessionalActive, ...publicData } = professional;
    return c.json({ success: true, professional: publicData, isPublic: true, isOwner: false });
  }

  // Profile is private

  // Allow the professional themselves to see their own profile
  if (isOwner) {
    const { isProfilePublic, isProfileEnabled, isProfessionalActive, ...publicData } = professional;
    return c.json({ success: true, professional: publicData, isPublic: false, isOwner: true });
  }

  const relation = await prisma.patientProfessionalRelation.findUnique({
    where: {
      patientId_professionalId: {
        patientId: loggedInUserId,
        professionalId,
      },
    },
  });

  if (!relation || relation.status !== "approved") {
    return c.json({ success: false, message: "Este perfil es privado. Necesitas aprobación del profesional.", isPublic: false }, 403);
  }

  const { isProfilePublic, isProfileEnabled, isProfessionalActive, ...publicData } = professional;
  return c.json({ success: true, professional: publicData, isPublic: false });
});


app.put("/api/professional/profile-settings", async (c) => {
  const { decode } = await import("@auth/core/jwt");
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/authjs\.session-token=([^;]+)/);
  if (!match) return c.json({ success: false, message: "No autenticado" }, 401);

  const token = await decode({ token: match[1], secret: process.env.AUTH_SECRET!, salt: "authjs.session-token" });
  if (!token?.sub) return c.json({ success: false, message: "Token inválido" }, 401);

  const user = await prisma.user.findUnique({ where: { id: token.sub } });
  if (!user || user.role !== "professional") {
    return c.json({ success: false, message: "Solo profesionales pueden actualizar estos ajustes" }, 403);
  }

  const body = await c.req.json();
  const { isProfilePublic, licenseNumber, bio, languages, sessionPrice } = body;

  try {
    const dataToUpdate: Record<string, unknown> = {};
    if (isProfilePublic !== undefined) dataToUpdate.isProfilePublic = isProfilePublic;
    if (licenseNumber !== undefined) dataToUpdate.licenseNumber = licenseNumber;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (languages !== undefined) dataToUpdate.languages = languages;
    if (sessionPrice !== undefined) dataToUpdate.sessionPrice = sessionPrice;

    // Recalculate isProfileEnabled
    const updatedLicense = licenseNumber !== undefined ? licenseNumber : user.licenseNumber;
    const isEnabled = updatedLicense != null && user.name != null && user.specialty != null && user.workingHours != null;
    dataToUpdate.isProfileEnabled = isEnabled;

    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: dataToUpdate,
      select: {
        id: true,
        isProfilePublic: true,
        isProfileEnabled: true,
        licenseNumber: true,
        bio: true,
        languages: true,
        sessionPrice: true,
      },
    });

    return c.json({ success: true, settings: updatedUser });
  } catch (error) {
    logger.error({ error }, "Error updating profile settings");
    return c.json({ success: false, message: "Error al actualizar ajustes" }, 500);
  }
});

// GET booked appointments for a professional in a given week
app.get("/api/professional/:id/appointments", async (c) => {
  const professionalId = c.req.param("id");
  const weekStart = c.req.query("weekStart");

  if (!weekStart) {
    return c.json({ success: false, message: "weekStart query param requerido (YYYY-MM-DD)" }, 400);
  }

  const startDate = new Date(weekStart + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      dateTime: { gte: startDate, lt: endDate },
      status: { not: "cancelled" },
    },
    select: {
      id: true,
      dateTime: true,
      status: true,
    },
  });

  return c.json({ success: true, appointments });
});

// CREATE an appointment (booking)
app.post("/api/appointments", async (c) => {
  const userId = c.get("userId" as any);
  const body = await c.req.json();
  const { professionalId, dateTime, notes } = body;

  if (!professionalId || !dateTime) {
    return c.json({ success: false, message: "professionalId y dateTime son requeridos" }, 400);
  }

  if (userId === professionalId) {
    return c.json({ success: false, message: "No puedes agendar un turno contigo mismo" }, 400);
  }

  // Get professional
  const professional = await prisma.user.findUnique({
    where: { id: professionalId },
    select: {
      id: true,
      role: true,
      workingHours: true,
      minAnticipationHours: true,
      isProfileEnabled: true,
      isProfessionalActive: true,
    },
  });

  if (!professional || professional.role !== "professional" || !professional.isProfileEnabled || !professional.isProfessionalActive) {
    return c.json({ success: false, message: "Profesional no disponible" }, 404);
  }

  const appointmentDate = new Date(dateTime);
  if (isNaN(appointmentDate.getTime())) {
    return c.json({ success: false, message: "Fecha inválida" }, 400);
  }

  const now = new Date();

  // Check: not in the past
  if (appointmentDate <= now) {
    return c.json({ success: false, message: "No puedes agendar turnos en el pasado" }, 400);
  }

  // Check: respects min anticipation
  const minMs = professional.minAnticipationHours * 60 * 60 * 1000;
  if (appointmentDate.getTime() - now.getTime() < minMs) {
    return c.json({ success: false, message: `Debes reservar con al menos ${professional.minAnticipationHours} hora(s) de anticipación` }, 400);
  }

  // Check: slot is within working hours
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayNames[appointmentDate.getDay()]; // Guaranteed to be string 0-6 if date is valid

  // Explicitly cast to unknown then to specific type to avoid Prisma Json type issues
  const wh = professional.workingHours as unknown as Record<string, { start: string; end: string }> | null;

  if (!wh || !dayName || !wh[dayName]) {
    return c.json({ success: false, message: "Este profesional no atiende en este día" }, 400);
  }

  const slotHour = appointmentDate.getHours();
  const dayConfig = wh[dayName];
  if (!dayConfig) {
    return c.json({ success: false, message: "Este profesional no atiende en este día" }, 400);
  }

  const startParts = dayConfig.start.split(":");
  const endParts = dayConfig.end.split(":");
  const startH = Number(startParts[0]);
  const endH = Number(endParts[0]);

  if (slotHour < startH || slotHour >= endH) {
    return c.json({ success: false, message: "El horario seleccionado está fuera del rango de atención" }, 400);
  }

  // Check: slot not already booked
  const existing = await prisma.appointment.findUnique({
    where: {
      professionalId_dateTime: {
        professionalId,
        dateTime: appointmentDate,
      },
    },
  });

  if (existing && existing.status !== "cancelled") {
    return c.json({ success: false, message: "Este horario ya está reservado" }, 409);
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: userId,
        professionalId,
        dateTime: appointmentDate,
        notes: notes || null,
      },
      select: {
        id: true,
        dateTime: true,
        status: true,
        professional: { select: { name: true, specialty: true } },
      },
    });

    return c.json({ success: true, appointment });
  } catch (error) {
    logger.error({ error }, "Error creating appointment");
    return c.json({ success: false, message: "Error al crear la reserva" }, 500);
  }
});

app.get("/api/patient/dashboard", async (c) => {
  const patientId = c.get("userId" as any);

  // Fetch next session (first future confirmed appointment)
  const nextSession = await prisma.appointment.findFirst({
    where: {
      patientId,
      dateTime: { gte: new Date() },
      status: "confirmed",
    },
    orderBy: { dateTime: "asc" },
    include: {
      professional: {
        select: { id: true, name: true, specialty: true, image: true },
      },
    },
  });

  // Fetch upcoming sessions (limit 5)
  const upcomingSessions = await prisma.appointment.findMany({
    where: {
      patientId,
      dateTime: { gte: new Date() },
      status: "confirmed",
    },
    orderBy: { dateTime: "asc" },
    take: 5,
    include: {
      professional: {
        select: { id: true, name: true, image: true, specialty: true },
      },
    },
  });

  // Fetch "My Professionals" (distinct professionals from appointments)
  const appointmentsWithPros = await prisma.appointment.findMany({
    where: { patientId },
    select: { professionalId: true },
    distinct: ["professionalId"],
  });

  const professionalIds = appointmentsWithPros.map((a: { professionalId: string }) => a.professionalId);

  const myProfessionals = await prisma.user.findMany({
    where: {
      id: { in: professionalIds },
    },
    select: {
      id: true,
      name: true,
      image: true,
      specialty: true,
      role: true,
    },
    take: 4,
  });

  // Mock stats
  const stats = {
    teamCount: myProfessionals.length,
    resourcesCount: 5, // Mock
  };

  return c.json({
    success: true,
    nextSession,
    upcomingSessions,
    myProfessionals,
    stats,
  });
});

app.get("/api/patient/appointments", async (c) => {
  const patientId = c.get("userId" as any);

  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { dateTime: "asc" },
      include: {
        professional: {
          select: { id: true, name: true, image: true, specialty: true, minAnticipationHours: true },
        },
      },
    });

    return c.json({ success: true, appointments });
  } catch (error) {
    logger.error({ error }, "Error fetching patient appointments");
    return c.json({ success: false, message: "Error al obtener las sesiones" }, 500);
  }
});

app.get("/api/professional/appointments", async (c) => {
  const professionalId = c.get("userId" as any);

  try {
    const appointments = await prisma.appointment.findMany({
      where: { professionalId },
      orderBy: { dateTime: "asc" },
      include: {
        patient: {
          select: { id: true, name: true, image: true, email: true, phone: true },
        },
      },
    });

    return c.json({ success: true, appointments });
  } catch (error) {
    logger.error({ error }, "Error fetching professional appointments");
    return c.json({ success: false, message: "Error al obtener la agenda" }, 500);
  }
});

app.onError((err, c) => {
  console.error(`[GLOBAL ERROR]: ${err.message}`, err.stack);
  
  // Ensure CORS headers are present even on errors
  const origin = c.req.header("Origin");
  if (origin) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
  }

  return c.json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  }, 500);
});

export const handleVercel = handle(app);
export default app;